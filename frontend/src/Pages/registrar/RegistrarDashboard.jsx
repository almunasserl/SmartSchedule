import React, { useEffect, useState } from "react";
import apiClient from "../../Services/apiClient";
import { Toast, ToastContainer, Spinner } from "react-bootstrap";

export default function RegistrarDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    faculty: 0,
    departments: 0,
    courses: 0,
    surveys: 0,
  });
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loadingPage, setLoadingPage] = useState(true);
  const [statusLoading, setStatusLoading] = useState(null);

  // ✅ Toast
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  // 📌 Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [st, fc, dp, co, sv, us] = await Promise.all([
          apiClient.get("/reports/students/total"),
          apiClient.get("/reports/faculty/total"),
          apiClient.get("/reports/departments/total"),
          apiClient.get("/reports/courses/total"),
          apiClient.get("/reports/surveys/total"),
          apiClient.get("/auth/users"),
        ]);
        setStats({
          students: st.data.total_students,
          faculty: fc.data.total_faculty,
          departments: dp.data.total_departments,
          courses: co.data.total_courses,
          surveys: sv.data.total_surveys,
        });
        setUsers(us.data);
      } catch {
        showToast("Error loading data", "danger");
      } finally {
        setLoadingPage(false);
      }
    };
    fetchData();
  }, []);

  // 📌 Toggle user status
  const toggleStatus = async (id, currentStatus) => {
    setStatusLoading(id);
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      await apiClient.patch(`/auth/users/${id}/status`, { status: newStatus });
      showToast(`User status updated to ${newStatus}`, "info");
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u))
      );
    } catch {
      showToast("Error updating status", "danger");
    } finally {
      setStatusLoading(null);
    }
  };

  // 📌 Filtered list
  const filteredUsers =
    filter === "all" ? users : users.filter((u) => u.status === filter);

  if (loadingPage) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner
          animation="border"
          variant="info"
          style={{ width: "3rem", height: "3rem" }}
        />
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-info">Registrar Dashboard</h2>

      {/* ✅ Toast Notification */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg={toast.type}
          show={toast.show}
          onClose={() => setToast({ show: false })}
        >
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* 📊 Stats cards */}
      <div className="row g-3 mb-4">
        {[
          { label: "Total Students", value: stats.students },
          { label: "Total Faculty", value: stats.faculty },
          { label: "Departments", value: stats.departments },
          { label: "Courses", value: stats.courses },
          { label: "Surveys", value: stats.surveys },
        ].map((stat, i) => (
          <div className="col-12 col-sm-6 col-md-4 col-lg" key={i}>
            <div className="card shadow-sm border-0 text-center h-100">
              <div className="card-body">
                <h5 className="fw-bold text-info">{stat.value}</h5>
                <p className="mb-0">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 👥 Manage Users */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="d-flex justify-content-between mb-3">
            <h5 className="fw-semibold text-info">Manage Users</h5>
          </div>

          <div className="mb-3">
            <select
              className="form-select w-auto"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered text-center align-middle">
              <thead className="table-light">
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>
                      <span
                        className={`badge ${
                          u.status === "active"
                            ? "bg-success"
                            : "bg-secondary"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${
                          u.status === "active" ? "btn-danger" : "btn-success"
                        }`}
                        onClick={() => toggleStatus(u.id, u.status)}
                        disabled={statusLoading === u.id}
                      >
                        {statusLoading === u.id ? (
                          <Spinner size="sm" animation="border" />
                        ) : u.status === "active" ? (
                          "Deactivate"
                        ) : (
                          "Activate"
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
