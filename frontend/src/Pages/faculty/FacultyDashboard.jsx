import React, { useEffect, useState } from "react";
import apiClient from "../../Services/apiClient";
import { useAuth } from "../../Hooks/AuthContext";

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total_courses: 0, total_sections: 0 });
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    if (user?.id) {
      apiClient.get(`/faculty/${user.id}/stats`).then(res => setStats(res.data));
      apiClient.get(`/faculty/${user.id}/schedule`).then(res => setSchedule(res.data));
    }
  }, [user]);

  return (
    <div>
      <h2 className="fw-bold text-info mb-4">Dashboard</h2>

      {/* Stats */}
      <div className="d-flex justify-content-center mb-4" style={{ gap: "6rem" }}>
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
                      {row.classes.map((cls, i) => (
                        <div key={i} className="mb-2 p-2 bg-light rounded">
                          <strong>{cls.course_name}</strong><br />
                          {cls.start_time} - {cls.end_time} | {cls.room_name} ({cls.building})
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
                {schedule.length === 0 && (
                  <tr>
                    <td colSpan={2} className="text-muted">No schedule available</td>
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
