import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../Services/apiClient";
import { useAuth } from "../../Hooks/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await apiClient.post("/auth/login", { email, password });
      if (res.data.token) {
        login(res.data.token);
        setSuccess("✅ Login successful! Redirecting...");
        setTimeout(() => {
          const decoded = JSON.parse(atob(res.data.token.split(".")[1]));
          if (decoded.role === "faculty") navigate("/faculty");
          else if (decoded.role === "registrar" || decoded.role === "committee") navigate("/registrar");
          else if (decoded.role === "student") navigate("/student");
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.error || "❌ Invalid email or password");
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
        <h3 className="text-center mb-4 text-info">SmartSchedule Login</h3>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-info w-100 text-white fw-bold"
            disabled={loading}
          >
            {loading && (
              <span className="spinner-border spinner-border-sm me-2"></span>
            )}
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
