const BASE = "http://localhost:3001";

async function getSegments() {
  const response = await fetch(`${BASE}/api/segments`, {
    credentials: "include",
  });
  if (response.ok) return await response.json();
  throw new Error("Failed to load segments");
}

export { getSegments };