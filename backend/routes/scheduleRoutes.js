const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");

// إنشاء جدول جديد
router.post("/", scheduleController.createSchedule);

// إحصائيات الجداول
router.get("/stats", scheduleController.getScheduleStats);

// جلب كل الجداول
router.get("/", scheduleController.getAllSchedules);


// جلب جدول محدد مع سكشناته
router.get("/:id", scheduleController.getScheduleById);

// تحديث جدول
router.put("/:id", scheduleController.updateSchedule);

// حذف جدول
router.delete("/:id", scheduleController.deleteSchedule);

// اعتماد جدول
router.put("/:id/approve", scheduleController.approveSchedule);

// نشر جدول
router.put("/:id/publish", scheduleController.publishSchedule);



module.exports = router;
