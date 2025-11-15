const sql = require("../config/db");

/**
 * 🧾 جلب المواد (id + course_code)
 */
exports.getCoursesList = async (req, res) => {
  try {
    const result = await sql`
      SELECT 
        id, 
        course_code AS label
      FROM course
      ORDER BY course_code ASC
    `;
    res.json(result);
  } catch (err) {
    console.error("❌ Error fetching courses list:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 🧑‍🏫 جلب الأساتذة (id + name)
 */
exports.getFacultyList = async (req, res) => {
  try {
    const result = await sql`
      SELECT 
        id, 
        name AS label
      FROM faculty
      ORDER BY name ASC
    `;
    res.json(result);
  } catch (err) {
    console.error("❌ Error fetching faculty list:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 🏫 جلب القاعات (id + name (building - capacity))
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
    console.error("❌ Error fetching rooms list:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 🎓 جلب المستويات (id + name)
 */
exports.getLevelsList = async (req, res) => {
  try {
    const result = await sql`
      SELECT 
        id, 
        name AS name
      FROM level
      ORDER BY id ASC
    `;
    res.json(result);
  } catch (err) {
    console.error("❌ Error fetching levels list:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 🧭 جلب الطلاب (id + name)
 */
exports.getStudentsList = async (req, res) => {
  try {
    const result = await sql`
      SELECT 
        id, 
        name AS label
      FROM student
      ORDER BY name ASC
    `;
    res.json(result);
  } catch (err) {
    console.error("❌ Error fetching students list:", err);
    res.status(500).json({ error: err.message });
  }
};
