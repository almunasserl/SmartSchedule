import React, { useState } from "react";

export default function CommitteeDashboard() {
  // بيانات تجريبية (Dummy Data)
  const stats = {
    students: 350,
    faculty: 45,
    sections: 40,
    courses: 24,
    surveys: 3,
  };

  // قائمة مستخدمين (مبدئية)
  const [users, setUsers] = useState([
    { id: 1, name: "Ali Ahmed", email: "ali@example.com", role: "Student", active: true },
    { id: 2, name: "Sara Mohamed", email: "sara@example.com", role: "Student", active: false },
    { id: 3, name: "Dr. Khaled Omar", email: "khaled@example.com", role: "Faculty", active: true },
    { id: 4, name: "Dr. Huda Saleh", email: "huda@example.com", role: "Faculty", active: true },
    { id: 5, name: "Admin Committee", email: "committee@example.com", role: "Committee", active: true },
  ]);

  // تغيير حالة المستخدم
  const toggleStatus = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, active: !u.active } : u
      )
    );
  };

  return (
    <div>
      <h2 className="mb-4">Committee Dashboard</h2>

      {/* Cards للإحصائيات */}
      <div className="row g-3">
        <div className="col">
          <div className="card shadow-sm p-3 text-center border-0 bg-info text-white">
            <h4>{stats.students}</h4>
            <p className="mb-0">Students</p>
          </div>
        </div>
        <div className="col">
          <div className="card shadow-sm p-3 text-center border-0 bg-primary text-white">
            <h4>{stats.faculty}</h4>
            <p className="mb-0">Faculty</p>
          </div>
        </div>
        <div className="col">
          <div className="card shadow-sm p-3 text-center border-0 bg-success text-white">
            <h4>{stats.sections}</h4>
            <p className="mb-0">Sections</p>
          </div>
        </div>
        <div className="col">
          <div className="card shadow-sm p-3 text-center border-0 bg-warning text-white">
            <h4>{stats.courses}</h4>
            <p className="mb-0">Courses</p>
          </div>
        </div>
        <div className="col">
          <div className="card shadow-sm p-3 text-center border-0 bg-secondary text-white">
            <h4>{stats.surveys}</h4>
            <p className="mb-0">Surveys</p>
          </div>
        </div>
      </div>

      {/* جدول المستخدمين */}
      <div className="card shadow-sm p-3 mt-4">
        <h5 className="mb-3 text-info">Users Management</h5>
        <div className="table-responsive">
          <table className="table table-bordered table-striped align-middle text-center">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <button
                      className={`btn btn-sm ${u.active ? "btn-success" : "btn-danger"}`}
                      onClick={() => toggleStatus(u.id)}
                    >
                      {u.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
