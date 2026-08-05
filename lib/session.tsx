"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, type Cabinet, type SafeUser } from "./api";
import { clearSession, getStoredToken, getStoredUser, saveSession } from "./auth-storage";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

type SessionContextValue = {
  status: SessionStatus;
  token: string | null;
  user: SafeUser | null;
  cabinet: Cabinet | null;
  refresh: () => Promise<void>;
  logout: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<SafeUser | null>(null);
  const [cabinet, setCabinet] = useState<Cabinet | null>(null);

  const refresh = useCallback(async () => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      setStatus("unauthenticated");
      return;
    }

    try {
      const { user: freshUser, cabinet: freshCabinet } = await api.me(storedToken);
      setToken(storedToken);
      setUser(freshUser);
      setCabinet(freshCabinet ?? null);
      setStatus("authenticated");
    } catch {
      clearSession();
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- optimistic hydration from localStorage before the /me refresh resolves
      setUser(storedUser);
      setToken(getStoredToken());
    }
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setUser(null);
    setCabinet(null);
    setStatus("unauthenticated");
  }, []);

  return (
    <SessionContext.Provider value={{ status, token, user, cabinet, refresh, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within a SessionProvider");
  return ctx;
}

export function persistSession(token: string, user: SafeUser) {
  saveSession(token, user);
}
