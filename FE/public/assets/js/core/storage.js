const AUTH_KEY = "amumal_auth";

export function saveAuth(authObject) {
  if (!authObject || typeof authObject !== "object") {
    console.error("saveAuth: invalid authObject", authObject);
    return;
  }
  localStorage.setItem(AUTH_KEY, JSON.stringify(authObject));
}

export function loadAuth() {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("loadAuth: JSON parse error", e);
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

export function loadUserId() {
  const auth = loadAuth();
  return auth?.id ?? null;
}
