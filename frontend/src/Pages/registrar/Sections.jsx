import React, { useEffect, useState } from "react";
import { Offcanvas, Button, Spinner } from "react-bootstrap";
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

  // dropdowns
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
    fetchSections();
    fetchDropdowns();
    fetchEnrollment();
  }, []);

  // جلب السكاشن
  const fetchSections = async () => {
    try {
      const res = await api.get("/sections");
      setSections(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // جلب التقارير (enrollment)
  const fetchEnrollment = async () => {
    try {
      const res = await api.get("/reports/sections/enrollment");
      setEnrollmentStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // جلب القوائم
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
    } catch (err) {
      console.error(err);
    }
  };

  // ➕ إنشاء أو تعديل سكشن
  const handleSaveSection = async () => {
    if (!newSection.schedule_id || !newSection.course_id || !newSection.instructor_id) return;
    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/sections/${newSection.id}`, newSection);
      } else {
        await api.post("/sections", newSection);
      }
      fetchSections();
      fetchEnrollment();
      setShowOffcanvas(false);
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✏️ تعديل
  const handleEdit = (section) => {
    setNewSection(section);
    setIsEditing(true);
    setShowOffcanvas(true);
  };

  // 🗑️ حذف
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this section?")) {
      try {
        await api.delete(`/sections/${id}`);
        fetchSections();
        fetchEnrollment();
      } catch (err) {
        console.error(err);
      }
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

  // 🔍 فلترة
  const filteredSections = sections.filter(
    (s) =>
      s.id.toString().includes(search) ||
      s.course_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.instructor_name?.toLowerCase().includes(search.toLowerCase())
  );

  // 📊 بيانات الشارت
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

  return (
    <div>
      <h2 className="mb-4 text-info">Sections</h2>

      {/* 🔍 بحث + زر إضافة */}
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

      {/* 📊 الشارت */}
      <div className="card shadow-sm p-3 mb-4">
        <h5 className="text-center text-info">Capacity vs Enrollment</h5>
        <div style={{ height: `${enrollmentStats.length * 40}px`, width: "100%" }}>
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

     {/* 📋 الجدول */}
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
          <th>Enrolled</th>   {/* ✅ عدد الطلاب الفعلي */}
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
            <td>{s.faculty_name}</td>   {/* ✅ اسم المدرس */}
            <td>{s.room_name}</td>
            <td>{s.capacity}</td>
            <td>{s.actual_students}</td>          {/* ✅ الطلاب الفعليين */}
            <td>{s.day_of_week}</td>
            <td>
              {s.start_time} - {s.end_time}
            </td>
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
        {filteredSections.length === 0 && (
          <tr>
            <td colSpan="9" className="text-muted text-center">
              No sections found
            </td>
          </tr>
        )}
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
          {/* Schedule Dropdown */}
          <div className="mb-3">
            <label className="form-label">Schedule</label>
            <select
              className="form-select"
              value={newSection.schedule_id}
              onChange={(e) => setNewSection({ ...newSection, schedule_id: e.target.value })}
            >
              <option value="">-- Select Schedule --</option>
              {schedules.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>

          {/* Course Dropdown */}
          <div className="mb-3">
            <label className="form-label">Course</label>
            <select
              className="form-select"
              value={newSection.course_id}
              onChange={(e) => setNewSection({ ...newSection, course_id: e.target.value })}
            >
              <option value="">-- Select Course --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Faculty Dropdown */}
          <div className="mb-3">
            <label className="form-label">Instructor</label>
            <select
              className="form-select"
              value={newSection.instructor_id}
              onChange={(e) => setNewSection({ ...newSection, instructor_id: e.target.value })}
            >
              <option value="">-- Select Instructor --</option>
              {faculty.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* Room Dropdown */}
          <div className="mb-3">
            <label className="form-label">Room</label>
            <select
              className="form-select"
              value={newSection.room_id}
              onChange={(e) => setNewSection({ ...newSection, room_id: e.target.value })}
            >
              <option value="">-- Select Room --</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Capacity */}
          <div className="mb-3">
            <label className="form-label">Capacity</label>
            <input
              type="number"
              className="form-control"
              value={newSection.capacity}
              onChange={(e) => setNewSection({ ...newSection, capacity: e.target.value })}
            />
          </div>

          {/* Day Dropdown */}
          <div className="mb-3">
            <label className="form-label">Day</label>
            <select
              className="form-select"
              value={newSection.day_of_week}
              onChange={(e) => setNewSection({ ...newSection, day_of_week: e.target.value })}
            >
              <option value="">-- Select Day --</option>
              {days.map((d, i) => (
                <option key={i} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Time */}
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

          <Button className="w-100" variant="info" onClick={handleSaveSection} disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : isEditing ? "Update Section" : "Save Section"}
          </Button>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}
