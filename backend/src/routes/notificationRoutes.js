import express from "express";
import pool from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all notification routes
router.use(authMiddleware);

// 1. GET /notifications - Get user notifications (latest 30) and unread count
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch latest 30 notifications
    const notificationsRes = await pool.query(
      `SELECT id, user_id, title, message, type, reference_id, action_url, is_read, created_at 
       FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 30`,
      [userId]
    );

    // Fetch unread count
    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS count 
       FROM notifications 
       WHERE user_id = $1 AND is_read = false`,
      [userId]
    );

    res.json({
      notifications: notificationsRes.rows,
      unreadCount: countRes.rows[0].count
    });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 2. PUT /notifications/:id/read - Mark a single notification as read
router.put("/:id/read", async (req, res) => {
  try {
    const notifId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    if (isNaN(notifId)) {
      return res.status(400).json({ error: "Invalid notification ID" });
    }

    const result = await pool.query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE id = $1 AND user_id = $2 
       RETURNING id`,
      [notifId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark notification read error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 3. PUT /notifications/read-all - Mark all user notifications as read
router.put("/read-all", async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE user_id = $1`,
      [userId]
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all read error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
