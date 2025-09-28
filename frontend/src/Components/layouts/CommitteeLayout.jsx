// src/layouts/CommitteeLayout.jsx
import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

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
      <span aria-hidden="true" style={{ display: "inline-grid", placeItems: "center" }}>
        {icon}
      </span>
      <span className="text-truncate">{label}</span>
    </NavLink>
  );
}

export default function CommitteeLayout({ userEmail, onLogout }) {
  const navigate = useNavigate();
  const email =
    userEmail ||
    (typeof window !== "undefined" &&
      (JSON.parse(localStorage.getItem("user") || "{}").email ||
        localStorage.getItem("email"))) ||
    "";

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("email");
      navigate("/login");
    }
  };

  return (
    <div className="container-fluid">
      <div className="row flex-nowrap min-vh-100">
        {/* Sidebar (lg+) */}
        <aside className="col-lg-2 d-none d-lg-flex bg-info text-white p-3 flex-column">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="h3 mb-0">SmartSchedule</span>
          </div>

          <nav className="mt-3">
            <ul className="nav nav-pills flex-column mb-auto gap-1">
              <li>
                <SideLink
                  to="/committee"
                  label="Dashboard"
                  icon={
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" />
                    </svg>
                  }
                />
              </li>
              <li>
                <SideLink
                  to="/committee/students"
                  label="Students"
                  icon={
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 
                        1.79-4 4 1.79 4 4 4zm0 2c-2.67 
                        0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  }
                />
              </li>
              <li>
                <SideLink
                  to="/committee/sections"
                  label="Sections"
                  icon={
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 
                        0h8V11h-8v10zm0-18v6h8V3h-8z" />
                    </svg>
                  }
                />
              </li>

              {/* NEW: Schedules */}
              <li>
                <SideLink
                  to="/committee/schedules"
                  label="Schedules"
                  icon={
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M7 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7zm12 7H5v10h14V9z" />
                      <path d="M7 12h5v2H7zM14 12h3v2h-3z" />
                    </svg>
                  }
                />
              </li>

              <li>
                <SideLink
                  to="/committee/survey"
                  label="Survey"
                  icon={
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M3 3h18v2H3zm0 4h12v2H3zm0 
                        4h18v2H3zm0 4h12v2H3zm0 4h18v2H3z" />
                    </svg>
                  }
                />
              </li>
              <li>
                <SideLink
                  to="/committee/rules"
                  label="Rules"
                  icon={
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M4 6h16v2H4zm0 5h16v2H4zm0 
                        5h16v2H4z" />
                    </svg>
                  }
                />
              </li>
              <li>
                <SideLink
                  to="/committee/notifications"
                  label="Notifications"
                  icon={
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M12 22c1.1 0 2-.9 2-2H10c0 
                        1.1.9 2 2 2zm6-6V9c0-3.1-1.6-5.6-4.5-6.3V2h-3v.7C7.6 
                        3.4 6 5.9 6 9v7l-2 2v1h16v-1l-2-2z" />
                    </svg>
                  }
                />
              </li>
            </ul>
          </nav>

          {/* Logout */}
          <div className="mt-auto">
            <button type="button" className="btn btn-outline-light w-100" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </aside>

        {/* Offcanvas sidebar (mobile/tablet) */}
        <div
          className="offcanvas offcanvas-start text-white bg-info"
          tabIndex={-1}
          id="committeeOffcanvas"
          aria-labelledby="committeeOffcanvasLabel"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="committeeOffcanvasLabel">
              SmartSchedule
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body">
            <ul className="nav nav-pills flex-column mb-auto gap-1">
              <li data-bs-dismiss="offcanvas">
                <SideLink to="/committee" label="Dashboard" icon="🏠" />
              </li>
              <li data-bs-dismiss="offcanvas">
                <SideLink to="/committee/students" label="Students" icon="👨‍🎓" />
              </li>
              <li data-bs-dismiss="offcanvas">
                <SideLink to="/committee/sections" label="Sections" icon="🗂️" />
              </li>
              {/* NEW: Schedules */}
              <li data-bs-dismiss="offcanvas">
                <SideLink to="/committee/schedules" label="Schedules" icon="🗓️" />
              </li>
              <li data-bs-dismiss="offcanvas">
                <SideLink to="/committee/survey" label="Survey" icon="📝" />
              </li>
              <li data-bs-dismiss="offcanvas">
                <SideLink to="/committee/rules" label="Rules" icon="⚙️" />
              </li>
              <li data-bs-dismiss="offcanvas">
                <SideLink to="/committee/notifications" label="Notifications" icon="🔔" />
              </li>
            </ul>

            {/* Logout inside offcanvas */}
            <button
              type="button"
              className="btn btn-outline-light w-100 mt-3"
              onClick={handleLogout}
              data-bs-dismiss="offcanvas"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Column */}
        <div className="col px-0 d-flex flex-column">
          {/* Top navbar */}
          <nav className="navbar navbar-light bg-light px-3 shadow-sm sticky-top">
            {/* Hamburger icon (mobile) */}
            <button
              type="button"
              className="p-0 border-0 bg-transparent d-lg-none me-2 text-info d-inline-flex align-items-center justify-content-center"
              style={{ width: 40, height: 40 }}
              data-bs-toggle="offcanvas"
              data-bs-target="#committeeOffcanvas"
              aria-controls="committeeOffcanvas"
            >
              <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                <path d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z" />
              </svg>
            </button>

            <span className="navbar-brand mb-0 h4">Committee Dashboard</span>

            {/* user email */}
            <div className="ms-auto">
              <span
                className="d-inline-block text-primary fw-semibold text-truncate"
                style={{ maxWidth: 260 }}
                title={email}
              >
                {email || " "}
              </span>
            </div>
          </nav>

          {/* Content */}
          <main className="p-3 p-md-4 bg-light flex-grow-1">
            <Outlet />
          </main>

          {/* Footer */}
          <footer className="bg-white border-top text-muted small py-2 px-3 text-center">
            © {new Date().getFullYear()} SmartSchedule
          </footer>
        </div>
      </div>
    </div>
  );
}
