const sql = require("../config/db");

/**
 * عرض المواد الخاصة بالأستاذ
 */
exports.getFacultyCourses = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const courses = await sql`
      SELECT c.* 
      FROM courses c
      JOIN sections s ON c.id = s.course_id
      WHERE s.instructor_id = ${facultyId}
      GROUP BY c.id
    `;
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * عرض السكاشن الخاصة بالأستاذ
 */
exports.getFacultySections = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const sections = await sql`
      SELECT s.*, c.name AS course_name, r.name AS room_name, r.building
      FROM sections s
      JOIN courses c ON s.course_id = c.id
      JOIN room r ON s.room_id = r.id
      WHERE s.instructor_id = ${facultyId}
    `;
    res.json(sections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



/**
 * إضافة توفر الأستاذ
 */
exports.addAvailability = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const { day, start_time, end_time } = req.body;

    const result = await sql`
      INSERT INTO faculty_availability (faculty_id, day, start_time, end_time)
      VALUES (${facultyId}, ${day}, ${start_time}, ${end_time})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * عرض التوفر
 */
exports.getAvailability = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const result = await sql`
      SELECT * FROM faculty_availability
      WHERE faculty_id = ${facultyId}
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * حذف توفر
 */
exports.deleteAvailability = async (req, res) => {
  try {
    const { facultyId, id } = req.params;

    await sql`
      DELETE FROM faculty_availability
      WHERE faculty_id = ${facultyId} AND id = ${id}
    `;
    res.json({ message: "Availability deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * عرض الجدول الخاص بالأستاذ مجمع حسب الأيام
 */
exports.getFacultySchedule = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const schedule = await sql`
      SELECT s.day_of_week,
             json_agg(
               json_build_object(
                 'course_name', c.name,
                 'start_time', s.start_time,
                 'end_time', s.end_time,
                 'room_name', r.name,
                 'building', r.building
               )
               ORDER BY s.start_time
             ) AS classes
      FROM sections s
      JOIN courses c ON s.course_id = c.id
      JOIN room r ON s.room_id = r.id
      WHERE s.instructor_id = ${facultyId}
      GROUP BY s.day_of_week
      ORDER BY MIN(s.start_time)
    `;

    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * إحصائيات الأستاذ (عدد المقررات وعدد السكاشن)
 */
exports.getFacultyStats = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const stats = await sql`
      SELECT 
        COUNT(DISTINCT c.id) AS total_courses,
        COUNT(s.id) AS total_sections
      FROM sections s
      JOIN courses c ON s.course_id = c.id
      WHERE s.instructor_id = ${facultyId}
    `;

    res.json(stats[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


