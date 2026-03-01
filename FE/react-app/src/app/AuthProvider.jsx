import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { authApi } from "@/lib/api/authApi.js";
import {
  AUTH_CHANGED_EVENT,
  AUTH_STORAGE_KEY,
  clearAuth,
  loadAccessToken,
} from "@/lib/storage/authStorage.js";

const AuthContext = createContext(null);

function normalizeUser(user) {
  if (!user || typeof user !== "object") return null;

  const userId = user.user_id ?? user.id ?? null;
  return {
    ...user,
    user_id: userId,
    id: userId,
  };
}

function isUnauthorizedError(error) {
  const code = error?.payload?.code ?? error?.code;
  const status = error?.status;

  return (
    status === 401 ||
    status === 403 ||
    code === "UNAUTHORIZED" ||
    code === "FORBIDDEN"
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const syncSeqRef = useRef(0);

  const syncMe = useCallback(async () => {
    const syncSeq = ++syncSeqRef.current;
    const accessToken = loadAccessToken();

    if (!accessToken) {
      if (syncSeqRef.current === syncSeq) {
        setUser(null);
        setIsInitializing(false);
      }
      return null;
    }

    try {
      const me = await authApi.getMe();
      const normalizedMe = normalizeUser(me);

      if (syncSeqRef.current === syncSeq) {
        setUser(normalizedMe);
        setIsInitializing(false);
      }

      return normalizedMe;
    } catch (error) {
      if (isUnauthorizedError(error)) {
        clearAuth();
      }

      if (syncSeqRef.current === syncSeq) {
        setUser(null);
        setIsInitializing(false);
      }

      return null;
    }
  }, []);

  useEffect(() => {
    void syncMe();
  }, [syncMe]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key && event.key !== AUTH_STORAGE_KEY) return;
      void syncMe();
    };

    const handleAuthChanged = () => {
      void syncMe();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChanged);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChanged);
    };
  }, [syncMe]);

  const login = useCallback(
    async (payload) => {
      await authApi.login(payload);
      return syncMe();
    },
    [syncMe],
  );

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isInitializing,
      syncMe,
      login,
      logout,
      setUser,
    }),
    [user, isInitializing, syncMe, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
