const express = require("express");
const router = express.Router();
const rulesController = require("../controllers/ruleController"); // ✅ plural, and matches new controller file

// 📘 Get all rules
router.get("/", rulesController.getAllRules);

// 📗 Get single rule by key
router.get("/:key", rulesController.getRuleByKey);

// 🟢 Create or update rule (Upsert)
router.post("/", rulesController.upsertRule);

// 🔴 Delete rule by key
router.delete("/:key", rulesController.deleteRule);

module.exports = router;
