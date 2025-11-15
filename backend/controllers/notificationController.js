const sql = require("../config/db");

/**
 * 1️⃣ Get all notifications
 */
exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await sql`
      SELECT * FROM notifications
      ORDER BY created_at DESC
    `;
    res.json(notifications);
  } catch (err) {
    console.error("❌ Error in getAllNotifications:", err.message);
    res.status(500).json({ error: err.message });
  }
};



/**
 * 3️⃣ Get notifications for a user:
 *     - Direct (user_id = ?)
 *     - Role-based (role = user's role)
 *     - General (role = 'all')
 */
exports.getNotificationsByUser = async (req, res) => {
  try {
    const { userId, role } = req.params;

    // 🧠 Validate input
    if (!userId || !role) {
      return res.status(400).json({ error: "Missing userId or role" });
    }

    // 🔹 Fetch notifications that match user_id, role, or all
    const notifications = await sql`
      SELECT *
      FROM notifications
      WHERE 
        user_id = ${userId}
        OR LOWER(role) = LOWER(${role})
        OR LOWER(role) = 'all'
      ORDER BY created_at DESC;
    `;

    if (notifications.length === 0) {
      return res.status(200).json([]); // empty array but successful response
    }

    res.status(200).json(notifications);
  } catch (err) {
    console.error("❌ Error in getNotificationsByUser:", err.message);
    res.status(500).json({ error: err.message });
  }
};


/**
 * 4️⃣ Create a new notification (default: draft)
 */
exports.addNotification = async (req, res) => {
  try {
    const { title, description, role, user_id } = req.body;

    const result = await sql`
      INSERT INTO notifications (title, description, role, user_id, isread, created_at, status)
      VALUES (${title}, ${description}, ${role || null}, ${user_id || null}, false, NOW(), 'draft')
      RETURNING *
    `;

    res.status(201).json(result[0]);
  } catch (err) {
    console.error("❌ Error in addNotification:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 5️⃣ Update notification status (publish / unpublish toggle)
 */
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // expected values: 'published' or 'draft'

    if (!["published", "draft"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const result = await sql`
      UPDATE notifications
      SET status = ${status}
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ message: `Notification marked as ${status}`, notification: result[0] });
  } catch (err) {
    console.error("❌ Error in updateStatus:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 6️⃣ Delete notification
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await sql`
      DELETE FROM notifications
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ message: "Notification deleted successfully" });
  } catch (err) {
    console.error("❌ Error in deleteNotification:", err.message);
    res.status(500).json({ error: err.message });
  }
};
