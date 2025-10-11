const sql = require("../config/db");
const openai = require("../config/openai");

exports.generateSmartSections = async (req, res) => {
  try {
    // 🔹 اجمع كل البيانات اللازمة من قاعدة البيانات
    const [
      courses,
      facultyCourses,
      facultyAvailability,
      prevSections,
      rules,
      faculty,
      rooms,
    ] = await Promise.all([
      sql`SELECT id, code, name, level_id, dept_id, credit_hours FROM courses`,
      sql`SELECT course_id, faculty_id FROM faculty_courses`,
      sql`SELECT faculty_id, day, start_time, end_time FROM faculty_availability`,
      sql`SELECT id, course_id, instructor_id, room_id, day_of_week, start_time, end_time FROM sections`,
      sql`SELECT * FROM rules LIMIT 1`,
      sql`SELECT id, name FROM faculty`,
      sql`SELECT id, name FROM room`,
    ]);

    const r = rules[0];
    const hasAvailability = facultyAvailability.length > 0;

    // 🔸 بناء النص الكامل المرسل إلى الذكاء الاصطناعي
    const context = `
You are an advanced university scheduling assistant.

${
  !hasAvailability
    ? "⚠️ NOTE: No faculty availability data is provided. You may suggest times logically within working hours (8:00–16:00) while ensuring no overlaps."
    : ""
}

Your goal is to generate new course sections (classes) for the next semester
while respecting all academic rules, instructor availability, and existing schedule constraints.

---

📘 COURSES:
${courses
  .map(
    (c) =>
      `${c.id}: ${c.code} - ${c.name} (Level ${c.level_id}, Dept ${c.dept_id}, Credit hours ${c.credit_hours})`
  )
  .join("\n")}

👨‍🏫 FACULTY LIST:
${faculty.map((f) => `${f.id}: ${f.name}`).join("\n")}

🏫 ROOMS:
${rooms.map((r) => `${r.id}: ${r.name}`).join("\n")}

📚 FACULTY COURSES (who can teach what):
${facultyCourses
  .map(
    (fc) => `Course ${fc.course_id} can be taught by Faculty ${fc.faculty_id}`
  )
  .join("\n")}

📅 FACULTY AVAILABILITY:
${facultyAvailability
  .map(
    (fa) =>
      `Faculty ${fa.faculty_id}: available on ${fa.day} from ${fa.start_time} to ${fa.end_time}`
  )
  .join("\n")}

⚠️ EXISTING SECTIONS (avoid conflicts with these):
${prevSections
  .map(
    (s) =>
      `Course ${s.course_id} taught by Faculty ${s.instructor_id} in Room ${s.room_id} on ${s.day_of_week} from ${s.start_time} to ${s.end_time}`
  )
  .join("\n")}

🧩 RULES:
- Working hours: ${r.work_start} to ${r.work_end}
- Working days: ${r.working_days.join(", ")}
- Break time: ${r.break_start} to ${r.break_end}
- Max lecture duration: ${r.lecture_duration} minutes
- Minimum students to open section: ${r.min_students_to_open_section}

---

🎯 TASK:
Generate a JSON array of 5–10 NEW SECTIONS following these rules:
Each object should contain:
- course_id
- course_code
- instructor_id
- faculty_name
- room_id
- room_name
- day_of_week
- start_time
- end_time
- capacity
- status = "draft"

Important:
- Avoid time conflicts with existing sections.
- Respect each faculty’s availability.
- Spread sections across available days.
- Avoid assigning the same instructor twice at overlapping times.
- Keep your response in pure JSON format only.
`;

    // 🔹 طلب من GPT يولّد السكاشن
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a university scheduling assistant. Respond ONLY with valid JSON.",
        },
        { role: "user", content: context },
      ],
      temperature: 0.7,
    });

    const raw = response.choices[0].message.content;

    let sections = [];
    try {
      // 🧹 تنظيف النص من أي Markdown قبل التحليل
      const cleaned = raw
        .replace(/```json/i, "")
        .replace(/```/g, "")
        .trim();
      sections = JSON.parse(cleaned);
    } catch (err) {
      console.error("❌ JSON parse failed:", err);
      return res.status(500).json({
        error: "AI returned invalid JSON format",
        raw,
      });
    }

    // ✅ إرسال الرد بصيغة JSON منسّقة وواضحة
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(sections, null, 2));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
