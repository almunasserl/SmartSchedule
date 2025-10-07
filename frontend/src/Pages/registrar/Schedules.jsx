import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../Services/apiClient";
import { Modal, Button, Spinner, Toast, ToastContainer } from "react-bootstrap";
import { useAuth } from "../../Hooks/AuthContext";

export default function RegistrarSchedules() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [stats, setStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [terms, setTerms] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);

  // loaders for actions
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingId, setLoadingId] = useState(null); // specific id for delete/approve/publish

  // toast
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 2500);
  };

  // filters
  const [statusFilter, setStatusFilter] = useState("");
  const [termFilter, setTermFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [search, setSearch] = useState("");

  // modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [termId, setTermId] = useState("");
  const [deptId, setDeptId] = useState("");

  useEffect(() => {
    loadPage();
  }, []);

  const loadPage = async () => {
    setPageLoading(true);
    await Promise.all([fetchSchedules(), fetchStats(), fetchDropdowns()]);
    setPageLoading(false);
  };

  const fetchSchedules = async () => {
    try {
      const res = await api.get("/schedules");
      setSchedules(res.data);
    } catch (err) {
      showToast("Error loading schedules", "danger");
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/schedules/stats");
      setStats(res.data.overall);
    } catch (err) {
      showToast("Error loading statistics", "danger");
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [resDepartments, resTerms] = await Promise.all([
        api.get("/dropdowns/departments"),
        api.get("/dropdowns/terms"),
      ]);
      setDepartments(resDepartments.data || []);
      setTerms(resTerms.data || []);
    } catch (err) {
      showToast("Error loading dropdowns", "danger");
    }
  };

  // create schedule
  const handleCreate = async () => {
    if (!title || !termId || !deptId) {
      showToast("Please fill all fields", "warning");
      return;
    }
    setLoadingCreate(true);
    try {
      await api.post("/schedules", {
        title,
        term_id: termId,
        dept_id: deptId,
        created_by: user?.id || 1,
      });
      setShowModal(false);
      resetForm();
      await Promise.all([fetchSchedules(), fetchStats()]);
      showToast("✅ Schedule created successfully!", "success");
    } catch (err) {
      showToast("Failed to create schedule", "danger");
    } finally {
      setLoadingCreate(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setTermId("");
    setDeptId("");
  };

  // delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this schedule?")) return;
    setLoadingId(id);
    try {
      await api.delete(`/schedules/${id}`);
      await Promise.all([fetchSchedules(), fetchStats()]);
      showToast("🗑️ Schedule deleted successfully", "success");
    } catch (err) {
      showToast("Failed to delete schedule", "danger");
    } finally {
      setLoadingId(null);
    }
  };

  // approve
  const handleApprove = async (id) => {
    setLoadingId(id);
    try {
      await api.put(`/schedules/${id}/approve`, { approved_by: user?.id || 1 });
      await Promise.all([fetchSchedules(), fetchStats()]);
      showToast("✅ Schedule approved successfully!", "success");
    } catch (err) {
      showToast("Error approving schedule", "danger");
    } finally {
      setLoadingId(null);
    }
  };

  // publish
  const handlePublish = async (id) => {
    setLoadingId(id);
    try {
      await api.put(`/schedules/${id}/publish`);
      await Promise.all([fetchSchedules(), fetchStats()]);
      showToast("🚀 Schedule published successfully!", "success");
    } catch (err) {
      showToast("Error publishing schedule", "danger");
    } finally {
      setLoadingId(null);
    }
  };

  // filter logic
  const filteredSchedules = schedules.filter((s) => {
    const matchesStatus = statusFilter ? s.status === statusFilter : true;
    const matchesDept = deptFilter ? s.dept_id?.toString() === deptFilter : true;
    const matchesTerm = termFilter ? s.term_id?.toString() === termFilter : true;
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      (s.dept_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.term_name || "").toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesDept && matchesTerm && matchesSearch;
  });

  return (
    <div>
      {/* Toast container */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg={toast.type}
          show={toast.show}
          onClose={() => setToast({ show: false })}
        >
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      {pageLoading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
          <Spinner animation="border" variant="info" />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="text-info">Schedules</h3>
            <Button variant="info" className="text-white" onClick={() => setShowModal(true)}>
              + Create Schedule
            </Button>
          </div>

          {/* Stats */}
          {stats && (
            <div className="row mb-4 g-3">
              {[
                { label: "Total", value: stats.total_schedules, color: "text-info" },
                { label: "Draft", value: stats.draft_schedules, color: "text-warning" },
                { label: "Approved", value: stats.approved_schedules, color: "text-success" },
                { label: "Published", value: stats.published_schedules, color: "text-primary" },
              ].map((c, i) => (
                <div className="col-md-3 col-6" key={i}>
                  <div className="card text-center shadow-sm h-100">
                    <div className="card-body d-flex flex-column justify-content-center">
                      <h6>{c.label}</h6>
                      <h4 className={c.color}>{c.value}</h4>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="mb-3 text-info">Filter Schedules</h5>
              <div className="row g-3 align-items-end">
                <div className="col-md-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="approved">Approved</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Term</label>
                  <select
                    className="form-select"
                    value={termFilter}
                    onChange={(e) => setTermFilter(e.target.value)}
                  >
                    <option value="">All Terms</option>
                    {terms.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Department</label>
                  <select
                    className="form-select"
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                  >
                    <option value="">All Departments</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
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

          {/* Table */}
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="mb-3 text-info">Schedules List</h5>
              <div className="table-responsive">
                <table className="table table-bordered table-striped align-middle text-center">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Department</th>
                      <th>Term</th>
                      <th>Status</th>
                      <th>Created By</th>
                      <th>Approved By</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSchedules.map((s) => (
                      <tr key={s.id}>
                        <td>{s.id}</td>
                        <td>{s.title}</td>
                        <td>{s.dept_name}</td>
                        <td>{s.term_name}</td>
                        <td>
                          <span
                            className={`badge ${
                              s.status === "published"
                                ? "bg-primary"
                                : s.status === "approved"
                                ? "bg-success"
                                : "bg-secondary"
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td>{s.created_by_email || "-"}</td>
                        <td>{s.approved_by_email || "-"}</td>
                        <td>
                          <Link
                            to={`/registrar/schedules/${s.id}`}
                            className="btn btn-sm btn-info text-white me-2"
                          >
                            View
                          </Link>

                          {user?.role === "committee" && s.status === "draft" && (
                            <Button
                              size="sm"
                              variant="success"
                              className="me-2"
                              disabled={loadingId === s.id}
                              onClick={() => handleApprove(s.id)}
                            >
                              {loadingId === s.id ? (
                                <Spinner size="sm" animation="border" />
                              ) : (
                                "Approve"
                              )}
                            </Button>
                          )}

                          {(user?.role === "committee" || user?.role === "registrar") &&
                            s.status === "approved" && (
                              <Button
                                size="sm"
                                variant="primary"
                                className="me-2"
                                disabled={loadingId === s.id}
                                onClick={() => handlePublish(s.id)}
                              >
                                {loadingId === s.id ? (
                                  <Spinner size="sm" animation="border" />
                                ) : (
                                  "Publish"
                                )}
                              </Button>
                            )}

                          <Button
                            size="sm"
                            variant="danger"
                            disabled={loadingId === s.id}
                            onClick={() => handleDelete(s.id)}
                          >
                            {loadingId === s.id ? (
                              <Spinner size="sm" animation="border" />
                            ) : (
                              "Delete"
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filteredSchedules.length === 0 && (
                      <tr>
                        <td colSpan="8" className="text-center text-muted">
                          No schedules found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Modal Create */}
          <Modal show={showModal} onHide={() => setShowModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Create Schedule</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="mb-3">
                <label className="form-label">Title</label>
                <input
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Term</label>
                <select
                  className="form-select"
                  value={termId}
                  onChange={(e) => setTermId(e.target.value)}
                >
                  <option value="">Select Term</option>
                  {terms.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Department</label>
                <select
                  className="form-select"
                  value={deptId}
                  onChange={(e) => setDeptId(e.target.value)}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="info" onClick={handleCreate} disabled={loadingCreate}>
                {loadingCreate ? <Spinner size="sm" animation="border" /> : "Create"}
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
}
