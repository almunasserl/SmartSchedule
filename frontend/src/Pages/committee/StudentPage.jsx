import React, { useState } from "react";
import { Offcanvas, Button } from "react-bootstrap";
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

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function StudentsPage() {
  const [students, setStudents] = useState([
    {
      id: 1,
      name: "Ali Ahmed",
      level: 2,
      regular: true,
      remainingCourses: ["CS201"],
      neededCourses: ["CS301"],
    },
    {
      id: 2,
      name: "Sara Mohamed",
      level: 3,
      regular: false,
      remainingCourses: ["CS210", "CS220"],
      neededCourses: ["CS310"],
    },
    {
      id: 3,
      name: "Huda Saleh",
      level: 4,
      regular: true,
      remainingCourses: [],
      neededCourses: [],
    },
    {
      id: 4,
      name: "Omar Khaled",
      level: 1,
      regular: false,
      remainingCourses: ["CS101"],
      neededCourses: ["MATH101"],
    },
  ]);

  const coursesList = [
    { code: "CS101", name: "Intro to CS" },
    { code: "CS201", name: "Data Structures" },
    { code: "CS210", name: "Algorithms" },
    { code: "CS220", name: "Databases" },
    { code: "CS301", name: "Operating Systems" },
    { code: "CS310", name: "Networks" },
    { code: "MATH101", name: "Calculus I" },
  ];

  const [newStudent, setNewStudent] = useState({
    id: null,
    name: "",
    level: 1,
    regular: false,
    remainingCourses: [],
    neededCourses: [],
  });

  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  // 📊 إحصائيات
  const stats = {
    regular: students.filter((s) => s.regular).length,
    irregular: students.filter((s) => !s.regular).length,
    levels: [1, 2, 3, 4].map(
      (lvl) => students.filter((s) => s.level === lvl).length
    ),
  };

  // Pie: Regular vs Irregular
  const pieData = {
    labels: ["Regular", "Irregular"],
    datasets: [
      {
        data: [stats.regular, stats.irregular],
        backgroundColor: ["#198754", "#dc3545"],
      },
    ],
  };

  // Bar: Students per Level
  const barData = {
    labels: ["Level 1", "Level 2", "Level 3", "Level 4"],
    datasets: [
      {
        label: "Students",
        data: stats.levels,
        backgroundColor: "#0d6efd",
      },
    ],
  };

  // ➕ حفظ طالب
  const handleSaveStudent = () => {
    if (isEditing) {
      setStudents(
        students.map((s) => (s.id === newStudent.id ? newStudent : s))
      );
      setIsEditing(false);
    } else {
      setStudents([...students, { ...newStudent, id: students.length + 1 }]);
    }

    setNewStudent({
      id: null,
      name: "",
      level: 1,
      regular: false,
      remainingCourses: [],
      neededCourses: [],
    });

    setShowOffcanvas(false);
  };

  // ✏️ تعديل طالب
  const handleEdit = (student) => {
    setNewStudent(student);
    setIsEditing(true);
    setShowOffcanvas(true);
  };

  // 🗑️ حذف طالب
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      setStudents(students.filter((s) => s.id !== id));
    }
  };

  // 🔍 فلترة الطلاب
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toString().includes(search)
  );

  const handleClose = () => setShowOffcanvas(false);

  return (
    <div>
      <h2 className="mb-4">Students Management</h2>

      {/* 📊 Charts */}
      <div className="row g-3 mb-4 justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm p-2" style={{ minHeight: "220px" }}>
            <h6 className="text-center">Regular vs Irregular</h6>
            <div style={{ height: "180px" }}>
              <Pie data={pieData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm p-2" style={{ minHeight: "220px" }}>
            <h6 className="text-center">Students per Level</h6>
            <div style={{ height: "180px" }}>
              <Bar data={barData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      </div>

      {/* 🔍 Search + Add */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Search by Name or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          variant="primary"
          onClick={() => {
            setIsEditing(false);
            setNewStudent({
              id: null,
              name: "",
              level: 1,
              regular: false,
              remainingCourses: [],
              neededCourses: [],
            });
            setShowOffcanvas(true);
          }}
        >
          + Add Student
        </Button>
      </div>

      {/* 📋 جدول الطلاب غير المنتظمين */}
      <div className="card shadow-sm p-3">
        <h5 className="mb-3 text-info">Irregular Students</h5>
        <div className="table-responsive">
          <table className="table table-bordered table-striped align-middle text-center">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Level</th>
                <th>Remaining Courses</th>
                <th>Needed Courses</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents
                .filter((s) => !s.regular)
                .map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.name}</td>
                    <td>{s.level}</td>
                    <td>{s.remainingCourses.join(", ") || "-"}</td>
                    <td>{s.neededCourses.join(", ") || "-"}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEdit(s)}
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
            </tbody>
          </table>
        </div>
      </div>

      {/* 📝 Offcanvas */}
      <Offcanvas show={showOffcanvas} onHide={handleClose} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            {isEditing ? "Edit Student" : "Add Irregular Student"}
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              value={newStudent.name}
              onChange={(e) =>
                setNewStudent({ ...newStudent, name: e.target.value })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Level</label>
            <input
              type="number"
              className="form-control"
              value={newStudent.level}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  level: parseInt(e.target.value),
                })
              }
            />
          </div>

          {/* Remaining Courses */}
          <div className="mb-3">
            <label className="form-label">Remaining Courses</label>
            <div className="d-flex flex-wrap gap-2">
              {coursesList.map((c) => (
                <div key={c.code} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={c.code}
                    checked={newStudent.remainingCourses.includes(c.code)}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewStudent((prev) => ({
                        ...prev,
                        remainingCourses: e.target.checked
                          ? [...prev.remainingCourses, value]
                          : prev.remainingCourses.filter(
                              (course) => course !== value
                            ),
                      }));
                    }}
                  />
                  <label className="form-check-label">{c.code}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Needed Courses */}
          <div className="mb-3">
            <label className="form-label">Needed Courses</label>
            <div className="d-flex flex-wrap gap-2">
              {coursesList.map((c) => (
                <div key={c.code} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={c.code}
                    checked={newStudent.neededCourses.includes(c.code)}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewStudent((prev) => ({
                        ...prev,
                        neededCourses: e.target.checked
                          ? [...prev.neededCourses, value]
                          : prev.neededCourses.filter(
                              (course) => course !== value
                            ),
                      }));
                    }}
                  />
                  <label className="form-check-label">{c.code}</label>
                </div>
              ))}
            </div>
          </div>

          <button className="btn btn-primary w-100" onClick={handleSaveStudent}>
            {isEditing ? "Update Student" : "Save Student"}
          </button>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}
