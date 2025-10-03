const sql = require("../config/db");

/**
 * 1) إنشاء جدول جديد
 */
exports.createSchedule = async (req, res) => {
  try {
    const { term_id, dept_id, title, created_by } = req.body;

    const result = await sql`
      INSERT INTO schedule (term_id, dept_id, title, created_by)
      VALUES (${term_id}, ${dept_id}, ${title}, ${created_by})
      RETURNING *
    `;

    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 2) جلب كل الجداول
 */
exports.getAllSchedules = async (req, res) => {
  try {
    const result = await sql`
      SELECT 
        s.id,
        s.title,
        s.status,
        s.created_at,
        d.name AS dept_name,
        t.name AS term_name,
        a.email AS created_by_email,
        af.email AS approved_by_email
      FROM schedule s
      JOIN departments d ON s.dept_id = d.id
      JOIN term t ON s.term_id = t.id
      LEFT JOIN auth a ON s.created_by = a.id
      LEFT JOIN auth af ON s.approved_by = af.id
      ORDER BY s.created_at DESC
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 3) جلب جدول محدد مع سكشناته
 */
exports.getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await sql`SELECT * FROM schedule WHERE id = ${id}`;
    if (schedule.length === 0)
      return res.status(404).json({ error: "Schedule not found" });

    const sections = await sql`
      SELECT s.*, c.name AS course_name, f.name AS instructor_name, r.name AS room_name, r.building
      FROM sections s
      JOIN courses c ON s.course_id = c.id
      JOIN faculty f ON s.instructor_id = f.id
      JOIN room r ON s.room_id = r.id
      WHERE s.schedule_id = ${id}
      ORDER BY s.day_of_week, s.start_time
    `;

    res.json({ schedule: schedule[0], sections });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 4) تحديث جدول
 */
exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const result = await sql`
      UPDATE schedule SET title = COALESCE(${title}, title), updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (result.length === 0)
      return res.status(404).json({ error: "Schedule not found" });

    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 5) حذف جدول
 */
exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    await sql`DELETE FROM schedule WHERE id = ${id}`;
    res.json({ message: "Schedule deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 6) اعتماد جدول (approve)
 */
exports.approveSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved_by } = req.body;

    const result = await sql`
      UPDATE schedule
      SET status = 'approved', approved_by = ${approved_by}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (result.length === 0)
      return res.status(404).json({ error: "Schedule not found" });

    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 7) نشر جدول (publish)
 */
exports.publishSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await sql`
      UPDATE schedule
      SET status = 'published', updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (result.length === 0)
      return res.status(404).json({ error: "Schedule not found" });

    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getScheduleStats = async (req, res) => {
  try {
    // إجمالي كل الجداول
    const overall = await sql`
      SELECT 
        COUNT(*) AS total_schedules,
        COUNT(*) FILTER (WHERE status = 'draft') AS draft_schedules,
        COUNT(*) FILTER (WHERE status = 'approved') AS approved_schedules,
        COUNT(*) FILTER (WHERE status = 'published') AS published_schedules
      FROM schedule
    `;

    // عدد الجداول لكل قسم
    const byDept = await sql`
      SELECT d.id AS dept_id, d.name AS dept_name, COUNT(s.id) AS total_schedules
      FROM departments d
      JOIN schedule s ON d.id = s.dept_id
      GROUP BY d.id, d.name
      ORDER BY total_schedules DESC
    `;

    res.json({
      overall: overall[0],
      byDepartment: byDept,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
