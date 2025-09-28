// src/pages/committee/CommitteeSchedulesPage.jsx
import React, { useMemo, useState } from "react";
import { Offcanvas, Button, Badge } from "react-bootstrap";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu"];

// Sample data (Courses / Faculty) as FK
const coursesList = [
  { code: "CS101", name: "Introduction to Computer Science", level: 1 },
  { code: "CS201", name: "Data Structures and Algorithms", level: 2 },
  { code: "CS220", name: "Database Management Systems", level: 3 },
  { code: "SWE315", name: "Introduction to Software Engineering", level: 3 },
];

const facultyList = [
  { id: "F001", name: "Dr. Ahmed Hassan" },
  { id: "F002", name: "Dr. Sara Mohammed" },
  { id: "F003", name: "Dr. Hadi Rahman" },
];

export default function CommitteeSchedulesPage() {
  // ===== Schedules (sections) =====
  const [sections, setSections] = useState([
    {
      id: 1,
      courseCode: "CS101",
      sectionCode: "A",
      facultyId: "F001",
      room: "B-101",
      capacity: 35,
      enrolled: 28,
      slots: [
        { day: "Sun", from: "09:00", to: "09:50", room: "B-101" },
        { day: "Tue", from: "09:00", to: "09:50", room: "B-101" },
      ],
      status: "Draft", // Draft | Proposed | Approved | Published
      conflict: false,
      level: 1,
    },
    {
      id: 2,
      courseCode: "CS201",
      sectionCode: "B",
      facultyId: "F002",
      room: "C-204",
      capacity: 40,
      enrolled: 40,
      slots: [
        { day: "Mon", from: "10:00", to: "10:50", room: "C-204" },
        { day: "Wed", from: "10:00", to: "10:50", room: "C-204" },
      ],
      status: "Proposed",
      conflict: false,
      level: 2,
    },
    {
      id: 3,
      courseCode: "CS220",
      sectionCode: "A",
      facultyId: "F002",
      room: "C-204",
      capacity: 35,
      enrolled: 36,
      slots: [{ day: "Thu", from: "11:00", to: "12:15", room: "C-204" }],
      status: "Draft",
      conflict: true, // Flag for potential scheduling conflicts
      level: 3,
    },
  ]);

  // ===== Filters =====
  const [filters, setFilters] = useState({
    status: "All",
    level: "All",
    course: "All",
    faculty: "All",
    searchQuery: "",
  });

  const filteredSections = useMemo(() => {
    return sections.filter((section) => {
      const matchesStatus =
        filters.status === "All" ? true : section.status === filters.status;
      const matchesLevel =
        filters.level === "All"
          ? true
          : String(section.level) === String(filters.level);
      const matchesCourse =
        filters.course === "All" ? true : section.courseCode === filters.course;
      const matchesFaculty =
        filters.faculty === "All"
          ? true
          : section.facultyId === filters.faculty;
      const matchesSearch =
        !filters.searchQuery ||
        section.id.toString().includes(filters.searchQuery) ||
        section.courseCode
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase()) ||
        section.sectionCode
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase());

      return (
        matchesStatus &&
        matchesLevel &&
        matchesCourse &&
        matchesFaculty &&
        matchesSearch
      );
    });
  }, [sections, filters]);

  // ===== Statistics =====
  const statistics = useMemo(() => {
    const total = filteredSections.length;
    const published = filteredSections.filter(
      (s) => s.status === "Published"
    ).length;
    const conflicted = filteredSections.filter((s) => s.conflict).length;
    const approved = filteredSections.filter(
      (s) => s.status === "Approved"
    ).length;
    return { total, published, conflicted, approved };
  }, [filteredSections]);

  // ===== Offcanvas (Create/Edit) =====
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const emptyForm = {
    id: null,
    courseCode: "",
    sectionCode: "",
    facultyId: "",
    room: "",
    capacity: 30,
    enrolled: 0,
    slots: [{ day: "Sun", from: "08:00", to: "08:50", room: "" }],
    status: "Draft",
    level: 1,
  };

  const [formData, setFormData] = useState(emptyForm);

  const handleCreateNew = () => {
    setIsEditing(false);
    setFormData(emptyForm);
    setShowEditPanel(true);
  };

  const handleEdit = (section) => {
    setIsEditing(true);
    setFormData({
      ...section,
      slots: section.slots.map((slot) => ({ ...slot })),
    });
    setShowEditPanel(true);
  };

  // ===== Section Management =====
  const saveSection = () => {
    // Validation
    if (!formData.courseCode || !formData.sectionCode || !formData.facultyId) {
      alert("Course, Section, and Faculty are required fields.");
      return;
    }

    if (isEditing) {
      setSections((prev) =>
        prev.map((s) => (s.id === formData.id ? { ...formData } : s))
      );
    } else {
      const nextId = sections.length
        ? Math.max(...sections.map((x) => x.id)) + 1
        : 1;
      setSections((prev) => [...prev, { ...formData, id: nextId }]);
    }
    setShowEditPanel(false);
  };

  const deleteSection = (id) => {
    if (window.confirm("Are you sure you want to delete this section?")) {
      setSections((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const approveSection = (id) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "Approved" } : s))
    );
  };

  const publishSection = (id) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "Published" } : s))
    );
  };

  // Generate draft schedule
  const generateDraftSchedule = () => {
    alert(
      "Draft generation feature will be implemented with scheduling algorithm integration."
    );
  };

  // Conflict detection: room/faculty time overlaps
  const detectSchedulingConflicts = () => {
    const conflictedSections = new Set();

    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const scheduleByResource = {};

    sections.forEach((section) => {
      section.slots.forEach((slot) => {
        const roomKey = `ROOM|${slot.day}|${slot.room}`;
        const facultyKey = `FACULTY|${slot.day}|${section.facultyId}`;

        scheduleByResource[roomKey] = scheduleByResource[roomKey] || [];
        scheduleByResource[facultyKey] = scheduleByResource[facultyKey] || [];

        scheduleByResource[roomKey].push({
          sectionId: section.id,
          from: timeToMinutes(slot.from),
          to: timeToMinutes(slot.to),
        });
        scheduleByResource[facultyKey].push({
          sectionId: section.id,
          from: timeToMinutes(slot.from),
          to: timeToMinutes(slot.to),
        });
      });
    });

    Object.values(scheduleByResource).forEach((scheduleArray) => {
      scheduleArray.sort((a, b) => a.from - b.from);

      for (let i = 1; i < scheduleArray.length; i++) {
        if (scheduleArray[i].from < scheduleArray[i - 1].to) {
          conflictedSections.add(scheduleArray[i].sectionId);
          conflictedSections.add(scheduleArray[i - 1].sectionId);
        }
      }
    });

    setSections((prev) =>
      prev.map((s) => ({ ...s, conflict: conflictedSections.has(s.id) }))
    );

    alert(
      `Conflict detection completed. Found ${conflictedSections.size} sections with conflicts.`
    );
  };

  const publishApprovedSections = () => {
    const approvedSectionIds = filteredSections
      .filter((section) => section.status === "Approved")
      .map((section) => section.id);

    if (approvedSectionIds.length === 0) {
      alert(
        "No approved sections available for publishing with current filters."
      );
      return;
    }

    setSections((prev) =>
      prev.map((s) =>
        approvedSectionIds.includes(s.id) ? { ...s, status: "Published" } : s
      )
    );
  };

  // ===== Week Schedule Preview =====
  const weeklySchedule = useMemo(() => {
    const scheduleMap = Object.fromEntries(DAYS.map((day) => [day, []]));

    filteredSections.forEach((section) => {
      section.slots.forEach((slot) => {
        scheduleMap[slot.day].push({
          label: `${section.courseCode}-${section.sectionCode} (${
            slot.room || section.room
          })`,
          from: slot.from,
          to: slot.to,
          color:
            section.status === "Published"
              ? "#198754"
              : section.status === "Approved"
              ? "#0d6efd"
              : section.status === "Proposed"
              ? "#ffc107"
              : "#6c757d",
          conflict: section.conflict,
        });
      });
    });

    // Sort by time for each day
    DAYS.forEach((day) => {
      scheduleMap[day].sort((a, b) => (a.from < b.from ? -1 : 1));
    });

    return scheduleMap;
  }, [filteredSections]);

  // ===== Helper Functions =====
  const getCourseName = (code) =>
    coursesList.find((course) => course.code === code)?.name || code;

  const getFacultyName = (id) =>
    facultyList.find((faculty) => faculty.id === id)?.name || id;

  const formatTimeSlots = (slots) =>
    slots
      .map(
        (slot) =>
          `${slot.day} ${slot.from}-${slot.to}${
            slot.room ? ` @${slot.room}` : ""
          }`
      )
      .join(" • ");

  // ===== UI Components =====
  return (
    <div className="container-fluid">
      <div className="row g-4">
        {/* Main Content: Controls and Table */}
        <div className="col-lg-8">
          {/* Header and Action Buttons */}
          <div className="d-flex flex-wrap align-items-center justify-content-between mb-4">
            <div>
              <h1 className="h3 mb-1">Academic Schedule Management</h1>
              <p className="text-muted mb-0">
                Manage course sections and scheduling
              </p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <Button variant="outline-primary" onClick={generateDraftSchedule}>
                Generate Draft
              </Button>
              <Button
                variant="outline-warning"
                onClick={detectSchedulingConflicts}
              >
                Detect Conflicts
              </Button>
              <Button variant="success" onClick={publishApprovedSections}>
                Publish Approved
              </Button>
              <Button variant="primary" onClick={handleCreateNew}>
                + New Section
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light">
              <h6 className="mb-0">Filter Sections</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={filters.status}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, status: e.target.value }))
                    }
                  >
                    <option value="All">All Statuses</option>
                    <option value="Draft">Draft</option>
                    <option value="Proposed">Proposed</option>
                    <option value="Approved">Approved</option>
                    <option value="Published">Published</option>
                  </select>
                </div>

                <div className="col-md-2">
                  <label className="form-label">Level</label>
                  <select
                    className="form-select"
                    value={filters.level}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, level: e.target.value }))
                    }
                  >
                    <option value="All">All Levels</option>
                    <option value="1">Level 1</option>
                    <option value="2">Level 2</option>
                    <option value="3">Level 3</option>
                    <option value="4">Level 4</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label">Course</label>
                  <select
                    className="form-select"
                    value={filters.course}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, course: e.target.value }))
                    }
                  >
                    <option value="All">All Courses</option>
                    {coursesList.map((course) => (
                      <option key={course.code} value={course.code}>
                        {course.code}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-2">
                  <label className="form-label">Faculty</label>
                  <select
                    className="form-select"
                    value={filters.faculty}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, faculty: e.target.value }))
                    }
                  >
                    <option value="All">All Faculty</option>
                    {facultyList.map((faculty) => (
                      <option key={faculty.id} value={faculty.id}>
                        {faculty.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-2">
                  <label className="form-label">Search</label>
                  <input
                    className="form-control"
                    placeholder="ID, Course, Section..."
                    value={filters.searchQuery}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, searchQuery: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card border-0 bg-primary text-white p-3 text-center">
                <div className="fw-semibold">Total Sections</div>
                <div className="h4 mb-0">{statistics.total}</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 bg-warning text-dark p-3 text-center">
                <div className="fw-semibold">With Conflicts</div>
                <div className="h4 mb-0">{statistics.conflicted}</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 bg-info text-white p-3 text-center">
                <div className="fw-semibold">Approved</div>
                <div className="h4 mb-0">{statistics.approved}</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 bg-success text-white p-3 text-center">
                <div className="fw-semibold">Published</div>
                <div className="h4 mb-0">{statistics.published}</div>
              </div>
            </div>
          </div>

          {/* Sections Table */}
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h6 className="mb-0">Course Sections</h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: 70 }}>ID</th>
                      <th>Course</th>
                      <th style={{ width: 90 }}>Section</th>
                      <th>Faculty</th>
                      <th>Room</th>
                      <th style={{ width: 90 }}>Capacity</th>
                      <th style={{ width: 90 }}>Enrolled</th>
                      <th>Schedule</th>
                      <th style={{ width: 110 }}>Status</th>
                      <th style={{ width: 110 }}>Conflict</th>
                      <th style={{ width: 280 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSections.map((section) => (
                      <tr
                        key={section.id}
                        className={section.conflict ? "table-warning" : ""}
                      >
                        <td className="fw-semibold">{section.id}</td>
                        <td>
                          <div className="fw-semibold">
                            {section.courseCode}
                          </div>
                          <div className="small text-muted">
                            {getCourseName(section.courseCode)}
                          </div>
                        </td>
                        <td>
                          <Badge bg="secondary">{section.sectionCode}</Badge>
                        </td>
                        <td>
                          <div className="fw-semibold">
                            {getFacultyName(section.facultyId)}
                          </div>
                          <div className="small text-muted">
                            {section.facultyId}
                          </div>
                        </td>
                        <td>{section.room}</td>
                        <td>{section.capacity}</td>
                        <td
                          className={
                            section.enrolled > section.capacity
                              ? "text-danger fw-semibold"
                              : ""
                          }
                        >
                          {section.enrolled}
                          {section.enrolled > section.capacity && (
                            <span className="badge bg-danger ms-1">Over</span>
                          )}
                        </td>
                        <td className="text-start small">
                          {formatTimeSlots(section.slots)}
                        </td>
                        <td>
                          <Badge
                            bg={
                              section.status === "Published"
                                ? "success"
                                : section.status === "Approved"
                                ? "primary"
                                : section.status === "Proposed"
                                ? "warning"
                                : "secondary"
                            }
                          >
                            {section.status}
                          </Badge>
                        </td>
                        <td>
                          {section.conflict ? (
                            <Badge bg="danger">Conflict</Badge>
                          ) : (
                            <Badge bg="success">OK</Badge>
                          )}
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1 justify-content-center">
                            <Button
                              size="sm"
                              variant="outline-warning"
                              onClick={() => handleEdit(section)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => approveSection(section.id)}
                              disabled={section.status === "Published"}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() => publishSection(section.id)}
                              disabled={section.status === "Published"}
                            >
                              Publish
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => deleteSection(section.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredSections.length === 0 && (
                      <tr>
                        <td
                          colSpan={11}
                          className="text-center text-muted py-4"
                        >
                          No sections found matching current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Weekly Schedule Preview */}
        <div className="col-lg-4">
          <div className="card shadow-sm sticky-top" style={{ top: "1rem" }}>
            <div className="card-header bg-light">
              <h6 className="mb-0">Weekly Schedule Preview</h6>
            </div>
            <div className="card-body">
              {DAYS.map((day) => (
                <div key={day} className="mb-3">
                  <div className="fw-semibold text-primary mb-2 border-bottom pb-1">
                    {day}
                  </div>
                  {weeklySchedule[day].length === 0 ? (
                    <div className="text-muted small text-center py-2">
                      No scheduled classes
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {weeklySchedule[day].map((block, index) => (
                        <div
                          key={index}
                          className="p-2 rounded"
                          style={{
                            backgroundColor: block.color,
                            color: "#fff",
                            border: block.conflict
                              ? "2px dashed #dc3545"
                              : "none",
                            opacity: block.conflict ? 0.8 : 1,
                          }}
                        >
                          <div className="small fw-semibold">{block.label}</div>
                          <div className="small">
                            {block.from} – {block.to}
                          </div>
                          {block.conflict && (
                            <div className="small mt-1">
                              <Badge bg="danger">Conflict</Badge>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit/Create Section Panel */}
      <Offcanvas
        show={showEditPanel}
        onHide={() => setShowEditPanel(false)}
        placement="end"
        size="lg"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            {isEditing ? "Edit Course Section" : "Create New Section"}
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveSection();
            }}
          >
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label required">Course</label>
                <select
                  className="form-select"
                  value={formData.courseCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    const level =
                      coursesList.find((c) => c.code === code)?.level ||
                      formData.level;
                    setFormData((f) => ({ ...f, courseCode: code, level }));
                  }}
                  required
                >
                  <option value="">Select Course...</option>
                  {coursesList.map((course) => (
                    <option key={course.code} value={course.code}>
                      {course.code} — {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label required">Section Code</label>
                <input
                  className="form-control"
                  placeholder="e.g., A, B, C1"
                  value={formData.sectionCode}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, sectionCode: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Academic Level</label>
                <select
                  className="form-select"
                  value={formData.level}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      level: Number(e.target.value),
                    }))
                  }
                >
                  <option value={1}>Level 1</option>
                  <option value={2}>Level 2</option>
                  <option value={3}>Level 3</option>
                  <option value={4}>Level 4</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label required">Faculty</label>
                <select
                  className="form-select"
                  value={formData.facultyId}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, facultyId: e.target.value }))
                  }
                  required
                >
                  <option value="">Select Faculty Member...</option>
                  {facultyList.map((faculty) => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.name} ({faculty.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">Room</label>
                <input
                  className="form-control"
                  placeholder="Room number"
                  value={formData.room}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, room: e.target.value }))
                  }
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Capacity</label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      capacity: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>

            {/* Meeting Slots Section */}
            <div className="mt-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="mb-0">Meeting Schedule</h6>
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={() =>
                    setFormData((f) => ({
                      ...f,
                      slots: [
                        ...f.slots,
                        {
                          day: "Sun",
                          from: "08:00",
                          to: "08:50",
                          room: f.room,
                        },
                      ],
                    }))
                  }
                >
                  + Add Time Slot
                </Button>
              </div>

              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: 140 }}>Day</th>
                      <th style={{ width: 140 }}>Start Time</th>
                      <th style={{ width: 140 }}>End Time</th>
                      <th>Room</th>
                      <th style={{ width: 80 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.slots.map((slot, index) => (
                      <tr key={index}>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={slot.day}
                            onChange={(e) =>
                              setFormData((f) => {
                                const updatedSlots = [...f.slots];
                                updatedSlots[index] = {
                                  ...updatedSlots[index],
                                  day: e.target.value,
                                };
                                return { ...f, slots: updatedSlots };
                              })
                            }
                          >
                            {DAYS.map((day) => (
                              <option key={day} value={day}>
                                {day}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="time"
                            className="form-control form-control-sm"
                            value={slot.from}
                            onChange={(e) =>
                              setFormData((f) => {
                                const updatedSlots = [...f.slots];
                                updatedSlots[index] = {
                                  ...updatedSlots[index],
                                  from: e.target.value,
                                };
                                return { ...f, slots: updatedSlots };
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="time"
                            className="form-control form-control-sm"
                            value={slot.to}
                            onChange={(e) =>
                              setFormData((f) => {
                                const updatedSlots = [...f.slots];
                                updatedSlots[index] = {
                                  ...updatedSlots[index],
                                  to: e.target.value,
                                };
                                return { ...f, slots: updatedSlots };
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="form-control form-control-sm"
                            placeholder={formData.room || "Room number"}
                            value={slot.room || ""}
                            onChange={(e) =>
                              setFormData((f) => {
                                const updatedSlots = [...f.slots];
                                updatedSlots[index] = {
                                  ...updatedSlots[index],
                                  room: e.target.value,
                                };
                                return { ...f, slots: updatedSlots };
                              })
                            }
                          />
                        </td>
                        <td className="text-center">
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() =>
                              setFormData((f) => ({
                                ...f,
                                slots: f.slots.filter((_, i) => i !== index),
                              }))
                            }
                          >
                            ✕
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {formData.slots.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center text-muted py-3">
                          No time slots added. Please add at least one meeting
                          time.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Status Section */}
            <div className="row g-3 mt-3">
              <div className="col-md-6">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, status: e.target.value }))
                  }
                >
                  <option value="Draft">Draft</option>
                  <option value="Proposed">Proposed</option>
                  <option value="Approved">Approved</option>
                  <option value="Published">Published</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex gap-2 mt-4 pt-3 border-top">
              <Button type="submit" variant="primary" className="flex-fill">
                {isEditing ? "Save Changes" : "Create Section"}
              </Button>
              <Button
                variant="outline-secondary"
                className="flex-fill"
                onClick={() => setShowEditPanel(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}
