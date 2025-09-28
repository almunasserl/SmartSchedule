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
