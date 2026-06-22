import { useState, useEffect, useRef } from "react";
import { Button, Alert } from "react-bootstrap";
import { saveGame } from "../api/game";

function ResultPhase({ result, gameInfo, onPlayAgain }) {
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const hasSavedRef = useRef(false); // guards against Strict Mode double-invocation

  const { finalScore } = result;
  const { startStation, endStation } = gameInfo;

  useEffect(() => {
    if (hasSavedRef.current) return;
    hasSavedRef.current = true;

    saveGame(finalScore, startStation, endStation)
      .then(() => setSaved(true))
      .catch(() => setSaveError("Could not save your score this time."));
  }, []);

  
  const message =
    finalScore >= 25
      ? "Outstanding journey!"
      : finalScore >= 15
      ? "Well done!"
      : finalScore >= 5
      ? "You made it, barely."
      : finalScore === 0
      ? "Better luck next time."
      : "Rough ride.";

  return (
    <div className="text-center py-4">

      <h2 className="mt-3 mb-1">{finalScore} coins</h2>
      <p className="text-muted mb-1">{message}</p>
      <p style={{ fontSize: 13, color: "#888" }}>
        {startStation} → {endStation}
      </p>

      {!result.valid && (
        <Alert variant="warning" className="mt-3 text-start" style={{ maxWidth: 400, margin: "0 auto" }}>
          Your route was <strong>invalid</strong>
          {result.reason ? `: ${result.reason}` : "."} Score set to zero.
        </Alert>
      )}

      {saveError && (
        <Alert variant="danger" className="mt-2" style={{ maxWidth: 400, margin: "0 auto" }}>
          {saveError}
        </Alert>
      )}

      {saved && (
        <p className="text-success mt-2" style={{ fontSize: 13 }}>
          ✓ Score saved
        </p>
      )}

      <Button
        variant="primary"
        size="lg"
        className="mt-4"
        onClick={onPlayAgain}
      >
        Play again
      </Button>
    </div>
  );
}

export default ResultPhase;