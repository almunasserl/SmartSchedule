import React from "react";
import { Link } from "react-router-dom";

export default function FacultyDashboard() {
  const courses = [
    {
      course_code: "SWE481",
      name: "Advanced Web Applications Engineering",
      credits: 3,
      type: "Elective",
    },
    {
      course_code: "SWE455",
      name: "Software Maintenance and Evolution",
      credits: 2,
      type: "Required",
    },
  ];

  const sections = [
    { section_id: 50801, course_code: "SWE481" },
    { section_id: 50678, course_code: "SWE455" },
  ];

  return (
    <div className="p-3 p-md-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h2 className="m-0 fw-bold text-info">Dashboard</h2>

        <Link
          to="/faculty/calendar"
          className="btn btn-outline-info d-inline-flex align-items-center justify-content-center rounded-3"
          style={{ width: 44, height: 44 }}
          title="View calendar"
          aria-label="View calendar"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1V3a1 1 0 1 1 2 0v1zm12 6H5v10h14V8z" />
          </svg>
        </Link>
      </div>

      {/* Stats (more space between items) */}
      <div
        className="d-flex justify-content-center mb-3"
        style={{ gap: "6rem" }} /* increased distance */
      >
        <div className="text-center">
          <div className="fs-3 fw-bold text-info">{courses.length}</div>
          <div className="text-info small">courses</div>
        </div>
        <div className="text-center">
          <div className="fs-3 fw-bold text-info">{sections.length}</div>
          <div className="text-info small">sections</div>
        </div>
      </div>

      {/* Courses card */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body">
          <h5 className="fw-semibold mb-3 text-info">Courses Overview</h5>

          <ul className="list-unstyled mb-0">
            {courses.map((c) => (
              <li
                key={c.course_code}
                className="p-3 mb-3 rounded-3 bg-light"
                // For a darker gray like the mock, uncomment:
                // style={{ backgroundColor: "#e9e9eb" }}
              >
                <div className="fw-semibold">
                  <strong>{c.course_code}</strong> - {c.name}
                </div>
                <div className="d-flex align-items-center text-muted small mt-1">
                  <span
                    className="rounded-circle me-2"
                    style={{
                      width: 7,
                      height: 7,
                      backgroundColor: "#333",
                      display: "inline-block",
                    }}
                  />
                  {c.credits} hours
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action button OUTSIDE the card */}
      <div className="d-flex justify-content-end mt-3">
        <Link
          to="/faculty/calendar"
          className="btn btn-info text-white fw-semibold"
        >
          view calendar
        </Link>
      </div>
    </div>
  );
}
