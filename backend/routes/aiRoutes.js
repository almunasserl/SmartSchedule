const express = require("express");
const router = express.Router();
const { generateSmartSections } = require("../controllers/aiSectionsController");

// Only one endpoint for now
router.post("/generate-smart-sections", generateSmartSections);

module.exports = router;
