// src/pages/committee/RulesPage.jsx
import React, { useMemo, useState } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu"];

export default function RulesPage() {
  const [teachingWindow, setTeachingWindow] = useState({
    days: ["Sun", "Mon", "Tue", "Wed", "Thu"],
    time_from: "08:00",
    time_to: "17:00",
    blocked_slots: [],
  });

  const [facultyLoad, setFacultyLoad] = useState({
    min_hours: 6,
    max_hours: 12,
    min_gap_minutes: 15,
  });

  const [rooms, setRooms] = useState({
    allow_overbooking: false,
    max_over_percent: 0,
  });

  const [surveyWeights, setSurveyWeights] = useState({
    use_ranked_courses: true,
    min_votes_to_open_section: 15,
    max_sections_per_course: 4,
  });

  // payload النهائي
  const rulesPayload = useMemo(
    () => ({
      teaching_window: teachingWindow,
      faculty_load: facultyLoad,
      rooms,
      survey_weights: surveyWeights,
    }),
    [teachingWindow, facultyLoad, rooms, surveyWeights]
  );

  const handleSaveDraft = () => {
    console.log("SAVE DRAFT:", rulesPayload);
    alert("Rules saved as draft (check console).");
  };

  const handleApplyNow = () => {
    console.log("APPLY NOW:", rulesPayload);
    alert("Rules applied (check console).");
  };

  const handleReset = () => {
    setTeachingWindow({
      days: ["Sun", "Mon", "Tue", "Wed", "Thu"],
      time_from: "08:00",
      time_to: "17:00",
      blocked_slots: [],
    });
    setFacultyLoad({ min_hours: 6, max_hours: 12, min_gap_minutes: 15 });
    setRooms({ allow_overbooking: false, max_over_percent: 0 });
    setSurveyWeights({
      use_ranked_courses: true,
      min_votes_to_open_section: 15,
      max_sections_per_course: 4,
    });
  };

  // Blocked slots handlers
  const addBlockedSlot = () => {
    setTeachingWindow((prev) => ({
      ...prev,
      blocked_slots: [...prev.blocked_slots, { day: "Sun", from: "12:00", to: "13:00" }],
    }));
  };
  const updateBlockedSlot = (idx, key, value) => {
    setTeachingWindow((prev) => {
      const copy = [...prev.blocked_slots];
      copy[idx] = { ...copy[idx], [key]: value };
      return { ...prev, blocked_slots: copy };
    });
  };
  const removeBlockedSlot = (idx) => {
    setTeachingWindow((prev) => {
      const copy = prev.blocked_slots.filter((_, i) => i !== idx);
      return { ...prev, blocked_slots: copy };
    });
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="mb-0">Scheduling Rules</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={handleReset}>
            Reset to Defaults
          </button>
          <button className="btn btn-outline-primary" onClick={handleSaveDraft}>
            Save Draft
          </button>
          <button className="btn btn-primary" onClick={handleApplyNow}>
            Apply Now
          </button>
        </div>
      </div>

      {/* Teaching Window */}
      <div className="card shadow-sm mb-3">
        <div className="card-header bg-white">
          <h5 className="mb-0 text-info">Teaching Window</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-lg-4">
              <label className="form-label fw-semibold">Days</label>
              <div className="d-flex flex-wrap gap-3">
                {DAYS.map((d) => (
                  <div className="form-check" key={d}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`day-${d}`}
                      checked={teachingWindow.days.includes(d)}
                      onChange={(e) => {
                        setTeachingWindow((prev) => {
                          const on = e.target.checked;
                          const arr = new Set(prev.days);
                          if (on) arr.add(d);
                          else arr.delete(d);
                          return { ...prev, days: Array.from(arr) };
                        });
                      }}
                    />
                    <label className="form-check-label" htmlFor={`day-${d}`}>
                      {d}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-lg-4">
              <label className="form-label fw-semibold">Time From</label>
              <input
                type="time"
                className="form-control"
                value={teachingWindow.time_from}
                onChange={(e) =>
                  setTeachingWindow((prev) => ({ ...prev, time_from: e.target.value }))
                }
              />
            </div>

            <div className="col-lg-4">
              <label className="form-label fw-semibold">Time To</label>
              <input
                type="time"
                className="form-control"
                value={teachingWindow.time_to}
                onChange={(e) =>
                  setTeachingWindow((prev) => ({ ...prev, time_to: e.target.value }))
                }
              />
            </div>
          </div>

          <hr className="my-4" />

          <div className="d-flex align-items-center justify-content-between mb-2">
            <h6 className="mb-0">Blocked Slots</h6>
            <button className="btn btn-sm btn-outline-primary" onClick={addBlockedSlot}>
              + Add Blocked Slot
            </button>
          </div>

          {teachingWindow.blocked_slots.length === 0 && (
            <div className="text-muted small">No blocked slots.</div>
          )}

          {teachingWindow.blocked_slots.length > 0 && (
            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead>
                  <tr>
                    <th style={{ width: 160 }}>Day</th>
                    <th style={{ width: 160 }}>From</th>
                    <th style={{ width: 160 }}>To</th>
                    <th style={{ width: 80 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {teachingWindow.blocked_slots.map((slot, idx) => (
                    <tr key={idx}>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={slot.day}
                          onChange={(e) => updateBlockedSlot(idx, "day", e.target.value)}
                        >
                          {DAYS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="time"
                          className="form-control form-control-sm"
                          value={slot.from}
                          onChange={(e) => updateBlockedSlot(idx, "from", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="time"
                          className="form-control form-control-sm"
                          value={slot.to}
                          onChange={(e) => updateBlockedSlot(idx, "to", e.target.value)}
                        />
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeBlockedSlot(idx)}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Faculty Load */}
      <div className="card shadow-sm mb-3">
        <div className="card-header bg-white">
          <h5 className="mb-0 text-info">Faculty Load</h5>
        </div>
        <div className="card-body row g-3">
          <div className="col-md-4">
            <label className="form-label fw-semibold">Min Hours</label>
            <input
              type="number"
              className="form-control"
              value={facultyLoad.min_hours}
              onChange={(e) =>
                setFacultyLoad((prev) => ({ ...prev, min_hours: Number(e.target.value) }))
              }
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Max Hours</label>
            <input
              type="number"
              className="form-control"
              value={facultyLoad.max_hours}
              onChange={(e) =>
                setFacultyLoad((prev) => ({ ...prev, max_hours: Number(e.target.value) }))
              }
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Min Gap (minutes)</label>
            <input
              type="number"
              className="form-control"
              value={facultyLoad.min_gap_minutes}
              onChange={(e) =>
                setFacultyLoad((prev) => ({
                  ...prev,
                  min_gap_minutes: Number(e.target.value),
                }))
              }
            />
          </div>
        </div>
      </div>

      {/* Rooms */}
      <div className="card shadow-sm mb-3">
        <div className="card-header bg-white">
          <h5 className="mb-0 text-info">Rooms</h5>
        </div>
        <div className="card-body row g-3">
          <div className="col-md-6 d-flex align-items-center">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="overbooking"
                checked={rooms.allow_overbooking}
                onChange={(e) =>
                  setRooms((prev) => ({ ...prev, allow_overbooking: e.target.checked }))
                }
              />
              <label className="form-check-label ms-2" htmlFor="overbooking">
                Allow Overbooking
              </label>
            </div>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Max Over %</label>
            <input
              type="number"
              className="form-control"
              min={0}
              max={100}
              disabled={!rooms.allow_overbooking}
              value={rooms.max_over_percent}
              onChange={(e) =>
                setRooms((prev) => ({ ...prev, max_over_percent: Number(e.target.value) }))
              }
            />
          </div>
        </div>
      </div>

      {/* Survey Weights */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white">
          <h5 className="mb-0 text-info">Survey Weights</h5>
        </div>
        <div className="card-body row g-3">
          <div className="col-md-4 d-flex align-items-center">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="useRanked"
                checked={surveyWeights.use_ranked_courses}
                onChange={(e) =>
                  setSurveyWeights((prev) => ({ ...prev, use_ranked_courses: e.target.checked }))
                }
              />
              <label className="form-check-label ms-2" htmlFor="useRanked">
                Use Ranked Courses
              </label>
            </div>
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Min Votes to Open Section</label>
            <input
              type="number"
              className="form-control"
              value={surveyWeights.min_votes_to_open_section}
              onChange={(e) =>
                setSurveyWeights((prev) => ({
                  ...prev,
                  min_votes_to_open_section: Number(e.target.value),
                }))
              }
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Max Sections per Course</label>
            <input
              type="number"
              className="form-control"
              value={surveyWeights.max_sections_per_course}
              onChange={(e) =>
                setSurveyWeights((prev) => ({
                  ...prev,
                  max_sections_per_course: Number(e.target.value),
                }))
              }
            />
          </div>
        </div>
      </div>

      {/* Preview JSON */}
      <div className="card shadow-sm">
        <div className="card-header bg-white">
          <h6 className="mb-0 text-muted">Preview (JSON payload)</h6>
        </div>
        <pre className="m-0 p-3 small bg-light" style={{ whiteSpace: "pre-wrap" }}>
{JSON.stringify(rulesPayload, null, 2)}
        </pre>
      </div>
    </div>
  );
}
