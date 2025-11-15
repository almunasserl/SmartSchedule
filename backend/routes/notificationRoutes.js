const express = require("express");
const router = express.Router();

const {
  getAllNotifications,
  getNotificationsByRole,
  getNotificationsByUser,
  addNotification,
  updateStatus, // ✅ unified publish/unpublish endpoint
  deleteNotification,
} = require("../controllers/notificationController");

/**
 * 🧾 Notification Routes
 */

// 1️⃣ Get all notifications
router.get("/", getAllNotifications);

// 3️⃣ Get notifications for a user (includes role + all)
router.get("/user/:userId/:role", getNotificationsByUser);

// 4️⃣ Add new notification (default = draft)
router.post("/", addNotification);

// 5️⃣ Update notification status (publish/unpublish)
router.patch("/:id/status", updateStatus);

// 6️⃣ Delete notification
router.delete("/:id", deleteNotification);

module.exports = router;
