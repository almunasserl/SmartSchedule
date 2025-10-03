const express = require("express");
const router = express.Router();
const {
  getAllStudents,
  updateStudent,
  deleteStudent,
  getStudentCourses,
  getCourseSections,
  enrollInSection,
  getStudentSchedule,
  getStudentStats,
} = require("../controllers/studentController");

// جلب كل الطلاب
router.get("/", getAllStudents);
router.patch("/:studentId", updateStudent);
router.delete("/:studentId", deleteStudent);

router.get("/:studentId/courses", getStudentCourses);

// عرض السكاشن لمادة
router.get("/courses/:courseId/sections", getCourseSections);

// تسجيل الطالب في سكشن
router.post("/:studentId/enroll", enrollInSection);

// عرض الجدول
router.get("/:studentId/schedule", getStudentSchedule);

// إحصائيات المواد
router.get("/:studentId/stats", getStudentStats);

module.exports = router;
