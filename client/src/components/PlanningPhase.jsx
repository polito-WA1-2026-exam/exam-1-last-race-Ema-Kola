import { useState, useEffect, useRef } from "react";
import { Button, Spinner, Alert, Badge } from "react-bootstrap";
import NetworkMap from "../components/NetworkMap";
import SegmentList from "../components/SegmentList";
import { getSegments } from "../api/network";
import { startGame } from "../api/game";

const PLANNING_SECONDS = 90;

function PlanningPhase({ onSubmit }) {
  const [gameInfo, setGameInfo] = useState(null);
  const [segments, setSegments] = useState([]);

  const [selectedSegments, setSelectedSegments] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(PLANNING_SECONDS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const submittedRef = useRef(false);

  const canonicalKey = (a, b) => [a, b].sort().join("|||");
  useEffect(() => {
    let ignore = false;

    Promise.all([startGame(), getSegments()])
      .then(([info, segs]) => {
        if (ignore) return;
        setGameInfo(info);
        setSegments(segs);
        setLoading(false);
      })
      .catch(() => {
        if (ignore) return;
        setError("Could not start the game. Please try again.");
        setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);
  
  useEffect(() => {
    if (loading || error || timeLeft <= 0) return;

    const id = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(id);
  }, [timeLeft, loading, error]);

  useEffect(() => {
    if (loading || error || submittedRef.current) return;
    if (timeLeft === 0) {
      submittedRef.current = true;
      onSubmit(selectedSegments, gameInfo);
    }
  }, [timeLeft, loading, error, selectedSegments, gameInfo, onSubmit]);

  const handleSubmitClick = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    onSubmit(selectedSegments, gameInfo);
  };

  const handleToggle = (s1, s2) => {
    const key = canonicalKey(s1, s2);

    if (selectedKeys.has(key)) {
      setSelectedSegments((segs) => segs.filter(([a, b]) => canonicalKey(a, b) !== key));
      setSelectedKeys((k) => {
        const next = new Set(k);
        next.delete(key);
        return next;
      });
    } else {
      setSelectedSegments((segs) => [...segs, [s1, s2]]);
      setSelectedKeys((k) => new Set([...k, key]));
    }
  };

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  const { startStation, endStation } = gameInfo;
  const timerVariant = timeLeft <= 15 ? "danger" : timeLeft <= 30 ? "warning" : "success";

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
        <div>
          <h5 className="mb-1">Plan your route</h5>
          <p className="mb-0" style={{ fontSize: 14 }}>
            From <strong>{startStation}</strong> to <strong>{endStation}</strong>
          </p>
        </div>
        <div className="text-end">
          <Badge bg={timerVariant} style={{ fontSize: 18, padding: "8px 14px" }}>
            ⏱ {timeLeft}s
          </Badge>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-5">
          <p className="text-muted mb-2" style={{ fontSize: 12 }}>
            Stations only — lines are hidden.
          </p>
          <NetworkMap mode="stations" />
        </div>

        <div className="col-md-7">
          <div className="mb-3">
            <SegmentList segments={segments} selected={selectedKeys} onToggle={handleToggle} />
          </div>

          <p className="mb-3" style={{ fontSize: 13 }}>
            <strong>{selectedSegments.length}</strong> segment
            {selectedSegments.length !== 1 ? "s" : ""} selected
          </p>

          <Button variant="primary" onClick={handleSubmitClick} disabled={selectedSegments.length === 0}>
            Submit route
          </Button>
          <span className="text-muted ms-3" style={{ fontSize: 13 }}>
            Route auto-submits when time runs out.
          </span>
        </div>
      </div>
    </div>
  );
}

export default PlanningPhase;