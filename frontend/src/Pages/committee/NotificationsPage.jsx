// src/pages/committee/NotificationsPage.jsx
import React, { useMemo, useState } from "react";
import { Offcanvas, Button } from "react-bootstrap";

const AUDIENCES = ["All", "Students", "Faculty", "Committee"];
const PRIORITIES = ["Normal", "Important", "Urgent"];

export default function NotificationsPage() {
  // ===== Dummy data (no section/schedule) =====
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Midterm Schedule Released",
      message: "Please check the midterm exam schedule under the Exams section.",
      audience: "Students",
      priority: "Important",
      status: "Published", // Draft | Published
      createdAt: "2025-09-20 10:30",
      levelFilter: null, // optional: 1..4 or null
    },
    {
      id: 2,
      title: "Faculty Load Review Meeting",
      message: "A meeting will be held on Monday at 12:00 to review workloads.",
      audience: "Faculty",
      priority: "Normal",
      status: "Draft",
      createdAt: "2025-09-22 08:00",
      levelFilter: null,
    },
    {
      id: 3,
      title: "Survey: Elective Courses Preferences",
      message: "Please submit your preferences for elective courses this week.",
      audience: "Students",
      priority: "Urgent",
      status: "Published",
      createdAt: "2025-09-24 09:15",
      levelFilter: null,
    },
  ]);

  // ===== Filters/Search =====
  const [search, setSearch] = useState("");
  const [audFilter, setAudFilter] = useState("All");

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      const matchesText = n.title.toLowerCase().includes(search.toLowerCase());
      const matchesAud = audFilter === "All" ? true : n.audience === audFilter;
      return matchesText && matchesAud;
    });
  }, [notifications, search, audFilter]);

  // ===== Offcanvas (Create/Edit) =====
  const [showEdit, setShowEdit] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    id: null,
    title: "",
    message: "",
    audience: "All",
    priority: "Normal",
    status: "Draft",
    levelFilter: "", // optional level (1..4)
  });

  const openCreate = () => {
    setIsEditing(false);
    setForm({
      id: null,
      title: "",
      message: "",
      audience: "All",
      priority: "Normal",
      status: "Draft",
      levelFilter: "",
    });
    setShowEdit(true);
  };

  const openEdit = (n) => {
    setIsEditing(true);
    setForm({
      id: n.id,
      title: n.title,
      message: n.message,
      audience: n.audience,
      priority: n.priority,
      status: n.status,
      levelFilter: n.levelFilter ?? "",
    });
    setShowEdit(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.message.trim()) {
      alert("Title and message are required.");
      return;
    }
    const nowStr = new Date()
      .toLocaleString("en-GB", { hour12: false })
      .replace(",", "");

    if (isEditing) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === form.id
            ? {
                ...n,
                title: form.title,
                message: form.message,
                audience: form.audience,
                priority: form.priority,
                status: form.status,
                levelFilter: form.levelFilter || null,
              }
            : n
        )
      );
    } else {
      const newId = notifications.length
        ? Math.max(...notifications.map((x) => x.id)) + 1
        : 1;
      setNotifications((prev) => [
        ...prev,
        {
          id: newId,
          title: form.title,
          message: form.message,
          audience: form.audience,
          priority: form.priority,
          status: form.status, // Draft unless changed
          createdAt: nowStr,
          levelFilter: form.levelFilter || null,
        },
      ]);
    }
    setShowEdit(false);
  };

  // ===== Actions =====
  const publish = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "Published" } : n))
    );
  };
  const unpublish = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "Draft" } : n))
    );
  };
  const remove = (id) => {
    if (window.confirm("Delete this notification?")) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  };

  // ===== Badges helpers =====
  const priorityBadge = (p) =>
    p === "Urgent" ? "bg-danger" : p === "Important" ? "bg-warning text-dark" : "bg-secondary";
  const statusBadge = (s) => (s === "Published" ? "bg-success" : "bg-secondary");

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Notifications</h2>

        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search by title..."
            style={{ maxWidth: 260 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="form-select"
            style={{ maxWidth: 180 }}
            value={audFilter}
            onChange={(e) => setAudFilter(e.target.value)}
          >
            {AUDIENCES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <Button variant="primary" onClick={openCreate}>
            + New Notification
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm p-3">
        <h5 className="mb-3 text-info">All Notifications</h5>
        <div className="table-responsive">
          <table className="table table-bordered table-striped text-center align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: 70 }}>ID</th>
                <th>Title</th>
                <th style={{ width: 120 }}>Audience</th>
                <th style={{ width: 120 }}>Priority</th>
                <th style={{ width: 160 }}>Created At</th>
                <th style={{ width: 120 }}>Status</th>
                <th style={{ width: 260 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((n) => (
                <tr key={n.id}>
                  <td>{n.id}</td>
                  <td className="text-start">{n.title}</td>
                  <td>{n.audience}</td>
                  <td>
                    <span className={`badge ${priorityBadge(n.priority)}`}>{n.priority}</span>
                  </td>
                  <td>{n.createdAt}</td>
                  <td>
                    <span className={`badge ${statusBadge(n.status)}`}>{n.status}</span>
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-2 justify-content-center">
                      {n.status === "Published" ? (
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => unpublish(n.id)}
                        >
                          Unpublish
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => publish(n.id)}
                        >
                          Publish
                        </button>
                      )}
                      <button className="btn btn-sm btn-warning" onClick={() => openEdit(n)}>
                        Edit
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => remove(n.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-muted">
                    No notifications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Offcanvas: Create/Edit (no section/schedule) */}
      <Offcanvas show={showEdit} onHide={() => setShowEdit(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{isEditing ? "Edit Notification" : "New Notification"}</Offcanvas.Title>
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

          <div className="mb-3">
            <label className="form-label">Message</label>
            <textarea
              className="form-control"
              rows={5}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            />
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label">Audience</label>
              <select
                className="form-select"
                value={form.audience}
                onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value }))}
              >
                {AUDIENCES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional: limit by level */}
          <div className="mb-3">
            <label className="form-label">Level (optional)</label>
            <select
              className="form-select"
              value={form.levelFilter}
              onChange={(e) => setForm((f) => ({ ...f, levelFilter: e.target.value }))}
            >
              <option value="">All Levels</option>
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
              <option value="4">Level 4</option>
            </select>
          </div>

          <div className="d-flex gap-2">
            <Button className="flex-fill" onClick={handleSave}>
              {isEditing ? "Save Changes" : "Create"}
            </Button>
            <Button
              variant="outline-secondary"
              className="flex-fill"
              onClick={() => setShowEdit(false)}
            >
              Cancel
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}
