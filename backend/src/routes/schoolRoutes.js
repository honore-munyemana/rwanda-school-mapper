import express from "express";
import pool from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { createNotification, notifyAllUsersOfRole } from "../utils/notificationHelper.js";

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware("admin", "mapper"), async (req, res) => {
  try {
    const { name, district, latitude, longitude, has_internet, has_smart_classroom, has_playground, has_electricity, school_type, education_level } = req.body;

    // Validate school_type
    const validSchoolTypes = ["Public", "Private", "Government Aided"];
    if (!school_type || !validSchoolTypes.includes(school_type)) {
      return res.status(400).json({ error: "Invalid school type" });
    }

    // Validate education_level
    const validEducationLevels = ["Primary", "Secondary", "TVET", "Combined"];
    if (!education_level || !validEducationLevels.includes(education_level)) {
      return res.status(400).json({ error: "Invalid education level" });
    }

    const net = !!has_internet;
    const smart = !!has_smart_classroom;
    const play = !!has_playground;
    const elec = !!has_electricity;
    const smart_score = (net ? 1 : 0) + (smart ? 1 : 0) + (play ? 1 : 0) + (elec ? 1 : 0);

    const query = `
      INSERT INTO schools (name, district, location, has_internet, has_smart_classroom, has_playground, has_electricity, smart_score, school_type, education_level, submitted_by)
      VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;

    const values = [name, district, longitude, latitude, net, smart, play, elec, smart_score, school_type, education_level, req.user.id];

    const result = await pool.query(query, values);
    const newSchool = result.rows[0];

    // Notify all validators
    await notifyAllUsersOfRole(
      "validator",
      "New School Awaiting Verification",
      "New school awaiting verification.",
      "SUBMISSION",
      newSchool.id,
      "/verification"
    );

    // Notify the submitting mapper if the current user is a mapper
    if (req.user.role === "mapper") {
      await createNotification(
        req.user.id,
        "School Submitted",
        "School submitted successfully.",
        "SUBMISSION",
        newSchool.id,
        "/mapper"
      );
    }

    res.status(201).json(newSchool);

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