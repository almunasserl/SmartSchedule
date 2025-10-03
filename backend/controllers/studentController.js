const sql = require("../config/db");


// جلب كل الطلاب
exports.getAllStudents = async (req, res) => {
  try {
    const students = await sql`
      SELECT s.id, s.name, s.status, s.auth_id, 
             s.dept_id, d.name AS department_name,
             s.term_id, t.name AS term_name
      FROM student s
      JOIN departments d ON s.dept_id = d.id
      JOIN term t ON s.term_id = t.id
    `;
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// تعديل بيانات طالب
exports.updateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { name, dept_id, term_id, status } = req.body;

    // نحدّث السجل
    const result = await sql`
      UPDATE student
      SET 
        name = COALESCE(${name}, name),
        dept_id = COALESCE(${dept_id}, dept_id),
        term_id = COALESCE(${term_id}, term_id),
        status = COALESCE(${status}, status)
      WHERE id = ${studentId}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ message: "Student updated successfully", student: result[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    // جلب الطالب عشان نعرف الـ auth_id
    const student = await sql`
      SELECT * FROM student WHERE id = ${studentId}
    `;

    if (student.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const authId = student[0].auth_id;

    // حذف الطالب
    await sql`DELETE FROM student WHERE id = ${studentId}`;

    // حذف الحساب المرتبط
    await sql`DELETE FROM auth WHERE id = ${authId}`;

    res.json({ message: "Student and related auth deleted successfully", student: student[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



/**
 * 1) عرض المواد الخاصة بالطالب لهذا الترم
 */
exports.getStudentCourses = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await sql`SELECT * FROM student WHERE id = ${studentId}`;
    if (student.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const { dept_id, term_id } = student[0];

    const courses = await sql`
      SELECT * FROM courses
      WHERE dept_id = ${dept_id} AND term_id = ${term_id}
    `;

    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 2) استعراض السكاشن الخاصة بمقرر
 */
exports.getCourseSections = async (req, res) => {
  try {
    const { courseId } = req.params;

    const sections = await sql`
      SELECT s.*, f.name AS faculty_name, r.name AS room_name, r.building
      FROM sections s
      JOIN faculty f ON s.instructor_id = f.id
      JOIN room r ON s.room_id = r.id
      WHERE s.course_id = ${courseId}
    `;

    res.json(sections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 3) تسجيل الطالب في سكشن
 */
exports.enrollInSection = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { section_id } = req.body;

    // 1) جلب بيانات السكشن المطلوب التسجيل فيه
    const section = await sql`SELECT * FROM sections WHERE id = ${section_id}`;
    if (section.length === 0) {
      return res.status(404).json({ error: "Section not found" });
    }

    const courseId = section[0].course_id;

    // 2) التأكد أن الطالب ما مسجل نفس الكورس
    const existing = await sql`
      SELECT e.* FROM student_sections e
      JOIN sections s ON e.section_id = s.id
      WHERE e.student_id = ${studentId} AND s.course_id = ${courseId}
    `;
    if (existing.length > 0) {
      return res.status(400).json({ error: "Already enrolled in this course" });
    }

    // 3) التأكد من الكاباسيتي
    const count = await sql`
      SELECT COUNT(*)::int AS enrolled_count FROM student_sections WHERE section_id = ${section_id}
    `;
    if (count[0].enrolled_count >= section[0].capacity) {
      return res.status(400).json({ error: "Section capacity reached" });
    }

    // 4) التأكد من التعارض الزمني (CAST to time)
    const conflicts = await sql`
      SELECT s.id, s.day_of_week, s.start_time, s.end_time, c.name AS course_name
      FROM student_sections e
      JOIN sections s ON e.section_id = s.id
      JOIN courses c ON s.course_id = c.id
      WHERE e.student_id = ${studentId}
        AND s.day_of_week = ${section[0].day_of_week}
        AND (
          (s.start_time, s.end_time) OVERLAPS (
            ${section[0].start_time}::time, ${section[0].end_time}::time
          )
        )
    `;

    if (conflicts.length > 0) {
      return res.status(400).json({
        error: "Schedule conflict detected",
        conflicts,
      });
    }

    // 5) تسجيل الطالب
    const result = await sql`
      INSERT INTO student_sections (student_id, section_id)
      VALUES (${studentId}, ${section_id})
      RETURNING *
    `;

    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



/**
 * 4) عرض الجدول الخاص بالطالب
 */
exports.getStudentSchedule = async (req, res) => {
  try {
    const { studentId } = req.params;

    const schedule = await sql`
      SELECT s.day_of_week,
             json_agg(
               json_build_object(
                 'course_name', c.name,
                 'start_time', s.start_time,
                 'end_time', s.end_time,
                 'faculty_name', f.name,
                 'room_name', r.name,
                 'building', r.building
               )
               ORDER BY s.start_time
             ) AS classes
      FROM student_sections e
      JOIN sections s ON e.section_id = s.id
      JOIN courses c ON s.course_id = c.id
      JOIN faculty f ON s.instructor_id = f.id
      JOIN room r ON s.room_id = r.id
      WHERE e.student_id = ${studentId}
      GROUP BY s.day_of_week
      ORDER BY MIN(s.start_time)
    `;

    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/**
 * 5) إحصائيات المواد الخاصة بالطالب
 */
exports.getStudentStats = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await sql`SELECT * FROM student WHERE id = ${studentId}`;
    if (student.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const { dept_id, term_id } = student[0];

    const stats = await sql`
      SELECT 
        COUNT(*) AS total_courses,
        COUNT(*) FILTER (WHERE type = 'core') AS core_courses,
        COUNT(*) FILTER (WHERE type = 'elective') AS elective_courses
      FROM courses
      WHERE dept_id = ${dept_id} AND term_id = ${term_id}
    `;

    res.json(stats[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


