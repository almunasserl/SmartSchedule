import React, { useEffect, useState } from "react";
import apiClient from "../../Services/apiClient";
import { useAuth } from "../../Hooks/AuthContext";
import { Spinner, Toast, ToastContainer } from "react-bootstrap";

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total_courses: 0, total_sections: 0 });
  const [schedule, setSchedule] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 2500);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;
      setPageLoading(true);
      try {
        const [statsRes, scheduleRes] = await Promise.all([
          apiClient.get(`/faculty/${user.id}/stats`),
          apiClient.get(`/faculty/${user.id}/schedule`),
        ]);

        setStats(statsRes.data);
        setSchedule(scheduleRes.data);
      } catch (err) {
        console.error("Error loading dashboard:", err);
        const msg = err.response?.data?.error || "Failed to load dashboard data";
        showToast(msg, "danger");
      } finally {
        setPageLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Loader
  if (pageLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <Spinner animation="border" variant="info" style={{ width: "3rem", height: "3rem" }} />
      </div>
    );
  }

  return (
    <div>
      {/* Toast Container */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg={toast.type}
          show={toast.show}
          onClose={() => setToast({ show: false })}
        >
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      <h2 className="fw-bold text-info mb-4">Dashboard</h2>

      {/* Stats */}
      <div className="d-flex justify-content-center mb-4 flex-wrap" style={{ gap: "6rem" }}>
        <div className="text-center">
          <div className="fs-3 fw-bold text-info">{stats.total_courses}</div>
          <div className="text-info small">Courses</div>
        </div>
        <div className="text-center">
          <div className="fs-3 fw-bold text-info">{stats.total_sections}</div>
          <div className="text-info small">Sections</div>
        </div>
      </div>

      {/* Faculty Schedule Table */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body">
          <h5 className="fw-semibold mb-3 text-info">My Weekly Schedule</h5>
          <div className="table-responsive">
            <table className="table table-bordered text-center align-middle">
              <thead className="table-light">
                <tr>
                  <th>Day</th>
                  <th>Classes</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row, idx) => (
                  <tr key={idx}>
                    <td className="fw-bold">{row.day_of_week}</td>
                    <td>
                      {row.classes.length > 0 ? (
                        row.classes.map((cls, i) => (
                          <div key={i} className="mb-2 p-2 bg-light rounded">
                            <strong>{cls.course_name}</strong>
                            <br />
                            {cls.start_time} - {cls.end_time} |{" "}
                            {cls.room_name} ({cls.building})
                          </div>
                        ))
                      ) : (
                        <span className="text-muted">No classes</span>
                      )}
                    </td>
                  </tr>
                ))}
                {schedule.length === 0 && (
                  <tr>
                    <td colSpan={2} className="text-muted">
                      No schedule available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
