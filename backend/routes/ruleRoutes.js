const express = require("express");
const router = express.Router();
const { getAllRules, updateRule } = require("../controllers/ruleController");

// عرض كل الرولز
router.get("/", getAllRules);

// تعديل رول
router.patch("/:ruleId", updateRule);

module.exports = router;
