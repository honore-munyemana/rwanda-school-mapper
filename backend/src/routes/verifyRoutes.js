import express from "express";
import pool from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware("admin", "validator"), async (req, res) => {
  try {
    const { school_id, latitude, longitude, notes } = req.body;

    const schoolId = parseInt(school_id, 10);

    if (isNaN(schoolId)) {
      return res.status(400).json({ error: "Invalid school_id" });
    }

    if (!school_id || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check distance using PostGIS ST_DWithin (<= 100 meters)
    const checkQuery = `
      SELECT ST_DWithin(
        location::geography,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        100
      ) AS is_within
      FROM schools
      WHERE id = $3;
    `;
    // ST_MakePoint takes (longitude, latitude)
    const checkValues = [longitude, latitude, schoolId];
    
    const checkResult = await pool.query(checkQuery, checkValues);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "School not found" });
    }

    const { is_within } = checkResult.rows[0];

    if (!is_within) {
      return res.status(400).json({ error: "Too far from school to verify" });
    }

    // Insert verification record
    const insertQuery = `
      INSERT INTO verification_records (school_id, user_id, captured_location, notes, status)
      VALUES ($1, NULL, ST_SetSRID(ST_MakePoint($2, $3), 4326), $4, 'verified')
      RETURNING *;
    `;
    const defaultNote = "Verified via GPS by field officer";
    const insertValues = [schoolId, longitude, latitude, notes || defaultNote];
    
    await pool.query(insertQuery, insertValues);

    // Update school status to Verified
    const updateQuery = `
      UPDATE schools SET status = 'Verified' WHERE id = $1 RETURNING *;
    `;
    await pool.query(updateQuery, [schoolId]);

    res.status(200).json({ message: "School verified successfully" });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
