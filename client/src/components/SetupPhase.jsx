import { Button } from "react-bootstrap";
import NetworkMap from "../components/NetworkMap";

function SetupPhase({ onReady }) {
  return (
    <div>
      <h5 className="mb-1">Study the network</h5>
      <p className="text-muted mb-3" style={{ fontSize: 14 }}>
        Memorise the lines and connections. When you are ready, click{" "}
        <strong>Ready to play</strong> — the 90-second planning timer will
        start.
      </p>

      <NetworkMap mode="full" />

      <div className="mt-3">
        <Button variant="success" size="lg" onClick={onReady}>
          Ready to play →
        </Button>
      </div>
    </div>
  );
}

export default SetupPhase;