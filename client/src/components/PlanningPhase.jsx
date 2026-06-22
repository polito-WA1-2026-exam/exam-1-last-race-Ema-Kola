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

  const timerRef = useRef(null);
  const submittedRef = useRef(false);
  const hasInitRef = useRef(false); 

  const canonicalKey = (a, b) => [a, b].sort().join("|||");

  const selectedSegmentsRef = useRef(selectedSegments);
  const gameInfoRef = useRef(gameInfo);

  useEffect(() => {
    selectedSegmentsRef.current = selectedSegments;
  }, [selectedSegments]);

  useEffect(() => {
    gameInfoRef.current = gameInfo;
  }, [gameInfo]);

 
  const handleSubmit = (currentSegments) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    clearInterval(timerRef.current);
    onSubmit(currentSegments, gameInfoRef.current);
  };

  useEffect(() => {
    if (hasInitRef.current) return;
    hasInitRef.current = true;

    Promise.all([startGame(), getSegments()])
      .then(([info, segs]) => {
        setGameInfo(info);
        setSegments(segs);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not start the game. Please try again.");
        setLoading(false);
      });
  }, []);

  
  useEffect(() => {
    if (loading || error) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loading, error]);

  
  useEffect(() => {
    if (timeLeft === 0 && !loading && !error) {
      handleSubmit(selectedSegmentsRef.current);
    }
  }, [timeLeft, loading, error]);


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
            From <strong>{startStation}</strong> to{" "}
            <strong>{endStation}</strong>
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
            <SegmentList
              segments={segments}
              selected={selectedKeys}
              onToggle={handleToggle}
            />
          </div>

          <p className="mb-3" style={{ fontSize: 13 }}>
            <strong>{selectedSegments.length}</strong> segment
            {selectedSegments.length !== 1 ? "s" : ""} selected
          </p>

          <Button
            variant="primary"
            onClick={() => handleSubmit(selectedSegments)}
            disabled={selectedSegments.length === 0}
          >
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