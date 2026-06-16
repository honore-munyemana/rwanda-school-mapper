import express from "express";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import pool from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all profile routes
router.use(authMiddleware);

// Define uploads directory path
const UPLOADS_DIR = "./uploads/profile-images";

// Ensure uploads folder exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage engine configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    // Generate unique name: timestamp-userid-random.extension
    const timestamp = Math.floor(Date.now() / 1000);
    const userId = req.user.id;
    const randomHex = crypto.randomBytes(3).toString("hex").slice(0, 5); // 5 chars
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${timestamp}-${userId}-${randomHex}${ext}`);
  }
});

// Multer upload middleware with validation
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // Max 2 MB
  },
  fileFilter: function (req, file, cb) {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and WebP images are allowed."));
    }
  }
}).single("photo");

// 1. GET /profile - Fetch current user profile
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, profile_photo, created_at FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User profile not found." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Fetch profile error:", error);
    res.status(500).json({ error: "Server error while fetching profile." });
  }
});

// 2. PUT /profile - Update profile name
router.put("/", async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Name field is required." });
    }

    const result = await pool.query(
      "UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email, role, profile_photo",
      [name.trim(), req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User profile not found." });
    }

    res.json({
      message: "Profile name updated successfully.",
      user: result.rows[0]
    });
  } catch (error) {
    console.error("Update profile name error:", error);
    res.status(500).json({ error: "Server error while updating profile name." });
  }
});

// 3. PUT /profile/password - Change password
router.put("/password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both current and new passwords are required." });
    }

    // Password validation: minimum 6 characters (recommended 8)
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long." });
    }
    if (newPassword.length < 8) {
      // Allow it but return a warning or note if desired, but here we require at least 6
    }

    // Retrieve current password hash
    const userRes = await pool.query("SELECT password FROM users WHERE id = $1", [req.user.id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const currentHash = userRes.rows[0].password;

    // Verify current password matches
    const isMatch = await bcrypt.compare(currentPassword, currentHash);
    if (!isMatch) {
      return res.status(400).json({ error: "The current password you entered is incorrect." });
    }

    // Confirm new password is different from the current password
    const isSamePassword = await bcrypt.compare(newPassword, currentHash);
    if (isSamePassword) {
      return res.status(400).json({ error: "New password must be different from your current password." });
    }

    // Hash the new password
    const saltRounds = 10;
    const newHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [newHash, req.user.id]);

    res.json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Server error while changing password." });
  }
});

// 4. POST /profile/photo - Upload profile photo
router.post("/photo", (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "File is too large. Maximum size is 2 MB." });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      }
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No image file provided." });
    }

    try {
      // Retrieve current profile photo path to clean up old files
      const userRes = await pool.query("SELECT profile_photo FROM users WHERE id = $1", [req.user.id]);
      const oldPhoto = userRes.rows[0]?.profile_photo;

      const relativePath = `uploads/profile-images/${req.file.filename}`;

      // Update database
      const updateRes = await pool.query(
        "UPDATE users SET profile_photo = $1 WHERE id = $2 RETURNING id, name, email, role, profile_photo",
        [relativePath, req.user.id]
      );

      // Clean up the old photo from disk if it exists
      if (oldPhoto) {
        const oldPath = path.resolve(oldPhoto);
        // Protect default system assets
        if (!oldPhoto.includes("default") && fs.existsSync(oldPath)) {
          fs.unlink(oldPath, (unlinkErr) => {
            if (unlinkErr) console.error("Error deleting old profile photo:", unlinkErr);
          });
        }
      }

      res.json({
        message: "Profile photo uploaded successfully.",
        user: updateRes.rows[0]
      });
    } catch (dbErr) {
      console.error("Database error while updating profile photo:", dbErr);
      // Clean up newly uploaded file if DB update failed
      const newFilePath = path.resolve(req.file.path);
      if (fs.existsSync(newFilePath)) {
        fs.unlinkSync(newFilePath);
      }
      res.status(500).json({ error: "Server error while updating profile photo." });
    }
  });
});

// 5. DELETE /profile/photo - Remove profile photo
router.delete("/photo", async (req, res) => {
  try {
    const userRes = await pool.query("SELECT profile_photo FROM users WHERE id = $1", [req.user.id]);
    const oldPhoto = userRes.rows[0]?.profile_photo;

    if (!oldPhoto) {
      return res.status(400).json({ error: "No profile photo to remove." });
    }

    // Set database column to NULL
    const updateRes = await pool.query(
      "UPDATE users SET profile_photo = NULL WHERE id = $1 RETURNING id, name, email, role, profile_photo",
      [req.user.id]
    );

    // Delete image file from disk (only if it's user-uploaded and not a default avatar)
    const oldPath = path.resolve(oldPhoto);
    if (!oldPhoto.includes("default") && fs.existsSync(oldPath)) {
      fs.unlink(oldPath, (unlinkErr) => {
        if (unlinkErr) console.error("Error deleting profile photo file:", unlinkErr);
      });
    }

    res.json({
      message: "Profile photo removed successfully.",
      user: updateRes.rows[0]
    });
  } catch (error) {
    console.error("Remove profile photo error:", error);
    res.status(500).json({ error: "Server error while removing profile photo." });
  }
});

export default router;
