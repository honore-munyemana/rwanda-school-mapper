import express from "express";
import pool from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/overview", authMiddleware, async (req, res) => {
  try {
    const query = `
      SELECT
        COUNT(*)::int AS total_schools,
        COUNT(CASE WHEN status = 'Verified' THEN 1 END)::int AS verified_schools,
        COUNT(CASE WHEN status = 'Pending' THEN 1 END)::int AS pending_schools,
        COUNT(CASE WHEN status = 'Unverified' THEN 1 END)::int AS unverified_schools,
        COUNT(CASE WHEN status = 'Rejected' THEN 1 END)::int AS rejected_schools,
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
    const row = result.rows[0];

    const total = row.total_schools || 0;
    const internetPercentage = total > 0 ? Number(((row.schools_with_internet / total) * 100).toFixed(1)) : 0;
    const electricityPercentage = total > 0 ? Number(((row.schools_with_electricity / total) * 100).toFixed(1)) : 0;
    const playgroundPercentage = total > 0 ? Number(((row.schools_with_playground / total) * 100).toFixed(1)) : 0;
    const smartClassroomPercentage = total > 0 ? Number(((row.schools_with_smart_classroom / total) * 100).toFixed(1)) : 0;

    res.json({
      totalSchools: total,
      verifiedSchools: row.verified_schools || 0,
      pendingSchools: row.pending_schools || 0,
      unverifiedSchools: row.unverified_schools || 0,
      rejectedSchools: row.rejected_schools || 0,
      averageSmartScore: row.average_smart_score || 0,
      schoolsWithInternet: row.schools_with_internet || 0,
      schoolsWithElectricity: row.schools_with_electricity || 0,
      schoolsWithPlayground: row.schools_with_playground || 0,
      schoolsWithSmartClassroom: row.schools_with_smart_classroom || 0,
      internetPercentage,
      electricityPercentage,
      playgroundPercentage,
      smartClassroomPercentage,
      distribution: {
        score0: row.score_0 || 0,
        score1: row.score_1 || 0,
        score2: row.score_2 || 0,
        score3: row.score_3 || 0,
        score4: row.score_4 || 0,
      }
    });
  } catch (error) {
    console.error("Analytics overview fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/districts", authMiddleware, async (req, res) => {
  try {
    const query = `
      SELECT district, COUNT(*)::int AS count
      FROM schools
      GROUP BY district
      ORDER BY district ASC;
    `;

    const result = await pool.query(query);
    
    const formatted = {};
    result.rows.forEach((row) => {
      if (row.district) {
        formatted[row.district] = row.count;
      }
    });

    res.json(formatted);
  } catch (error) {
    console.error("Analytics districts fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
