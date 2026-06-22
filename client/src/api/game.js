const BASE = "http://localhost:3001";

async function startGame() {
  const response = await fetch(`${BASE}/api/game/start`, {
    method: "POST",
    credentials: "include",
  });
  if (response.ok) return await response.json(); 
  throw new Error("Failed to start game");
}

async function executeGame(segments) {
  const response = await fetch(`${BASE}/api/game/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ segments }),
  });
  if (response.ok) return await response.json();
  throw new Error("Failed to execute game");
}

async function saveGame(score, startStation, endStation) {
  const response = await fetch(`${BASE}/api/games`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ score, startStation, endStation }),
  });
  if (!response.ok) throw new Error("Failed to save game");
}

async function getRanking() {
  const response = await fetch(`${BASE}/api/ranking`, {
    credentials: "include",
  });
  if (response.ok) return await response.json();
  throw new Error("Failed to load ranking");
}

export { startGame, executeGame, saveGame, getRanking };