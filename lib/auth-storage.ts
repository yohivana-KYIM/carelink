import type { SafeUser } from "./api";

const TOKEN_KEY = "carelink_token";
const USER_KEY = "carelink_user";
const REMEMBER_KEY = "carelink_remember";

/**
 * "Se souvenir de moi" coché → session persistée dans localStorage (survit à
 * la fermeture du navigateur). Sinon → sessionStorage (effacée à la fermeture
 * de l'onglet/navigateur).
 */
export function saveSession(token: string, user: SafeUser, rememberMe = true) {
  if (typeof window === "undefined") return;

  clearSession();

  const store = rememberMe ? window.localStorage : window.sessionStorage;
  store.setItem(TOKEN_KEY, token);
  store.setItem(USER_KEY, JSON.stringify(user));
  window.localStorage.setItem(REMEMBER_KEY, rememberMe ? "1" : "0");
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY) ?? window.sessionStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): SafeUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY) ?? window.sessionStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as SafeUser) : null;
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.localStorage.removeItem(REMEMBER_KEY);
  window.sessionStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(USER_KEY);
}
