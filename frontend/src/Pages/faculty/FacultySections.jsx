import React from "react";
import { Link } from "react-router-dom";

export default function FacultySections() {
  // بيانات تجريبية (Dummy Data) من جدول sections
  const sections = [
    {
      section_id: 50801,
      course_code: "SWE481",
      day: "Sunday",
      time: "8:00 - 8:50",
      capacity: 30,
      enrolled: 28,
    },
    {
      section_id: 50678,
      course_code: "SWE455",
      day: "Wednesday",
      time: "10:00 - 10:50",
      capacity: 40,
      enrolled: 35,
    },
  ];

  return (
    <div>
      {/* header with calendar icon */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="m-0 text-info">My Sections</h2>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered text-center align-middle">
          <thead className="table-light">
            <tr>
              <th>Section</th>
              <th>Course</th>
              <th>Day</th>
              <th>Time</th>
              <th>Capacity</th>
              <th>Enrolled</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((sec) => (
              <tr key={sec.section_id}>
                <td>{sec.section_id}</td>
                <td>{sec.course_code}</td>
                <td>{sec.day}</td>
                <td>{sec.time}</td>
                <td>{sec.capacity}</td>
                <td>{sec.enrolled}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
