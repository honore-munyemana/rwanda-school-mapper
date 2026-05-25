import express from "express";
import pool from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:id/history", authMiddleware, async (req, res) => {
  try {
    const schoolId = req.params.id;

    const result = await pool.query(
      `
      SELECT
        vl.id,
        vl.result,
        vl.distance_meters,
        vl.created_at,
        u.name AS verifier_name
      FROM verification_logs vl
      JOIN users u ON vl.verifier_id = u.id
      WHERE vl.school_id = $1
      ORDER BY vl.created_at DESC
      `,
      [schoolId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
