import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Layouts
import FacultyLayout from "./Components/layouts/FacultyLayout";
import StudentLayout from "./Components/layouts/StudentLayout";
import RegistrarLayout from "./Components/layouts/RegistrarLayout";

// Pages (Auth)
import Login from "./Pages/auth/login";
import ForgotPassword from "./Pages/auth/ForgotPassword";
import ResetPassword from "./Pages/auth/ResetPassword";

// Pages (Faculty)
import FacultyDashboard from "./Pages/faculty/FacultyDashboard";
import FacultyCalendar from "./Pages/faculty/FacultyCalender";
import FacultyCourses from "./Pages/faculty/FacultyCourses";
import FacultySections from "./Pages/faculty/FacultySections";
import FacultyFeedback from "./Pages/faculty/FacultyFeedback";
import FacultyAvailability from "./Pages/faculty/FacultyAvailability";

// Pages (Student)
import StudentDashboard from "./Pages/student/StudentDashboard";
import StudentCourses from "./Pages/student/StudentCourses";
import StudentSections from "./Pages/student/StudentSections";
import StudentSurveys from "./Pages/student/StudentSurveys";
import StudentSurveyDetails from "./Pages/student/StudentSurveyDetails";
import StudentFeedback from "./Pages/student/StudentFeedback";

// Pages (Registrar)
import RegistrarDashboard from "./Pages/registrar/RegistrarDashboard";
 import Schedules from "./Pages/registrar/Schedules";
import ScheduleDetails from "./Pages/registrar/ScheduleDetails";
import Sections from "./Pages/registrar/Sections";
import Students from "./Pages/registrar/Students";
import Courses from "./Pages/registrar/Cources";
import Surveys from "./Pages/registrar/Surveys";
import Feedback from "./Pages/registrar/Feedback";
import Notifications from "./Pages/registrar/Notifications";
import Rules from "./Pages/registrar/Rules";


function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Redirect Root to Committee (ممكن تغيريها حسب اللي تحبي) */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Faculty Routes */}
        <Route path="/faculty" element={<FacultyLayout />}>
          <Route index element={<FacultyDashboard />} /> {/* /faculty */}
          <Route path="calendar" element={<FacultyCalendar />} />
          <Route path="courses" element={<FacultyCourses />} />
          <Route path="sections" element={<FacultySections />} />
          <Route path="feedback" element={<FacultyFeedback />} />
          <Route path="availability" element={<FacultyAvailability />} />
        </Route>


        {/* Student Routes */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} /> {/* /students */}
          <Route path="courses" element={<StudentCourses />} />
          <Route path="courses/:courseId/sections" element={<StudentSections />} />
          <Route path="surveys" element={<StudentSurveys />} />
          <Route path="surveys/:surveyId" element={<StudentSurveyDetails />} />
          <Route path="feedback" element={<StudentFeedback />} />
        </Route>

        {/* Registrar Routes */}
        <Route path="/registrar" element={<RegistrarLayout />}>
          <Route index element={<RegistrarDashboard />} /> {/* /registrar */}
          <Route path="schedules" element={<Schedules />} />
          <Route path="schedules/:id" element={<ScheduleDetails />} />
          <Route path="sections" element={<Sections />} />
          <Route path="students" element={<Students />} />
          <Route path="courses" element={<Courses />} />
          <Route path="surveys" element={<Surveys />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="rules" element={<Rules />} />


        </Route>
      </Routes>
    </Router>
  );
}

export default App;
