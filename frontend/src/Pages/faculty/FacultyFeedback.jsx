import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function FacultyFeedback() {
  const [type, setType] = useState("On Assignment");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Feedback Submitted:", { type, feedback });
    alert("Feedback submitted successfully!");
    setFeedback("");
  };

  return (
    <div>
      {/* header with calendar icon */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="m-0 text-info">Feedback</h2>

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

      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        {/* اختيار النوع */}
        <div className="mb-3">
          <label className="me-3">
            <input
              type="radio"
              name="feedbackType"
              value="On Schedule"
              checked={type === "On Schedule"}
              onChange={(e) => setType(e.target.value)}
              className="me-2"
            />
            On Schedule
          </label>
          <label>
            <input
              type="radio"
              name="feedbackType"
              value="On Assignment"
              checked={type === "On Assignment"}
              onChange={(e) => setType(e.target.value)}
              className="me-2"
            />
            On Assignment
          </label>
        </div>

        {/* مربع الكتابة */}
        <div className="mb-3">
          <textarea
            className="form-control mb-3 bg-light p-3 rounded"
            rows="5"
            placeholder="Write your feedback here..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>

        {/* زر الإرسال */}
        <button type="submit" className="btn btn-info text-white">
          Send
        </button>
      </form>
    </div>
  );
}
