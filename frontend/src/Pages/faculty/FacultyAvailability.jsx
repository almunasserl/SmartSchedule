import React, { useEffect, useState } from "react";
import apiClient from "../../Services/apiClient";
import { useAuth } from "../../Hooks/AuthContext";

export default function FacultyAvailability() {
  const { user } = useAuth();
  const facultyId = user?.id;

  const [availability, setAvailability] = useState([]);
  const [form, setForm] = useState({
    day: "Sunday",
    start_time: "",
    end_time: "",
  });
  const [loading, setLoading] = useState(false);

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

  // جلب البيانات
  const fetchAvailability = async () => {
    try {
      const res = await apiClient.get(`/faculty/${facultyId}/availability`);
      setAvailability(res.data);
    } catch (err) {
      console.error("Error fetching availability:", err);
    }
  };

  useEffect(() => {
    if (facultyId) fetchAvailability();
  }, [facultyId]);

  // إضافة توفر
  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.post(`/faculty/${facultyId}/availability`, {
        day: form.day,
        start_time: form.start_time + ":00", // 👈 تأكد من hh:mm:ss
        end_time: form.end_time + ":00",
      });
      setForm({ day: "Sunday", start_time: "", end_time: "" });
      fetchAvailability();
    } catch (err) {
      console.error("Error adding availability:", err);
    } finally {
      setLoading(false);
    }
  };

  // حذف
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await apiClient.delete(`/faculty/${facultyId}/availability/${id}`);
      fetchAvailability();
    } catch (err) {
      console.error("Error deleting availability:", err);
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-info">My Availability</h2>

      <form
        onSubmit={handleAdd}
        className="d-flex gap-2 align-items-center mb-3"
      >
        <select
          className="form-select"
          value={form.day}
          onChange={(e) => setForm({ ...form, day: e.target.value })}
        >
          {days.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <input
          type="time"
          className="form-control"
          value={form.start_time}
          onChange={(e) => setForm({ ...form, start_time: e.target.value })}
          required
        />

        <input
          type="time"
          className="form-control"
          value={form.end_time}
          onChange={(e) => setForm({ ...form, end_time: e.target.value })}
          required
        />

        <button type="submit" className="btn btn-info text-white" disabled={loading}>
          {loading ? "Adding..." : "Add"}
        </button>
      </form>

      <div className="table-responsive">
        <table className="table table-bordered text-center align-middle">
          <thead className="table-light">
            <tr>
              <th>Day</th>
              <th>Start</th>
              <th>End</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {availability.map((a) => (
              <tr key={a.id}>
                <td>{a.day}</td>
                <td>{a.start_time.slice(0, 5)}</td> {/* 👈 عرض hh:mm */}
                <td>{a.end_time.slice(0, 5)}</td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(a.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {availability.length === 0 && (
              <tr>
                <td colSpan="4" className="text-muted">
                  No availability records yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
