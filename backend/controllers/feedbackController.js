const sql = require("../config/db");

/**
 * 1️⃣ جلب جميع التعليقات (مع بيانات المستخدم والرد)
 */
exports.getAllFeedback = async (req, res) => {
  try {
    const feedback = await sql`
      SELECT f.id, f.type, f.text, f.reply, f.created_at, 
             a.email, a.role
      FROM feedback f
      JOIN auth a ON f.auth_id = a.id
      ORDER BY f.created_at DESC
    `;
    res.json(feedback);
  } catch (err) {
    console.error("❌ Error in getAllFeedback:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 🟢 جلب التعليقات الخاصة بنوع assignment فقط
 */
exports.getAssignmentFeedbacks = async (req, res) => {
  try {
    const feedback = await sql`
      SELECT f.id, f.type, f.text, f.reply, f.created_at, 
             a.email, a.role
      FROM feedback f
      JOIN auth a ON f.auth_id = a.id
      WHERE f.type = 'assignment'
      ORDER BY f.created_at DESC
    `;
    if (feedback.length === 0) {
      return res.status(404).json({ message: "No assignment feedback found" });
    }
    res.status(200).json(feedback);
  } catch (err) {
    console.error("❌ Error in getAssignmentFeedbacks:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 🟠 جلب جميع التعليقات باستثناء النوع assignment
 */
exports.getNonAssignmentFeedbacks = async (req, res) => {
  try {
    const feedback = await sql`
      SELECT f.id, f.type, f.text, f.reply, f.created_at, 
             a.email, a.role
      FROM feedback f
      JOIN auth a ON f.auth_id = a.id
      WHERE f.type <> 'assignment' OR f.type IS NULL
      ORDER BY f.created_at DESC
    `;
    if (feedback.length === 0) {
      return res.status(404).json({ message: "No non-assignment feedback found" });
    }
    res.status(200).json(feedback);
  } catch (err) {
    console.error("❌ Error in getNonAssignmentFeedbacks:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 2️⃣ جلب التعليقات الخاصة بمستخدم معين
 */
exports.getFeedbackByUser = async (req, res) => {
  try {
    const { authId } = req.params;

    const feedback = await sql`
      SELECT f.id, f.type, f.text, f.reply, f.created_at
      FROM feedback f
      WHERE f.auth_id = ${authId}
      ORDER BY f.created_at DESC
    `;

    if (feedback.length === 0) {
      return res.status(404).json({ message: "No feedback found for this user" });
    }

    res.status(200).json(feedback);
  } catch (err) {
    console.error("❌ Error in getFeedbackByUser:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 3️⃣ إضافة تعليق جديد
 */
exports.addFeedback = async (req, res) => {
  try {
    const { auth_id, type, text } = req.body;

    const result = await sql`
      INSERT INTO feedback (auth_id, type, text)
      VALUES (${auth_id}, ${type}, ${text})
      RETURNING *
    `;

    res.status(201).json(result[0]);
  } catch (err) {
    console.error("❌ Error in addFeedback:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 4️⃣ تعديل التعليق (النص فقط)
 */
exports.updateFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { text } = req.body;

    const result = await sql`
      UPDATE feedback
      SET text = ${text}
      WHERE id = ${feedbackId}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    res.json({ message: "Feedback updated", feedback: result[0] });
  } catch (err) {
    console.error("❌ Error in updateFeedback:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 5️⃣ إضافة أو تعديل الرد على التعليق (reply)
 */
exports.replyToFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { reply } = req.body;

    const result = await sql`
      UPDATE feedback
      SET reply = ${reply}
      WHERE id = ${feedbackId}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    res.json({ message: "Reply added successfully", feedback: result[0] });
  } catch (err) {
    console.error("❌ Error in replyToFeedback:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 6️⃣ حذف تعليق
 */
exports.deleteFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;

    const result = await sql`
      DELETE FROM feedback
      WHERE id = ${feedbackId}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    res.json({ message: "Feedback deleted successfully" });
  } catch (err) {
    console.error("❌ Error in deleteFeedback:", err.message);
    res.status(500).json({ error: err.message });
  }
};
