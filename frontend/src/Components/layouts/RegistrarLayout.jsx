// src/layouts/RegistrarLayout.jsx
import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../Hooks/AuthContext";

function SideLink({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        "nav-link d-flex align-items-center gap-2 position-relative rounded-3 px-3 py-2 " +
        (isActive ? "bg-white text-info fw-semibold" : "text-white")
      }
    >
      <span
        aria-hidden="true"
        style={{ display: "inline-grid", placeItems: "center" }}
      >
        {icon}
      </span>
      <span className="text-truncate">{label}</span>
    </NavLink>
  );
}

export default function RegistrarLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="container-fluid">
      <div className="row flex-nowrap min-vh-100">
        {/* Sidebar */}
        <aside className="col-lg-2 d-none d-lg-flex bg-info text-white p-3 flex-column">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="h3 mb-0">SmartSchedule</span>
          </div>

          <nav>
            <ul className="nav nav-pills flex-column mb-auto gap-1">
              {/* 👥 Committee Menu */}
              {user?.role === "committee" && (
                <>
                  <li>
                    <SideLink
                      to="/registrar"
                      label="Dashboard"
                      icon={
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" />
                        </svg>
                      }
                    />
                  </li>

                  <li>
                    <SideLink
                      to="/registrar/schedules"
                      label="Schedules"
                      icon={
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M3 4h18v2H3zM3 10h18v2H3zM3 16h18v2H3z" />
                        </svg>
                      }
                    />
                  </li>

                  <li>
                    <SideLink
                      to="/registrar/sections"
                      label="Sections"
                      icon={
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2 1 7l11 5 11-5z" />
                          <path d="M1 12l11 5 11-5v3l-11 5L1 15z" />
                        </svg>
                      }
                    />
                  </li>

                  <li>
                    <SideLink
                      to="/registrar/courses"
                      label="Courses"
                      icon={
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M4 3h12a3 3 0 0 1 3 3v14h-2V6a1 1 0 0 0-1-1H4z" />
                          <path d="M4 5h10a2 2 0 0 1 2 2v13H6a2 2 0 0 1-2-2z" />
                        </svg>
                      }
                    />
                  </li>

                  <li>
                    <SideLink
                      to="/registrar/surveys"
                      label="Surveys"
                      icon={
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M4 4h16v11H7l-3 3z" />
                        </svg>
                      }
                    />
                  </li>

                  <li>
                    <SideLink
                      to="/registrar/feedback"
                      label="Feedback"
                      icon={
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M2 2h20v14H6l-4 4z" />
                        </svg>
                      }
                    />
                  </li>

                  <li>
                    <SideLink
                      to="/registrar/notifications"
                      label="Notifications"
                      icon={
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zm6-6V11c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1z" />
                        </svg>
                      }
                    />
                  </li>

                  <li>
                    <SideLink
                      to="/registrar/rules"
                      label="Rules"
                      icon={
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M3 6h18v2H3zM3 12h18v2H3zM3 18h18v2H3z" />
                        </svg>
                      }
                    />
                  </li>
                </>
              )}

              {/* 👩‍💼 Registrar Menu — فقط يظهر هذا */}
              {user?.role === "registrar" && (
                <li>
                  <SideLink
                    to="/registrar/irregular-students"
                    label="Irregular Students"
                    icon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8 0a8 8 0 1 0 8 8A8.009 8.009 0 0 0 8 0zM3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                      </svg>
                    }
                  />
                </li>
              )}
            </ul>
          </nav>

          {/* Logout */}
          <div className="mt-auto">
            <button
              type="button"
              className="btn btn-outline-light w-100"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </aside>

        {/* ====== Main Layout Area ====== */}
        <div className="col px-0 d-flex flex-column">
          <nav className="navbar navbar-light bg-light px-3 shadow-sm sticky-top">
            <span className="navbar-brand mb-0 h4">Registrar Dashboard</span>
            <div className="ms-auto">
              <span
                className="d-inline-block text-primary fw-semibold text-truncate"
                style={{ maxWidth: 260 }}
                title={user?.email}
              >
                {user?.email || ""}
              </span>
            </div>
          </nav>

          <main className="p-3 p-md-4 bg-light flex-grow-1">
            <Outlet />
          </main>

          <footer className="bg-white border-top text-muted small py-2 px-3 text-center">
            © {new Date().getFullYear()} SmartSchedule
          </footer>
        </div>
      </div>
    </div>
  );
}
