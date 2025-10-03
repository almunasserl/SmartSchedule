const sql = require("../config/db");

/**
 * 1) جلب جميع التعليقات
 */
exports.getAllFeedback = async (req, res) => {
  try {
    const feedback = await sql`
      SELECT f.*, a.email, a.role
      FROM feedback f
      JOIN auth a ON f.auth_id = a.id
      ORDER BY f.created_at DESC
    `;
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 2) إضافة تعليق
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
    res.status(500).json({ error: err.message });
  }
};

/**
 * 3) تعديل تعليق
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
    res.status(500).json({ error: err.message });
  }
};

/**
 * 4) حذف تعليق
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
    res.status(500).json({ error: err.message });
  }
};
