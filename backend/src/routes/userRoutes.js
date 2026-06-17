import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import pool from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { sendActivationEmail } from "../utils/mailer.js";

const router = express.Router();

// Apply auth and admin check to all user management routes
router.use(authMiddleware);
router.use(roleMiddleware("admin"));

// 1. GET /users - View Users (with optional search and role filtering)
router.get("/", async (req, res) => {
  try {
    const { search, role } = req.query;
    let query = "SELECT id, name, email, role, created_at FROM users";
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length})`);
    }

    if (role) {
      params.push(role);
      conditions.push(`role = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY created_at DESC, id DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Fetch users error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 2. POST /users - Create User
router.post("/", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate fields
    if (!name || !email || !role) {
      return res.status(400).json({ error: "Name, email, and role are required" });
    }

    // Validate role
    const validRoles = ["admin", "validator", "mapper"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role. Role must be admin, validator, or mapper." });
    }

    // Check if email already exists
    const userCheck = await pool.query("SELECT id, is_verified FROM users WHERE email = $1", [email]);
    if (userCheck.rows.length > 0) {
      const existingUser = userCheck.rows[0];
      if (existingUser.is_verified === false) {
        return res.status(400).json({ error: "This user has already been invited." });
      }
      return res.status(400).json({ error: "Email already registered" });
    }

    let result;
    if (password) {
      // Validate password length
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters." });
      }
      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert verified user (backward compatibility)
      result = await pool.query(
        "INSERT INTO users (name, email, password, role, is_verified) VALUES ($1, $2, $3, $4, true) RETURNING id, name, email, role, created_at",
        [name, email, hashedPassword, role]
      );
    } else {
      // Generate activation fields
      const activationToken = crypto.randomBytes(32).toString("hex");
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
      const hashedOtp = await bcrypt.hash(otpCode, 10);
      
      const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
      const activationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      // Random dummy password hash
      const dummyPassword = crypto.randomBytes(32).toString("hex");
      const hashedDummyPassword = await bcrypt.hash(dummyPassword, 10);

      // Insert unverified user
      result = await pool.query(
        `INSERT INTO users 
         (name, email, password, role, is_verified, activation_token, otp_code, otp_expiry, activation_expiry, otp_attempts) 
         VALUES ($1, $2, $3, $4, false, $5, $6, $7, $8, 0) 
         RETURNING id, name, email, role, created_at`,
        [name, email, hashedDummyPassword, role, activationToken, hashedOtp, otpExpiry, activationExpiry]
      );

      // Send activation email (asynchronous background operation)
      sendActivationEmail(email, name, role, activationToken, otpCode);
    }

    res.status(201).json({
      message: password ? "User created successfully" : "User invited successfully. Activation email sent.",
      user: result.rows[0]
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 3. PUT /users/:id - Edit User
router.put("/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { name, email, password, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ error: "Name, email, and role are required." });
    }

    const validRoles = ["admin", "validator", "mapper"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role. Role must be admin, validator, or mapper." });
    }

    // Check if user exists
    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentUserRecord = userResult.rows[0];

    // Verify unique email
    const emailCheck = await pool.query("SELECT id FROM users WHERE email = $1 AND id != $2", [email, userId]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Protect last administrator downgrading
    if (currentUserRecord.role === "admin" && role !== "admin") {
      const adminCountRes = await pool.query("SELECT COUNT(*)::int FROM users WHERE role = 'admin'");
      const adminCount = adminCountRes.rows[0].count;
      if (adminCount <= 1) {
        return res.status(400).json({ error: "Cannot downgrade the last Administrator." });
      }
    }

    let hashedPassword = null;
    if (password && password.trim() !== "") {
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters." });
      }
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    if (hashedPassword) {
      await pool.query(
        "UPDATE users SET name = $1, email = $2, role = $3, password = $4 WHERE id = $5",
        [name, email, role, hashedPassword, userId]
      );
    } else {
      await pool.query(
        "UPDATE users SET name = $1, email = $2, role = $3 WHERE id = $4",
        [name, email, role, userId]
      );
    }

    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 4. DELETE /users/:id - Delete User
router.delete("/:id", async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id);
    const requestingUserId = req.user.id;

    // Self-deletion check
    if (targetUserId === requestingUserId) {
      return res.status(400).json({ error: "Self-deletion is not allowed. You cannot delete your own account." });
    }

    // Check if target user exists
    const userResult = await pool.query("SELECT role FROM users WHERE id = $1", [targetUserId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const targetUserRole = userResult.rows[0].role;

    // Protect last administrator deletion
    if (targetUserRole === "admin") {
      const adminCountRes = await pool.query("SELECT COUNT(*)::int FROM users WHERE role = 'admin'");
      const adminCount = adminCountRes.rows[0].count;
      if (adminCount <= 1) {
        return res.status(400).json({ error: "Cannot delete the last Administrator account." });
      }
    }

    // Perform delete
    await pool.query("DELETE FROM users WHERE id = $1", [targetUserId]);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
