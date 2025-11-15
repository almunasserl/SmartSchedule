const sql = require("../config/db");

/**
 * 🟦 Get all rules
 * Returns all (rule_key, rule_value, data_type)
 */
exports.getAllRules = async (req, res) => {
  try {
    const rules = await sql`
      SELECT id, rule_key, rule_value, data_type, updated_at
      FROM system_rules
      ORDER BY id ASC;
    `;
    res.json(rules);
  } catch (err) {
    console.error("❌ getAllRules error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 🟩 Create or Update (Upsert)
 * If rule_key exists, update its value; otherwise insert a new rule.
 */
exports.upsertRule = async (req, res) => {
  try {
    const { rule_key, rule_value, data_type = "text" } = req.body;

    if (!rule_key || rule_value === undefined) {
      return res
        .status(400)
        .json({ error: "rule_key and rule_value are required" });
    }

    const result = await sql`
      INSERT INTO system_rules (rule_key, rule_value, data_type)
      VALUES (${rule_key}, ${rule_value}, ${data_type})
      ON CONFLICT (rule_key)
      DO UPDATE
        SET rule_value = EXCLUDED.rule_value,
            data_type = EXCLUDED.data_type,
            updated_at = NOW()
      RETURNING *;
    `;

    res.status(201).json({
      message: "✅ Rule saved successfully",
      rule: result[0],
    });
  } catch (err) {
    console.error("❌ upsertRule error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 🟨 Get single rule by key
 */
exports.getRuleByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const result = await sql`
      SELECT * FROM system_rules WHERE rule_key = ${key};
    `;
    if (result.length === 0)
      return res.status(404).json({ error: "Rule not found" });
    res.json(result[0]);
  } catch (err) {
    console.error("❌ getRuleByKey error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 🟥 Delete rule by key
 */
exports.deleteRule = async (req, res) => {
  try {
    const { key } = req.params;
    const deleted = await sql`
      DELETE FROM system_rules WHERE rule_key = ${key} RETURNING *;
    `;
    if (deleted.length === 0)
      return res.status(404).json({ error: "Rule not found" });
    res.json({
      message: "🗑️ Rule deleted successfully",
      deleted: deleted[0],
    });
  } catch (err) {
    console.error("❌ deleteRule error:", err);
    res.status(500).json({ error: err.message });
  }
};
