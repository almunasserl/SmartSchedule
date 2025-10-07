import React, { useEffect, useState } from "react";
import { Offcanvas, Button, Spinner, Toast, ToastContainer } from "react-bootstrap";
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

  const [schedules, setSchedules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [days, setDays] = useState([]);

  const [newSection, setNewSection] = useState({
    id: null,
    schedule_id: "",
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
      const [schedulesRes, coursesRes, facultyRes, roomsRes, daysRes] = await Promise.all([
        api.get("/dropdowns/schedules-list"),
        api.get("/dropdowns/courses"),
        api.get("/dropdowns/faculty"),
        api.get("/dropdowns/rooms"),
        api.get("/dropdowns/working-days"),
      ]);
      setSchedules(schedulesRes.data || []);
      setCourses(coursesRes.data || []);
      setFaculty(facultyRes.data || []);
      setRooms(roomsRes.data || []);
      setDays(daysRes.data || []);
    } catch {
      showToast("Failed to load dropdowns", "danger");
    }
  };

  const handleSaveSection = async () => {
    if (!newSection.schedule_id || !newSection.course_id || !newSection.instructor_id) {
      showToast("Please fill all required fields", "warning");
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/sections/${newSection.id}`, newSection);
        showToast("✅ Section updated successfully!", "success");
      } else {
        await api.post("/sections", newSection);
        showToast("✅ Section created successfully!", "success");
      }
      await Promise.all([fetchSections(), fetchEnrollment()]);
      setShowOffcanvas(false);
      resetForm();
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to save section";
      showToast(msg, "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (section) => {
    setNewSection(section);
    setIsEditing(true);
    setShowOffcanvas(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this section?")) return;
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

  const resetForm = () => {
    setNewSection({
      id: null,
      schedule_id: "",
      course_id: "",
      instructor_id: "",
      room_id: "",
      capacity: "",
      day_of_week: "",
      start_time: "",
      end_time: "",
    });
    setIsEditing(false);
  };

  const filteredSections = sections.filter(
    (s) =>
      s.id.toString().includes(search) ||
      s.course_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.instructor_name?.toLowerCase().includes(search.toLowerCase())
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
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
        <Spinner animation="border" variant="info" style={{ width: "3rem", height: "3rem" }} />
      </div>
    );
  }

  return (
    <div>
      {/* Toasts */}
      <ToastContainer position="top-end" className="p-3">
        <Toast bg={toast.type} show={toast.show} onClose={() => setToast({ show: false })}>
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      <h2 className="mb-4 text-info">Sections</h2>

      {/* Search & Add */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Search by Course or Instructor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          variant="primary"
          onClick={() => {
            resetForm();
            setShowOffcanvas(true);
          }}
        >
          + Add Section
        </Button>
      </div>

      {/* Chart */}
      <div className="card shadow-sm p-3 mb-4">
        <h5 className="text-center text-info mb-3">Capacity vs Enrollment</h5>

        {enrollmentStats.length > 0 ? (
          <div style={{ height: `${enrollmentStats.length * 40}px`, width: "100%" }}>
            <Bar data={barData} options={barOptions} />
          </div>
        ) : (
          <div
            className="d-flex flex-column justify-content-center align-items-center text-muted"
            style={{ height: "250px" }}
          >
            <i className="bi bi-bar-chart" style={{ fontSize: "2rem", color: "#adb5bd" }}></i>
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
                <th>Course</th>
                <th>Instructor</th>
                <th>Room</th>
                <th>Capacity</th>
                <th>Enrolled</th>
                <th>Day</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSections.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.course_name}</td>
                  <td>{s.faculty_name}</td>
                  <td>{s.room_name}</td>
                  <td>{s.capacity}</td>
                  <td>{s.actual_students}</td>
                  <td>{s.day_of_week}</td>
                  <td>
                    {s.start_time} - {s.end_time}
                  </td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEdit(s)}
                      disabled={actionId === s.id}
                    >
                      {actionId === s.id && isEditing ? (
                        <Spinner size="sm" animation="border" />
                      ) : (
                        "Edit"
                      )}
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
              {filteredSections.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center text-muted">
                    No sections found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Offcanvas Form */}
      <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{isEditing ? "Edit Section" : "Add Section"}</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body>
          <div className="mb-3">
            <label className="form-label">Schedule</label>
            <select
              className="form-select"
              value={newSection.schedule_id}
              onChange={(e) => setNewSection({ ...newSection, schedule_id: e.target.value })}
            >
              <option value="">-- Select Schedule --</option>
              {schedules.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Course</label>
            <select
              className="form-select"
              value={newSection.course_id}
              onChange={(e) => setNewSection({ ...newSection, course_id: e.target.value })}
            >
              <option value="">-- Select Course --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Instructor</label>
            <select
              className="form-select"
              value={newSection.instructor_id}
              onChange={(e) => setNewSection({ ...newSection, instructor_id: e.target.value })}
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
              onChange={(e) => setNewSection({ ...newSection, room_id: e.target.value })}
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
            <label className="form-label">Capacity</label>
            <input
              type="number"
              className="form-control"
              value={newSection.capacity}
              onChange={(e) => setNewSection({ ...newSection, capacity: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Day</label>
            <select
              className="form-select"
              value={newSection.day_of_week}
              onChange={(e) => setNewSection({ ...newSection, day_of_week: e.target.value })}
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
              <label className="form-label">Start Time</label>
              <input
                type="time"
                className="form-control"
                value={newSection.start_time}
                onChange={(e) => setNewSection({ ...newSection, start_time: e.target.value })}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">End Time</label>
              <input
                type="time"
                className="form-control"
                value={newSection.end_time}
                onChange={(e) => setNewSection({ ...newSection, end_time: e.target.value })}
              />
            </div>
          </div>

          <Button
            className="w-100 mt-3"
            variant="info"
            onClick={handleSaveSection}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" /> Saving...
              </>
            ) : isEditing ? (
              "Update Section"
            ) : (
              "Save Section"
            )}
          </Button>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}
