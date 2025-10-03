// src/pages/Feedback.jsx
import React, { useEffect, useState } from "react";
import { Spinner, Offcanvas } from "react-bootstrap";
import api from "../../Services/apiClient";

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");

  // Offcanvas
  const [showDetail, setShowDetail] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/feedback");
      setFeedbacks(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Apply filters
  const filteredFeedbacks = feedbacks.filter((f) => {
    const matchType = typeFilter ? f.type === typeFilter : true;
    const matchRole = roleFilter ? f.role === roleFilter : true;
    const matchSearch = f.text.toLowerCase().includes(search.toLowerCase());
    return matchType && matchRole && matchSearch;
  });

  return (
    <div>
      <h3 className="text-info mb-3">Feedback</h3>

      {/* Filters */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        <select
          className="form-select w-auto"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="suggestion">Suggestion</option>
          <option value="bug">Bug</option>
          <option value="question">Question</option>
        </select>

        <select
          className="form-select w-auto"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="committee">Committee</option>
          <option value="registrar">Registrar</option>
        </select>

        <input
          type="text"
          className="form-control w-auto"
          placeholder="Search in feedback..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="info" />
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered align-middle text-center">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Role</th>
                <th>Type</th>
                <th>Text (Preview)</th>
                <th>Date</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeedbacks.map((f) => (
                <tr key={f.id}>
                  <td>{f.id}</td>
                  <td>{f.email}</td>
                  <td>{f.role}</td>
                  <td>
                    <span
                      className={`badge ${
                        f.type === "bug"
                          ? "bg-danger"
                          : f.type === "suggestion"
                          ? "bg-info"
                          : "bg-warning"
                      }`}
                    >
                      {f.type}
                    </span>
                  </td>
                  <td>{f.text.length > 50 ? f.text.substring(0, 50) + "…" : f.text}</td>
                  <td>{new Date(f.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-info"
                      onClick={() => {
                        setSelectedFeedback(f);
                        setShowDetail(true);
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filteredFeedbacks.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-muted text-center">
                    No feedback found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Offcanvas Detail */}
      <Offcanvas
        show={showDetail}
        onHide={() => setShowDetail(false)}
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Feedback Details</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {selectedFeedback ? (
            <div>
              <p>
                <strong>Email:</strong> {selectedFeedback.email}
              </p>
              <p>
                <strong>Role:</strong> {selectedFeedback.role}
              </p>
              <p>
                <strong>Type:</strong>{" "}
                <span className="badge bg-info">{selectedFeedback.type}</span>
              </p>
              <p>
                <strong>Text:</strong>
              </p>
              <div className="border rounded p-2 bg-light">
                {selectedFeedback.text}
              </div>
              <p className="mt-3 text-muted small">
                Created at: {new Date(selectedFeedback.created_at).toLocaleString()}
              </p>
            </div>
          ) : (
            <p className="text-muted">No feedback selected</p>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}
