const AUTH_STORAGE_KEY = "amumal_auth";

function getStorage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function normalizeAuthPatch(partial) {
  if (!partial || typeof partial !== "object") return {};

  const normalized = { ...partial };

  if ("id" in normalized && !("user_id" in normalized)) {
    normalized.user_id = normalized.id;
  }
  if ("userId" in normalized && !("user_id" in normalized)) {
    normalized.user_id = normalized.userId;
  }
  if ("accessToken" in normalized && !("access_token" in normalized)) {
    normalized.access_token = normalized.accessToken;
  }
  if ("refreshToken" in normalized && !("refresh_token" in normalized)) {
    normalized.refresh_token = normalized.refreshToken;
  }
  if ("tokenType" in normalized && !("token_type" in normalized)) {
    normalized.token_type = normalized.tokenType;
  }
  if ("expiresIn" in normalized && !("expires_in" in normalized)) {
    normalized.expires_in = normalized.expiresIn;
  }

  delete normalized.id;
  delete normalized.userId;
  delete normalized.accessToken;
  delete normalized.refreshToken;
  delete normalized.tokenType;
  delete normalized.expiresIn;

  return normalized;
}

function writeAuth(value) {
  const storage = getStorage();
  if (!storage) return;

  if (!value || typeof value !== "object" || Object.keys(value).length === 0) {
    storage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(value));
}

export function loadAuth() {
  const storage = getStorage();
  if (!storage) return null;

  const raw = storage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    storage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function saveAuth(partial) {
  if (!partial || typeof partial !== "object") return;

  const prev = loadAuth() || {};
  const next = { ...prev, ...normalizeAuthPatch(partial) };
  writeAuth(next);
}

export function clearAuth() {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(AUTH_STORAGE_KEY);
}

export function loadUserId() {
  const auth = loadAuth();
  return auth?.user_id ?? auth?.id ?? null;
}

export function loadAccessToken() {
  const auth = loadAuth();
  return auth?.access_token ?? auth?.accessToken ?? null;
}

export function loadRefreshToken() {
  const auth = loadAuth();
  return auth?.refresh_token ?? auth?.refreshToken ?? null;
}

export function saveTokens({
  access_token,
  refresh_token,
  token_type,
  expires_in,
  accessToken,
  refreshToken,
  tokenType,
  expiresIn,
} = {}) {
  saveAuth({
    ...(access_token !== undefined || accessToken !== undefined
      ? { access_token: access_token ?? accessToken }
      : {}),
    ...(refresh_token !== undefined || refreshToken !== undefined
      ? { refresh_token: refresh_token ?? refreshToken }
      : {}),
    ...(token_type !== undefined || tokenType !== undefined
      ? { token_type: token_type ?? tokenType }
      : {}),
    ...(expires_in !== undefined || expiresIn !== undefined
      ? { expires_in: expires_in ?? expiresIn }
      : {}),
  });
}

export function mapAuthResponse(payload = {}) {
  if (!payload || typeof payload !== "object") return {};

  return normalizeAuthPatch({
    user_id: payload.user_id ?? payload.id,
    access_token: payload.access_token ?? payload.accessToken,
    refresh_token: payload.refresh_token ?? payload.refreshToken,
    token_type: payload.token_type ?? payload.tokenType,
    expires_in: payload.expires_in ?? payload.expiresIn,
  });
}

export function saveAuthResponse(payload = {}) {
  const mapped = mapAuthResponse(payload);
  saveAuth(mapped);
}

export function buildRefreshTokenRequestBody(refreshToken = loadRefreshToken()) {
  if (typeof refreshToken !== "string" || refreshToken.trim() === "") {
    throw new Error("refresh_token is required");
  }
  return { refresh_token: refreshToken };
}

export function clearTokens() {
  const auth = loadAuth();
  if (!auth) return;

  const next = { ...auth };
  delete next.access_token;
  delete next.refresh_token;
  delete next.accessToken;
  delete next.refreshToken;
  delete next.token_type;
  delete next.tokenType;
  delete next.expires_in;
  delete next.expiresIn;

  writeAuth(next);
}
