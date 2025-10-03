import React, { useEffect, useState } from "react";
import apiClient from "../../Services/apiClient";
import { useAuth } from "../../Hooks/AuthContext";

export default function FacultySections() {
  const { user } = useAuth();
  const [sections, setSections] = useState([]);

  useEffect(() => {
    if (user?.id) {
      apiClient.get(`/faculty/${user.id}/sections`).then(res => setSections(res.data));
    }
  }, [user]);

  return (
    <div>
      <h2 className="text-info mb-3">My Sections</h2>
      <div className="table-responsive">
        <table className="table table-bordered text-center align-middle">
          <thead className="table-light">
            <tr>
              <th>Section</th>
              <th>Course</th>
              <th>Day</th>
              <th>Time</th>
              <th>Room</th>
              <th>Building</th>
              <th>Capacity</th>
              <th>Actual Students</th>
            </tr>
          </thead>
          <tbody>
            {sections.map(sec => (
              <tr key={sec.id}>
                <td>{sec.id}</td>
                <td>{sec.course_name}</td>
                <td>{sec.day_of_week}</td>
                <td>{sec.start_time} - {sec.end_time}</td>
                <td>{sec.room_name}</td>
                <td>{sec.building}</td>
                <td>{sec.capacity}</td>
                <td>{sec.actual_students}</td>
              </tr>
            ))}
            {sections.length === 0 && (
              <tr>
                <td colSpan="8" className="text-muted">No sections found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
