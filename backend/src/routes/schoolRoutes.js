import express from "express";
import pool from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware("admin", "mapper"), async (req, res) => {
  try {
    const { name, district, latitude, longitude } = req.body;

    const query = `
      INSERT INTO schools (name, district, location)
      VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326))
      RETURNING *;
    `;

    const values = [name, district, longitude, latitude];

    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const query = `
      SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(
          json_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(location)::json,
            'properties', json_build_object(
              'id', id,
              'name', name,
              'district', district,
              'status', status
            )
          )
        )
      ) AS geojson
      FROM schools;
    `;

    const result = await pool.query(query);
    res.json(result.rows[0].geojson);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
export default router;