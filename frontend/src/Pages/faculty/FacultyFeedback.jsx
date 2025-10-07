import React, { useEffect, useState } from "react";
import apiClient from "../../Services/apiClient";
import { useAuth } from "../../Hooks/AuthContext";
import { Spinner, Toast, ToastContainer } from "react-bootstrap";

export default function FacultyFeedback() {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [filterType, setFilterType] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ type: "schedule", text: "" });

  const [loading, setLoading] = useState(false); // أثناء الإضافة أو التعديل أو الحذف
  const [pageLoading, setPageLoading] = useState(true); // تحميل الصفحة بالكامل

  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 2500);
  };

  // جلب البيانات
  useEffect(() => {
    if (!user?.id) return;
    const fetchData = async () => {
      try {
        const res = await apiClient.get(`/feedback`);
        setFeedbacks(res.data.filter((f) => f.auth_id === user.id));
      } catch (err) {
        console.error("Error fetching feedbacks", err);
        showToast("Failed to load feedbacks", "danger");
      } finally {
        setPageLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const openAddModal = () => {
    setEditing(null);
    setForm({ type: "schedule", text: "" });
    setShowModal(true);
  };

  const openEditModal = (fb) => {
    setEditing(fb);
    setForm({ type: fb.type, text: fb.text });
    setShowModal(true);
  };

  // إضافة أو تعديل
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        const res = await apiClient.patch(`/feedback/${editing.id}`, {
          text: form.text,
        });
        setFeedbacks((prev) =>
          prev.map((f) => (f.id === editing.id ? res.data.feedback : f))
        );
        showToast("✅ Feedback updated successfully", "success");
      } else {
        const res = await apiClient.post(`/feedback`, {
          auth_id: user.id,
          type: form.type,
          text: form.text,
        });
        setFeedbacks([res.data, ...feedbacks]);
        showToast("✅ Feedback added successfully", "success");
      }
      setShowModal(false);
    } catch (err) {
      console.error("Error saving feedback", err);
      const msg = err.response?.data?.error || "Failed to save feedback";
      showToast(msg, "danger");
    } finally {
      setLoading(false);
    }
  };

  // حذف
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;
    setLoading(true);
    try {
      await apiClient.delete(`/feedback/${id}`);
      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
      showToast("🗑️ Feedback deleted successfully", "success");
    } catch (err) {
      console.error("Error deleting feedback", err);
      const msg = err.response?.data?.error || "Failed to delete feedback";
      showToast(msg, "danger");
    } finally {
      setLoading(false);
    }
  };

  const filteredFeedbacks =
    filterType === "All"
      ? feedbacks
      : feedbacks.filter((f) => f.type === filterType);

  // Loader أثناء تحميل الصفحة
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
        <Toast bg={toast.type} show={toast.show} onClose={() => setToast({ show: false })}>
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      <div className="d-flex justify-content-between mb-3 align-items-center">
        <h2 className="m-0 text-info">My Feedback</h2>
        <div className="d-flex gap-2">
          <select
            className="form-select w-auto"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="schedule">Schedule</option>
            <option value="administrative">Administrative</option>
            <option value="suggestion">Suggestion</option>
          </select>
          <button className="btn btn-info text-white" onClick={openAddModal} disabled={loading}>
            {loading && <span className="spinner-border spinner-border-sm me-2"></span>}
            + Add Feedback
          </button>
        </div>
      </div>

      {/* Feedback Table */}
      <div className="card shadow-sm p-3">
        <div className="table-responsive">
          <table className="table table-bordered text-center align-middle">
            <thead className="table-light">
              <tr>
                <th>Type</th>
                <th>Text</th>
                <th>Date</th>
                <th style={{ width: "150px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeedbacks.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-muted">
                    No feedback found
                  </td>
                </tr>
              ) : (
                filteredFeedbacks.map((fb) => (
                  <tr key={fb.id}>
                    <td className="text-capitalize">{fb.type}</td>
                    <td>{fb.text}</td>
                    <td>
                      {new Date(fb.created_at).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => openEditModal(fb)}
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                          "Edit"
                        )}
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(fb.id)}
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                          "Delete"
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title text-info">
                    {editing ? "Edit Feedback" : "Add Feedback"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <label className="form-label">Type</label>
                  <select
                    className="form-select mb-3"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    disabled={editing}
                  >
                    <option value="schedule">Schedule</option>
                    <option value="administrative">Administrative</option>
                    <option value="suggestion">Suggestion</option>
                  </select>

                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Write your feedback..."
                    value={form.text}
                    onChange={(e) => setForm({ ...form, text: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-info text-white"
                    disabled={loading}
                  >
                    {loading && (
                      <span className="spinner-border spinner-border-sm me-2"></span>
                    )}
                    {editing ? "Update" : "Add"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
