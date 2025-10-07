import React, { useEffect, useState } from "react";
import apiClient from "../../Services/apiClient";
import { useAuth } from "../../Hooks/AuthContext";
import { Spinner, Toast, ToastContainer } from "react-bootstrap";

export default function FacultyCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 2500);
  };

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user?.id) return;

      setPageLoading(true);
      try {
        const res = await apiClient.get(`/faculty/${user.id}/courses`);
        setCourses(res.data);
      } catch (err) {
        console.error("Error loading courses:", err);
        const msg = err.response?.data?.error || "Failed to load courses";
        showToast(msg, "danger");
      } finally {
        setPageLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  // Loader for full page
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
      {/* Toasts */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg={toast.type}
          show={toast.show}
          onClose={() => setToast({ show: false })}
        >
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      <h2 className="text-info mb-3">My Courses</h2>

      <div className="card shadow-sm p-3">
        <div className="table-responsive">
          <table className="table table-bordered text-center align-middle">
            <thead className="table-light">
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Credit Hours</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td>{course.code}</td>
                  <td>{course.name}</td>
                  <td>{course.credit_hours}</td>
                  <td>{course.type}</td>
                </tr>
              ))}

              {courses.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-muted">
                    No courses found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
