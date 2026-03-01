import { loadAccessToken } from "@/lib/storage/authStorage.js";

const DEFAULT_BASE_URL = "http://localhost:8080";
const DEFAULT_ERROR_MESSAGE = "요청에 실패했습니다.";

function isNonBlankString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeErrorMessage(raw) {
  if (isNonBlankString(raw)) return raw;

  if (isNonBlankString(raw?.message)) return raw.message;
  if (isNonBlankString(raw?.error?.message)) return raw.error.message;
  if (isNonBlankString(raw?.detail)) return raw.detail;
  if (isNonBlankString(raw?.error?.detail)) return raw.error.detail;

  if (isNonBlankString(raw?.code)) return raw.code;
  if (isNonBlankString(raw?.error?.code)) return raw.error.code;
  if (isNonBlankString(raw?.error)) return raw.error;
  if (isNonBlankString(raw?.errors?.[0]?.defaultMessage)) {
    return raw.errors[0].defaultMessage;
  }

  return DEFAULT_ERROR_MESSAGE;
}

async function parseResponseBody(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  if (contentType.includes("text/")) {
    return response.text();
  }
  return null;
}

function buildUrl(baseUrl, path, query) {
  const url = new URL(path, baseUrl);
  if (!query) return url.toString();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    url.searchParams.append(key, String(value));
  });

  return url.toString();
}

export class HttpError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.payload = payload;
  }
}

export function createHttpClient(config = {}) {
  const {
    baseUrl = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL,
    getAccessToken,
  } = config;

  async function request(path, options = {}) {
    const { method = "GET", headers, body, query, signal } = options;
    const token = getAccessToken?.();
    const isFormData = body instanceof FormData;

    const response = await fetch(buildUrl(baseUrl, path, query), {
      method,
      signal,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers || {}),
      },
      body:
        body === undefined
          ? undefined
          : isFormData || typeof body === "string"
            ? body
            : JSON.stringify(body),
    });

    const raw = await parseResponseBody(response);

    if (!response.ok) {
      throw new HttpError(normalizeErrorMessage(raw), response.status, raw);
    }

    if (raw && typeof raw === "object") {
      if (raw.success === false) {
        throw new HttpError(normalizeErrorMessage(raw), response.status, raw);
      }
      if ("data" in raw) return raw.data;
    }

    return raw;
  }

  return {
    request,
    get(path, options = {}) {
      return request(path, { ...options, method: "GET" });
    },
    post(path, body, options = {}) {
      return request(path, { ...options, method: "POST", body });
    },
    patch(path, body, options = {}) {
      return request(path, { ...options, method: "PATCH", body });
    },
    put(path, body, options = {}) {
      return request(path, { ...options, method: "PUT", body });
    },
    delete(path, options = {}) {
      return request(path, { ...options, method: "DELETE" });
    },
  };
}

export const httpClient = createHttpClient({
  getAccessToken: loadAccessToken,
});

export const publicHttpClient = createHttpClient();
