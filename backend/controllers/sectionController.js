const sql = require("../config/db");

// Convert "HH:mm:ss" → minutes
function toMinutes(timeStr) {
  const [h, m, s] = timeStr.split(":").map(Number);
  return h * 60 + m + (s ? s / 60 : 0);
}

/**
 * 🧩 Create new section with full validation
 */
exports.createSection = async (req, res) => {
  try {
    const {
      course_id,
      room_id,
      faculty_id,
      day_of_week,
      start_time,
      end_time,
      schedule_id,
      type,
      section_code,
      section_group,
    } = req.body;

    // 🧠 Validate required fields
    if (!course_id || !day_of_week || !start_time || !end_time) {
      return res.status(400).json({
        error:
          "Required fields missing: course_id, day_of_week, start_time, end_time.",
      });
    }

    // Convert times to minutes for validation
    const start = toMinutes(start_time);
    const end = toMinutes(end_time);

    // 1️⃣ Check working hours (8 AM - 3 PM)
    const WORK_START = 8 * 60;
    const WORK_END = 15 * 60;
    if (start < WORK_START || end > WORK_END) {
      return res
        .status(400)
        .json({ error: "❌ Section must be between 8:00 AM and 3:00 PM." });
    }

    // 2️⃣ No classes on Friday or Saturday
    const invalidDays = ["Friday", "Saturday"];
    if (invalidDays.includes(day_of_week)) {
      return res
        .status(400)
        .json({ error: `❌ No classes allowed on ${day_of_week}.` });
    }

    // 3️⃣ Group time conflict
    if (section_group) {
      const conflictGroup = await sql`
        SELECT id FROM sections
        WHERE section_group = ${section_group}
          AND day_of_week = ${day_of_week}
          AND tsrange(
            TIMESTAMP '2000-01-01' + start_time,
            TIMESTAMP '2000-01-01' + end_time
          ) &&
          tsrange(
            TIMESTAMP '2000-01-01' + ${start_time}::time,
            TIMESTAMP '2000-01-01' + ${end_time}::time
          )
      `;
      if (conflictGroup.length > 0)
        return res.status(400).json({
          error: "❌ This group already has a section at this time.",
        });
    }

    // 4️⃣ Faculty time conflict
    if (faculty_id) {
      const conflictFaculty = await sql`
        SELECT id FROM sections
        WHERE faculty_id = ${faculty_id}
          AND day_of_week = ${day_of_week}
          AND tsrange(
            TIMESTAMP '2000-01-01' + start_time,
            TIMESTAMP '2000-01-01' + end_time
          ) &&
          tsrange(
            TIMESTAMP '2000-01-01' + ${start_time}::time,
            TIMESTAMP '2000-01-01' + ${end_time}::time
          )
      `;
      if (conflictFaculty.length > 0)
        return res.status(400).json({
          error: "❌ This faculty already has a section at this time.",
        });
    }

    // 5️⃣ Break time 12–1 PM
    const BREAK_START = 12 * 60;
    const BREAK_END = 13 * 60;
    if (!(end <= BREAK_START || start >= BREAK_END)) {
      return res.status(400).json({
        error: "❌ Section overlaps with break time (12:00 PM - 1:00 PM).",
      });
    }

    // 6️⃣ Overlap with any section same day/time
    const overlapCheck = await sql`
      SELECT id FROM sections
      WHERE day_of_week = ${day_of_week}
        AND tsrange(
          TIMESTAMP '2000-01-01' + start_time,
          TIMESTAMP '2000-01-01' + end_time
        ) &&
        tsrange(
          TIMESTAMP '2000-01-01' + ${start_time}::time,
          TIMESTAMP '2000-01-01' + ${end_time}::time
        )
    `;
    if (overlapCheck.length > 0) {
      return res.status(400).json({
        error: "❌ Time conflict: another section exists during this time.",
      });
    }

    // 7️⃣ Insert
    const result = await sql`
      INSERT INTO sections (
        course_id, room_id, faculty_id,
        day_of_week, start_time, end_time,
        schedule_id, type,section_code, section_group
      )
      VALUES (
        ${course_id},
        ${room_id || null},
        ${faculty_id || null},
        ${day_of_week},
        ${start_time},
        ${end_time},
        ${schedule_id || null},
        ${type || null},
     ${section_code || null},
        ${section_group || null}
      )
      RETURNING *
    `;

    res.status(201).json({
      message: "✅ Section created successfully",
      section: result[0],
    });
  } catch (err) {
    console.error("❌ Error creating section:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/** ✏️ Update Section */
exports.updateSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const {
      course_id,
      faculty_id,
      room_id,
      day_of_week,
      start_time,
      end_time,
      schedule_id,
      section_code,
      type,
      section_group,
    } = req.body;

    const existing = await sql`SELECT * FROM sections WHERE id = ${sectionId}`;
    if (existing.length === 0)
      return res.status(404).json({ error: "Section not found." });

    const [sh, sm] = start_time.split(":").map(Number);
    const [eh, em] = end_time.split(":").map(Number);
    const start = sh * 60 + sm;
    const end = eh * 60 + em;

    const WORK_START = 8 * 60;
    const WORK_END = 15 * 60;
    if (start < WORK_START || end > WORK_END)
      return res
        .status(400)
        .json({ error: "❌ Must be within working hours (8–3)." });

    const invalidDays = ["Friday", "Saturday"];
    if (invalidDays.includes(day_of_week))
      return res
        .status(400)
        .json({ error: `❌ No sections allowed on ${day_of_week}.` });

    // Group conflict
    if (section_group) {
      const conflictGroup = await sql`
        SELECT id FROM sections
        WHERE section_group = ${section_group}
          AND day_of_week = ${day_of_week}
          AND id != ${sectionId}
          AND tsrange(
            TIMESTAMP '2000-01-01' + start_time,
            TIMESTAMP '2000-01-01' + end_time
          ) &&
          tsrange(
            TIMESTAMP '2000-01-01' + ${start_time}::time,
            TIMESTAMP '2000-01-01' + ${end_time}::time
          )
      `;
      if (conflictGroup.length > 0)
        return res
          .status(400)
          .json({ error: "❌ Group already has a section at that time." });
    }

    // Faculty conflict
    if (faculty_id) {
      const conflictFaculty = await sql`
        SELECT id FROM sections
        WHERE faculty_id = ${faculty_id}
          AND day_of_week = ${day_of_week}
          AND id != ${sectionId}
          AND tsrange(
            TIMESTAMP '2000-01-01' + start_time,
            TIMESTAMP '2000-01-01' + end_time
          ) &&
          tsrange(
            TIMESTAMP '2000-01-01' + ${start_time}::time,
            TIMESTAMP '2000-01-01' + ${end_time}::time
          )
      `;
      if (conflictFaculty.length > 0)
        return res.status(400).json({
          error: "❌ Faculty already teaching at that time.",
        });
    }

    // Break check
    const BREAK_START = 12 * 60;
    const BREAK_END = 13 * 60;
    if (!(end <= BREAK_START || start >= BREAK_END))
      return res.status(400).json({
        error: "❌ Section overlaps with break (12–1 PM).",
      });

    // Overlap with others
    const overlapCheck = await sql`
      SELECT id FROM sections
      WHERE day_of_week = ${day_of_week}
        AND id != ${sectionId}
        AND tsrange(
          TIMESTAMP '2000-01-01' + start_time,
          TIMESTAMP '2000-01-01' + end_time
        ) &&
        tsrange(
          TIMESTAMP '2000-01-01' + ${start_time}::time,
          TIMESTAMP '2000-01-01' + ${end_time}::time
        )
    `;
    if (overlapCheck.length > 0)
      return res.status(400).json({
        error: "❌ Another section exists during this time.",
      });

    const updated = await sql`
      UPDATE sections
      SET 
        course_id = ${course_id},
        faculty_id = ${faculty_id || null},
        room_id = ${room_id || null},
        day_of_week = ${day_of_week},
        start_time = ${start_time},
        end_time = ${end_time},
        schedule_id = ${schedule_id || null},
        section_code=${section_code || null},
        type = ${type || null},
        section_group = ${section_group || null}
      WHERE id = ${sectionId}
      RETURNING *
    `;

    res.json({
      message: "✅ Section updated successfully.",
      section: updated[0],
    });
  } catch (err) {
    console.error("❌ Error updating section:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/** 🔹 Get all sections */
exports.getAllSections = async (req, res) => {
  try {
    const { schedule_id } = req.query;

    const sections = await sql`
      SELECT 
        s.id,
        s.schedule_id,
        s.section_group,
        s.section_code,
        s.type,
        s.day_of_week,
        s.start_time,
        s.end_time,
        c.id AS course_id,
        c.course_name,
        c.course_code,
        f.id AS faculty_id,
        f.name AS faculty_name,
        r.id AS room_id,
        r.name AS room_name,
        r.building
      FROM sections s
      JOIN course c ON s.course_id = c.id
      LEFT JOIN faculty f ON s.faculty_id = f.id
      LEFT JOIN room r ON s.room_id = r.id
      ${schedule_id ? sql`WHERE s.schedule_id = ${schedule_id}` : sql``}
      ORDER BY s.day_of_week, s.start_time
    `;

    res.json(sections);
  } catch (err) {
    console.error("❌ Error in getAllSections:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/** 🗑️ Delete Section */
exports.deleteSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    await sql`DELETE FROM sections WHERE id = ${sectionId}`;
    res.json({ message: "✅ Section deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
