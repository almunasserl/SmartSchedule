import React, { useState } from "react";
import { Offcanvas, Button } from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function SectionsPage() {
  const courses = [
    { code: "CS101", name: "Intro to CS" },
    { code: "CS201", name: "Data Structures" },
    { code: "CS220", name: "Databases" },
  ];

  const faculty = [
    { id: "F001", name: "Dr. Ali" },
    { id: "F002", name: "Dr. Sara" },
    { id: "F003", name: "Dr. Omar" },
  ];

  const [sections, setSections] = useState([
    { id: 1, courseCode: "CS101", facultyId: "F001", room: "A1", capacity: 30, students: 25 },
    { id: 2, courseCode: "CS201", facultyId: "F002", room: "B2", capacity: 35, students: 33 },
    { id: 3, courseCode: "CS220", facultyId: "F003", room: "Lab1", capacity: 25, students: 20 },
  ]);

  const [newSection, setNewSection] = useState({
    id: null,
    courseCode: "",
    facultyId: "",
    room: "",
    capacity: 0,
    students: 0,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [search, setSearch] = useState("");

  // 📊 Chart: Capacity vs Enrollment
  const barData = {
    labels: sections.map((s) => `${s.courseCode} (${s.id})`),
    datasets: [
      {
        label: "Capacity",
        data: sections.map((s) => s.capacity),
        backgroundColor: "#0dcaf0",
      },
      {
        label: "Enrolled",
        data: sections.map((s) => s.students),
        backgroundColor: "#0d6efd",
      },
    ],
  };

  const barOptions = {
    maintainAspectRatio: false,
    indexAxis: "y", // أفقية
    responsive: true,
  };

  // ➕ Save Section
  const handleSaveSection = () => {
    if (isEditing) {
      setSections(sections.map((s) => (s.id === newSection.id ? newSection : s)));
      setIsEditing(false);
    } else {
      setSections([...sections, { ...newSection, id: sections.length + 1 }]);
    }
    setShowOffcanvas(false);
    setNewSection({ id: null, courseCode: "", facultyId: "", room: "", capacity: 0, students: 0 });
  };

  // ✏️ Edit Section
  const handleEdit = (section) => {
    setNewSection(section);
    setIsEditing(true);
    setShowOffcanvas(true);
  };

  // 🗑️ Delete Section
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this section?")) {
      setSections(sections.filter((s) => s.id !== id));
    }
  };

  // 🔍 Filter
  const filteredSections = sections.filter(
    (s) =>
      s.id.toString().includes(search) ||
      s.courseCode.toLowerCase().includes(search.toLowerCase()) ||
      s.facultyId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2 className="mb-4">Sections Management</h2>

      {/* 🔍 Search + Add */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Search by ID, CourseCode, or FacultyID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          variant="primary"
          onClick={() => {
            setIsEditing(false);
            setNewSection({ id: null, courseCode: "", facultyId: "", room: "", capacity: 0, students: 0 });
            setShowOffcanvas(true);
          }}
        >
          + Add Section
        </Button>
      </div>

      {/* 📊 Chart full width */}
      <div className="card shadow-sm p-3 mb-4">
        <h5 className="text-center text-info">Section Capacity vs Enrollment</h5>
        <div style={{ height: `${sections.length * 40}px`, width: "100%" }}>
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      {/* 📋 Sections Table */}
      <div className="card shadow-sm p-3">
        <h5 className="mb-3 text-info">Sections List</h5>
        <div className="table-responsive">
          <table className="table table-bordered table-striped align-middle text-center">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Course Code</th>
                <th>Faculty ID</th>
                <th>Room</th>
                <th>Capacity</th>
                <th>Actual Students</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSections.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.courseCode}</td>
                  <td>{s.facultyId}</td>
                  <td>{s.room}</td>
                  <td>{s.capacity}</td>
                  <td>{s.students}</td>
                  <td>
                    <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(s)}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📝 Offcanvas Form */}
      <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{isEditing ? "Edit Section" : "Add Section"}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {/* Course Dropdown */}
          <div className="mb-3">
            <label className="form-label">Course</label>
            <select
              className="form-select"
              value={newSection.courseCode}
              onChange={(e) => setNewSection({ ...newSection, courseCode: e.target.value })}
            >
              <option value="">-- Select Course --</option>
              {courses.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Faculty Dropdown */}
          <div className="mb-3">
            <label className="form-label">Faculty</label>
            <select
              className="form-select"
              value={newSection.facultyId}
              onChange={(e) => setNewSection({ ...newSection, facultyId: e.target.value })}
            >
              <option value="">-- Select Faculty --</option>
              {faculty.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.id} - {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Room */}
          <div className="mb-3">
            <label className="form-label">Room</label>
            <input
              type="text"
              className="form-control"
              value={newSection.room}
              onChange={(e) => setNewSection({ ...newSection, room: e.target.value })}
            />
          </div>

          {/* Capacity */}
          <div className="mb-3">
            <label className="form-label">Capacity</label>
            <input
              type="number"
              className="form-control"
              value={newSection.capacity}
              onChange={(e) => setNewSection({ ...newSection, capacity: parseInt(e.target.value) })}
            />
          </div>

          {/* Actual Students */}
          <div className="mb-3">
            <label className="form-label">Actual Students</label>
            <input
              type="number"
              className="form-control"
              value={newSection.students}
              onChange={(e) => setNewSection({ ...newSection, students: parseInt(e.target.value) })}
            />
          </div>

          <button className="btn btn-primary w-100" onClick={handleSaveSection}>
            {isEditing ? "Update Section" : "Save Section"}
          </button>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}
