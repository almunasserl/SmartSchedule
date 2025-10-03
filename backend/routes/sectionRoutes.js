const express = require("express");
const router = express.Router();
const sectionsController = require("../controllers/sectionController");

// إنشاء سكشن
router.post("/", sectionsController.createSection);

// تحديث سكشن
router.put("/:sectionId", sectionsController.updateSection);

// جلب كل السكشنز
router.get("/", sectionsController.getAllSections);

// حذف سكشن
router.delete("/:sectionId", sectionsController.deleteSection);

module.exports = router;
