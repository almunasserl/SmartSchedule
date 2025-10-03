import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../Services/apiClient";

export default function ResetPassword() {
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
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
      const res = await apiClient.post("/auth/reset-password", {
        resetToken,
        newPassword,
      });
      setMessage(res.data.message || "✅ Password reset successfully!");

      // تحويل المستخدم للـ login بعد نجاح العملية
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "❌ Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-info">
      <div className="card shadow p-4 bg-white" style={{ minWidth: "350px", borderRadius: "15px" }}>
        <h3 className="text-center mb-4 text-info">Reset Password</h3>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold">Reset Token</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter reset token"
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">New Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-info w-100 text-white fw-bold" disabled={loading}>
            {loading && <span className="spinner-border spinner-border-sm me-2"></span>}
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
