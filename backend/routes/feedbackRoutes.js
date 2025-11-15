const express = require("express");
const router = express.Router();

const {
  getAllFeedback,
  getFeedbackByUser,
  addFeedback,
  updateFeedback,
  replyToFeedback,
  deleteFeedback,
  getAssignmentFeedbacks,        // ✅ جديد
  getNonAssignmentFeedbacks       // ✅ جديد
} = require("../controllers/feedbackController");

/**
 * 🧾 جميع المسارات الخاصة بالتعليقات
 */

// 1️⃣ جلب كل التعليقات
router.get("/", getAllFeedback);

// 2️⃣ جلب تعليقات مستخدم معين
router.get("/user/:authId", getFeedbackByUser);

// 3️⃣ جلب التعليقات من نوع assignment فقط
router.get("/type/assignment", getAssignmentFeedbacks);

// 4️⃣ جلب جميع التعليقات باستثناء نوع assignment
router.get("/type/non-assignment", getNonAssignmentFeedbacks);

// 5️⃣ إضافة تعليق جديد
router.post("/", addFeedback);

// 6️⃣ تعديل نص التعليق
router.patch("/:feedbackId", updateFeedback);

// 7️⃣ إضافة أو تعديل الرد على التعليق (reply)
router.patch("/:feedbackId/reply", replyToFeedback);

// 8️⃣ حذف تعليق
router.delete("/:feedbackId", deleteFeedback);

module.exports = router;
