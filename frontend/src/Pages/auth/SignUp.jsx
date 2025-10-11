import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../../Services/apiClient";

export default function SignUp() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
    name: "",
    level_id: "",
    dept_id: "",
  });
  const [levels, setLevels] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // ✅ Fetch levels and departments once
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [levelsRes, deptRes] = await Promise.all([
          apiClient.get("/dropdowns/terms"),
          apiClient.get("/dropdowns/departments"),
        ]);
        setLevels(levelsRes.data);
        setDepartments(deptRes.data);
      } catch {
        setLevels([]);
        setDepartments([]);
      }
    };
    fetchDropdowns();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      // Add optional fields based on role
      if (formData.role === "student") {
        payload.name = formData.name;
        payload.level_id = formData.level_id;
        payload.dept_id = formData.dept_id;
      } else if (formData.role === "faculty") {
        payload.name = formData.name;
        payload.dept_id = formData.dept_id;
      }

      const res = await apiClient.post("auth/signup", payload);
      setSuccess("✅ Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("Sign up error:", err);
      setError(err.response?.data?.error || "❌ Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-info">
      <div
        className="card shadow p-4 bg-white"
        style={{ minWidth: "350px", borderRadius: "15px" }}
      >
        <h3 className="text-center mb-4 text-info">SmartSchedule Sign Up</h3>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-3">
            <label className="form-label fw-bold">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label fw-bold">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Role */}
          <div className="mb-3">
            <label className="form-label fw-bold">Role</label>
            <select
              className="form-select"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="">Select Role</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="registrar">Registrar</option>
              <option value="committee">Committee</option>
            </select>
          </div>

          {/* Name for student/faculty */}
          {(formData.role === "student" || formData.role === "faculty") && (
            <div className="mb-3">
              <label className="form-label fw-bold">Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter your name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          {/* Department for student/faculty */}
          {(formData.role === "student" || formData.role === "faculty") && (
            <div className="mb-3">
              <label className="form-label fw-bold">Department</label>
              <select
                className="form-select"
                name="dept_id"
                value={formData.dept_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Level for student only */}
          {formData.role === "student" && (
            <div className="mb-3">
              <label className="form-label fw-bold">Level</label>
              <select
                className="form-select"
                name="level_id"
                value={formData.level_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Level</option>
                {levels.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-info w-100 text-white fw-bold"
            disabled={loading}
          >
            {loading && (
              <span className="spinner-border spinner-border-sm me-2"></span>
            )}
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="text-center mt-3">
          <span className="small">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-decoration-none text-info fw-semibold"
            >
              Login here
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
