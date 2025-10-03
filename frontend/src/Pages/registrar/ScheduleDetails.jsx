// src/pages/registrar/ScheduleDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../Services/apiClient";

export default function ScheduleDetails() {
  const { id } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);

  // search & filters
  const [search, setSearch] = useState("");
  const [instructorFilter, setInstructorFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [roomFilter, setRoomFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("");

  useEffect(() => {
    fetchSchedule();
  }, [id]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/schedules/${id}`);
      setSchedule(res.data.schedule);
      setSections(res.data.sections);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ استخراج القيم الفريدة للفلاتر
  const uniqueInstructors = [...new Set(sections.map((s) => s.instructor_name))];
  const uniqueCourses = [...new Set(sections.map((s) => s.course_name))];
  const uniqueRooms = [...new Set(sections.map((s) => s.room_name))];
  const uniqueDays = [...new Set(sections.map((s) => s.day_of_week))];

  // ✅ فلترة السكاشن
  const filteredSections = sections.filter((s) => {
    const matchesSearch =
      s.course_name.toLowerCase().includes(search.toLowerCase()) ||
      s.instructor_name.toLowerCase().includes(search.toLowerCase()) ||
      s.room_name.toLowerCase().includes(search.toLowerCase()) ||
      s.day_of_week.toLowerCase().includes(search.toLowerCase());

    const matchesInstructor = instructorFilter
      ? s.instructor_name === instructorFilter
      : true;
    const matchesCourse = courseFilter ? s.course_name === courseFilter : true;
    const matchesRoom = roomFilter ? s.room_name === roomFilter : true;
    const matchesDay = dayFilter ? s.day_of_week === dayFilter : true;

    return (
      matchesSearch &&
      matchesInstructor &&
      matchesCourse &&
      matchesRoom &&
      matchesDay
    );
  });

  return (
    <div>
      {/* ✅ عنوان في الوسط */}
      <h3 className="text-info text-center mb-4">
        {schedule?.title || "Schedule"}
      </h3>

      {/* ✅ فلاتر */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="mb-3 text-info">Filter Sections</h5>
          <div className="row g-3 align-items-end">
            <div className="col-md-2">
              <label className="form-label">Instructor</label>
              <select
                className="form-select"
                value={instructorFilter}
                onChange={(e) => setInstructorFilter(e.target.value)}
              >
                <option value="">All</option>
                {uniqueInstructors.map((ins, i) => (
                  <option key={i} value={ins}>
                    {ins}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label">Course</label>
              <select
                className="form-select"
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
              >
                <option value="">All</option>
                {uniqueCourses.map((c, i) => (
                  <option key={i} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label">Room</label>
              <select
                className="form-select"
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
              >
                <option value="">All</option>
                {uniqueRooms.map((r, i) => (
                  <option key={i} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label">Day</label>
              <select
                className="form-select"
                value={dayFilter}
                onChange={(e) => setDayFilter(e.target.value)}
              >
                <option value="">All</option>
                {uniqueDays.map((d, i) => (
                  <option key={i} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ✅ جدول السكاشن */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3 text-info">Sections</h5>

          {/* ✅ لودر */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-info" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredSections.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-bordered table-striped align-middle text-center">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Course</th>
                    <th>Instructor</th>
                    <th>Room</th>
                    <th>Day</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSections.map((s) => (
                    <tr key={s.id}>
                      <td>{s.id}</td>
                      <td>{s.course_name}</td>
                      <td>{s.instructor_name}</td>
                      <td>
                        {s.room_name} ({s.building})
                      </td>
                      <td>{s.day_of_week}</td>
                      <td>
                        {s.start_time} - {s.end_time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted text-center">No sections found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
