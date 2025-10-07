// src/pages/student/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import apiClient from "../../Services/apiClient";
import { useAuth } from "../../Hooks/AuthContext";

export default function StudentDashboard() {
  const { user } = useAuth();
  const studentId = user?.id;
  console.log(studentId);

  const [stats, setStats] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (studentId) {
      setLoading(true);

      Promise.all([
        apiClient.get(`/students/${studentId}/stats`),
        apiClient.get(`/students/${studentId}/schedule`),
      ])
        .then(([statsRes, scheduleRes]) => {
          setStats(statsRes.data);
          setSchedule(scheduleRes.data);
        })
        .catch((err) => console.error("Error loading dashboard:", err))
        .finally(() => setLoading(false));
    }
  }, [studentId]);

  if (loading) {
    return (
      <div className="text-center my-5">
        <div
          className="spinner-border text-info"
          style={{ width: "3rem", height: "3rem" }}
        />
        <p className="mt-2 text-info">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-info">Dashboard</h2>

      {/* Stats */}
      {stats ? (
        <div
          className="d-flex justify-content-center mb-4"
          style={{ gap: "4rem" }}
        >
          <div className="text-center">
            <div className="fs-3 fw-bold text-info">{stats.total_courses}</div>
            <div className="text-info small">Total Courses</div>
          </div>
          <div className="text-center">
            <div className="fs-3 fw-bold text-info">{stats.core_courses}</div>
            <div className="text-info small">Core</div>
          </div>
          <div className="text-center">
            <div className="fs-3 fw-bold text-info">
              {stats.elective_courses}
            </div>
            <div className="text-info small">Electives</div>
          </div>
        </div>
      ) : (
        <p className="text-muted">No stats available</p>
      )}

      {/* Schedule */}
      <div className="card shadow-sm border-0 rounded-3">
        <div className="card-body">
          <h5 className="fw-semibold mb-3 text-info">My Schedule</h5>

          {schedule.length === 0 ? (
            <p className="text-muted">No schedule available</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered text-center align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Day</th>
                    <th>Course</th>
                    <th>Time</th>
                    <th>Faculty</th>
                    <th>Room</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((day) =>
                    day.classes.map((c, idx) => (
                      <tr key={day.day_of_week + idx}>
                        <td>{idx === 0 ? day.day_of_week : ""}</td>
                        <td>{c.course_name}</td>
                        <td>
                          {c.start_time.slice(0, 5)} - {c.end_time.slice(0, 5)}
                        </td>
                        <td>{c.faculty_name}</td>
                        <td>
                          {c.room_name} ({c.building})
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
