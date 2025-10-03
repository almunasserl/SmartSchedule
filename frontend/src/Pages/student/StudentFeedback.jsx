import React, { useEffect, useState } from "react";
import apiClient from "../../Services/apiClient";
import { useAuth } from "../../Hooks/AuthContext";

export default function StudentFeedback() {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [type, setType] = useState("schedule");
  const [text, setText] = useState("");

  // 📌 تحميل تعليقات الطالب فقط
  const fetchFeedbacks = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/feedback?auth_id=${user.id}`);
      setFeedbacks(res.data);
    } catch (err) {
      console.error("Failed to load feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [user]);

  // 📌 فتح المودال
  const openModal = (fb = null) => {
    if (fb) {
      setEditingFeedback(fb);
      setType(fb.type);
      setText(fb.text);
    } else {
      setEditingFeedback(null);
      setType("schedule");
      setText("");
    }
    setModalOpen(true);
  };

  // 📌 حفظ (إضافة / تعديل)
  const handleSave = async () => {
    try {
      if (editingFeedback) {
        await apiClient.patch(`/feedback/${editingFeedback.id}`, { text });
      } else {
        await apiClient.post("/feedback", { auth_id: user.id, type, text });
      }
      setModalOpen(false);
      fetchFeedbacks();
    } catch (err) {
      console.error("Error saving feedback:", err);
    }
  };

  // 📌 حذف تعليق
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feedback?"))
      return;
    try {
      await apiClient.delete(`/feedback/${id}`);
      fetchFeedbacks();
    } catch (err) {
      console.error("Error deleting feedback:", err);
    }
  };

  // 📌 فلترة
  const filtered = filter === "all" ? feedbacks : feedbacks.filter((f) => f.type === filter);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0 text-info">My Feedback</h2>
        <button
          className="btn btn-info text-white fw-bold"
          onClick={() => openModal()}
        >
          + Add Feedback
        </button>
      </div>

      {/* فلترة */}
      <div className="mb-3">
        <select
          className="form-select w-auto"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="schedule">Schedule</option>
          <option value="administrative">Administrative</option>
          <option value="suggestion">Suggestion</option>
        </select>
      </div>

      {/* جدول التعليقات */}
      {loading ? (
        <div className="text-center my-4">
          <div className="spinner-border text-info" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-bordered align-middle text-center">
            <thead className="table-light">
              <tr>
                <th>Type</th>
                <th>Feedback</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id}>
                  <td>
                    <span className="badge bg-secondary">{f.type}</span>
                  </td>
                  <td className="text-start">{f.text}</td>
                  <td>{new Date(f.created_at).toLocaleString()}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => openModal(f)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(f.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="alert alert-warning">No feedback available</div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingFeedback ? "Edit Feedback" : "Add Feedback"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                {!editingFeedback && (
                  <div className="mb-3">
                    <label className="form-label fw-bold">Type</label>
                    <select
                      className="form-select"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      <option value="schedule">Schedule</option>
                      <option value="administrative">Administrative</option>
                      <option value="suggestion">Suggestion</option>
                    </select>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label fw-bold">Feedback</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-info text-white"
                  onClick={handleSave}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
