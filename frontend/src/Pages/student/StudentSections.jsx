import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../Services/apiClient";
import { useAuth } from "../../Hooks/AuthContext";

export default function StudentSections() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/students/courses/${courseId}/sections`);
        setSections(res.data);
      } catch (err) {
        console.error("Failed to load sections:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSections();
  }, [courseId]);

  const handleEnroll = async (sectionId) => {
    try {
      setMessage(null);
      const res = await apiClient.post(`/students/${user.id}/enroll`, {
        section_id: sectionId,
      });
      setMessage({ type: "success", text: "✅ Enrolled successfully!" });
    } catch (err) {
      setMessage({
        type: "danger",
        text: err.response?.data?.error || "❌ Enrollment failed",
      });
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0 text-info">Sections</h2>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/student/courses")}
        >
          Back to Courses
        </button>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      {loading ? (
        <div className="text-center my-4">
          <div className="spinner-border text-info" />
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered text-center align-middle">
            <thead className="table-light">
              <tr>
                <th>Section</th>
                <th>Day</th>
                <th>Time</th>
                <th>Faculty</th>
                <th>Room</th>
                <th>Capacity</th>
                <th>Enrolled</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((sec) => (
                <tr key={sec.id}>
                  <td>{sec.id}</td>
                  <td>{sec.day_of_week}</td>
                  <td>
                    {sec.start_time} - {sec.end_time}
                  </td>
                  <td>{sec.faculty_name}</td>
                  <td>
                    {sec.room_name} ({sec.building})
                  </td>
                  <td>{sec.capacity}</td>
                  <td>{sec.actual_students}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-info text-white"
                      onClick={() => handleEnroll(sec.id)}
                    >
                      Enroll
                    </button>
                  </td>
                </tr>
              ))}
              {sections.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-muted">
                    No sections found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
