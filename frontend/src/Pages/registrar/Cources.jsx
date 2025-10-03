// src/pages/registrar/Courses.jsx
import React, { useEffect, useState } from "react";
import { Offcanvas, Button, Spinner } from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import api from "../../Services/apiClient";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ total: 0, core: 0, elective: 0 });
  const [creditsByDept, setCreditsByDept] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [terms, setTerms] = useState([]);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [termFilter, setTermFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [newCourse, setNewCourse] = useState({
    id: null,
    code: "",
    name: "",
    type: "",
    dept_id: "",
    term_id: "",
    credit_hours: "",
  });

  useEffect(() => {
    loadPage();
  }, []);

  const loadPage = async () => {
    setPageLoading(true);
    await Promise.all([
      fetchCourses(),
      fetchStats(),
      fetchCredits(),
      fetchDropdowns(),
    ]);
    setPageLoading(false);
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const totalRes = await api.get("/reports/courses/total");
      const typesRes = await api.get("/reports/courses/types");
      setStats({
        total: totalRes.data.total_courses,
        core: typesRes.data.core_courses,
        elective: typesRes.data.elective_courses,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCredits = async () => {
    try {
      const res = await api.get("/reports/courses/credits");
      setCreditsByDept(res.data || []);
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
    }
  };

  // Save course
  const handleSave = async () => {
    if (!newCourse.code || !newCourse.name || !newCourse.type) return;
    setLoading(true);
    try {
      if (isEditing) {
        await api.patch(`/courses/${newCourse.id}`, newCourse);
      } else {
        await api.post("/courses", newCourse);
      }
      fetchCourses();
      fetchStats();
      fetchCredits();
      setShowOffcanvas(false);
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Edit course
  const handleEdit = (course) => {
    setNewCourse(course);
    setIsEditing(true);
    setShowOffcanvas(true);
  };

  // Delete course
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await api.delete(`/courses/${id}`);
        fetchCourses();
        fetchStats();
        fetchCredits();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setNewCourse({
      id: null,
      code: "",
      name: "",
      type: "",
      dept_id: "",
      term_id: "",
      credit_hours: "",
    });
    setIsEditing(false);
  };

  // Filters
  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase());

    const matchesDept = deptFilter ? c.dept_id === parseInt(deptFilter) : true;
    const matchesTerm = termFilter ? c.term_id === parseInt(termFilter) : true;
    const matchesType = typeFilter ? c.type === typeFilter : true;

    return matchesSearch && matchesDept && matchesTerm && matchesType;
  });

  // 📊 Bar Chart for Credit Hours
  const barData = {
    labels: creditsByDept.map((d) => d.department),
    datasets: [
      {
        label: "Total Credit Hours",
        data: creditsByDept.map((d) => d.total_credit_hours),
        backgroundColor: "#0dcaf0",
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };

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
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="text-info">Courses</h3>
            <Button
              variant="info"
              className="text-white"
              onClick={() => {
                resetForm();
                setShowOffcanvas(true);
              }}
            >
              + Add Course
            </Button>
          </div>

          {/* Stats */}
          <div className="row mb-4 g-3">
            {/* Total */}
            <div className="col-md-4">
              <div className="card text-center shadow-sm h-100">
                <div className="card-body">
                  <h6>Total Courses</h6>
                  <h4 className="text-info">{stats.total}</h4>
                </div>
              </div>
            </div>

            {/* Core vs Elective */}
            <div className="col-md-4">
              <div className="card text-center shadow-sm h-100">
                <div className="card-body">
                  <h6>Core vs Elective</h6>
                  <div className="d-flex justify-content-around mt-2">
                    <div>
                      <h4 className="text-success">{stats.core}</h4>
                      <small>Core</small>
                    </div>
                    <div>
                      <h4 className="text-warning">{stats.elective}</h4>
                      <small>Elective</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Credit Hours by Department (Chart) */}
            <div className="col-md-4">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h6 className="text-center text-info">
                    Credit Hours by Department
                  </h6>
                  <div style={{ height: "220px" }}>
                    <Bar data={barData} options={barOptions} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="row g-3 align-items-end">
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
                  <label className="form-label">Term</label>
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
                <div className="col-md-2">
                  <label className="form-label">Type</label>
                  <select
                    className="form-select"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="core">Core</option>
                    <option value="elective">Elective</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Search</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name or code..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Courses Table */}
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="mb-3 text-info">Courses List</h5>
              <div className="table-responsive">
                <table className="table table-bordered table-striped align-middle text-center">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Credits</th>
                      <th>Dept</th>
                      <th>Term</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.map((c) => (
                      <tr key={c.id}>
                        <td>{c.id}</td>
                        <td>{c.code}</td>
                        <td>{c.name}</td>
                        <td>{c.type}</td>
                        <td>{c.credit_hours}</td>
                        <td>{c.dept_id}</td>
                        <td>{c.term_id}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => handleEdit(c)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(c.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredCourses.length === 0 && (
                      <tr>
                        <td colSpan="8" className="text-center text-muted">
                          No courses found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Offcanvas Add/Edit */}
          <Offcanvas
            show={showOffcanvas}
            onHide={() => setShowOffcanvas(false)}
            placement="end"
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>
                {isEditing ? "Edit Course" : "Add Course"}
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <div className="mb-3">
                <label className="form-label">Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={newCourse.code}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, code: e.target.value })
                  }
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={newCourse.name}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, name: e.target.value })
                  }
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={newCourse.type}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, type: e.target.value })
                  }
                >
                  <option value="">Select Type</option>
                  <option value="core">Core</option>
                  <option value="elective">Elective</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Department</label>
                <select
                  className="form-select"
                  value={newCourse.dept_id}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, dept_id: e.target.value })
                  }
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
                <label className="form-label">Term</label>
                <select
                  className="form-select"
                  value={newCourse.term_id}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, term_id: e.target.value })
                  }
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
                <label className="form-label">Credit Hours</label>
                <input
                  type="number"
                  className="form-control"
                  value={newCourse.credit_hours}
                  onChange={(e) =>
                    setNewCourse({
                      ...newCourse,
                      credit_hours: e.target.value,
                    })
                  }
                />
              </div>
              <Button
                className="w-100"
                variant="info"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <Spinner size="sm" animation="border" />
                ) : isEditing ? (
                  "Update"
                ) : (
                  "Save"
                )}
              </Button>
            </Offcanvas.Body>
          </Offcanvas>
        </>
      )}
    </div>
  );
}
