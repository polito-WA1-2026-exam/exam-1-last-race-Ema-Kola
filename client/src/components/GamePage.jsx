import { useState, useContext } from "react";
import { Navigate } from "react-router";
import { Container, Card } from "react-bootstrap";
import UserContext from "../contexts/UserContext";
import SetupPhase from "../components/SetupPhase";
import PlanningPhase from "../components/PlanningPhase";
import ExecutionPhase from "../components/ExecutionPhase";
import ResultPhase from "../components/ResultPhase";


const PHASE = {
  SETUP: "setup",
  PLANNING: "planning",
  EXECUTION: "execution",
  RESULT: "result",
};

function GamePage() {
  const user = useContext(UserContext);

  const [phase, setPhase] = useState(PHASE.SETUP);
  const [gameInfo, setGameInfo] = useState(null); 
  const [segments, setSegments] = useState([]);   
  const [result, setResult] = useState(null);     

  if (!user) return <Navigate to="/login" />;

 
  const handleReady = () => {
    setPhase(PHASE.PLANNING);
  };


  const handleRouteSubmit = (submittedSegments, info) => {
    setSegments(submittedSegments);
    setGameInfo(info);
    setPhase(PHASE.EXECUTION);
  };

 
  const handleExecutionFinish = (executionResult) => {
    setResult(executionResult);
    setPhase(PHASE.RESULT);
  };

 
  const handlePlayAgain = () => {
    setPhase(PHASE.SETUP);
    setGameInfo(null);
    setSegments([]);
    setResult(null);
  };

  const phaseLabel = {
    [PHASE.SETUP]: "1 · Study the network",
    [PHASE.PLANNING]: "2 · Plan your route",
    [PHASE.EXECUTION]: "3 · Journey",
    [PHASE.RESULT]: "4 · Result",
  };

  return (
    <Container style={{ maxWidth: 860, marginTop: "1rem" }}>
  
      <div className="d-flex gap-2 mb-3">
        {Object.values(PHASE).map((p) => (
          <span
            key={p}
            style={{
              fontSize: 12,
              padding: "3px 10px",
              borderRadius: 20,
              background: phase === p ? "#0d6efd" : "#e9ecef",
              color: phase === p ? "#fff" : "#666",
              fontWeight: phase === p ? 600 : 400,
            }}
          >
            {phaseLabel[p]}
          </span>
        ))}
      </div>

      <Card className="shadow-sm">
        <Card.Body className="p-4">
          {phase === PHASE.SETUP && (
            <SetupPhase onReady={handleReady} />
          )}
          {phase === PHASE.PLANNING && (
            <PlanningPhase onSubmit={handleRouteSubmit} />
          )}
          {phase === PHASE.EXECUTION && (
            <ExecutionPhase
              segments={segments}
              gameInfo={gameInfo}
              onFinish={handleExecutionFinish}
            />
          )}
          {phase === PHASE.RESULT && (
            <ResultPhase
              result={result}
              gameInfo={gameInfo}
              onPlayAgain={handlePlayAgain}
            />
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default GamePage;