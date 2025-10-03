import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../Services/apiClient";
import { useAuth } from "../../Hooks/AuthContext";

export default function StudentSurveys() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const fetchSurveys = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/surveys/available/${user.id}`);
        setSurveys(res.data);
      } catch (err) {
        console.error("Failed to load surveys:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSurveys();
  }, [user]);

  return (
    <div>
      <h2 className="mb-4 text-info">My Surveys</h2>

      {loading ? (
        <div className="text-center my-4">
          <div className="spinner-border text-info" />
        </div>
      ) : surveys.length > 0 ? (
        <div className="list-group">
          {surveys.map((s) => (
            <div
              key={s.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <div className="fw-bold">{s.title}</div>
                <small className="text-muted">
                  {new Date(s.start_date).toLocaleDateString()} -{" "}
                  {new Date(s.end_date).toLocaleDateString()}
                </small>
              </div>

              {s.has_voted ? (
                <span className="badge bg-success">✔ Voted</span>
              ) : (
                <button
                  className="btn btn-sm btn-info text-white"
                  onClick={() => navigate(`/student/surveys/${s.id}`)}
                >
                  Vote Now
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-warning">No available surveys</div>
      )}
    </div>
  );
}
