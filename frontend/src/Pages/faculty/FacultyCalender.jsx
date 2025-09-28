import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function FacultyCalendar() {
  const navigate = useNavigate();
  const location = useLocation();

  // بيانات مؤقتة (dummy) للجدول
  const schedule = [
    { day: "Monday", time: "8:00 - 8:50", course: "SWE 481" },
    { day: "Wednesday", time: "10:00 - 10:50", course: "SWE 455" },
  ];

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
  const times = [
    "8:00 - 8:50",
    "9:00 - 9:50",
    "10:00 - 10:50",
    "11:00 - 11:50",
    "12:00 - 12:50",
    "1:00 - 1:50",
  ];

  const getCourse = (day, time) => {
    const match = schedule.find((s) => s.day === day && s.time === time);
    if (time === "12:00 - 12:50") return "Break";
    return match ? match.course : "";
  };

  const handleBack = () => {
    // لو صفحة محمّلة مباشرة بدون تاريخ سابق، نرجّع للفاكلتي
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

  return (
    <div>
      <h2 className="mb-4 text-info">Calendar</h2>

      <div className="table-responsive">
        <table className="table table-bordered text-center align-middle">
          <thead className="table-light">
            <tr>
              <th style={{ backgroundColor: "#ddd" }}> </th>
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
                <td style={{ backgroundColor: "#ddd", fontWeight: "bold" }}>
                  {day}
                </td>
                {times.map((time) => (
                  <td key={time}>
                    {getCourse(day, time) === "Break" ? (
                      <span className="text-muted">Break</span>
                    ) : (
                      getCourse(day, time)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* زر الرجوع */}
      <div className="mt-3">
        <button onClick={handleBack} className="btn btn-info text-white">
          back
        </button>
      </div>
    </div>
  );
}
