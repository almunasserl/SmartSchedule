import React, { useEffect, useState } from "react";
import {
  Offcanvas,
  Button,
  Spinner,
  Toast,
  ToastContainer,
  Modal,
  Table,
} from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import api from "../../Services/apiClient";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Sections() {
  const [sections, setSections] = useState([]);
  const [enrollmentStats, setEnrollmentStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 2500);
  };

  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [days, setDays] = useState([]);

  const [newSection, setNewSection] = useState({
    id: null,
    course_id: "",
    instructor_id: "",
    room_id: "",
    capacity: "",
    day_of_week: "",
    start_time: "",
    end_time: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [search, setSearch] = useState("");

  const [showAIModal, setShowAIModal] = useState(false);
  const [aiSections, setAiSections] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    loadPage();
  }, []);

  const loadPage = async () => {
    setPageLoading(true);
    await Promise.all([fetchSections(), fetchDropdowns(), fetchEnrollment()]);
    setPageLoading(false);
  };

  const fetchSections = async () => {
    try {
      const res = await api.get("/sections");
      setSections(res.data);
    } catch {
      showToast("Failed to load sections", "danger");
    }
  };

  const fetchEnrollment = async () => {
    try {
      const res = await api.get("/reports/sections/enrollment");
      setEnrollmentStats(res.data);
    } catch {
      showToast("Failed to load enrollment data", "danger");
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [coursesRes, facultyRes, roomsRes, daysRes] = await Promise.all([
        api.get("/dropdowns/courses"),
        api.get("/dropdowns/faculty"),
        api.get("/dropdowns/rooms"),
        api.get("/dropdowns/working-days"),
      ]);
      setCourses(coursesRes.data || []);
      setFaculty(facultyRes.data || []);
      setRooms(roomsRes.data || []);
      setDays(daysRes.data || []);
    } catch {
      showToast("Failed to load dropdowns", "danger");
    }
  };

  // ✅ Fixed Edit function to show correct values
  const handleEdit = (section) => {
    const course = courses.find((c) => c.code === section.course_code);
    const instructor = faculty.find((f) => f.name === section.faculty_name);
    const room = rooms.find((r) =>
      r.label.toLowerCase().includes(section.room_name.toLowerCase())
    );

    setNewSection({
      id: section.id,
      course_id: course ? course.id : "",
      instructor_id: instructor ? instructor.id : "",
      room_id: room ? room.id : "",
      capacity: section.capacity,
      day_of_week: section.day_of_week,
      start_time: section.start_time,
      end_time: section.end_time,
    });

    setIsEditing(true);
    setShowOffcanvas(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this section?"))
      return;
    setActionId(id);
    try {
      await api.delete(`/sections/${id}`);
      await Promise.all([fetchSections(), fetchEnrollment()]);
      showToast("🗑️ Section deleted successfully", "success");
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to delete section";
      showToast(msg, "danger");
    } finally {
      setActionId(null);
    }
  };

  const handleGenerateAI = async () => {
    setLoadingAI(true);
    setShowAIModal(true);
    try {
      const res = await api.get("/ai/smart-sections");
      setAiSections(res.data);
      showToast("🤖 Smart sections generated successfully!", "success");
    } catch {
      showToast("Failed to generate smart sections", "danger");
    } finally {
      setLoadingAI(false);
    }
  };

  const filteredSections = sections.filter(
    (s) =>
      s.id.toString().includes(search) ||
      s.course_code?.toLowerCase().includes(search.toLowerCase()) ||
      s.faculty_name?.toLowerCase().includes(search.toLowerCase())
  );

  const barData = {
    labels: enrollmentStats.map((s) => `${s.course} (${s.section_id})`),
    datasets: [
      {
        label: "Capacity",
        data: enrollmentStats.map((s) => s.capacity),
        backgroundColor: "#0dcaf0",
      },
      {
        label: "Enrolled",
        data: enrollmentStats.map((s) => s.enrolled),
        backgroundColor: "#0d6efd",
      },
    ],
  };

  const barOptions = {
    maintainAspectRatio: false,
    indexAxis: "y",
    responsive: true,
    plugins: { legend: { position: "bottom" } },
  };

  if (pageLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
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

      <h2 className="mb-4 text-info">Sections</h2>

      {/* Search & Add & AI */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Search by Course or Instructor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="d-flex gap-2">
          <Button
            variant="info"
            onClick={handleGenerateAI}
            disabled={loadingAI}
          >
            {loadingAI ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Loading...
              </>
            ) : (
              "🤖 Smart Generate"
            )}
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setIsEditing(false);
              setNewSection({
                id: null,
                course_id: "",
                instructor_id: "",
                room_id: "",
                capacity: "",
                day_of_week: "",
                start_time: "",
                end_time: "",
              });
              setShowOffcanvas(true);
            }}
          >
            + Add Section
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div className="card shadow-sm p-3 mb-4">
        <h5 className="text-center text-info mb-3">Capacity vs Enrollment</h5>

        {enrollmentStats.length > 0 ? (
          <div
            style={{
              height: `${Math.max(enrollmentStats.length * 40, 100)}px`,
              width: "100%",
            }}
          >
            <Bar data={barData} options={barOptions} />
          </div>
        ) : (
          <div
            className="d-flex flex-column justify-content-center align-items-center text-muted"
            style={{ height: "250px" }}
          >
            <i
              className="bi bi-bar-chart"
              style={{ fontSize: "2rem", color: "#adb5bd" }}
            ></i>
            <p className="mt-2">No enrollment data available yet</p>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card shadow-sm p-3">
        <h5 className="mb-3 text-info">Sections List</h5>
        <div className="table-responsive">
          <table className="table table-bordered table-striped align-middle text-center">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Course Code</th>
                <th>Instructor</th>
                <th>Room</th>
                <th>Capacity</th>
                <th>Enrolled</th>
                <th>Day</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSections.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.course_code}</td>
                  <td>{s.faculty_name}</td>
                  <td>{s.room_name}</td>
                  <td>{s.capacity}</td>
                  <td>{s.actual_students}</td>
                  <td>{s.day_of_week}</td>
                  <td>
                    {s.start_time} - {s.end_time}
                  </td>
                  <td>{s.status}</td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEdit(s)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(s.id)}
                      disabled={actionId === s.id}
                    >
                      {actionId === s.id ? (
                        <Spinner size="sm" animation="border" />
                      ) : (
                        "Delete"
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Offcanvas Form */}
      <Offcanvas
        show={showOffcanvas}
        onHide={() => setShowOffcanvas(false)}
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            {isEditing ? "Edit Section" : "Add Section"}
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="mb-3">
            <label className="form-label">Course</label>
            <select
              className="form-select"
              value={newSection.course_id}
              onChange={(e) =>
                setNewSection({ ...newSection, course_id: e.target.value })
              }
            >
              <option value="">-- Select Course --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Instructor</label>
            <select
              className="form-select"
              value={newSection.instructor_id}
              onChange={(e) =>
                setNewSection({ ...newSection, instructor_id: e.target.value })
              }
            >
              <option value="">-- Select Instructor --</option>
              {faculty.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Room</label>
            <select
              className="form-select"
              value={newSection.room_id}
              onChange={(e) =>
                setNewSection({ ...newSection, room_id: e.target.value })
              }
            >
              <option value="">-- Select Room --</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Day</label>
            <select
              className="form-select"
              value={newSection.day_of_week}
              onChange={(e) =>
                setNewSection({ ...newSection, day_of_week: e.target.value })
              }
            >
              <option value="">-- Select Day --</option>
              {days.map((d, i) => (
                <option key={i} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Capacity</label>
              <input
                type="number"
                className="form-control"
                value={newSection.capacity}
                onChange={(e) =>
                  setNewSection({ ...newSection, capacity: e.target.value })
                }
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Start Time</label>
              <input
                type="time"
                className="form-control"
                value={newSection.start_time}
                onChange={(e) =>
                  setNewSection({ ...newSection, start_time: e.target.value })
                }
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">End Time</label>
            <input
              type="time"
              className="form-control"
              value={newSection.end_time}
              onChange={(e) =>
                setNewSection({ ...newSection, end_time: e.target.value })
              }
            />
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      {/* AI Modal */}
      <Modal
        show={showAIModal}
        onHide={() => setShowAIModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>🤖 Smart Sections Suggestions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingAI ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="info" />
              <p className="mt-3">Generating smart sections...</p>
            </div>
          ) : aiSections.length > 0 ? (
            <div className="table-responsive">
              <Table bordered striped hover>
                <thead className="table-info text-center">
                  <tr>
                    <th>Course Code</th>
                    <th>Instructor</th>
                    <th>Room</th>
                    <th>Day</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Capacity</th>
                  </tr>
                </thead>
                <tbody>
                  {aiSections.map((s, i) => (
                    <tr key={i}>
                      <td>{s.course_code}</td>
                      <td>{s.faculty_name}</td>
                      <td>{s.room_name}</td>
                      <td>{s.day_of_week}</td>
                      <td>{s.start_time}</td>
                      <td>{s.end_time}</td>
                      <td>{s.capacity}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted">
              No suggestions available yet.
            </p>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
