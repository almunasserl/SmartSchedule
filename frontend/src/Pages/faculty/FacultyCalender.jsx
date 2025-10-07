import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Spinner, Toast, ToastContainer } from "react-bootstrap";
import apiClient from "../../Services/apiClient";

export default function FacultyCalendar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [schedule, setSchedule] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 2500);
  };

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
  const times = [
    "8:00 - 8:50",
    "9:00 - 9:50",
    "10:00 - 10:50",
    "11:00 - 11:50",
    "12:00 - 12:50",
    "1:00 - 1:50",
  ];

  // 🔹 تحميل الجدول من الـ API (مستقبلاً)
  const fetchSchedule = async () => {
    try {
      // مثال استدعاء API مستقبلاً:
      // const res = await apiClient.get("/faculty/calendar");
      // setSchedule(res.data);

      // مؤقتاً بيانات تجريبية
      setTimeout(() => {
        setSchedule([
          { day: "Monday", time: "8:00 - 8:50", course: "SWE 481" },
          { day: "Wednesday", time: "10:00 - 10:50", course: "SWE 455" },
        ]);
        setPageLoading(false);
      }, 1000);
    } catch (err) {
      console.error("Error fetching schedule:", err);
      showToast("Failed to load schedule", "danger");
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const getCourse = (day, time) => {
    if (time === "12:00 - 12:50") return "Break";
    const match = schedule.find((s) => s.day === day && s.time === time);
    return match ? match.course : "";
  };

  const handleBack = () => {
    const hasHistory =
      typeof window !== "undefined" && window.history.length > 1;
    const fromState = location.state && location.state.from;

    if (fromState) {
      navigate(fromState);
    } else if (hasHistory) {
      navigate(-1);
    } else {
      navigate("/faculty");
    }
  };

  if (pageLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <Spinner
          animation="border"
          variant="info"
          style={{ width: "3rem", height: "3rem" }}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Toasts */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg={toast.type}
          show={toast.show}
          onClose={() => setToast({ show: false })}
        >
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      <h2 className="mb-4 text-info">Faculty Calendar</h2>

      <div className="card shadow-sm p-3 mb-3">
        <div className="table-responsive">
          <table className="table table-bordered text-center align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ backgroundColor: "#ddd" }}>Day / Time</th>
                {times.map((time) => (
                  <th key={time} style={{ backgroundColor: "#ddd" }}>
                    {time}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day}>
                  <td
                    style={{
                      backgroundColor: "#f0f0f0",
                      fontWeight: "bold",
                      width: "120px",
                    }}
                  >
                    {day}
                  </td>
                  {times.map((time) => {
                    const course = getCourse(day, time);
                    const isBreak = course === "Break";
                    return (
                      <td
                        key={time}
                        className={isBreak ? "text-muted bg-light" : ""}
                        style={{
                          height: "60px",
                          backgroundColor: isBreak ? "#f8f9fa" : undefined,
                        }}
                      >
                        {course || ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-3 text-end">
        <button onClick={handleBack} className="btn btn-info text-white px-4">
          ← Back
        </button>
      </div>
    </div>
  );
}
