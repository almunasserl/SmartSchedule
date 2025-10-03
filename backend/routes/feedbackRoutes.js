const express = require("express");
const router = express.Router();
const {
  getAllFeedback,
  addFeedback,
  updateFeedback,
  deleteFeedback
} = require("../controllers/feedbackController");

// جلب كل التعليقات
router.get("/", getAllFeedback);

// إضافة تعليق
router.post("/", addFeedback);

// تعديل تعليق
router.patch("/:feedbackId", updateFeedback);

// حذف تعليق
router.delete("/:feedbackId", deleteFeedback);

module.exports = router;
