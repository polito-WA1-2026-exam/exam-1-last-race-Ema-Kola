import "bootstrap/dist/css/bootstrap.min.css";

import { useState, useEffect, useRef } from "react";
import { Container } from "react-bootstrap";
import { Routes, Route, Outlet } from "react-router";

import UserContext from "./contexts/UserContext";
import { checkSession } from "./api/auth";

import Header from "./components/Header";
import HomePage from "./components/Homepage";
import LoginPage from "./components/LoginPage";
import GamePage from "./components/GamePage";
import RankingPage from "./components/RankingPage";

function App() {
  const [user, setUser] = useState(null);     
  const [sessionChecked, setSessionChecked] = useState(false);
  const hasCheckedRef = useRef(false); // guards checkSession() against Strict Mode double-invocation

  useEffect(() => {
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    checkSession()
      .then((u) => {
        setUser(u);         
        setSessionChecked(true);
      })
      .catch(() => {
        setSessionChecked(true);
      });
  }, []);

  return (
    <UserContext.Provider value={user}>
      <Routes>
        <Route element={<Layout setUser={setUser} />}>
          <Route path="/"        element={<HomePage />} />
          <Route path="/login"   element={<LoginPage setUser={setUser} />} />
          <Route
            path="/game"
            element={sessionChecked ? <GamePage /> : null}
          />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="*"        element={<NotFound />} />
        </Route>
      </Routes>
    </UserContext.Provider>
  );
}

function Layout({ setUser }) {
  return (
    <>
      <Header setUser={setUser} />
      <Container fluid="lg">
        <Outlet />
      </Container>
    </>
  );
}

function NotFound() {
  return (
    <Container className="text-center mt-5">
      <h2>404 — Page not found</h2>
    </Container>
  );
}

export default App;