const express = require("express");
const router = express.Router();
const dropdownsController = require("../controllers/dropdownsController");

// الأقسام
router.get("/departments", dropdownsController.getDepartments);

// الترام
router.get("/terms", dropdownsController.getTerms);

// أيام الدوام
router.get("/working-days", dropdownsController.getWorkingDays);

router.get("/schedules-list", dropdownsController.getSchedulesList);

router.get("/courses", dropdownsController.getCoursesList);
router.get("/faculty", dropdownsController.getFacultyList);
router.get("/rooms", dropdownsController.getRoomsList);

module.exports = router;
