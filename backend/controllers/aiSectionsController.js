const sql = require("../config/db");
const openai = require("../config/openai");

// ===================== Smart Sections via OpenAI =====================
exports.generateSmartSections = async (req, res) => {
  try {
    const { level_id, group_id } = req.body;

    if (!level_id) {
      return res.status(400).json({ error: "Missing required field: level_id" });
    }

    // 🔹 Gather data from actual tables
    const [
      courses,
      facultyCourses,
      prevSections,
      faculty,
      rooms,
    ] = await Promise.all([
      // Filter courses by selected level
      sql`
        SELECT id, course_code, course_name, credit_hours, type, level_id, capacity
        FROM course
        WHERE level_id = ${level_id}
      `,
      sql`SELECT course_id, faculty_id FROM course_facultys`,
      sql`SELECT id, course_id, faculty_id, room_id, day_of_week, start_time, end_time FROM sections`,
      sql`SELECT id, name FROM faculty`,
      sql`SELECT id, name, capacity FROM room`,
    ]);

    // 🧭 Fixed system rules
    const WORK_START = "08:00";
    const WORK_END = "15:00";
    const BREAK_START = "12:00";
    const BREAK_END = "13:00";
    const WORKING_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

    // 🔸 Build the context prompt for GPT
    const context = `
You are an advanced university scheduling assistant.
Your task is to generate valid new course sections for the next semester
based on real university constraints.

---

📘 COURSES (Filtered by Level ${level_id}):
${courses
  .map(
    (c) =>
      `${c.id}: ${c.course_code} - ${c.course_name} (Credit Hours ${c.credit_hours}, Type ${c.type || "Lecture"}, Capacity ${c.capacity})`
  )
  .join("\n")}

👨‍🏫 FACULTY LIST:
${faculty.map((f) => `${f.id}: ${f.name}`).join("\n")}

🏫 ROOMS:
${rooms.map((r) => `${r.id}: ${r.name} (Capacity ${r.capacity})`).join("\n")}

📚 FACULTY COURSES (who can teach what):
${facultyCourses
  .map(
    (fc) => `Course ${fc.course_id} can be taught by Faculty ${fc.faculty_id}`
  )
  .join("\n")}

⚠️ EXISTING SECTIONS (avoid conflicts):
${prevSections
  .map(
    (s) =>
      `Course ${s.course_id} taught by Faculty ${s.faculty_id} in Room ${s.room_id} on ${s.day_of_week} from ${s.start_time} to ${s.end_time}`
  )
  .join("\n")}

🧩 RULES:
- Working hours: ${WORK_START} to ${WORK_END}
- Working days: ${WORKING_DAYS.join(", ")}
- Break time: ${BREAK_START} to ${BREAK_END}
- Max lecture duration: 60 minutes
- Minimum students to open a section: 10
- Avoid overlapping schedules for faculty or rooms
- Avoid scheduling during the break hour

---

🎯 TASK:
Generate a JSON array of 5–10 NEW SECTIONS following these rules.
Each object must match the database schema for the "sections" table:

{
  "course_id": number,
  "faculty_id": number,
  "room_id": number,
  "section_code": string,
  "start_time": "HH:MM",
  "end_time": "HH:MM",
  "day_of_week": string,
  "type": string,
  "schedule_id": null,
  "section_group": ${group_id || "null"}
}

⚠️ Notes:
- Times must be between ${WORK_START}–${WORK_END}, excluding ${BREAK_START}–${BREAK_END}.
- Spread sections evenly across working days.
- Respond ONLY with pure JSON (no Markdown or comments).
`;

    // 🔹 Request from OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a university scheduling assistant. Respond ONLY with valid JSON (no markdown, no explanations).",
        },
        { role: "user", content: context },
      ],
      temperature: 0.6,
    });

    const raw = response.choices[0].message.content;

    let sections = [];
    try {
      const cleaned = raw.replace(/```json/i, "").replace(/```/g, "").trim();
      sections = JSON.parse(cleaned);
    } catch (err) {
      console.error("❌ JSON parse failed:", err);
      return res.status(500).json({
        error: "AI returned invalid JSON format",
        raw,
      });
    }

    // ✅ Return generated sections
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(sections, null, 2));
  } catch (err) {
    console.error("❌ Smart Section Error:", err);
    res.status(500).json({ error: err.message });
  }
};
