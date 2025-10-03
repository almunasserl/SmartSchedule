import React, { useEffect, useState } from "react";
import apiClient from "../../Services/apiClient";

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
  const [showModal, setShowModal] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [terms, setTerms] = useState([]);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    name: "",
    role: "",
    dept_id: "",
    term_id: "",
    status: "regular",
  });

  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingBtn, setLoadingBtn] = useState(false);

  // 📌 جلب التقارير + المستخدمين
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
      } catch (err) {
        console.error("Error loading data", err);
      } finally {
        setLoadingPage(false);
      }
    };
    fetchData();
  }, []);

  // 📌 جلب الدروب داون
  useEffect(() => {
    apiClient.get("/dropdowns/departments").then((res) => setDepartments(res.data));
    apiClient.get("/dropdowns/terms").then((res) => setTerms(res.data));
  }, []);

  // 📌 إضافة مستخدم جديد
  const handleAddUser = async () => {
    try {
      setLoadingBtn(true);
      await apiClient.post("/auth/signup", formData);
      setShowModal(false);
      setFormData({
        email: "",
        phone: "",
        name: "",
        role: "",
        dept_id: "",
        term_id: "",
        status: "regular",
      });
      const refreshed = await apiClient.get("/auth/users");
      setUsers(refreshed.data);
    } catch (err) {
      console.error("Error adding user:", err);
    } finally {
      setLoadingBtn(false);
    }
  };

  // 📌 تحديث حالة المستخدم
  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      await apiClient.patch(`/auth/users/${id}/status`, { status: newStatus });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, status: newStatus } : u
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // 📌 فلترة المستخدمين
  const filteredUsers =
    filter === "all" ? users : users.filter((u) => u.status === filter);

  // ================== UI ==================
  if (loadingPage) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-info" style={{ width: "3rem", height: "3rem" }} />
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-info">Registrar Dashboard</h2>

      {/* الكروت */}
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

      {/* التحكم بالمستخدمين */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="d-flex justify-content-between mb-3">
            <h5 className="fw-semibold text-info">Manage Users</h5>
            <button
              className="btn btn-info text-white"
              onClick={() => setShowModal(true)}
            >
              + Add User
            </button>
          </div>

          {/* فلترة */}
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

          {/* جدول */}
          <div className="table-responsive">
            <table className="table table-bordered text-center align-middle">
              <thead className="table-light">
                <tr>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.email}</td>
                    <td>{u.phone}</td>
                    <td>{u.role}</td>
                    <td>
                      <button
                        className={`btn btn-sm ${
                          u.status === "active" ? "btn-danger" : "btn-success"
                        }`}
                        onClick={() => toggleStatus(u.id, u.status)}
                      >
                        {u.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* مودال إضافة مستخدم */}
      {showModal && (
        <div
          className="offcanvas offcanvas-end show"
          style={{ visibility: "visible", backgroundColor: "white" }}
          tabIndex="-1"
        >
          <div className="offcanvas-header border-bottom">
            <h5 className="offcanvas-title">Add User</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => setShowModal(false)}
            ></button>
          </div>
          <div className="offcanvas-body">
            {/* بيانات auth */}
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Phone</label>
              <input
                type="text"
                className="form-control"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>

            {/* اختيار الرول */}
            <div className="mb-3">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="">Select Role</option>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="committee">Committee</option>
                <option value="registrar">Registrar</option>
              </select>
            </div>

            {/* الحقول حسب الرول */}
            {formData.role === "student" && (
              <>
                <div className="mb-3">
                  <label className="form-label">Department</label>
                  <select
                    className="form-select"
                    value={formData.dept_id}
                    onChange={(e) =>
                      setFormData({ ...formData, dept_id: e.target.value })
                    }
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Term</label>
                  <select
                    className="form-select"
                    value={formData.term_id}
                    onChange={(e) =>
                      setFormData({ ...formData, term_id: e.target.value })
                    }
                  >
                    <option value="">Select Term</option>
                    {terms.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="regular">Regular</option>
                    <option value="irregular">Irregular</option>
                  </select>
                </div>
              </>
            )}

            {formData.role === "faculty" && (
              <div className="mb-3">
                <label className="form-label">Department</label>
                <select
                  className="form-select"
                  value={formData.dept_id}
                  onChange={(e) =>
                    setFormData({ ...formData, dept_id: e.target.value })
                  }
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              className="btn btn-info text-white w-100"
              onClick={handleAddUser}
              disabled={loadingBtn}
            >
              {loadingBtn ? (
                <div
                  className="spinner-border spinner-border-sm text-light"
                  role="status"
                />
              ) : (
                "Save"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
