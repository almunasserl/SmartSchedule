const express = require("express");
const router = express.Router();

const {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  publishSchedule,
  approveSchedule,
  deleteSchedule,
  getAvailableSections,
} = require("../controllers/scheduleController");

/**
 * 🧾 Schedule Routes
 */

// 1️⃣ Create a new schedule (default = draft)
router.post("/", createSchedule);

// 2️⃣ Get all schedules
router.get("/", getAllSchedules);

// 3️⃣ Get a single schedule by ID (with its sections)
router.get("/:scheduleId", getScheduleById);

// 4️⃣ Publish a schedule
router.patch("/:scheduleId/publish", publishSchedule);

// 5️⃣ Approve a schedule (by committee)
router.patch("/:scheduleId/approve", approveSchedule);

// 6️⃣ Delete a schedule (and its related sections)
router.delete("/:scheduleId", deleteSchedule);



module.exports = router;
