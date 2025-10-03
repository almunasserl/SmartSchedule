const sql = require("../config/db");

// عدد الطلاب
exports.getTotalStudents = async (req, res) => {
  try {
    const result = await sql`SELECT COUNT(*) AS total_students FROM student`;
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// عدد المدرسين
exports.getTotalFaculty = async (req, res) => {
  try {
    const result = await sql`SELECT COUNT(*) AS total_faculty FROM faculty`;
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// عدد الأقسام
exports.getTotalDepartments = async (req, res) => {
  try {
    const result =
      await sql`SELECT COUNT(*) AS total_departments FROM departments`;
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// عدد المقررات
exports.getTotalCourses = async (req, res) => {
  try {
    const result = await sql`SELECT COUNT(*) AS total_courses FROM courses`;
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// عدد الاستبيانات
exports.getTotalSurveys = async (req, res) => {
  try {
    const result = await sql`SELECT COUNT(*) AS total_surveys FROM survey`;
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// نسبة الطلاب المنتظمين مقابل غير المنتظمين
exports.getStudentStatusRatio = async (req, res) => {
  try {
    const result = await sql`
      SELECT status, COUNT(*) AS total
      FROM student
      GROUP BY status
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// عدد الطلاب في كل ترم
exports.getStudentsByTerm = async (req, res) => {
  try {
    const result = await sql`
      SELECT term_id, COUNT(*) AS total_students
      FROM student
      GROUP BY term_id
      ORDER BY term_id
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// عدد الطلاب في كل قسم
exports.getStudentsByDepartment = async (req, res) => {
  try {
    const result = await sql`
      SELECT d.name AS department, COUNT(s.id) AS total_students
      FROM student s
      JOIN departments d ON s.dept_id = d.id
      GROUP BY d.name
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// عدد المسجلين في كل سكشن مع الكاباسيتي
exports.getSectionEnrollment = async (req, res) => {
  try {
    const result = await sql`
      SELECT sec.id AS section_id, c.name AS course, sec.capacity, 
             COUNT(sc.student_id) AS enrolled
      FROM sections sec
      JOIN courses c ON sec.course_id = c.id
      LEFT JOIN student_sections sc ON sec.id = sc.section_id
      GROUP BY sec.id, c.name, sec.capacity
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 عدد الاستبيانات السارية والمغلقة
exports.getSurveyStatusCounts = async (req, res) => {
  try {
    const result = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE start_date <= NOW() AND end_date >= NOW()) AS active_surveys,
        COUNT(*) FILTER (WHERE end_date < NOW()) AS closed_surveys
      FROM survey
    `;
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 عدد الأقسام اللي معاها استبيانات
exports.getDepartmentsWithSurveys = async (req, res) => {
  try {
    const result = await sql`
      SELECT COUNT(DISTINCT d.id) AS total_departments
      FROM departments d
      JOIN survey s ON d.id = s.dept_id
     
    `;
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 عدد المقررات الاختيارية والإجبارية
exports.getCourseTypesCount = async (req, res) => {
  try {
    const result = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE type = 'core') AS core_courses,
        COUNT(*) FILTER (WHERE type = 'elective') AS elective_courses
      FROM courses
    `;
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 إجمالي عدد الساعات للمواد في كل قسم
exports.getTotalCreditsByDepartment = async (req, res) => {
  try {
    const result = await sql`
      SELECT d.name AS department, SUM(c.credit_hours) AS total_credit_hours
      FROM courses c
      JOIN departments d ON c.dept_id = d.id
      GROUP BY d.name
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 عدد الطلاب المشاركين في الاستبيانات
exports.getSurveyParticipants = async (req, res) => {
  try {
    const result = await sql`
      SELECT COUNT(DISTINCT student_id) AS total_participants
      FROM elective_preferences
    `;
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 عدد الإشعارات الإجمالي
exports.getTotalNotifications = async (req, res) => {
  try {
    const result =
      await sql`SELECT COUNT(*) AS total_notifications FROM notifications`;
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 عدد الإشعارات الخاصة بكل رول
exports.getNotificationsByRole = async (req, res) => {
  try {
    const result = await sql`
      SELECT role, COUNT(*) AS total_notifications
      FROM notifications
      WHERE role IS NOT NULL
      GROUP BY role
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 عدد الإشعارات الموجهة لأشخاص (يعني عندها user_id)
exports.getNotificationsByUser = async (req, res) => {
  try {
    const result = await sql`
      SELECT user_id, COUNT(*) AS total_notifications
      FROM notifications
      WHERE user_id IS NOT NULL
      GROUP BY user_id
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
