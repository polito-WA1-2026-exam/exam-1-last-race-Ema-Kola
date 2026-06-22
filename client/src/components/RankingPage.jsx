import { useState, useEffect, useContext } from "react";
import { Container, Table, Alert, Spinner, Button } from "react-bootstrap";
import { Link } from "react-router";
import UserContext from "../contexts/UserContext";
import { getRanking } from "../api/game";

function RankingPage() {
  const user = useContext(UserContext);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(!!user);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    getRanking()
      .then((data) => {
        setRanking(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load ranking.");
        setLoading(false);
      });
  }, [user]);

  if (!user) {
    return (
      <Container style={{ maxWidth: 520, marginTop: "2rem" }}>
        <h3 className="mb-4">All-time ranking</h3>
        <Alert variant="info">
          The ranking is only visible to registered users.{" "}
          <Button as={Link} to="/login" variant="link" className="p-0 align-baseline">
            Log in
          </Button>{" "}
          to see it.
        </Alert>
      </Container>
    );
  }

  return (
    <Container style={{ maxWidth: 520, marginTop: "2rem" }}>
      <h3 className="mb-4">All-time ranking</h3>

      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && ranking.length === 0 && (
        <p className="text-muted">No games played yet.</p>
      )}

      {!loading && ranking.length > 0 && (
        <Table bordered hover>
          <thead className="table-dark">
            <tr>
              <th style={{ width: 60 }}>#</th>
              <th>Player</th>
              <th style={{ width: 120, textAlign: "right" }}>Best score</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((row, i) => (
              <tr key={row.username} className={i === 0 ? "table-warning" : ""}>
                <td>
                  {i + 1}
                </td>
                <td>{row.username}</td>
                <td style={{ textAlign: "right" }}>
                  <strong>{row.bestScore}</strong> coins
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default RankingPage;