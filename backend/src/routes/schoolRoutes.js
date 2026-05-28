import express from "express";
import pool from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware("admin", "mapper"), async (req, res) => {
  try {
    const { name, district, latitude, longitude, has_internet, has_smart_classroom, has_playground, has_electricity } = req.body;

    const net = !!has_internet;
    const smart = !!has_smart_classroom;
    const play = !!has_playground;
    const elec = !!has_electricity;
    const smart_score = (net ? 1 : 0) + (smart ? 1 : 0) + (play ? 1 : 0) + (elec ? 1 : 0);

    const query = `
      INSERT INTO schools (name, district, location, has_internet, has_smart_classroom, has_playground, has_electricity, smart_score)
      VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5, $6, $7, $8, $9)
      RETURNING *;
    `;

    const values = [name, district, longitude, latitude, net, smart, play, elec, smart_score];

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