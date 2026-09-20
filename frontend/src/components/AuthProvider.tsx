"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AUTH_TOKEN_KEY, apiUrl } from "@/lib/api";

export type AuthUser = {
  id: string;
  email: string;
  phone: string;
  role: "patient" | "admin";
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<string | null>;
  register: (email: string, phone: string, password: string) => Promise<string | null>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const saveSession = useCallback((nextToken: string, nextUser: AuthUser) => {
    window.localStorage.setItem(AUTH_TOKEN_KEY, nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const stored = window.localStorage.getItem(AUTH_TOKEN_KEY);

    async function restoreSession() {
      if (!stored) {
        return;
      }

      try {
        const response = await fetch(apiUrl("/api/auth/me"), {
          headers: { Authorization: `Bearer ${stored}` },
        });
        const data = (await response.json()) as { user?: AuthUser };
        if (cancelled) {
          return;
        }
        if (!response.ok || !data.user) {
          window.localStorage.removeItem(AUTH_TOKEN_KEY);
          return;
        }
        setToken(stored);
        setUser(data.user);
      } catch {
        window.localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    }

    restoreSession().finally(() => {
      if (!cancelled) {
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const response = await fetch(apiUrl("/api/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
    const data = (await response.json()) as { user?: AuthUser; token?: string; error?: string };
    if (!response.ok || !data.user || !data.token) {
      return data.error ?? "تعذر تسجيل الدخول.";
    }
    saveSession(data.token, data.user);
    return null;
  }, [saveSession]);

  const register = useCallback(async (email: string, phone: string, password: string) => {
    const response = await fetch(apiUrl("/api/auth/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, phone, password }),
    });
    const data = (await response.json()) as { user?: AuthUser; token?: string; error?: string };
    if (!response.ok || !data.user || !data.token) {
      return data.error ?? "تعذر إنشاء الحساب.";
    }
    saveSession(data.token, data.user);
    return null;
  }, [saveSession]);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
