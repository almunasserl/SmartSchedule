// src/pages/registrar/Students.jsx
import React, { useEffect, useState } from "react";
import { Offcanvas, Button, Spinner } from "react-bootstrap";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import api from "../../Services/apiClient";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function Students() {
  const [students, setStudents] = useState([]);
  const [statusStats, setStatusStats] = useState([]);
  const [deptStats, setDeptStats] = useState([]);
  const [loading, setLoading] = useState(false);

  const [terms, setTerms] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [editStudent, setEditStudent] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchReports();
    fetchDropdowns();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get("/students");
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReports = async () => {
    try {
      const [statusRes, deptRes] = await Promise.all([
        api.get("/reports/students/status-ratio"),
        api.get("/reports/students/by-department"),
      ]);
      setStatusStats(statusRes.data || []);
      setDeptStats(deptRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [termsRes, deptsRes] = await Promise.all([
        api.get("/dropdowns/terms"),
        api.get("/dropdowns/departments"),
      ]);
      setTerms(termsRes.data || []);
      setDepartments(deptsRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    if (!editStudent) return;
    setLoading(true);
    try {
      await api.patch(`/students/${editStudent.id}`, editStudent);
      fetchStudents();
      setShowOffcanvas(false);
      setEditStudent(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await api.delete(`/students/${id}`);
        fetchStudents();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // 📊 Pie Data
  const statusData = {
    labels: statusStats.map((s) => s.status),
    datasets: [
      {
        data: statusStats.map((s) => s.total),
        backgroundColor: ["#0dcaf0", "#0d6efd", "#ffc107", "#dc3545"],
      },
    ],
  };

  // 📊 Bar Data
  const deptData = {
    labels: deptStats.map((d) => d.department),
    datasets: [
      {
        label: "Students",
        data: deptStats.map((d) => d.total_students),
        backgroundColor: "#20c997",
      },
    ],
  };

  const barOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: { legend: { display: false } },
  };

  return (
    <div>
      <h2 className="mb-4 text-info">Students Management</h2>

      {/* 📊 Reports */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm p-3">
            <h6 className="text-info">Students Status</h6>
            <div
              style={{
                height: "280px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Pie data={statusData} />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm p-3">
            <h6 className="text-info">Students by Department</h6>
            <div style={{ height: "280px" }}>
              <Bar data={deptData} options={barOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* 📋 Students Table */}
      <div className="card shadow-sm p-3">
        <h5 className="mb-3 text-info">Students List</h5>
        <div className="table-responsive">
          <table className="table table-bordered table-striped align-middle text-center">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Status</th>
                <th>Department</th>
                <th>Term</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.name}</td>
                  <td>{s.status}</td>
                  <td>{s.department_name}</td>
                  <td>{s.term_name}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => {
                        setEditStudent(s);
                        setShowOffcanvas(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(s.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-muted text-center">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📝 Offcanvas Edit */}
      <Offcanvas
        show={showOffcanvas}
        onHide={() => setShowOffcanvas(false)}
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Edit Student</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {editStudent && (
            <>
              {/* Name */}
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={editStudent.name}
                  onChange={(e) =>
                    setEditStudent({ ...editStudent, name: e.target.value })
                  }
                />
              </div>

              {/* Status */}
              <div className="mb-3">
                <label className="form-label">Status</label>
                <input
                  type="text"
                  className="form-control"
                  value={editStudent.status}
                  onChange={(e) =>
                    setEditStudent({ ...editStudent, status: e.target.value })
                  }
                />
              </div>

              {/* Department */}
              <div className="mb-3">
                <label className="form-label">Department</label>
                <select
                  className="form-select"
                  value={editStudent.dept_id}
                  onChange={(e) =>
                    setEditStudent({ ...editStudent, dept_id: e.target.value })
                  }
                >
                  <option value="">-- Select Department --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Term */}
              <div className="mb-3">
                <label className="form-label">Term</label>
                <select
                  className="form-select"
                  value={editStudent.term_id}
                  onChange={(e) =>
                    setEditStudent({ ...editStudent, term_id: e.target.value })
                  }
                >
                  <option value="">-- Select Term --</option>
                  {terms.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                className="w-100"
                variant="info"
                onClick={handleUpdate}
                disabled={loading}
              >
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "Update Student"
                )}
              </Button>
            </>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}
