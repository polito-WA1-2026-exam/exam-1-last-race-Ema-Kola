import { Button, Alert } from "react-bootstrap";

function ResultPhase({ result, gameInfo, onPlayAgain }) {
  const { finalScore } = result;
  const { startStation, endStation } = gameInfo;


  
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