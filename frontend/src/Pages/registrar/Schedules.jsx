// src/pages/registrar/RegistrarSchedules.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../Services/apiClient";
import { Modal, Button, Spinner } from "react-bootstrap";
import { useAuth } from "../../Hooks/AuthContext";

export default function RegistrarSchedules() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [stats, setStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [terms, setTerms] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  // filters
  const [statusFilter, setStatusFilter] = useState("");
  const [termFilter, setTermFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [search, setSearch] = useState("");

  // modal states
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
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/schedules/stats");
      setStats(res.data.overall);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const resDepartments = await api.get("/dropdowns/departments");
      const resTerms = await api.get("/dropdowns/terms");
      setDepartments(resDepartments.data || []);
      setTerms(resTerms.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // create schedule
  const handleCreate = async () => {
    if (!title || !termId || !deptId) return;
    setLoading(true);
    try {
      await api.post("/schedules", {
        title,
        term_id: termId,
        dept_id: deptId,
        created_by: user?.id || 1,
      });
      setShowModal(false);
      resetForm();
      fetchSchedules();
      fetchStats();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setTermId("");
    setDeptId("");
  };

  // delete schedule
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this schedule?")) return;
    try {
      await api.delete(`/schedules/${id}`);
      fetchSchedules();
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  // approve schedule
  const handleApprove = async (id) => {
    try {
      await api.put(`/schedules/${id}/approve`, {
        approved_by: user?.id || 1,
      });
      fetchSchedules();
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  // publish schedule
  const handlePublish = async (id) => {
    try {
      await api.put(`/schedules/${id}/publish`);
      fetchSchedules();
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  // filters
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
      {pageLoading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "60vh" }}
        >
          <Spinner animation="border" variant="info" />
        </div>
      ) : (
        <>
          {/* header */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="text-info">Schedules</h3>
            <Button
              variant="info"
              className="text-white"
              onClick={() => setShowModal(true)}
            >
              + Create Schedule
            </Button>
          </div>

          {/* stats cards */}
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

          {/* filters */}
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
                      <option key={t.id} value={t.id}>{t.name}</option>
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
                      <option key={d.id} value={d.id}>{d.name}</option>
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

          {/* table */}
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
                            <button
                              className="btn btn-sm btn-success me-2"
                              onClick={() => handleApprove(s.id)}
                            >
                              Approve
                            </button>
                          )}
                          {(user?.role === "committee" || user?.role === "registrar") &&
                            s.status === "approved" && (
                              <button
                                className="btn btn-sm btn-primary me-2"
                                onClick={() => handlePublish(s.id)}
                              >
                                Publish
                              </button>
                            )}
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(s.id)}
                          >
                            Delete
                          </button>
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

          {/* modal */}
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
                    <option key={t.id} value={t.id}>{t.name}</option>
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
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="info" onClick={handleCreate} disabled={loading}>
                {loading ? <Spinner size="sm" animation="border" /> : "Create"}
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
}
