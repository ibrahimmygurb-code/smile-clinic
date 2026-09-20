export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const AUTH_TOKEN_KEY = "smile_token";

export function apiUrl(path: string) {
  return `${API_URL}${path}`;
}

export function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }
  const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}
