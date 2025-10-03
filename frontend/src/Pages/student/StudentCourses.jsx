import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../Services/apiClient";
import { useAuth } from "../../Hooks/AuthContext";

export default function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/students/${user.id}/courses`);
        setCourses(res.data);
      } catch (err) {
        console.error("Failed to load courses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [user]);

  return (
    <div>
      <h2 className="mb-4 text-info">My Courses</h2>

      {loading ? (
        <div className="text-center my-4">
          <div className="spinner-border text-info" />
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered text-center align-middle">
            <thead className="table-light">
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Credits</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td>{course.code}</td>
                  <td>{course.name}</td>
                  <td>{course.credit_hours}</td>
                  <td>{course.type}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-info text-white"
                      onClick={() =>
                        navigate(`/student/courses/${course.id}/sections`)
                      }
                    >
                      View Sections
                    </button>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-muted">
                    No courses found
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
