const sql = require("../config/db");

/**
 * 1️⃣ Create Schedule (default = draft)
 */
exports.createSchedule = async (req, res) => {
  try {
    const { title, level_id, group_id, created_by } = req.body;

    if (!title || !level_id || !group_id || !created_by) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const result = await sql`
      INSERT INTO schedule (title, level_id, group_id, status, created_by, created_at)
      VALUES (${title}, ${level_id}, ${group_id}, 'draft', ${created_by}, NOW())
      RETURNING *
    `;

    res.status(201).json({
      message: "✅ Schedule created successfully",
      schedule: result[0],
    });
  } catch (err) {
    console.error("❌ Error creating schedule:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 2️⃣ Get All Schedules
 */
exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await sql`
      SELECT 
        s.id,
        s.title,
        s.status,
        s.created_at,
        s.updated_at,
        l.name AS level_name,
        g.name AS group_name,
        c.email AS created_by_email,
        ap.email AS approved_by_email
      FROM schedule s
      JOIN level l ON s.level_id = l.id
      JOIN groups g ON s.group_id = g.id
      LEFT JOIN auth c ON s.created_by = c.id
      LEFT JOIN auth ap ON s.approved_by = ap.id
      ORDER BY s.created_at DESC;
    `;

    res.json(schedules);
  } catch (err) {
    console.error("❌ Error fetching schedules:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 3️⃣ Get Schedule by ID (with sections)
 */
exports.getScheduleById = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    const schedule = await sql`
      SELECT s.*, l.name AS level_name, g.name AS group_name
      FROM schedule s
      JOIN level l ON s.level_id = l.id
      JOIN groups g ON s.group_id = g.id
      WHERE s.id = ${scheduleId}
    `;

    if (schedule.length === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    // later we will join the `sections` table (instead of slots)
    const sections = await sql`
      SELECT *
      FROM sections
      WHERE schedule_id = ${scheduleId}
      ORDER BY day_of_week, start_time
    `;

    res.json({
      schedule: schedule[0],
      sections,
    });
  } catch (err) {
    console.error("❌ Error fetching schedule:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 4️⃣ Publish Schedule
 */
exports.publishSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    // ensure exists
    const schedule = await sql`SELECT * FROM schedule WHERE id = ${scheduleId}`;
    if (schedule.length === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }
    

    await sql`
      UPDATE schedule
      SET status = 'published', updated_at = NOW()
      WHERE id = ${scheduleId}
    `;

    res.json({ message: "✅ Schedule published successfully" });
  } catch (err) {
    console.error("❌ Error publishing schedule:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 5️⃣ Approve Schedule
 */
exports.approveSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { approved_by } = req.body;

    const schedule = await sql`SELECT * FROM schedule WHERE id = ${scheduleId}`;
    if (schedule.length === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    // ✅ Allow approval only for DRAFT schedules
    if (schedule[0].status !== "draft") {
      return res
        .status(400)
        .json({ error: "Only draft schedules can be approved" });
    }

    await sql`
      UPDATE schedule
      SET status = 'approved',
          approved_by = ${approved_by},
          updated_at = NOW()
      WHERE id = ${scheduleId}
    `;

    res.json({ message: "✅ Schedule approved successfully" });
  } catch (err) {
    console.error("❌ Error approving schedule:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 6️⃣ Delete Schedule
 */
exports.deleteSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    // delete related sections first
    await sql`DELETE FROM sections WHERE schedule_id = ${scheduleId}`;
    await sql`DELETE FROM schedule WHERE id = ${scheduleId}`;

    res.json({ message: "🗑️ Schedule deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting schedule:", err);
    res.status(500).json({ error: err.message });
  }
};
