const sql = require("../config/db");

// جلب كل الرولز
exports.getAllRules = async (req, res) => {
  try {
    const rules = await sql`SELECT * FROM rules ORDER BY id ASC`;
    res.json(rules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateRule = async (req, res) => {
  try {
    const { ruleId } = req.params;
    const {
      work_start,
      work_end,
      working_days,
      break_start,
      break_end,
      lecture_duration,
    } = req.body;

    // ✅ التحقق من أوقات الدوام
    if (work_start && work_end && work_start >= work_end) {
      return res
        .status(400)
        .json({ error: "Work start time must be before work end time" });
    }

    // ✅ التحقق من أوقات البريك
    if (break_start && break_end && break_start >= break_end) {
      return res
        .status(400)
        .json({ error: "Break start time must be before break end time" });
    }

    // ✅ التحقق أن البريك داخل أوقات الدوام
    if (
      (work_start && break_start && break_start < work_start) ||
      (work_end && break_end && break_end > work_end)
    ) {
      return res
        .status(400)
        .json({ error: "Break must be within working hours" });
    }

    // ✅ التحقق من مدة المحاضرة
    if (lecture_duration && (lecture_duration <= 0 || lecture_duration > 240)) {
      return res
        .status(400)
        .json({ error: "Lecture duration must be between 1 and 240 minutes" });
    }

    // ✅ التحقق من أيام الدوام
    if (working_days && !Array.isArray(working_days)) {
      return res.status(400).json({ error: "Working days must be an array" });
    }

    const result = await sql`
      UPDATE rules
      SET
        work_start = COALESCE(${work_start}, work_start),
        work_end = COALESCE(${work_end}, work_end),
        working_days = COALESCE(${working_days}, working_days),
        break_start = COALESCE(${break_start}, break_start),
        break_end = COALESCE(${break_end}, break_end),
        lecture_duration = COALESCE(${lecture_duration}, lecture_duration)
      WHERE id = ${ruleId}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Rule not found" });
    }

    res.json({ message: "Rule updated successfully", rule: result[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
