import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../Services/apiClient";
import { useAuth } from "../../Hooks/AuthContext";

export default function StudentSurveyDetails() {
  const { surveyId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [survey, setSurvey] = useState(null);
  const [electives, setElectives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [choices, setChoices] = useState({
    first_choice: "",
    second_choice: "",
    third_choice: "",
  });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/surveys/${surveyId}`);
        setSurvey(res.data.survey);
        setElectives(res.data.electives);
      } catch (err) {
        console.error("Failed to load survey details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSurvey();
  }, [surveyId]);

  const handleVote = async () => {
    if (
      !choices.first_choice ||
      !choices.second_choice ||
      !choices.third_choice
    ) {
      setMessage({
        type: "danger",
        text: "❌ Please select all three choices.",
      });
      return;
    }

    try {
      setMessage(null);
      await apiClient.post(`/surveys/${surveyId}/vote`, {
        student_id: user.id,
        ...choices,
      });
      setMessage({ type: "success", text: "✅ Vote submitted successfully!" });
      setTimeout(() => navigate("/student/surveys"), 2000);
    } catch (err) {
      setMessage({
        type: "danger",
        text: err.response?.data?.error || "❌ Failed to submit vote",
      });
    }
  };

  return (
    <div>
      {loading ? (
        <div className="text-center my-4">
          <div className="spinner-border text-info" />
        </div>
      ) : survey ? (
        <div>
          <h2 className="mb-3 text-info">{survey.title}</h2>
          <p className="text-muted">
            {new Date(survey.start_date).toLocaleDateString()} -{" "}
            {new Date(survey.end_date).toLocaleDateString()}
          </p>

          {message && (
            <div className={`alert alert-${message.type}`}>{message.text}</div>
          )}

          <div className="card p-3 shadow-sm">
            <h5 className="mb-3">Select Your Preferences</h5>

            <div className="mb-3">
              <label className="form-label">First Choice</label>
              <select
                className="form-select"
                value={choices.first_choice}
                onChange={(e) =>
                  setChoices({ ...choices, first_choice: e.target.value })
                }
              >
                <option value="">-- Select --</option>
                {electives.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Second Choice</label>
              <select
                className="form-select"
                value={choices.second_choice}
                onChange={(e) =>
                  setChoices({ ...choices, second_choice: e.target.value })
                }
              >
                <option value="">-- Select --</option>
                {electives.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Third Choice</label>
              <select
                className="form-select"
                value={choices.third_choice}
                onChange={(e) =>
                  setChoices({ ...choices, third_choice: e.target.value })
                }
              >
                <option value="">-- Select --</option>
                {electives.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-info text-white fw-bold w-100"
              onClick={handleVote}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Vote"}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-muted">Survey not found.</p>
      )}
    </div>
  );
}
