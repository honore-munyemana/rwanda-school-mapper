import express from "express";
import pool from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    const userRole = req.user.role;
    const userId = req.user.id;

    // Return empty results if no query or query length < 2
    if (!q || q.trim().length < 2) {
      return res.json({
        query: q || "",
        resultCount: 0,
        schools: [],
        users: [],
        reports: [],
        audits: []
      });
    }

    const queryStr = `%${q.trim()}%`;
    const schoolLimit = 10;
    const generalLimit = 5;

    // 1. Query Schools
    // Schools can be searched by all authenticated users
    const schoolsQuery = `
      SELECT id, name, district, school_type, education_level, status, submitted_by
      FROM schools
      WHERE name ILIKE $1
         OR district ILIKE $1
         OR school_type ILIKE $1
         OR education_level ILIKE $1
         OR status ILIKE $1
      ORDER BY name ASC
      LIMIT $2;
    `;
    const schoolsRes = await pool.query(schoolsQuery, [queryStr, schoolLimit]);
    const schools = schoolsRes.rows.map(school => ({
      ...school,
      is_own_submission: school.submitted_by === userId
    }));

    // 2. Query Users (Admin only)
    let users = [];
    if (userRole === "admin") {
      const usersQuery = `
        SELECT id, name, email, role
        FROM users
        WHERE name ILIKE $1
           OR email ILIKE $1
           OR role ILIKE $1
        ORDER BY name ASC
        LIMIT $2;
      `;
      const usersRes = await pool.query(usersQuery, [queryStr, generalLimit]);
      users = usersRes.rows;
    }

    // 3. Query Audits (Admin & Validator only)
    let audits = [];
    if (userRole === "admin" || userRole === "validator") {
      let auditsQuery = `
        SELECT
          vl.id,
          s.name AS school_name,
          u.name AS verifier_name,
          u.email AS verifier_email,
          vl.result,
          vl.distance_meters,
          vl.created_at
        FROM verification_logs vl
        JOIN schools s ON s.id = vl.school_id
        JOIN users u ON u.id = vl.verifier_id
        WHERE (
          s.name ILIKE $1
          OR u.name ILIKE $1
          OR u.email ILIKE $1
          OR vl.result ILIKE $1
          OR 'verification' ILIKE $1
        )
      `;
      const params = [queryStr, generalLimit];

      if (userRole === "validator") {
        auditsQuery += " AND vl.verifier_id = $3";
        params.push(userId);
      }

      auditsQuery += " ORDER BY vl.created_at DESC LIMIT $2";
      const auditsRes = await pool.query(auditsQuery, params);
      audits = auditsRes.rows;
    }

    // 4. Search Reports
    // Standard reports definitions
    const standardReports = [
      {
        title: "System Summary Report",
        type: "summary",
        description: "General system metrics and infrastructure distribution"
      },
      {
        title: "Districts Report",
        type: "districts",
        description: "School counts and average smart scores by district"
      },
      {
        title: "Verification Audit Report",
        type: "audit",
        description: "Verification results and validator accuracy metrics",
        adminOrValidatorOnly: true
      },
      {
        title: "School Compliance Report",
        type: "compliance",
        description: "Digital compliance statistics for all registered schools"
      }
    ];

    // Filter standard reports
    const filteredStandardReports = standardReports.filter(rep => {
      if (rep.adminOrValidatorOnly && userRole !== "admin" && userRole !== "validator") {
        return false;
      }
      const queryLower = q.toLowerCase();
      const matchTitle = rep.title.toLowerCase().includes(queryLower);
      const matchDesc = rep.description.toLowerCase().includes(queryLower);
      const matchType = rep.type.toLowerCase().includes(queryLower);
      return matchTitle || matchDesc || matchType;
    });

    // School detail reports
    const schoolReportsQuery = `
      SELECT id, name, district
      FROM schools
      WHERE name ILIKE $1 OR district ILIKE $1
      ORDER BY name ASC
      LIMIT $2;
    `;
    const schoolReportsRes = await pool.query(schoolReportsQuery, [queryStr, generalLimit]);
    const schoolReports = schoolReportsRes.rows.map(school => ({
      title: `School Detail Report: ${school.name}`,
      type: "detail",
      school_id: school.id,
      district: school.district,
      description: `Detailed infrastructure and validation log history for ${school.name}`
    }));

    const reports = [...filteredStandardReports, ...schoolReports].slice(0, generalLimit);

    const resultCount = schools.length + users.length + reports.length + audits.length;

    res.json({
      query: q,
      resultCount,
      schools,
      users,
      reports,
      audits
    });

  } catch (error) {
    console.error("Global search error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
