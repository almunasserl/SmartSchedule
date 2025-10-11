const sql = require("../config/db");

// جلب كل الاستبيانات (للمسؤول)
exports.getAllSurveys = async (req, res) => {
  try {
    const result = await sql`
      SELECT s.*, d.name AS dept_name, t.name AS level_name,
        CASE
          WHEN s.start_date <= NOW() AND s.end_date >= NOW() THEN 'active'
          WHEN s.end_date < NOW() THEN 'closed'
          ELSE 'upcoming'
        END AS status
      FROM survey s
      JOIN departments d ON s.dept_id = d.id
      JOIN level t ON s.level_id = t.id
      ORDER BY s.id ASC
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 1) إنشاء Survey جديد
 */
exports.createSurvey = async (req, res) => {
  try {
    const { title, dept_id, level_id, start_date, end_date } = req.body;

    const result = await sql`
      INSERT INTO survey (title, dept_id, level_id, start_date, end_date)
      VALUES (${title}, ${dept_id}, ${level_id}, ${start_date}, ${end_date})
      RETURNING *
    `;

    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 2) جلب السيرفايات المتاحة للطالب
 */
exports.getAvailableSurveys = async (req, res) => {
  try {
    const { studentId } = req.params;

    // نحدد القسم والترم للطالب
    const student = await sql`
      SELECT dept_id, level_id FROM student WHERE id = ${studentId}
    `;
    if (student.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const { dept_id, level_id } = student[0];

    // نجيب السيرفايات المفتوحة + حالة الطالب
    const surveys = await sql`
      SELECT s.*,
        EXISTS (
          SELECT 1 FROM elective_preferences sp
          WHERE sp.survey_id = s.id AND sp.student_id = ${studentId}
        ) AS has_voted
      FROM survey s
      WHERE s.dept_id = ${dept_id}
        AND s.level_id = ${level_id}
        AND s.start_date <= NOW()
        AND s.end_date >= NOW()
      ORDER BY s.start_date DESC
    `;

    res.json(surveys);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 3) جلب تفاصيل Survey محدد
 */
exports.getSurveyDetails = async (req, res) => {
  try {
    const { surveyId } = req.params;

    // السيرفاي نفسه
    const survey = await sql`SELECT * FROM survey WHERE id = ${surveyId}`;
    if (survey.length === 0) {
      return res.status(404).json({ error: "Survey not found" });
    }

    // المواد الاختيارية للقسم والترم
    const electives = await sql`
      SELECT c.* 
      FROM courses c
      JOIN survey s ON s.dept_id = c.dept_id AND s.level_id = c.level_id
      WHERE s.id = ${surveyId} AND c.type = 'elective'
    `;

    res.json({ survey: survey[0], electives });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 4) تصويت الطالب
 */
exports.voteSurvey = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const { student_id, first_choice, second_choice, third_choice } = req.body;

    // التحقق أن الطالب ما صوت من قبل
    const existing = await sql`
      SELECT * FROM elective_preferences
      WHERE survey_id = ${surveyId} AND student_id = ${student_id}
    `;
    if (existing.length > 0) {
      return res.status(400).json({ error: "Already voted" });
    }

    const result = await sql`
      INSERT INTO elective_preferences (survey_id, student_id, first_choice, second_choice, third_choice)
      VALUES (${surveyId}, ${student_id}, ${first_choice}, ${second_choice}, ${third_choice})
      RETURNING *
    `;

    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * عرض نتائج الاستبيان (survey results)
 */
exports.getSurveyResults = async (req, res) => {
  try {
    const { surveyId } = req.params;

    const results = await sql`
      SELECT 
        c.id AS course_id,
        c.name AS course_name,
        COUNT(*) FILTER (WHERE ep.rank = 1) AS first_choice,
        COUNT(*) FILTER (WHERE ep.rank = 2) AS second_choice,
        COUNT(*) FILTER (WHERE ep.rank = 3) AS third_choice,
        COUNT(*) AS total_votes
      FROM courses c
      JOIN elective_preferences ep ON ep.course_id = c.id
      JOIN survey s ON s.id = ep.survey_id
      WHERE s.id = ${surveyId}
      GROUP BY c.id, c.name
      ORDER BY first_choice DESC, total_votes DESC
    `;

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
