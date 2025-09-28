import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Layouts
import FacultyLayout from "./Components/layouts/FacultyLayout";
import CommitteeLayout from "./Components/layouts/CommitteeLayout";

// Pages (Faculty)
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import FacultyCalendar from "./Pages/faculty/FacultyCalender";
import FacultyCourses from "./Pages/faculty/FacultyCourses";
import FacultySections from "./Pages/faculty/FacultySections";
import FacultyFeedback from "./Pages/faculty/FacultyFeedback";

// Pages (Committee)
import CommitteeDashboard from "./pages/committee/CommitteeDashboard";
import StudentsPage from "./Pages/committee/StudentPage";
import SectionsPage from "./Pages/committee/SectionsPage";
import SurveyPage from "./Pages/committee/SurveyPage";
import RulesPage from "./Pages/committee/RulesPage";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/committee" replace />} />
        {/* Faculty Routes */}
        <Route path="/faculty" element={<FacultyLayout />}>
          <Route index element={<FacultyDashboard />} /> {/* /faculty */}
          <Route path="calendar" element={<FacultyCalendar />} />
          <Route path="courses" element={<FacultyCourses />} />
          <Route path="sections" element={<FacultySections />} />
          <Route path="feedback" element={<FacultyFeedback />} />
        </Route>
        {/* Committee Routes */}
        <Route path="/committee" element={<CommitteeLayout />}>
          <Route index element={<CommitteeDashboard />} /> {/* /committee */}
          <Route path="students" element={<StudentsPage />} />
          <Route path="sections" element={<SectionsPage />} />
          <Route path="survey" element={<SurveyPage />} />
          <Route path="rules" element={<RulesPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
