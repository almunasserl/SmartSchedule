const express = require("express");
const router = express.Router();
const {
  getCourses,
  
  addCourse,
  updateCourse,
  deleteCourse
} = require("../controllers/courseController");

// جلب كل الكورسات
router.get("/", getCourses);

// جلب كورس محدد


// إضافة كورس
router.post("/", addCourse);

// تحديث كورس
router.patch("/:id", updateCourse);

// حذف كورس
router.delete("/:id", deleteCourse);

module.exports = router;
