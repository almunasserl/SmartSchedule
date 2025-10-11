const express = require("express");
const router = express.Router();
const {
  getCourses,
  
  addCourse,
  updateCourse,
  deleteCourse,
  getCourseById
} = require("../controllers/courseController");

// جلب كل الكورسات
router.get("/", getCourses);

// جلب كورس محدد
router.get("/:id", getCourseById);


// إضافة كورس
router.post("/", addCourse);

// تحديث كورس
router.patch("/:id", updateCourse);

// حذف كورس
router.delete("/:id", deleteCourse);

module.exports = router;
