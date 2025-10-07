const sql = require("../config/db");

/** 🧩 دالة مساعدة لتحويل الوقت إلى دقائق */
function toMinutes(timeStr) {
  const [h, m, s] = timeStr.split(":").map(Number);
  return h * 60 + m + (s ? s / 60 : 0);
}

/**
 * إنشاء سكشن جديد مع التحقق من كل الشروط
 */
exports.createSection = async (req, res) => {
  try {
    const {
      schedule_id,
      course_id,
      instructor_id,
      room_id,
      capacity,
      day_of_week,
      start_time,
      end_time,
    } = req.body;

    // 1) جلب القوانين
    const rules = await sql`SELECT * FROM rules LIMIT 1`;
    if (rules.length === 0) {
      return res.status(400).json({ error: "Rules not defined" });
    }

    const {
      work_start,
      work_end,
      break_start,
      break_end,
      lecture_duration,
      min_students_to_open,
    } = rules[0];

    // 2) ✅ تحقق من وقت الدوام (تحويل إلى دقائق)
    const startMin = toMinutes(start_time);
    const endMin = toMinutes(end_time);
    const workStartMin = toMinutes(work_start);
    const workEndMin = toMinutes(work_end);

    if (startMin < workStartMin || endMin > workEndMin) {
      return res
        .status(400)
        .json({ error: "Section outside working hours" });
    }

    // 3) تحقق من وقت البريك (في PostgreSQL)
    const overlapBreak = await sql`
      SELECT (
        tsrange(
          TIMESTAMP '2000-01-01' + ${start_time}::time,
          TIMESTAMP '2000-01-01' + ${end_time}::time
        ) &&
        tsrange(
          TIMESTAMP '2000-01-01' + ${break_start}::time,
          TIMESTAMP '2000-01-01' + ${break_end}::time
        )
      ) AS overlap
    `;
    if (overlapBreak[0].overlap) {
      return res
        .status(400)
        .json({ error: "Section overlaps with break time" });
    }

    // 4) تحقق من مدة المحاضرة (بالساعات)
    const duration = await sql`
      SELECT EXTRACT(EPOCH FROM (${end_time}::time - ${start_time}::time))/3600 AS hours
    `;
    if (duration[0].hours > lecture_duration) {
      return res
        .status(400)
        .json({ error: "Section exceeds maximum allowed duration" });
    }

    // 5) تحقق من سعة القاعة
    const room = await sql`SELECT * FROM room WHERE id = ${room_id}`;
    if (room.length === 0)
      return res.status(404).json({ error: "Room not found" });
    if (capacity > room[0].capacity) {
      return res
        .status(400)
        .json({ error: "Section capacity exceeds room capacity" });
    }

    // 6) تحقق من إتاحة الأستاذ
    const availability = await sql`
      SELECT * FROM faculty_availability
      WHERE faculty_id = ${instructor_id}
        AND day = ${day_of_week}
        AND ${start_time}::time >= start_time
        AND ${end_time}::time <= end_time
    `;
    if (availability.length === 0) {
      return res
        .status(400)
        .json({ error: "Instructor not available at this time" });
    }

    // 7) تحقق من تضارب الأستاذ
    const instructorConflict = await sql`
      SELECT * FROM sections
      WHERE instructor_id = ${instructor_id}
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
    if (instructorConflict.length > 0) {
      return res
        .status(400)
        .json({ error: "Instructor has another section at this time" });
    }

    // 8) تحقق من تضارب القاعة
    const roomConflict = await sql`
      SELECT * FROM sections
      WHERE room_id = ${room_id}
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
    if (roomConflict.length > 0) {
      return res
        .status(400)
        .json({ error: "Room already booked at this time" });
    }

    // 9) تحقق من فتح سكشن جديد (نسبة 70% أو عدد محدد)
    const existingSections = await sql`
      SELECT id, capacity,
             (SELECT COUNT(*) FROM student_sections WHERE section_id = sections.id) AS enrolled
      FROM sections WHERE course_id = ${course_id}
    `;
    if (existingSections.length > 0) {
      const last = existingSections[existingSections.length - 1];
      const fillRate = last.enrolled / last.capacity;
      if (fillRate < 0.7 && last.enrolled < min_students_to_open) {
        return res.status(400).json({
          error: "Previous section not sufficiently filled to open a new one",
        });
      }
    }

    // 10) إنشاء السكشن
    const result = await sql`
      INSERT INTO sections (schedule_id, course_id, instructor_id, room_id, capacity, day_of_week, start_time, end_time)
      VALUES (${schedule_id}, ${course_id}, ${instructor_id}, ${room_id}, ${capacity}, ${day_of_week}, ${start_time}, ${end_time})
      RETURNING *
    `;

    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * تحديث سكشن
 */
exports.updateSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const {
      schedule_id,
      course_id,
      instructor_id,
      room_id,
      capacity,
      day_of_week,
      start_time,
      end_time,
    } = req.body;

    // ✅ تحقق من القاعة
    const room = await sql`SELECT * FROM room WHERE id = ${room_id}`;
    if (room.length === 0)
      return res.status(404).json({ error: "Room not found" });
    if (capacity > room[0].capacity) {
      return res
        .status(400)
        .json({ error: "Section capacity exceeds room capacity" });
    }

    // ✅ تحقق من القوانين (المدة والبريك)
    const rules = await sql`SELECT * FROM rules LIMIT 1`;

    const duration = await sql`
      SELECT EXTRACT(EPOCH FROM (${end_time}::time - ${start_time}::time))/60 AS minutes
    `;
    if (duration[0].minutes > rules[0].lecture_duration) {
      return res.status(400).json({
        error: `Lecture exceeds max duration of ${rules[0].lecture_duration} minutes`,
      });
    }

    // تحقق من وقت البريك
    const overlapBreak = await sql`
      SELECT (
        tsrange(
          TIMESTAMP '2000-01-01' + ${start_time}::time,
          TIMESTAMP '2000-01-01' + ${end_time}::time
        ) &&
        tsrange(
          TIMESTAMP '2000-01-01' + ${rules[0].break_start}::time,
          TIMESTAMP '2000-01-01' + ${rules[0].break_end}::time
        )
      ) AS overlap
    `;
    if (overlapBreak[0].overlap) {
      return res
        .status(400)
        .json({ error: "Section overlaps with break time" });
    }

    // ✅ تحقق من توفر المدرس
    const availability = await sql`
      SELECT * FROM faculty_availability
      WHERE faculty_id = ${instructor_id}
        AND day = ${day_of_week}
        AND start_time <= ${start_time}::time
        AND end_time >= ${end_time}::time
    `;
    if (availability.length === 0) {
      return res
        .status(400)
        .json({ error: "Instructor not available at this time" });
    }

    // ✅ تحقق من التعارض مع سكشن آخر لنفس المدرس
    const conflictInstructor = await sql`
      SELECT * FROM sections
      WHERE instructor_id = ${instructor_id}
        AND day_of_week = ${day_of_week}
        AND tsrange(
          TIMESTAMP '2000-01-01' + start_time,
          TIMESTAMP '2000-01-01' + end_time
        ) &&
        tsrange(
          TIMESTAMP '2000-01-01' + ${start_time}::time,
          TIMESTAMP '2000-01-01' + ${end_time}::time
        )
        AND id != ${sectionId}
    `;
    if (conflictInstructor.length > 0) {
      return res
        .status(400)
        .json({ error: "Instructor already has a section at this time" });
    }

    // ✅ تحقق من التعارض في القاعة
    const conflictRoom = await sql`
      SELECT * FROM sections
      WHERE room_id = ${room_id}
        AND day_of_week = ${day_of_week}
        AND tsrange(
          TIMESTAMP '2000-01-01' + start_time,
          TIMESTAMP '2000-01-01' + end_time
        ) &&
        tsrange(
          TIMESTAMP '2000-01-01' + ${start_time}::time,
          TIMESTAMP '2000-01-01' + ${end_time}::time
        )
        AND id != ${sectionId}
    `;
    if (conflictRoom.length > 0) {
      return res
        .status(400)
        .json({ error: "Room already has a section at this time" });
    }

    // ✅ تحديث السكشن
    const updated = await sql`
      UPDATE sections
      SET schedule_id   = COALESCE(${schedule_id}, schedule_id),
          course_id     = COALESCE(${course_id}, course_id),
          instructor_id = COALESCE(${instructor_id}, instructor_id),
          room_id       = COALESCE(${room_id}, room_id),
          capacity      = COALESCE(${capacity}, capacity),
          day_of_week   = COALESCE(${day_of_week}, day_of_week),
          start_time    = COALESCE(${start_time}::time, start_time),
          end_time      = COALESCE(${end_time}::time, end_time)
      WHERE id = ${sectionId}
      RETURNING *
    `;

    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * جلب جميع السكشنز
 */
exports.getAllSections = async (req, res) => {
  try {
    const sections = await sql`
      SELECT s.*, c.name AS course_name, f.name AS faculty_name, r.name AS room_name, r.building
      FROM sections s
      JOIN courses c ON s.course_id = c.id
      JOIN faculty f ON s.instructor_id = f.id
      JOIN room r ON s.room_id = r.id
      ORDER BY s.day_of_week, s.start_time
    `;
    res.json(sections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    await sql`DELETE FROM sections WHERE id = ${sectionId}`;
    res.json({ message: "Section deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
