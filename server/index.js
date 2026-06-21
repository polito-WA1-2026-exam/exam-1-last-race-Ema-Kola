import express from "express";
import morgan from "morgan";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import LocalStrategy from "passport-local";
import { check, validationResult } from "express-validator";

import {
  getSegments,
  getAllEvents,
  pickStartEnd,
  validateRoute,
  saveGame,
  getRanking,
  getUser,
} from "./dao.js";

const app = express();
const port = 3001;


app.use(express.json());
app.use(morgan("dev"));
app.use(
  cors({
    origin: "http://localhost:5173",
    optionsSuccessStatus: 200,
    credentials: true,
  })
);


passport.use(
  new LocalStrategy(async function verify(username, password, cb) {
    try {
      const user = await getUser(username, password);
      if (!user) return cb(null, false, "Incorrect username or password.");
      return cb(null, user);
    } catch (err) {
      return cb(err);
    }
  })
);

passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((user, cb) => cb(null, user));

app.use(
  session({
    secret: "auroravia-metro-secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.authenticate("session"));


const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ error: "Not authorized" });
};


// POST /api/sessions  — login
app.post(
  "/api/sessions",
  passport.authenticate("local", { failWithError: true }),
  function (req, res) {
    return res.status(201).json({ username: req.user.username });
  },
  function (err, req, res, next) {
    return res.status(401).json({ error: err.message || "Login failed" });
  }
);

// GET /api/sessions/current  — check auth status
app.get("/api/sessions/current", (req, res) => {
  if (req.isAuthenticated())
    return res.json({ username: req.user.username });
  return res.status(401).json({ error: "Not authenticated" });
});

// DELETE /api/sessions/current  — logout
app.delete("/api/sessions/current", (req, res) => {
  req.logout(() => res.status(200).end());
});


// GET /api/segments  — unique station pairs without line info, used in Planning phase
app.get("/api/segments", isLoggedIn, async (req, res) => {
  try {
    const segments = await getSegments();
    res.json(segments);
  } catch {
    res.status(500).json({ error: "Failed to retrieve segments" });
  }
});


// POST /api/game/start  — generate a start/end pair, store in session
app.post("/api/game/start", isLoggedIn, async (req, res) => {
  try {
    const { startStation, endStation } = await pickStartEnd();
    req.session.currentGame = { startStation, endStation };
    res.json({ startStation, endStation, coins: 20 });
  } catch {
    res.status(500).json({ error: "Failed to start game" });
  }
});

// POST /api/game/execute  — validate selected segments, apply events, return steps + score
app.post(
  "/api/game/execute",
  isLoggedIn,
  [check("segments").isArray()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ error: "Invalid request body" });

    const currentGame = req.session.currentGame;
    if (!currentGame)
      return res.status(400).json({ error: "No active game. Please start a new game." });

    const { startStation, endStation } = currentGame;
    const { segments } = req.body;

    let validationResult_;
    try {
      validationResult_ = await validateRoute(segments, startStation, endStation);
    } catch {
      return res.status(500).json({ error: "Validation error" });
    }

    if (!validationResult_.valid) {
      req.session.currentGame = null;
      return res.json({ valid: false, finalScore: 0, reason: validationResult_.reason });
    }

    let events;
    try {
      events = await getAllEvents();
    } catch {
      return res.status(500).json({ error: "Failed to retrieve events" });
    }

    const walk = validationResult_.walk; 

    let coins = 20;
    const steps = [];

    for (let i = 0; i < walk.length - 1; i++) {
      const event = events[Math.floor(Math.random() * events.length)];
      coins += event.effect;
      steps.push({
        from: walk[i],
        to: walk[i + 1],
        event: event.description,
        effect: event.effect,
        coins,
      });
    }

    const finalScore = Math.max(0, coins);
    req.session.currentGame = null;

    res.json({ valid: true, steps, finalScore });
  }
);


// POST /api/games  — save a completed game result
app.post(
  "/api/games",
  isLoggedIn,
  [
    check("score").isInt({ min: 0 }),
    check("startStation").notEmpty().isString(),
    check("endStation").notEmpty().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ error: "Invalid game data" });

    const { score, startStation, endStation } = req.body;
    try {
      await saveGame(req.user.username, score, startStation, endStation);
      res.status(201).end();
    } catch {
      res.status(500).json({ error: "Failed to save game" });
    }
  }
);

// GET /api/ranking  — best score per user
app.get("/api/ranking", isLoggedIn, async (req, res) => {
  try {
    const ranking = await getRanking();
    res.json(ranking);
  } catch {
    res.status(500).json({ error: "Failed to retrieve ranking" });
  }
});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});