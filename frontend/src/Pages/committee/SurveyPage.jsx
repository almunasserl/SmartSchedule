// src/pages/committee/SurveyPage.jsx
import React, { useMemo, useState } from "react";
import { Offcanvas, Button } from "react-bootstrap";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function SurveyPage() {
  // داتا الكورسات (FK)
  const coursesList = [
    { code: "CS101", name: "Intro to CS" },
    { code: "CS201", name: "Data Structures" },
    { code: "CS220", name: "Databases" },
    { code: "SWE315", name: "Intro to SE" },
    { code: "ENG132", name: "Technical Writing" },
  ];

  // داتا السيرفيز (مع votes + respondents breakdown)
  const [surveys, setSurveys] = useState([
    {
      id: 1,
      title: "Sem 1 Survey",
      startDate: "2025-05-06",
      endDate: "2025-07-06",
      courses: ["ENG132", "SWE315", "CS220"],
      responses: 120,
      votes: {
        ENG132: 64,
        SWE315: 38,
        CS220: 18,
      },
      respondents: { regular: 92, irregular: 28 },
    },
    {
      id: 2,
      title: "Sem 2 Survey",
      startDate: "2025-10-01",
      endDate: "2025-12-01",
      courses: ["CS201", "CS220", "CS101"],
      responses: 130,
      votes: {
        CS201: 70,
        CS220: 44,
        CS101: 16,
      },
      respondents: { regular: 100, irregular: 30 },
    },
  ]);

  // إنشاء/تعديل (Offcanvas 1)
  const [showEdit, setShowEdit] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    id: null,
    title: "",
    startDate: "",
    endDate: "",
    courses: [],
  });

  // العرض (Offcanvas 2)
  const [showView, setShowView] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);

  // فتح الإضافة
  const openCreate = () => {
    setIsEditing(false);
    setForm({ id: null, title: "", startDate: "", endDate: "", courses: [] });
    setShowEdit(true);
  };

  // فتح العرض
  const openView = (survey) => {
    setSelectedSurvey(survey);
    setShowView(true);
  };

  // حفظ Survey (إنشاء/تعديل)
  const handleSave = () => {
    if (!form.title || !form.startDate || !form.endDate) {
      alert("Please fill in the title, start and end date.");
      return;
    }
    if (isEditing) {
      setSurveys((prev) =>
        prev.map((s) =>
          s.id === form.id
            ? {
                ...s,
                ...form,
                // لو ما كانت موجودة مسبقًا، أنشئ حقول افتراضية
                votes: s.votes ?? Object.fromEntries(form.courses.map((c) => [c, 0])),
                respondents: s.respondents ?? { regular: 0, irregular: 0 },
                responses: s.responses ?? 0,
              }
            : s
        )
      );
    } else {
      setSurveys((prev) => [
        ...prev,
        {
          ...form,
          id: prev.length ? Math.max(...prev.map((p) => p.id)) + 1 : 1,
          votes: Object.fromEntries(form.courses.map((c) => [c, 0])),
          respondents: { regular: 0, irregular: 0 },
          responses: 0,
        },
      ]);
    }
    setShowEdit(false);
  };

  const handleCoursesChange = (e) => {
    const opts = Array.from(e.target.selectedOptions).map((o) => o.value);
    setForm((f) => ({ ...f, courses: opts }));
  };

  // ====== Ranked Courses + Charts (للسيرفي المختار) ======
  const rankedCourses = useMemo(() => {
    if (!selectedSurvey) return [];
    const votes = selectedSurvey.votes || {};
    // نسمي الكود إلى اسم مقروء لو وجد
    const nameByCode = Object.fromEntries(coursesList.map((c) => [c.code, c.name]));
    return Object.entries(votes)
      .map(([code, count]) => ({
        code,
        name: nameByCode[code] ? `${code} - ${nameByCode[code]}` : code,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [selectedSurvey, coursesList]);

  // Bar: votes per course (مرتّبة)
  const votesBarData = useMemo(() => {
    return {
      labels: rankedCourses.map((c) => c.code),
      datasets: [
        {
          label: "Votes",
          data: rankedCourses.map((c) => c.count),
          backgroundColor: "#0d6efd",
        },
      ],
    };
  }, [rankedCourses]);

  // Pie: regular vs irregular
  const respPieData = useMemo(() => {
    const reg = selectedSurvey?.respondents?.regular ?? 0;
    const irreg = selectedSurvey?.respondents?.irregular ?? 0;
    return {
      labels: ["Regular", "Irregular"],
      datasets: [
        {
          data: [reg, irreg],
          backgroundColor: ["#198754", "#dc3545"],
        },
      ],
    };
  }, [selectedSurvey]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Surveys Management</h2>
        <Button variant="primary" onClick={openCreate}>+ New Survey</Button>
      </div>

      {/* جدول السيرفيز */}
      <div className="card shadow-sm p-3">
        <h5 className="mb-3 text-info">Surveys</h5>
        <div className="table-responsive">
          <table className="table table-bordered table-striped text-center align-middle">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Start date</th>
                <th>End date</th>
                <th>Courses</th>
                <th>Responses</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {surveys.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.title}</td>
                  <td>{s.startDate}</td>
                  <td>{s.endDate}</td>
                  <td>{s.courses.join(", ")}</td>
                  <td>{s.responses ?? 0}</td>
                  <td className="d-flex gap-2 justify-content-center">
                    <button className="btn btn-sm btn-outline-info" onClick={() => openView(s)}>
                      View
                    </button>
                    {/* ممكن تضيف Edit/Delete لاحقًا */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Offcanvas الإضافة/التعديل (يمين) */}
      <Offcanvas show={showEdit} onHide={() => setShowEdit(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{isEditing ? "Edit Survey" : "Add New Survey"}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-control"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div className="row mb-3">
            <div className="col">
              <label className="form-label">Start date</label>
              <input
                type="date"
                className="form-control"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              />
            </div>
            <div className="col">
              <label className="form-label">End date</label>
              <input
                type="date"
                className="form-control"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="mb-2">
            <label className="form-label">Elective Courses (FK)</label>
            <select
              className="form-select"
              multiple
              value={form.courses}
              onChange={handleCoursesChange}
            >
              {coursesList.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
            <small className="text-muted">
              Hold <b>Ctrl</b> (Windows) / <b>Cmd</b> (Mac) to select multiple.
            </small>
          </div>

          <Button className="w-100 mt-3" onClick={handleSave}>
            {isEditing ? "Update Survey" : "Publish Survey"}
          </Button>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Offcanvas العرض (يمين) */}
      <Offcanvas show={showView} onHide={() => setShowView(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Survey Details</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {!selectedSurvey ? (
            <p className="text-muted">No survey selected.</p>
          ) : (
            <>
              {/* معلومات عامة */}
              <div className="mb-3">
                <h5 className="mb-1">{selectedSurvey.title}</h5>
                <div className="text-muted small">
                  <span>From: {selectedSurvey.startDate}</span> &nbsp;•&nbsp;
                  <span>To: {selectedSurvey.endDate}</span> &nbsp;•&nbsp;
                  <span>Responses: <b>{selectedSurvey.responses ?? 0}</b></span>
                </div>
              </div>

              {/* قائمة مرتبة للكورسات حسب الأصوات */}
              <div className="mb-3">
                <h6 className="text-info">Ranked Courses</h6>
                <ol className="list-group list-group-numbered">
                  {rankedCourses.map((c) => (
                    <li
                      key={c.code}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <span className="text-truncate">{c.name}</span>
                      <span className="badge bg-primary rounded-pill">{c.count}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* الرسوم البيانية */}
              <div className="mb-3">
                <h6 className="text-info mb-2">Votes per Course</h6>
                <div style={{ height: Math.max(220, rankedCourses.length * 36) }}>
                  <Bar
                    data={votesBarData}
                    options={{
                      maintainAspectRatio: false,
                      responsive: true,
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { beginAtZero: true },
                        y: { ticks: { autoSkip: false } },
                      },
                    }}
                  />
                </div>
              </div>

              <div className="mb-2">
                <h6 className="text-info mb-2">Respondents (Regular vs Irregular)</h6>
                <div style={{ height: 240 }}>
                  <Pie
                    data={respPieData}
                    options={{ maintainAspectRatio: false, responsive: true }}
                  />
                </div>
              </div>

              {/* أزرار مستقبلية */}
              <div className="d-grid gap-2 mt-3">
                <button className="btn btn-outline-secondary" disabled>
                  Export CSV (coming soon)
                </button>
              </div>
            </>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}
