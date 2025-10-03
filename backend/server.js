const express = require("express");
const cors = require("cors");
const DB = require("./config/db");
require("dotenv").config();
const facultyRoutes = require("./routes/facultyRoutes");
const studentRoutes = require("./routes/studentRoutes");
const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const ruleRoutes = require("./routes/ruleRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const surveyRoutes = require("./routes/surveyRoutes");
const sectionRoutes = require("./routes/sectionRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const courseRoutes = require("./routes/courseRoutes");
const dropdownsRoutes = require("./routes/dropdownsRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/faculty", facultyRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/rules", ruleRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/surveys", surveyRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/dropdowns", dropdownsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
