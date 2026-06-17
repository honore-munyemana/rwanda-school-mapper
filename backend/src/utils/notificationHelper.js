import pool from "../config/db.js";

/**
 * Creates a notification for a specific user.
 * Prevents duplicates by checking if a similar unread notification was created in the last 5 minutes.
 */
export async function createNotification(userId, title, message, type, referenceId = null, actionUrl = null) {
  try {
    // Standardize referenceId to string
    const refIdStr = referenceId !== null ? String(referenceId) : null;

    // Check for duplicates within the last 5 minutes
    const duplicateCheck = await pool.query(
      `SELECT id FROM notifications 
       WHERE user_id = $1 
         AND type = $2 
         AND (reference_id = $3 OR (reference_id IS NULL AND $3 IS NULL)) 
         AND is_read = false 
         AND created_at > NOW() - INTERVAL '5 minutes'`,
      [userId, type, refIdStr]
    );

    if (duplicateCheck.rows.length > 0) {
      // Duplicate found, skip insertion
      return duplicateCheck.rows[0];
    }

    // Insert new notification
    const insertResult = await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, reference_id, action_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, title, message, type, refIdStr, actionUrl]
    );

    return insertResult.rows[0];
  } catch (error) {
    console.error("Error in createNotification helper:", error);
    throw error;
  }
}

/**
 * Broadcasts a notification to all users of a specific role.
 */
export async function notifyAllUsersOfRole(role, title, message, type, referenceId = null, actionUrl = null) {
  try {
    const usersRes = await pool.query("SELECT id FROM users WHERE role = $1", [role]);
    const notifications = [];

    for (const user of usersRes.rows) {
      const notif = await createNotification(user.id, title, message, type, referenceId, actionUrl);
      if (notif) {
        notifications.push(notif);
      }
    }

    return notifications;
  } catch (error) {
    console.error(`Error in notifyAllUsersOfRole helper for role ${role}:`, error);
    throw error;
  }
}
