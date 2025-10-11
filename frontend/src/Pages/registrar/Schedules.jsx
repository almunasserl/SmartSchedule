import React, { useEffect, useState } from "react";
import { Spinner, Button, Toast, ToastContainer } from "react-bootstrap";
import api from "../../Services/apiClient";
import { useAuth } from "../../Hooks/AuthContext";

export default function RegistrarSections() {
  const { user } = useAuth();

  const [sections, setSections] = useState([]);
  const [stats, setStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [terms, setTerms] = useState([]);

  const [statusFilter, setStatusFilter] = useState("");
  const [termFilter, setTermFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [search, setSearch] = useState("");

  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingId, setLoadingId] = useState(null);

  // Toast
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  useEffect(() => {
    loadPage();
  }, []);

  const loadPage = async () => {
    setLoadingPage(true);
    await Promise.all([fetchSections(), fetchStats(), fetchDropdowns()]);
    setLoadingPage(false);
  };

  const fetchSections = async () => {
    try {
      const res = await api.get("/sections");
      setSections(res.data);
    } catch {
      showToast("Error loading sections", "danger");
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/sections/stats");
      setStats(res.data.overall);
    } catch {
      showToast("Error loading stats", "danger");
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [deptRes, termRes] = await Promise.all([
        api.get("/dropdowns/departments"),
        api.get("/dropdowns/terms"),
      ]);
      setDepartments(deptRes.data || []);
      setTerms(termRes.data || []);
    } catch {
      showToast("Error loading dropdowns", "danger");
    }
  };

  // Approve section
  const handleApprove = async (id) => {
    setLoadingId(id);
    try {
      await api.patch(`/sections/${id}/status`, { status: "approved" });
      await Promise.all([fetchSections(), fetchStats()]);
      showToast("✅ Section approved successfully!", "success");
    } catch {
      showToast("Error approving section", "danger");
    } finally {
      setLoadingId(null);
    }
  };

  // Publish section
  const handlePublish = async (id) => {
    setLoadingId(id);
    try {
      await api.patch(`/sections/${id}/status`, { status: "published" });
      await Promise.all([fetchSections(), fetchStats()]);
      showToast("🚀 Section published successfully!", "success");
    } catch {
      showToast("Error publishing section", "danger");
    } finally {
      setLoadingId(null);
    }
  };

  // Filter logic
  const filteredSections = sections.filter((s) => {
    const matchesStatus = statusFilter ? s.status === statusFilter : true;

    const matchesDept = deptFilter
      ? s.dept_name?.toLowerCase() ===
        departments
          .find((d) => d.id.toString() === deptFilter)
          ?.name.toLowerCase()
      : true;

    const matchesTerm = termFilter
      ? s.level_name?.toLowerCase() ===
        terms.find((t) => t.id.toString() === termFilter)?.name.toLowerCase()
      : true;

    const matchesSearch =
      s.course_code?.toLowerCase().includes(search.toLowerCase()) ||
      s.faculty_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.room_name?.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesDept && matchesTerm && matchesSearch;
  });

  if (loadingPage) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner
          animation="border"
          variant="info"
          style={{ width: "3rem", height: "3rem" }}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Toast */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg={toast.type}
          show={toast.show}
          onClose={() => setToast({ show: false })}
        >
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="text-info">Sections Dashboard</h3>
      </div>

      {/* Stats */}
      {stats && (
        <div className="row mb-4 g-3">
          {[
            {
              label: "Total Sections",
              value: stats.total_sections,
              color: "text-info",
            },
            {
              label: "Draft",
              value: stats.draft_sections,
              color: "text-secondary",
            },
            {
              label: "Approved",
              value: stats.approved_sections,
              color: "text-success",
            },
            {
              label: "Published",
              value: stats.published_sections,
              color: "text-primary",
            },
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
          <h5 className="mb-3 text-info">Filter Sections</h5>
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All</option>
                <option value="draft">Draft</option>
                <option value="approved">Approved</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Level</label>
              <select
                className="form-select"
                value={termFilter}
                onChange={(e) => setTermFilter(e.target.value)}
              >
                <option value="">All</option>
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
                <option value="">All</option>
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
                placeholder="Search by code, instructor, or room..."
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
          <h5 className="mb-3 text-info">Sections List</h5>
          <div className="table-responsive">
            <table className="table table-bordered table-striped align-middle text-center">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Code</th>
                  <th>Instructor</th>
                  <th>Department</th>
                  <th>Level</th>
                  <th>Status</th>
                  <th style={{ minWidth: "200px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSections.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.course_code || "-"}</td>
                    <td>{s.faculty_name}</td>
                    <td>{s.dept_name}</td>
                    <td>{s.level_name || "-"}</td>
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
                    <td>
                      <div className="d-flex justify-content-center gap-2 flex-wrap">
                        {user?.role === "committee" && s.status === "draft" && (
                          <Button
                            size="sm"
                            variant="success"
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

                        {(user?.role === "committee" ||
                          user?.role === "registrar") &&
                          s.status === "approved" && (
                            <Button
                              size="sm"
                              variant="primary"
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
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSections.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center text-muted">
                      No sections found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
