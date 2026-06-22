const BASE = "http://localhost:3001";

async function doLogin(username, password) {
  const response = await fetch(`${BASE}/api/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });
  if (response.ok) {
    return await response.json(); 
  } else {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Login failed");
  }
}

async function doLogout() {
  const response = await fetch(`${BASE}/api/sessions/current`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Logout failed");
}

async function checkSession() {
  const response = await fetch(`${BASE}/api/sessions/current`, {
    credentials: "include",
  });
  if (response.ok) return await response.json(); 
  return null;
}

export { doLogin, doLogout, checkSession };