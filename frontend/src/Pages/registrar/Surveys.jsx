import React, { useEffect, useState } from "react";
import { Button, Spinner, Offcanvas, Modal, Toast, ToastContainer } from "react-bootstrap";
import { Bar, Pie } from "react-chartjs-2";
import api from "../../Services/apiClient";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function Surveys() {
  const [stats, setStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [levels, setLevels] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  // Filters
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [search, setSearch] = useState("");

  // Offcanvas (View results)
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState([]);
  const [currentSurvey, setCurrentSurvey] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);

  // Modal (Create Survey)
  const [showCreate, setShowCreate] = useState(false);
  const [newSurvey, setNewSurvey] = useState({
    title: "",
    dept_id: "",
    level_id: "",
    start_date: "",
    end_date: "",
  });
  const [creating, setCreating] = useState(false);

  // ✅ Toast notifications
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 2500);
  };

  useEffect(() => {
    loadPage();
  }, []);

  const loadPage = async () => {
    setLoading(true);
    await Promise.all([fetchReports(), fetchDepartments(), fetchLevels(), fetchSurveys()]);
    setLoading(false);
  };

  const fetchReports = async () => {
    try {
      const [totalRes, statusRes, participantsRes, deptRes] = await Promise.all([
        api.get("/reports/surveys/total"),
        api.get("/reports/surveys/status"),
        api.get("/reports/surveys/participants"),
        api.get("/reports/surveys/departments"),
      ]);

      setStats({
        total: totalRes.data.total_surveys,
        active: statusRes.data.active_surveys,
        closed: statusRes.data.closed_surveys,
        participants: participantsRes.data.total_participants,
        departments: deptRes.data.total_departments,
      });
    } catch (err) {
      showToast("Failed to load reports", "danger");
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/dropdowns/departments");
      setDepartments(res.data || []);
    } catch {
      showToast("Failed to load departments", "danger");
    }
  };

  const fetchLevels = async () => {
    try {
      const res = await api.get("/dropdowns/terms");
      setLevels(res.data || []);
    } catch {
      showToast("Failed to load levels", "danger");
    }
  };

  const fetchSurveys = async () => {
    try {
      const res = await api.get("/surveys");
      setSurveys(res.data || []);
    } catch {
      showToast("Failed to load surveys", "danger");
    }
  };

  const handleView = async (survey) => {
    setCurrentSurvey(survey);
    setShowResults(true);
    setResultsLoading(true);
    setActionId(survey.id);
    try {
      const res = await api.get(`/surveys/${survey.id}/results`);
      setResults(res.data || []);
    } catch (err) {
      showToast("Failed to load survey results", "danger");
    } finally {
      setResultsLoading(false);
      setActionId(null);
    }
  };

  const handleCreate = async () => {
    if (!newSurvey.title || !newSurvey.dept_id || !newSurvey.level_id) {
      showToast("Please fill all required fields", "warning");
      return;
    }
    setCreating(true);
    try {
      await api.post("/surveys", newSurvey);
      showToast("✅ Survey created successfully!", "success");
      setShowCreate(false);
      setNewSurvey({
        title: "",
        dept_id: "",
        level_id: "",
        start_date: "",
        end_date: "",
      });
      await Promise.all([fetchSurveys(), fetchReports()]);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to create survey";
      showToast(msg, "danger");
    } finally {
      setCreating(false);
    }
  };

  const filteredSurveys = surveys.filter((s) => {
    const matchDept = selectedDept ? s.dept_id.toString() === selectedDept : true;
    const matchLevel = selectedLevel ? s.level_id.toString() === selectedLevel : true;
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase());
    return matchDept && matchLevel && matchSearch;
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
        <Spinner animation="border" variant="info" style={{ width: "3rem", height: "3rem" }} />
      </div>
    );
  }

  return (
    <div>
      {/* Toasts */}
      <ToastContainer position="top-end" className="p-3">
        <Toast bg={toast.type} show={toast.show} onClose={() => setToast({ show: false })}>
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="text-info">Surveys</h3>
        <Button variant="info" className="text-white" onClick={() => setShowCreate(true)}>
          + Create Survey
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="row mb-4 g-3">
          <div className="col-md-3 col-6">
            <div className="card text-center shadow-sm h-100">
              <div className="card-body d-flex flex-column justify-content-center">
                <h6>Total Surveys</h6>
                <h4 className="text-info">{stats.total}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="card text-center shadow-sm h-100">
              <div className="card-body d-flex flex-column justify-content-center">
                <h6>Active / Closed</h6>
                <h5>
                  <span className="badge bg-success">{stats.active}</span>{" "}
                  <span className="badge bg-danger">{stats.closed}</span>
                </h5>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="card text-center shadow-sm h-100">
              <div className="card-body d-flex flex-column justify-content-center">
                <h6>Participants</h6>
                <h4 className="text-primary">{stats.participants}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="card text-center shadow-sm h-100">
              <div className="card-body d-flex flex-column justify-content-center">
                <h6>Departments with Surveys</h6>
                <h4 className="text-warning">{stats.departments}</h4>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex flex-wrap gap-2 justify-content-between mb-3">
            <div className="d-flex gap-2">
              <select
                className="form-select w-auto"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <select
                className="form-select w-auto"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                <option value="">All Levels</option>
                {levels.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                className="form-control w-auto"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered table-striped align-middle text-center">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Department</th>
                  <th>Level</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSurveys.map((s) => {
                  const now = new Date();
                  const isActive =
                    new Date(s.start_date) <= now && new Date(s.end_date) >= now;
                  return (
                    <tr key={s.id}>
                      <td>{s.id}</td>
                      <td>{s.title}</td>
                      <td>{s.dept_name}</td>
                      <td>{s.level_name}</td>
                      <td>{new Date(s.start_date).toLocaleDateString()}</td>
                      <td>{new Date(s.end_date).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${isActive ? "bg-success" : "bg-danger"}`}>
                          {isActive ? "Active" : "Closed"}
                        </span>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="info"
                          className="text-white"
                          onClick={() => handleView(s)}
                          disabled={actionId === s.id}
                        >
                          {actionId === s.id ? <Spinner size="sm" animation="border" /> : "View"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {filteredSurveys.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-muted text-center">
                      No surveys found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Offcanvas Results */}
      <Offcanvas
        show={showResults}
        onHide={() => setShowResults(false)}
        placement="end"
        style={{ width: "650px" }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Survey Results – {currentSurvey?.title}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {resultsLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="info" />
            </div>
          ) : results.length > 0 ? (
            <>
              <h6 className="text-info mb-3">Detailed Votes</h6>
              <table className="table table-sm table-bordered text-center mb-4">
                <thead className="table-light">
                  <tr>
                    <th>Course</th>
                    <th>1st Choice</th>
                    <th>2nd Choice</th>
                    <th>3rd Choice</th>
                    <th>Total Votes</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.course_id}>
                      <td>{r.course_name}</td>
                      <td>{r.first_choice}</td>
                      <td>{r.second_choice}</td>
                      <td>{r.third_choice}</td>
                      <td>{r.total_votes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h6 className="text-info mb-3">Total Votes per Course</h6>
              <div style={{ height: "300px" }}>
                <Bar
                  data={{
                    labels: results.map((r) => r.course_name),
                    datasets: [
                      {
                        label: "Votes",
                        data: results.map((r) => r.total_votes),
                        backgroundColor: "#0dcaf0",
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } },
                  }}
                />
              </div>

              <h6 className="text-info mt-4">Votes Distribution</h6>
              <div style={{ height: "300px" }}>
                <Pie
                  data={{
                    labels: results.map((r) => r.course_name),
                    datasets: [
                      {
                        data: results.map((r) => r.total_votes),
                        backgroundColor: [
                          "#0dcaf0",
                          "#0d6efd",
                          "#20c997",
                          "#ffc107",
                          "#dc3545",
                        ],
                      },
                    ],
                  }}
                  options={{ responsive: true, plugins: { legend: { position: "bottom" } } }}
                />
              </div>
            </>
          ) : (
            <p className="text-muted text-center">No results found</p>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      {/* Modal Create Survey */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create Survey</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-control"
              value={newSurvey.title}
              onChange={(e) => setNewSurvey({ ...newSurvey, title: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Department</label>
            <select
              className="form-select"
              value={newSurvey.dept_id}
              onChange={(e) => setNewSurvey({ ...newSurvey, dept_id: e.target.value })}
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Level</label>
            <select
              className="form-select"
              value={newSurvey.level_id}
              onChange={(e) => setNewSurvey({ ...newSurvey, level_id: e.target.value })}
            >
              <option value="">Select Level</option>
              {levels.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                value={newSurvey.start_date}
                onChange={(e) => setNewSurvey({ ...newSurvey, start_date: e.target.value })}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                value={newSurvey.end_date}
                onChange={(e) => setNewSurvey({ ...newSurvey, end_date: e.target.value })}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreate(false)}>
            Cancel
          </Button>
          <Button variant="info" className="text-white" onClick={handleCreate} disabled={creating}>
            {creating ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" /> Creating...
              </>
            ) : (
              "Create"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
