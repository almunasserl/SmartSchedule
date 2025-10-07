import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../Services/apiClient";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await apiClient.post("/auth/request-password-reset", { email });
      setMessage(res.data.message || "✅ Reset instructions sent to your email.");
    } catch (err) {
      setError(err.response?.data?.error || "❌ Failed to send reset link");
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
        <h3 className="text-center mb-4 text-info">Forgot Password</h3>

        {message && <div className="alert alert-success">{message}</div>}
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

          <button
            type="submit"
            className="btn btn-info w-100 text-white fw-bold"
            disabled={loading}
          >
            {loading && (
              <span className="spinner-border spinner-border-sm me-2"></span>
            )}
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          {/* 🔗 Link to Reset Password page */}
          <div className="text-center mt-3">
            <button
              type="button"
              className="btn btn-link text-info text-decoration-none fw-semibold"
              onClick={() => navigate("/reset-password")}
            >
              Go to Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
