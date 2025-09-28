import React from "react";
import { Link } from "react-router-dom";

export default function FacultyCourses() {
  // بيانات تجريبية (Dummy) حسب قاعدة البيانات
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

  return (
    <div>
      {/* header with calendar icon */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="m-0 text-info">My Courses</h2>

        <Link
          to="/faculty/calendar"
          className="btn btn-outline-info d-inline-flex align-items-center justify-content-center rounded-3"
          style={{ width: 44, height: 44 }}
          title="View calendar"
          aria-label="View calendar"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1V3a1 1 0 1 1 2 0v1zm12 6H5v10h14V8z" />
          </svg>
        </Link>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered text-center align-middle">
          <thead className="table-light">
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Credits</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.course_code}>
                <td>{course.course_code}</td>
                <td>{course.name}</td>
                <td>{course.credits}</td>
                <td>{course.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
