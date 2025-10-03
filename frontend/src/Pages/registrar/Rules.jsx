import React, { useEffect, useState } from "react";
import { Card, Button, Modal, Form, Spinner } from "react-bootstrap";
import api from "../../Services/apiClient"; // ✅ نستخدم apiClient زي باقي الصفحات

export default function RulesPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  const [show, setShow] = useState(false);
  const [currentRule, setCurrentRule] = useState(null);
  const [saving, setSaving] = useState(false);

  // ✅ جلب الرولز
  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await api.get("/rules"); // ⚡ /api/ موجود في apiClient
      console.log("Rules API:", res.data);
      setRules(res.data); // لأنه Array مباشر
    } catch (err) {
      console.error("Error fetching rules:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ فتح المودال للتعديل
  const handleEdit = (rule) => {
    setCurrentRule({ ...rule });
    setShow(true);
  };

  // ✅ حفظ التعديلات
  const handleSave = async () => {
    if (!currentRule) return;
    setSaving(true);
    try {
      await api.patch(`/rules/${currentRule.id}`, currentRule);
      setShow(false);
      fetchRules(); // تحديث البيانات
    } catch (err) {
      console.error("Error updating rule:", err.response?.data || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3 text-info">System Rules</h3>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="info" />
        </div>
      ) : (
        <div className="row g-3">
          {rules.map((rule) => (
            <div className="col-md-6" key={rule.id}>
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <h5 className="text-info mb-3">Rule #{rule.id}</h5>
                  <p>
                    <strong>Work Start:</strong> {rule.work_start?.slice(0, 5)}
                  </p>
                  <p>
                    <strong>Work End:</strong> {rule.work_end?.slice(0, 5)}
                  </p>
                  <p>
                    <strong>Working Days:</strong>{" "}
                    {rule.working_days?.join(", ")}
                  </p>
                  <p>
                    <strong>Break:</strong> {rule.break_start?.slice(0, 5)} -{" "}
                    {rule.break_end?.slice(0, 5)}
                  </p>
                  <p>
                    <strong>Lecture Duration:</strong> {rule.lecture_duration}{" "}
                    min
                  </p>
                  <p>
                    <strong>Min Students / Section:</strong>{" "}
                    {rule.min_students_to_open_section}
                  </p>

                  <Button
                    variant="info"
                    className="text-white mt-2"
                    size="sm"
                    onClick={() => handleEdit(rule)}
                  >
                    Edit
                  </Button>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* 🔹 Modal التعديل */}
      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Rule</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentRule && (
            <Form>
              <Form.Group className="mb-2">
                <Form.Label>Work Start</Form.Label>
                <Form.Control
                  type="time"
                  value={currentRule.work_start}
                  onChange={(e) =>
                    setCurrentRule({
                      ...currentRule,
                      work_start: e.target.value,
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Work End</Form.Label>
                <Form.Control
                  type="time"
                  value={currentRule.work_end}
                  onChange={(e) =>
                    setCurrentRule({ ...currentRule, work_end: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Working Days (comma separated)</Form.Label>
                <Form.Control
                  type="text"
                  value={currentRule.working_days.join(", ")}
                  onChange={(e) =>
                    setCurrentRule({
                      ...currentRule,
                      working_days: e.target.value
                        .split(",")
                        .map((d) => d.trim()),
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Break Start</Form.Label>
                <Form.Control
                  type="time"
                  value={currentRule.break_start}
                  onChange={(e) =>
                    setCurrentRule({
                      ...currentRule,
                      break_start: e.target.value,
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Break End</Form.Label>
                <Form.Control
                  type="time"
                  value={currentRule.break_end}
                  onChange={(e) =>
                    setCurrentRule({
                      ...currentRule,
                      break_end: e.target.value,
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Lecture Duration (minutes)</Form.Label>
                <Form.Control
                  type="number"
                  value={currentRule.lecture_duration}
                  onChange={(e) =>
                    setCurrentRule({
                      ...currentRule,
                      lecture_duration: e.target.value,
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Min Students / Section</Form.Label>
                <Form.Control
                  type="number"
                  value={currentRule.min_students_to_open_section}
                  onChange={(e) =>
                    setCurrentRule({
                      ...currentRule,
                      min_students_to_open_section: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Cancel
          </Button>
          <Button
            variant="info"
            className="text-white"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <Spinner size="sm" animation="border" /> : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
