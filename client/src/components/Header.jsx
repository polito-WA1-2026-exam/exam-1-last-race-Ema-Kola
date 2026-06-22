import { useContext } from "react";
import { Link, useNavigate } from "react-router";
import { Navbar, Container, Button, Nav } from "react-bootstrap";
import UserContext from "../contexts/UserContext";
import { doLogout } from "../api/auth";

function Header({ setUser }) {
  const user = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await doLogout();
      setUser(null);
      navigate("/");
    } catch {
      setUser(null);
      navigate("/");
    }
  };

  return (
    <Navbar bg="dark" variant="dark" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Last Race
        </Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link as={Link} to="/">
            Rules
          </Nav.Link>
          {user && (
            <>
              <Nav.Link as={Link} to="/ranking">
                Ranking
              </Nav.Link>
              <Nav.Link as={Link} to="/game">
                Play
              </Nav.Link>
            </>
          )}
        </Nav>
        <Nav>
          {user ? (
            <>
              <Navbar.Text className="me-3">
                Logged in as <strong>{user.username}</strong>
              </Navbar.Text>
              <Button variant="outline-light" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Button
              variant="outline-light"
              size="sm"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}

export default Header;