const sql = require("../config/db");

/**
 * 1) جلب الأقسام (id + name)
 */
exports.getDepartments = async (req, res) => {
  try {
    const result =
      await sql`SELECT id, name FROM departments ORDER BY name ASC`;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 2) جلب الترام (id + name)
 */
exports.getTerms = async (req, res) => {
  try {
    const result = await sql`SELECT id, name FROM level ORDER BY id ASC`;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 3) جلب أيام الدوام من جدول rules (working_days)
 * نفترض عندك جدول اسمه rules أو system_rules فيه الأعمدة work_start, work_end, working_days
 */
exports.getWorkingDays = async (req, res) => {
  try {
    const result = await sql`SELECT working_days FROM rules LIMIT 1`;

    if (result.length === 0) {
      return res.status(404).json({ error: "No working days found" });
    }

    // نرجع الأيام كمصفوفة JSON
    res.json(result[0].working_days);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 4) جلب أسماء الجداول مع الـ id
 */

/**
 * جلب الكورسات (id + name)
 */
exports.getCoursesList = async (req, res) => {
  try {
    const result = await sql`
      SELECT id, code
      FROM courses
      ORDER BY code ASC
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * جلب الأساتذة (id + name)
 */
exports.getFacultyList = async (req, res) => {
  try {
    const result = await sql`
      SELECT id, name 
      FROM faculty
      ORDER BY name ASC
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * جلب القاعات (id + "name (building - capacity)")
 */
exports.getRoomsList = async (req, res) => {
  try {
    const result = await sql`
      SELECT 
        id, 
        name || ' (' || building || ' - ' || capacity || ')' AS label
      FROM room
      ORDER BY name ASC
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
