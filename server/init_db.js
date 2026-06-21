//ran this once via node init-db.js

import sqlite3 from "sqlite3";
import crypto from "crypto";
import fs from "fs";

const DB_FILE = "./game.sqlite";


if (fs.existsSync(DB_FILE)) fs.unlinkSync(DB_FILE);

const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) throw err;
});

const run = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    })
  );

const hashPassword = (password) =>
  new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.scrypt(password, salt, 16, (err, hash) => {
      if (err) reject(err);
      else resolve({ hash: hash.toString("hex"), salt });
    });
  });

async function init() {
  await run(`CREATE TABLE IF NOT EXISTS users (
    username     TEXT PRIMARY KEY,
    passwordHash TEXT NOT NULL,
    salt         TEXT NOT NULL
  )`);

  await run(`CREATE TABLE IF NOT EXISTS graph (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    line     TEXT NOT NULL,
    station1 TEXT NOT NULL,
    station2 TEXT NOT NULL
  )`);

  await run(`CREATE TABLE IF NOT EXISTS events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    effect      INTEGER NOT NULL
  )`);

  await run(`CREATE TABLE IF NOT EXISTS games (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    username     TEXT NOT NULL,
    score        INTEGER NOT NULL,
    startStation TEXT NOT NULL,
    endStation   TEXT NOT NULL,
    FOREIGN KEY (username) REFERENCES users(username)
  )`);


  const segments = [
    ["Red Line",    "Tarkovsky",    "Fincher"],
    ["Red Line",    "Fincher",     "Tarantino"],
    ["Red Line",    "Tarantino",  "Fellini"],
    ["Red Line",    "Fellini",    "Spielberg"],
    ["Blue Line",   "Wilder",    "Lumet"],
    ["Blue Line",   "Lumet",     "Tarantino"],
    ["Blue Line",   "Tarantino",  "Coppola"],
    ["Blue Line",   "Coppola",    "Bergman"],
    ["Green Line",  "Lumet",     "Scorsese"],
    ["Green Line",  "Scorsese",  "PTA"],
    ["Green Line",  "PTA",     "Nolan"],
    ["Green Line",  "Nolan",   "Lanthimos"],
    ["Yellow Line", "Fellini",    "Scorsese"],
    ["Yellow Line", "Scorsese",  "Varda"],
    ["Yellow Line", "Varda",     "Kubrick"],
    ["Yellow Line", "Kubrick",    "Antonioni"],
  ];

  for (const [line, s1, s2] of segments) {
    await run(
      "INSERT INTO graph(line, station1, station2) VALUES (?,?,?)",
      [line, s1, s2]
    );
  }


  const events = [
    ["Someone's filming a scene on your train",  0],
    ["Your phone dies mid-scene-discussion",        -2],
    ["Free popcorn from a film crew nearby,",   +1],
    ["Reel change, brief blackout",                 -3],
    ["You get cast as an extra",          +2],
    ["Boom mic dips into frame, awkward delay",    -1],
    ["Found a lucky coin on the seat",          +1],
    ["Missed the doors, waited for next train", -4],
    ["Helpful driver gave a free tip",          +3],
    ["Train overcrowded, very stressful",       -1],
    ["A director recognizes you from a festival",       +4],
  ];

  for (const [description, effect] of events) {
    await run("INSERT INTO events(description, effect) VALUES (?,?)", [
      description,
      effect,
    ]);
  }

  
  const users = [
    { username: "ema" },
    { username: "elena" },
    { username: "marco" },
    { username: "paolo" },
  ];

  for (const u of users) {
    const { hash, salt } = await hashPassword("password");
    await run(
      "INSERT INTO users(username, passwordHash, salt) VALUES (?,?,?)",
      [u.username, hash, salt]
    );
  }

  // Pre-existing games for alice and bob
  const gamesData = [
    ["paolo", 24, "Tarkovsky",   "Antonioni"],
    ["ema", 17, "Lanthimos",   "Spielberg"],
    ["paolo",  8, "Bergman",   "Kubrick"],
    ["elena",   21, "Wilder",   "Nolan"],
    ["elena",   13, "Fincher",    "Varda"],
  ];

  for (const [username, score, startStation, endStation] of gamesData) {
    await run(
      "INSERT INTO games(username, score, startStation, endStation) VALUES (?,?,?,?)",
      [username, score, startStation, endStation]
    );
  }

  console.log("Database initialised: game.sqlite");
  db.close();
}

init().catch((err) => {
  console.error("Init failed:", err);
  process.exit(1);
});