import sqlite3 from "sqlite3";
import crypto from "crypto";

const db = new sqlite3.Database("./game.sqlite", (err) => {
  if (err) throw err;
});


const dbAll = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
  );

const dbGet = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)))
  );

const dbRun = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    })
  );

export const getSegments = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT station1, station2 FROM graph";
    db.all(sql, [], (err, rows) => {
      if (err) { reject(err); return; }
      const seen = new Set();
      const segments = [];
      for (const row of rows) {
        const [a, b] = [row.station1, row.station2].sort();
        const key = `${a}|||${b}`;
        if (!seen.has(key)) {
          seen.add(key);
          segments.push({ station1: a, station2: b });
        }
      }
      segments.sort(
        (a, b) =>
          a.station1.localeCompare(b.station1) ||
          a.station2.localeCompare(b.station2)
      );
      resolve(segments);
    });
  });
};


export const getAllEvents = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT id, description, effect FROM events";
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};


const canonicalKey = (a, b) => [a, b].sort().join("|||");

export const buildNetworkMaps = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT line, station1, station2 FROM graph", [], (err, rows) => {
      if (err) { reject(err); return; }

      const adjacency = new Map();   
      const segmentLines = new Map(); 
      const stationLines = new Map(); 

      const addAdj = (a, b) => {
        if (!adjacency.has(a)) adjacency.set(a, new Set());
        if (!adjacency.has(b)) adjacency.set(b, new Set());
        adjacency.get(a).add(b);
        adjacency.get(b).add(a);
      };

      for (const { line, station1, station2 } of rows) {
        addAdj(station1, station2);

        const key = canonicalKey(station1, station2);
        if (!segmentLines.has(key)) segmentLines.set(key, new Set());
        segmentLines.get(key).add(line);

        if (!stationLines.has(station1)) stationLines.set(station1, new Set());
        if (!stationLines.has(station2)) stationLines.set(station2, new Set());
        stationLines.get(station1).add(line);
        stationLines.get(station2).add(line);
      }

      resolve({ adjacency, segmentLines, stationLines });
    });
  });
};

export const bfsDistance = (adjacency, from, to) => {
  if (from === to) return 0;
  const visited = new Set([from]);
  const queue = [[from, 0]];
  while (queue.length > 0) {
    const [current, dist] = queue.shift();
    for (const neighbour of (adjacency.get(current) || [])) {
      if (neighbour === to) return dist + 1;
      if (!visited.has(neighbour)) {
        visited.add(neighbour);
        queue.push([neighbour, dist + 1]);
      }
    }
  }
  return Infinity;
};

export const pickStartEnd = async () => {
  const { adjacency } = await buildNetworkMaps();
  const stations = [...adjacency.keys()];

  const validPairs = [];
  for (let i = 0; i < stations.length; i++) {
    for (let j = 0; j < stations.length; j++) {
      if (i === j) continue;
      if (bfsDistance(adjacency, stations[i], stations[j]) >= 3)
        validPairs.push([stations[i], stations[j]]);
    }
  }

  if (validPairs.length === 0) throw new Error("No valid station pairs found");
  const [start, end] = validPairs[Math.floor(Math.random() * validPairs.length)];
  return { startStation: start, endStation: end };
};


export const validateRoute = async (segments, startStation, endStation) => {
  if (!Array.isArray(segments) || segments.length === 0)
    return { valid: false, reason: "No segments selected" };

  for (const pair of segments) {
    if (!Array.isArray(pair) || pair.length !== 2)
      return { valid: false, reason: "Malformed segment in submission" };
  }

  const { segmentLines, stationLines } = await buildNetworkMaps();

  const usedSegments = new Set();
  for (const [a, b] of segments) {
    const key = canonicalKey(a, b);
    if (!segmentLines.has(key))
      return { valid: false, reason: `Segment ${a} — ${b} does not exist` };
    if (usedSegments.has(key))
      return { valid: false, reason: `Segment ${a} — ${b} selected more than once` };
    usedSegments.add(key);
  }

  const degree = new Map(); 
  const localAdjacency = new Map(); 

  for (const [a, b] of segments) {
    const key = canonicalKey(a, b);
    degree.set(a, (degree.get(a) || 0) + 1);
    degree.set(b, (degree.get(b) || 0) + 1);
    if (!localAdjacency.has(a)) localAdjacency.set(a, []);
    if (!localAdjacency.has(b)) localAdjacency.set(b, []);
    localAdjacency.get(a).push({ to: b, key });
    localAdjacency.get(b).push({ to: a, key });
  }


  if (startStation === endStation)
    return { valid: false, reason: "Start and destination must differ" };

  for (const [station, deg] of degree.entries()) {
    const isEndpoint = station === startStation || station === endStation;
    const expectedParity = isEndpoint ? 1 : 0;
    if (deg % 2 !== expectedParity)
      return {
        valid: false,
        reason: `Selected segments do not form a single path.`,
      };
  }

  if (!degree.has(startStation))
    return { valid: false, reason: "Selected segments do not touch the starting station" };
  if (!degree.has(endStation))
    return { valid: false, reason: "Selected segments do not touch the destination station" };

  const remaining = new Map(); 
  for (const [station, opts] of localAdjacency.entries()) {
    remaining.set(station, [...opts]);
  }

  const stack = [startStation];
  const walk = [];

  while (stack.length > 0) {
    const station = stack[stack.length - 1];
    const options = remaining.get(station) || [];

    let nextEdgeIndex = -1;
    for (let i = 0; i < options.length; i++) {
      if (usedSegments.has(options[i].key) && !options[i].consumed) {
        nextEdgeIndex = i;
        break;
      }
    }

    if (nextEdgeIndex === -1) {
      walk.push(stack.pop());
    } else {
      const edge = options[nextEdgeIndex];
      edge.consumed = true;
      const reverseOptions = remaining.get(edge.to) || [];
      const reverseEdge = reverseOptions.find(
        (opt) => opt.key === edge.key && !opt.consumed
      );
      if (reverseEdge) reverseEdge.consumed = true;

      stack.push(edge.to);
    }
  }

  walk.reverse();

  if (walk.length === 0 || walk[0] !== startStation)
    return { valid: false, reason: "Selected segments do not form a single connected path" };
  if (walk[walk.length - 1] !== endStation)
    return { valid: false, reason: "Selected segments do not end at the destination station" };
  if (walk.length - 1 !== segments.length)
    return { valid: false, reason: "Selected segments do not form a single connected path" };

  let currentLine = null;
  for (let i = 0; i < walk.length - 1; i++) {
    const from = walk[i];
    const to = walk[i + 1];
    const key = canonicalKey(from, to);
    const linesForSegment = segmentLines.get(key);

    if (currentLine === null) {
      currentLine = [...linesForSegment][0];
    } else if (!linesForSegment.has(currentLine)) {
      const fromLines = stationLines.get(from) || new Set();
      if (fromLines.size < 2)
        return { valid: false, reason: `Line change at ${from} not allowed (not an interchange)` };

      const commonLines = [...linesForSegment].filter((l) => fromLines.has(l));
      if (commonLines.length === 0)
        return { valid: false, reason: `No valid line for segment ${from} — ${to} after interchange` };

      currentLine = commonLines[0];
    }
  }

  return { valid: true, walk };
};


export const saveGame = (username, score, startStation, endStation) => {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO games(username, score, startStation, endStation) VALUES (?,?,?,?)";
    db.run(sql, [username, score, startStation, endStation], function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
};

export const getRanking = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT username, MAX(score) AS bestScore
      FROM games
      GROUP BY username
      ORDER BY bestScore DESC
    `;
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};


export const getUser = (username, password) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM users WHERE username = ?";
    db.get(sql, [username], (err, row) => {
      if (err) { reject(err); return; }
      if (row === undefined) { resolve(false); return; }

      const user = { username: row.username };
      crypto.scrypt(password, row.salt, 16, function (err, hashedPassword) {
        if (err) { reject(err); return; }
        if (!crypto.timingSafeEqual(Buffer.from(row.passwordHash, "hex"), hashedPassword))
          resolve(false);
        else
          resolve(user);
      });
    });
  });
};