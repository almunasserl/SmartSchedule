// server.js
const express = require("express");
const cors = require("cors");
const http = require("http");
require("dotenv").config();
const { startYjsServer } = require("./yjsServer.js");

// 🧩 Import routes
const facultyRoutes = require("./routes/facultyRoutes");
const studentRoutes = require("./routes/studentRoutes");
const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const ruleRoutes = require("./routes/ruleRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const surveyRoutes = require("./routes/surveyRoutes");
const sectionRoutes = require("./routes/sectionRoutes");
const facultyCoursesRoutes = require("./routes/facultyCoursesRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const courseRoutes = require("./routes/courseRoutes");
const dropdownsRoutes = require("./routes/dropdownsRoutes");
const aiRoutes = require("./routes/aiRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const irregularRoutes = require("./routes/irregularRoutes");

const PORT = process.env.PORT || 5001;

// ⚙️ Initialize app and server
const app = express();
const server = http.createServer(app);

// 🧠 Start Yjs WebSocket server (works only locally or on persistent host)
startYjsServer(server);

// ✅ Secure & flexible CORS setup
const allowedOrigins = [
  "http://localhost:5173", // for local development
  "https://smartschedulefrontend.onrender.com", // ✅  deployed frontend domain
  //  Vercel production domain
  "https://smart-schedule-ten.vercel.app",

  //  Vercel preview domain for the main branch
  "https://smart-schedule-git-main-almunasserls-projects.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman or mobile apps)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Handle preflight (OPTIONS) requests for any path (Express 5 requires regex)
app.options(/.*/, cors());

app.use(express.json());

// 🧭 API routes
app.use("/api/faculty", facultyRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/rules", ruleRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/surveys", surveyRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/faculty-courses", facultyCoursesRoutes);
app.use("/api/irregular", irregularRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/dropdowns", dropdownsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/schedules", scheduleRoutes);

server.listen(PORT, () => {
  console.log(`🚀 SmartSchedule backend running on port ${PORT}`);
});
