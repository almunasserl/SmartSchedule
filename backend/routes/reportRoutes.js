const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

// التقارير الأساسية
router.get("/students/total", reportController.getTotalStudents);
router.get("/faculty/total", reportController.getTotalFaculty);
router.get("/departments/total", reportController.getTotalDepartments);
router.get("/courses/total", reportController.getTotalCourses);
router.get("/surveys/total", reportController.getTotalSurveys);

// تقارير تفصيلية
router.get("/students/status-ratio", reportController.getStudentStatusRatio);
router.get("/students/by-term", reportController.getStudentsByTerm);
router.get("/students/by-department", reportController.getStudentsByDepartment);
router.get("/sections/enrollment", reportController.getSectionEnrollment);

router.get("/surveys/status", reportController.getSurveyStatusCounts);
router.get("/surveys/departments", reportController.getDepartmentsWithSurveys);
router.get("/courses/types", reportController.getCourseTypesCount);
router.get("/courses/credits", reportController.getTotalCreditsByDepartment);
router.get("/surveys/participants", reportController.getSurveyParticipants);

router.get("/notifications/total", reportController.getTotalNotifications);
router.get("/notifications/by-role", reportController.getNotificationsByRole);
router.get("/notifications/by-user", reportController.getNotificationsByUser);

module.exports = router;
