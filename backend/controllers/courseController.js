const sql = require("../config/db");

/**
 * 1) جلب جميع الكورسات
 */
exports.getCourses = async (req, res) => {
  try {
    const courses = await sql`
      SELECT * FROM courses
      ORDER BY id ASC
    `;
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 2) جلب كورس محدد
 */
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await sql`
      SELECT * FROM courses
      WHERE id = ${id}
    `;

    if (course.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json(course[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 3) إضافة كورس جديد
 */
exports.addCourse = async (req, res) => {
  try {
    const { code, name, type, dept_id, term_id, credit_hours } = req.body;

    const result = await sql`
      INSERT INTO courses (code, name, type, dept_id, term_id, credit_hours)
      VALUES (${code}, ${name}, ${type}, ${dept_id}, ${term_id}, ${credit_hours})
      RETURNING *
    `;

    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 4) تحديث كورس
 */
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, type, dept_id, term_id, credit_hours } = req.body;

    const result = await sql`
      UPDATE courses
      SET 
        code = COALESCE(${code}, code),
        name = COALESCE(${name}, name),
        type = COALESCE(${type}, type),
        dept_id = COALESCE(${dept_id}, dept_id),
        term_id = COALESCE(${term_id}, term_id),
        credit_hours = COALESCE(${credit_hours}, credit_hours)
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 5) حذف كورس
 */
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await sql`
      DELETE FROM courses
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json({ message: "Course deleted", course: result[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
