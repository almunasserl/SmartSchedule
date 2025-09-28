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
