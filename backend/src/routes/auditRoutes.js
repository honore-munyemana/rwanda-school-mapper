import express from "express";
import pool from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const query = `
      SELECT
        vl.id,
        s.name AS school_name,
        u.email AS verifier_email,
        vl.result,
        vl.distance_meters,
        vl.created_at
      FROM verification_logs vl
      JOIN schools s ON s.id = vl.school_id
      JOIN users u ON u.id = vl.verifier_id
      ORDER BY vl.created_at DESC
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Audit fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
