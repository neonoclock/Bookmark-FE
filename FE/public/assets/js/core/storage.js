const AUTH_KEY = "amumal_auth";

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

export function saveAuth(partial) {
  if (!partial || typeof partial !== "object") return;
  const prev = loadAuth() || {};
  const next = { ...prev, ...partial };
  localStorage.setItem(AUTH_KEY, JSON.stringify(next));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

export function loadUserId() {
  const auth = loadAuth();
  return auth?.id ?? null;
}

export function loadAccessToken() {
  const auth = loadAuth();
  return auth?.accessToken ?? null;
}
