import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import pool from "../config/db.js";
import { sendActivationEmail } from "../utils/mailer.js";
import { notifyAllUsersOfRole } from "../utils/notificationHelper.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields (name, email, password, role) are required" });
    }

    // Validate role (exactly: admin, validator, mapper)
    const validRoles = ["admin", "validator", "mapper"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role. Role must be admin, validator, or mapper." });
    }

    // Check if email already exists
    const userCheck = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user into users table
    await pool.query(
      "INSERT INTO users (name, email, password, role, is_verified) VALUES ($1, $2, $3, $4, true)",
      [name, email, hashedPassword, role]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Verify email exists
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    // Check if the user is verified/activated
    if (user.is_verified === false) {
      return res.status(403).json({
        error: "Your account has not been activated. Please check your email or request another activation email."
      });
    }

    // Compare password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT token (payload includes id, email, role; expires in 7d)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your_secret_key",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        profile_photo: user.profile_photo
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    // req.user is attached by authMiddleware. Query the database to get fresh details
    const result = await pool.query(
      "SELECT id, name, email, role, profile_photo FROM users WHERE id = $1",
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const activate = async (req, res) => {
  try {
    const { token, otp, password } = req.body;

    if (!token || !otp || !password) {
      return res.status(400).json({ error: "Activation token, OTP, and password are required." });
    }

    // Password validation: min 8 characters, at least one uppercase, one lowercase, and one number.
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number."
      });
    }

    // Look up user by activation token where is_verified is false
    const userCheck = await pool.query(
      "SELECT * FROM users WHERE activation_token = $1 AND is_verified = false",
      [token]
    );

    if (userCheck.rows.length === 0) {
      return res.status(400).json({ error: "Invalid activation link or account already activated." });
    }

    const user = userCheck.rows[0];

    // Check activation expiry
    if (user.activation_expiry && new Date() > new Date(user.activation_expiry)) {
      return res.status(400).json({
        error: "Activation link has expired. Please request a new activation email."
      });
    }

    // Check OTP attempts and OTP expiry
    if (user.otp_attempts >= 5 || !user.otp_code || (user.otp_expiry && new Date() > new Date(user.otp_expiry))) {
      return res.status(400).json({
        error: "The one-time password has expired or attempts exceeded. Please request a new activation email."
      });
    }

    // Verify OTP
    const isOtpMatch = await bcrypt.compare(otp, user.otp_code);
    if (!isOtpMatch) {
      const newAttempts = user.otp_attempts + 1;
      if (newAttempts >= 5) {
        // Invalidate OTP by nullifying the OTP code/expiry
        await pool.query(
          "UPDATE users SET otp_attempts = $1, otp_code = NULL, otp_expiry = NULL WHERE id = $2",
          [newAttempts, user.id]
        );
        return res.status(400).json({
          error: "Incorrect OTP. Maximum attempts (5) exceeded. Please request a new activation email."
        });
      } else {
        await pool.query(
          "UPDATE users SET otp_attempts = $1 WHERE id = $2",
          [newAttempts, user.id]
        );
        return res.status(400).json({
          error: `Incorrect OTP. ${5 - newAttempts} attempts remaining.`
        });
      }
    }

    // OTP matched! Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update user details & clear verification columns
    await pool.query(
      `UPDATE users SET 
        password = $1, 
        is_verified = true, 
        activation_token = NULL, 
        otp_code = NULL, 
        otp_expiry = NULL, 
        activation_expiry = NULL, 
        otp_attempts = 0 
      WHERE id = $2`,
      [hashedPassword, user.id]
    );

    // Notification hook (optional, prepared as requested)
    console.log(`Notification Hook: ${user.role.charAt(0).toUpperCase() + user.role.slice(1)} ${user.name} activated their account.`);
    await notifyAllUsersOfRole(
      "admin",
      "User Activated Account",
      "User successfully activated account.",
      "ACTIVATION",
      user.id,
      "/users"
    );

    res.json({ message: "Account activated successfully. You can now log in." });
  } catch (error) {
    console.error("Activation error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const resendActivation = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: "No account found with this email address." });
    }

    const user = userCheck.rows[0];
    if (user.is_verified) {
      return res.status(400).json({ error: "This account is already activated. Please login." });
    }

    // Generate new OTP & activation token
    const activationToken = crypto.randomBytes(32).toString("hex");
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const hashedOtp = await bcrypt.hash(otpCode, 10);
    
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    const activationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user
    await pool.query(
      `UPDATE users SET 
        activation_token = $1, 
        otp_code = $2, 
        otp_expiry = $3, 
        activation_expiry = $4, 
        otp_attempts = 0 
      WHERE id = $5`,
      [activationToken, hashedOtp, otpExpiry, activationExpiry, user.id]
    );

    // Send new activation email
    await sendActivationEmail(user.email, user.name, user.role, activationToken, otpCode);

    res.json({ message: "A new activation email has been sent with your OTP." });
  } catch (error) {
    console.error("Resend activation error:", error);
    res.status(500).json({ error: error.message });
  }
};
