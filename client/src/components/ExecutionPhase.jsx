import { useState, useEffect, useRef } from "react";
import { Button, Spinner, Alert, Badge, Card } from "react-bootstrap";
import { executeGame } from "../api/game";

function ExecutionPhase({ segments,  onFinish }) {
  const [result, setResult] = useState(null);       
  const [currentStep, setCurrentStep] = useState(0); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const hasCalledRef = useRef(false); 

  useEffect(() => {
    if (hasCalledRef.current) return;
    hasCalledRef.current = true;

    executeGame(segments)
      .then((data) => {
        setResult(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Something went wrong during the journey. Please try again.");
        setLoading(false);
      });
  }, [segments]);

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" />
        <p className="mt-2 text-muted">Executing your route…</p>
      </div>
    );
  }

  if (error) return <Alert variant="danger">{error}</Alert>;


  if (!result.valid) {
    return (
      <div>
        <Alert variant="danger">
          <strong>Invalid route.</strong>{" "}
          {result.reason || "Your route could not be completed."}
        </Alert>
        <p className="text-muted" style={{ fontSize: 14 }}>
          You lose all your coins for an invalid route.
        </p>
        <Button variant="primary" onClick={() => onFinish(result)}>
          See result →
        </Button>
      </div>
    );
  }

  
  const steps = result.steps;
  const shownSteps = steps.slice(0, currentStep + 1);
  const isLast = currentStep === steps.length - 1;
  const currentCoins = shownSteps[shownSteps.length - 1]?.coins ?? 20;

  const effectColor = (effect) => {
    if (effect > 0) return "success";
    if (effect < 0) return "danger";
    return "secondary";
  };

  const effectLabel = (effect) => {
    if (effect > 0) return `+${effect}`;
    if (effect < 0) return `${effect}`;
    return "±0";
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Your journey</h5>
        <Badge bg={currentCoins >= 20 ? "success" : currentCoins > 0 ? "warning" : "danger"}
          style={{ fontSize: 16, padding: "6px 12px" }}>
          {currentCoins} coins
        </Badge>
      </div>

      <div className="mb-3" style={{ maxHeight: 500, overflowY: "auto" }}>
        {shownSteps.map((step, i) => (
          <Card
            key={i}
            className="mb-2"
            border={i === currentStep ? "primary" : undefined}
          >
            <Card.Body className="py-2 px-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <span style={{ fontSize: 13, color: "#666" }}>
                    Step {i + 1}
                  </span>
                  <div style={{ fontSize: 14 }}>
                    <strong>{step.from}</strong>
                    <span className="mx-2">→</span>
                    <strong>{step.to}</strong>
                  </div>
                  <div className="text-muted" style={{ fontSize: 13 }}>
                    {step.event}
                  </div>
                </div>
                <div className="text-end">
                  <Badge bg={effectColor(step.effect)} className="mb-1">
                    {effectLabel(step.effect)}
                  </Badge>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    Total: {step.coins}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>

      {!isLast ? (
        <Button
          variant="primary"
          onClick={() => setCurrentStep((s) => s + 1)}
        >
          Next step →
        </Button>
      ) : (
        <Button
          variant="success"
          onClick={() => onFinish(result)}
        >
          See final result →
        </Button>
      )}
    </div>
  );
}

export default ExecutionPhase;