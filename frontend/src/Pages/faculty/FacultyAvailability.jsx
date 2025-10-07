import React, { useEffect, useState } from "react";
import apiClient from "../../Services/apiClient";
import { useAuth } from "../../Hooks/AuthContext";
import { Spinner, Toast, ToastContainer } from "react-bootstrap";

export default function FacultyAvailability() {
  const { user } = useAuth();
  const facultyId = user?.id;

  const [availability, setAvailability] = useState([]);
  const [form, setForm] = useState({
    day: "Sunday",
    start_time: "",
    end_time: "",
  });

  const [loading, setLoading] = useState(false); // button loader
  const [pageLoading, setPageLoading] = useState(true); // full page loader
  const [deletingId, setDeletingId] = useState(null); // button delete loader

  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 2500);
  };

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

  // 🟦 Fetch availability list
  const fetchAvailability = async () => {
    try {
      const res = await apiClient.get(`/faculty/${facultyId}/availability`);
      setAvailability(res.data);
    } catch (err) {
      console.error("Error fetching availability:", err);
      showToast("Failed to load availability", "danger");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (facultyId) fetchAvailability();
  }, [facultyId]);

  // 🟩 Add new availability
  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post(`/faculty/${facultyId}/availability`, {
        day: form.day,
        start_time: form.start_time + ":00",
        end_time: form.end_time + ":00",
      });
      setForm({ day: "Sunday", start_time: "", end_time: "" });
      await fetchAvailability();
      showToast("✅ Availability added successfully", "success");
    } catch (err) {
      console.error("Error adding availability:", err);
      const msg = err.response?.data?.error || "Failed to add availability";
      showToast(msg, "danger");
    } finally {
      setLoading(false);
    }
  };

  // 🟥 Delete availability
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this slot?")) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/faculty/${facultyId}/availability/${id}`);
      await fetchAvailability();
      showToast("🗑️ Availability deleted successfully", "success");
    } catch (err) {
      console.error("Error deleting availability:", err);
      const msg = err.response?.data?.error || "Failed to delete availability";
      showToast(msg, "danger");
    } finally {
      setDeletingId(null);
    }
  };

  // 🌀 Page loader
  if (pageLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <Spinner animation="border" variant="info" style={{ width: "3rem", height: "3rem" }} />
      </div>
    );
  }

  return (
    <div>
      {/* Toast Container */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg={toast.type}
          show={toast.show}
          onClose={() => setToast({ show: false })}
        >
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      <h2 className="mb-4 text-info">My Availability</h2>

      {/* Add Form */}
      <form
        onSubmit={handleAdd}
        className="d-flex gap-2 align-items-center mb-3 flex-wrap"
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

        <button
          type="submit"
          className="btn btn-info text-white"
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner size="sm" animation="border" className="me-2" /> Adding...
            </>
          ) : (
            "Add"
          )}
        </button>
      </form>

      {/* Availability Table */}
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
                <td>{a.start_time.slice(0, 5)}</td>
                <td>{a.end_time.slice(0, 5)}</td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(a.id)}
                    disabled={deletingId === a.id}
                  >
                    {deletingId === a.id ? (
                      <>
                        <Spinner size="sm" animation="border" className="me-1" /> Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
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
