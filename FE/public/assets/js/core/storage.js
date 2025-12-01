const AUTH_KEY = "amumal_auth";

export function saveAuth({ email, nickname, profileImage, role }) {
  const auth = { email, nickname, profileImage, role };
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
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
  return null;
}
