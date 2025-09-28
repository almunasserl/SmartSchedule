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
