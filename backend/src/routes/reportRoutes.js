import express from "express";
import pool from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { generateReportPDF } from "../utils/pdfGenerator.js";

const router = express.Router();

// Apply authMiddleware to all reporting endpoints
router.use(authMiddleware);

// Cache dynamic verifier name column on route initialization/startup
let verifierNameColumn = "u.name"; // Default fallback

try {
  const checkColResult = await pool.query(
    `SELECT column_name 
     FROM information_schema.columns 
     WHERE table_name = 'users' AND column_name = 'full_name' 
     LIMIT 1`
  );
  if (checkColResult.rows.length > 0) {
    verifierNameColumn = "u.full_name";
  }
} catch (error) {
  console.error("Error identifying users column name, falling back to 'u.name':", error);
}

/**
 * GET /reports/summary
 * Returns aggregated statistics for the schools.
 */
router.get("/summary", async (req, res) => {
  try {
    const query = `
      SELECT
        COUNT(*)::int AS total_schools,
        COUNT(CASE WHEN LOWER(status) = 'verified' THEN 1 END)::int AS verified_schools,
        COUNT(CASE WHEN LOWER(status) = 'unverified' OR status IS NULL THEN 1 END)::int AS unverified_schools,
        COALESCE(ROUND(AVG(smart_score), 2), 0)::float AS average_smart_score,
        COUNT(CASE WHEN has_internet = true THEN 1 END)::int AS schools_with_internet,
        COUNT(CASE WHEN has_electricity = true THEN 1 END)::int AS schools_with_electricity,
        COUNT(CASE WHEN has_playground = true THEN 1 END)::int AS schools_with_playground,
        COUNT(CASE WHEN has_smart_classroom = true THEN 1 END)::int AS schools_with_smart_classroom,
        COUNT(CASE WHEN smart_score = 0 THEN 1 END)::int AS score_0,
        COUNT(CASE WHEN smart_score = 1 THEN 1 END)::int AS score_1,
        COUNT(CASE WHEN smart_score = 2 THEN 1 END)::int AS score_2,
        COUNT(CASE WHEN smart_score = 3 THEN 1 END)::int AS score_3,
        COUNT(CASE WHEN smart_score = 4 THEN 1 END)::int AS score_4
      FROM schools;
    `;

    const result = await pool.query(query);
    const row = result.rows[0] || {};

    const total = row.total_schools || 0;
    
    // Percentages return 0 if total is 0 to prevent divide-by-zero crashes
    const internetPercentage = total > 0 ? Number(((row.schools_with_internet / total) * 100).toFixed(2)) : 0;
    const electricityPercentage = total > 0 ? Number(((row.schools_with_electricity / total) * 100).toFixed(2)) : 0;
    const playgroundPercentage = total > 0 ? Number(((row.schools_with_playground / total) * 100).toFixed(2)) : 0;
    const smartClassroomPercentage = total > 0 ? Number(((row.schools_with_smart_classroom / total) * 100).toFixed(2)) : 0;

    res.json({
      totalSchools: total,
      verifiedSchools: row.verified_schools || 0,
      unverifiedSchools: row.unverified_schools || 0,
      averageSmartScore: row.average_smart_score || 0,
      schoolsWithInternet: row.schools_with_internet || 0,
      schoolsWithElectricity: row.schools_with_electricity || 0,
      schoolsWithPlayground: row.schools_with_playground || 0,
      schoolsWithSmartClassroom: row.schools_with_smart_classroom || 0,
      internetPercentage,
      electricityPercentage,
      playgroundPercentage,
      smartClassroomPercentage,
      scoreDistribution: {
        score0: row.score_0 || 0,
        score1: row.score_1 || 0,
        score2: row.score_2 || 0,
        score3: row.score_3 || 0,
        score4: row.score_4 || 0,
      }
    });
  } catch (error) {
    console.error("Reports summary fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /reports/districts
 * Returns school count and average smart score grouped by district.
 */
router.get("/districts", async (req, res) => {
  try {
    const query = `
      SELECT
        district,
        COUNT(*)::int AS school_count,
        COALESCE(ROUND(AVG(smart_score), 2), 0)::float AS average_smart_score
      FROM schools
      GROUP BY district
      ORDER BY district ASC;
    `;

    const result = await pool.query(query);

    const formatted = result.rows.map((row) => ({
      district: row.district,
      school_count: row.school_count,
      schoolCount: row.school_count,
      average_smart_score: row.average_smart_score,
      averageSmartScore: row.average_smart_score,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Reports districts fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /reports/schools/:id
 * Returns complete information for a single school.
 */
router.get("/schools/:id", async (req, res) => {
  try {
    const schoolId = parseInt(req.params.id, 10);
    if (isNaN(schoolId)) {
      return res.status(400).json({ error: "Invalid school ID format" });
    }

    const query = `
      SELECT
        id,
        name,
        district,
        status,
        has_internet,
        has_smart_classroom,
        has_playground,
        has_electricity,
        smart_score,
        ST_Y(location::geometry) AS latitude,
        ST_X(location::geometry) AS longitude
      FROM schools
      WHERE id = $1;
    `;

    const result = await pool.query(query, [schoolId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "School not found" });
    }

    const school = result.rows[0];
    res.json({
      id: school.id,
      name: school.name,
      district: school.district,
      status: school.status,
      has_internet: school.has_internet,
      has_smart_classroom: school.has_smart_classroom,
      has_playground: school.has_playground,
      has_electricity: school.has_electricity,
      smart_score: school.smart_score,
      latitude: school.latitude !== null ? parseFloat(school.latitude) : null,
      longitude: school.longitude !== null ? parseFloat(school.longitude) : null,
    });
  } catch (error) {
    console.error("Reports school by ID fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /reports/audit
 * Returns verification log history for report consumption.
 */
router.get("/audit", async (req, res) => {
  try {
    const query = `
      SELECT
        vl.id AS log_id,
        s.name AS school_name,
        ${verifierNameColumn} AS verifier_full_name,
        u.email AS verifier_email,
        vl.result,
        vl.distance_meters::float AS distance_meters,
        vl.created_at
      FROM verification_logs vl
      LEFT JOIN schools s ON s.id = vl.school_id
      LEFT JOIN users u ON u.id = vl.verifier_id
      ORDER BY vl.created_at DESC;
    `;

    const result = await pool.query(query);

    const formatted = result.rows.map((row) => ({
      id: row.log_id,
      log_id: row.log_id,
      school_name: row.school_name,
      schoolName: row.school_name,
      verifier_full_name: row.verifier_full_name,
      verifierFullName: row.verifier_full_name,
      verifier_email: row.verifier_email,
      verifierEmail: row.verifier_email,
      result: row.result,
      distance_meters: row.distance_meters,
      distanceMeters: row.distance_meters,
      created_at: row.created_at,
      timestamp: row.created_at,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Reports audit fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});


/**
 * GET /reports/summary/pdf
 * Generates System Summary PDF.
 */
router.get("/summary/pdf", async (req, res) => {
  try {
    const summaryQuery = `
      SELECT
        COUNT(*)::int AS total_schools,
        COUNT(CASE WHEN LOWER(status) = 'verified' THEN 1 END)::int AS verified_schools,
        COUNT(CASE WHEN LOWER(status) = 'unverified' OR status IS NULL THEN 1 END)::int AS unverified_schools,
        COALESCE(ROUND(AVG(smart_score), 2), 0)::float AS average_smart_score,
        COUNT(CASE WHEN has_internet = true THEN 1 END)::int AS schools_with_internet,
        COUNT(CASE WHEN has_electricity = true THEN 1 END)::int AS schools_with_electricity,
        COUNT(CASE WHEN has_playground = true THEN 1 END)::int AS schools_with_playground,
        COUNT(CASE WHEN has_smart_classroom = true THEN 1 END)::int AS schools_with_smart_classroom,
        COUNT(CASE WHEN smart_score = 0 THEN 1 END)::int AS score_0,
        COUNT(CASE WHEN smart_score = 1 THEN 1 END)::int AS score_1,
        COUNT(CASE WHEN smart_score = 2 THEN 1 END)::int AS score_2,
        COUNT(CASE WHEN smart_score = 3 THEN 1 END)::int AS score_3,
        COUNT(CASE WHEN smart_score = 4 THEN 1 END)::int AS score_4
      FROM schools;
    `;
    const result = await pool.query(summaryQuery);
    const row = result.rows[0] || {};
    const total = row.total_schools || 0;
    
    const internetPercentage = total > 0 ? Number(((row.schools_with_internet / total) * 100).toFixed(2)) : 0;
    const electricityPercentage = total > 0 ? Number(((row.schools_with_electricity / total) * 100).toFixed(2)) : 0;
    const playgroundPercentage = total > 0 ? Number(((row.schools_with_playground / total) * 100).toFixed(2)) : 0;
    const smartClassroomPercentage = total > 0 ? Number(((row.schools_with_smart_classroom / total) * 100).toFixed(2)) : 0;

    const data = {
      totalSchools: total,
      verifiedSchools: row.verified_schools || 0,
      unverifiedSchools: row.unverified_schools || 0,
      averageSmartScore: row.average_smart_score || 0,
      schoolsWithInternet: row.schools_with_internet || 0,
      schoolsWithElectricity: row.schools_with_electricity || 0,
      schoolsWithPlayground: row.schools_with_playground || 0,
      schoolsWithSmartClassroom: row.schools_with_smart_classroom || 0,
      internetPercentage,
      electricityPercentage,
      playgroundPercentage,
      smartClassroomPercentage,
      scoreDistribution: {
        score0: row.score_0 || 0,
        score1: row.score_1 || 0,
        score2: row.score_2 || 0,
        score3: row.score_3 || 0,
        score4: row.score_4 || 0,
      }
    };

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="ssevms-system-summary.pdf"');
    
    const pdfDoc = await generateReportPDF("summary", data, req.user);
    pdfDoc.pipe(res);
  } catch (error) {
    console.error("PDF generation summary error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /reports/districts/pdf
 * Generates District Performance & Compliance PDF.
 */
router.get("/districts/pdf", async (req, res) => {
  try {
    const districtsQuery = `
      SELECT
        district,
        COUNT(*)::int AS school_count,
        COALESCE(ROUND(AVG(smart_score), 2), 0)::float AS average_smart_score,
        COUNT(CASE WHEN LOWER(status) = 'verified' THEN 1 END)::int AS verified_count,
        COUNT(CASE WHEN LOWER(status) = 'unverified' OR status IS NULL THEN 1 END)::int AS unverified_count,
        COUNT(CASE WHEN has_internet = true THEN 1 END)::int AS internet_count,
        COUNT(CASE WHEN has_electricity = true THEN 1 END)::int AS electricity_count,
        COUNT(CASE WHEN has_playground = true THEN 1 END)::int AS playground_count,
        COUNT(CASE WHEN has_smart_classroom = true THEN 1 END)::int AS smart_classroom_count
      FROM schools
      GROUP BY district
      ORDER BY district ASC;
    `;
    const result = await pool.query(districtsQuery);
    
    const data = result.rows.map((row) => {
      const total = row.school_count || 0;
      return {
        district: row.district || "Unknown",
        schoolCount: total,
        averageSmartScore: row.average_smart_score || 0,
        verifiedCount: row.verified_count || 0,
        unverifiedCount: row.unverified_count || 0,
        internetPercentage: total > 0 ? Math.round((row.internet_count / total) * 100) : 0,
        electricityPercentage: total > 0 ? Math.round((row.electricity_count / total) * 100) : 0,
        playgroundPercentage: total > 0 ? Math.round((row.playground_count / total) * 100) : 0,
        smartClassroomPercentage: total > 0 ? Math.round((row.smart_classroom_count / total) * 100) : 0,
      };
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="ssevms-districts-report.pdf"');
    
    const pdfDoc = await generateReportPDF("districts", data, req.user);
    pdfDoc.pipe(res);
  } catch (error) {
    console.error("PDF generation districts error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /reports/audit/pdf
 * Generates Verification Audit Log PDF (Restricted to Admin & Validator).
 */
router.get("/audit/pdf", roleMiddleware("admin", "validator"), async (req, res) => {
  try {
    const auditQuery = `
      SELECT
        vl.id AS log_id,
        s.name AS school_name,
        ${verifierNameColumn} AS verifier_full_name,
        u.email AS verifier_email,
        vl.result,
        vl.distance_meters::float AS distance_meters,
        vl.created_at
      FROM verification_logs vl
      LEFT JOIN schools s ON s.id = vl.school_id
      LEFT JOIN users u ON u.id = vl.verifier_id
      ORDER BY vl.created_at DESC;
    `;
    const result = await pool.query(auditQuery);

    const data = result.rows.map((row) => ({
      id: row.log_id,
      schoolName: row.school_name || "N/A",
      verifierFullName: row.verifier_full_name,
      verifierEmail: row.verifier_email,
      result: row.result,
      distanceMeters: row.distance_meters,
      timestamp: row.created_at,
    }));

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="ssevms-verification-audit-report.pdf"');
    
    const pdfDoc = await generateReportPDF("audit", data, req.user);
    pdfDoc.pipe(res);
  } catch (error) {
    console.error("PDF generation audit error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /reports/compliance/pdf
 * Generates Smart School Compliance Checklist PDF.
 */
router.get("/compliance/pdf", async (req, res) => {
  try {
    const complianceQuery = `
      SELECT
        name,
        district,
        has_internet,
        has_electricity,
        has_smart_classroom,
        has_playground,
        smart_score
      FROM schools
      ORDER BY name ASC;
    `;
    const result = await pool.query(complianceQuery);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="ssevms-school-compliance-report.pdf"');
    
    const pdfDoc = await generateReportPDF("compliance", result.rows, req.user);
    pdfDoc.pipe(res);
  } catch (error) {
    console.error("PDF generation compliance error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /reports/schools/:id/pdf
 * Generates single School Detail Report PDF.
 */
router.get("/schools/:id/pdf", async (req, res) => {
  try {
    const schoolId = parseInt(req.params.id, 10);
    if (isNaN(schoolId)) {
      return res.status(400).json({ error: "Invalid school ID format" });
    }

    const schoolQuery = `
      SELECT
        id,
        name,
        district,
        status,
        has_internet,
        has_smart_classroom,
        has_playground,
        has_electricity,
        smart_score,
        ST_Y(location::geometry) AS latitude,
        ST_X(location::geometry) AS longitude
      FROM schools
      WHERE id = $1;
    `;
    const result = await pool.query(schoolQuery, [schoolId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "School not found" });
    }

    const school = result.rows[0];
    const data = {
      id: school.id,
      name: school.name,
      district: school.district,
      status: school.status,
      has_internet: school.has_internet,
      has_smart_classroom: school.has_smart_classroom,
      has_playground: school.has_playground,
      has_electricity: school.has_electricity,
      smart_score: school.smart_score,
      latitude: school.latitude !== null ? parseFloat(school.latitude) : null,
      longitude: school.longitude !== null ? parseFloat(school.longitude) : null,
    };

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="ssevms-school-${schoolId}-details.pdf"`);
    
    const pdfDoc = await generateReportPDF("detail", data, req.user);
    pdfDoc.pipe(res);
  } catch (error) {
    console.error("PDF generation school detail error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
