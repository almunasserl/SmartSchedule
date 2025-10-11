const express = require("express");
const router = express.Router();
const {
  generateSmartSections,
} = require("../controllers/aiSectionsController");

router.get("/smart-sections", generateSmartSections);

module.exports = router;
