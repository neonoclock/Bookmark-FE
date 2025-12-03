import { loadAccessToken } from "./storage.js";

const BASE_URL = "http://localhost:8080";

async function request(path, options = {}) {
  const { headers, ...rest } = options;

  const token = loadAccessToken();
  const authHeaders = {};

  if (token) {
    authHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(BASE_URL + path, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...(headers || {}),
    },
    ...rest,
  });

  let raw;
  try {
    raw = await res.json();
  } catch (e) {
    raw = null;
  }

  if (!res.ok) {
    const msg =
      raw?.message ||
      raw?.error ||
      raw?.errors?.[0]?.defaultMessage ||
      "요청에 실패했습니다.";

    throw new Error(msg);
  }

  if (raw && typeof raw === "object") {
    if ("success" in raw && raw.success === false) {
      const msg =
        raw.message ||
        raw.error ||
        raw.errors?.[0]?.defaultMessage ||
        "요청에 실패했습니다.";
      throw new Error(msg);
    }

    if ("data" in raw) {
      return raw.data;
    }
  }

  return raw;
}

export function GET(path) {
  return request(path, { method: "GET" });
}

export function POST(path, body) {
  return request(path, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function PATCH(path, body) {
  return request(path, {
    method: "PATCH",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function DELETE(path) {
  return request(path, { method: "DELETE" });
}

export function toQueryString(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    searchParams.append(key, String(value));
  });

  return searchParams.toString();
}
