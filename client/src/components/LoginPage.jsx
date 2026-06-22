import { useState, useContext } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Form, Button, Container, Card, Alert } from "react-bootstrap";
import { doLogin } from "../api/auth";
import UserContext from "../contexts/UserContext";

function LoginPage({ setUser }) {
  const user = useContext(UserContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/game" />;

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await doLogin(username.trim(), password);
      setUser(loggedUser);
      navigate("/game");
    } catch (ex) {
      setError(ex.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container style={{ maxWidth: 420, marginTop: "4rem" }}>
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h4 className="mb-4">Login to play</h4>
          {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. ema"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <Button type="submit" variant="primary" className="w-100" disabled={loading}>
              {loading ? "Logging in…" : "Log in"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default LoginPage;