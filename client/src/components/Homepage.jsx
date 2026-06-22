import { useContext } from "react";
import { Link } from "react-router";
import { Container, Card, Button, Row, Col } from "react-bootstrap";
import UserContext from "../contexts/UserContext";

function HomePage() {
  const user = useContext(UserContext);

  return (
    <Container style={{ maxWidth: 720, marginTop: "2rem" }}>
      <div className="text-center mb-4">
        <h1> Last Race</h1>
        <p className="text-muted lead">
          Navigate the Film Metro before time runs out.
        </p>
        {user ? (
          <Button as={Link} to="/game" variant="primary" size="lg">
            Play now
          </Button>
        ) : (
          <Button as={Link} to="/login" variant="primary" size="lg">
            Log in to play
          </Button>
        )}
      </div>

      <Card className="mb-3">
        <Card.Body>
          <h5>How to play</h5>
          <Row className="g-3 mt-1">
            <Col md={6}>
              <div className="d-flex gap-3">
                <div style={{ fontSize: 24 }}></div>
                <div>
                  <strong>1. Setup</strong>
                  <p className="text-muted mb-0" style={{ fontSize: 14 }}>
                    Study the full metro network — all lines, stations, and
                    connections. Take your time before the timer starts.
                  </p>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className="d-flex gap-3">
                <div style={{ fontSize: 24 }}></div>
                <div>
                  <strong>2. Planning (90 seconds)</strong>
                  <p className="text-muted mb-0" style={{ fontSize: 14 }}>
                    You are given a start and destination station. Build your
                    route by selecting segments from a list — the lines are
                    hidden. Work fast!
                  </p>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className="d-flex gap-3">
                <div style={{ fontSize: 24 }}></div>
                <div>
                  <strong>3. Execution</strong>
                  <p className="text-muted mb-0" style={{ fontSize: 14 }}>
                    Each segment of your journey triggers a random event — good
                    or bad. Watch your coin total change with every step.
                  </p>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className="d-flex gap-3">
                <div style={{ fontSize: 24 }}></div>
                <div>
                  <strong>4. Result</strong>
                  <p className="text-muted mb-0" style={{ fontSize: 14 }}>
                    Your final score is the coins you have left. Reach the
                    destination with as many coins as possible to top the
                    ranking.
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <h5>Rules</h5>
          <ul className="mb-0" style={{ fontSize: 14 }}>
            <li>You start with <strong>20 coins</strong>.</li>
            <li>You have <strong>90 seconds</strong> to plan your route.</li>
            <li>You must travel from the assigned start to the assigned destination.</li>
            <li>Each segment can only be used <strong>once</strong>.</li>
            <li>An invalid or incomplete route scores <strong>zero coins</strong>.</li>
            <li>Negative final scores are stored as zero.</li>
          </ul>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default HomePage;