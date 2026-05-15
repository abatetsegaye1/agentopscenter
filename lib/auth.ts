export interface AuthSession {
  accessToken: string;
  role: string;
  email: string;
}

export const AUTH_SESSION_KEY = "agentops.auth.session";

export function readStoredSession(): AuthSession | undefined {
  if (typeof window === "undefined") return undefined;

  const raw = window.localStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) return undefined;

  try {
    const parsed = JSON.parse(raw) as Partial<AuthSession>;
    if (!parsed.accessToken || !parsed.email || !parsed.role) return undefined;
    return {
      accessToken: parsed.accessToken,
      role: parsed.role,
      email: parsed.email
    };
  } catch {
    return undefined;
  }
}

export function storeSession(session: AuthSession): void {
  window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export function clearStoredSession(): void {
  window.localStorage.removeItem(AUTH_SESSION_KEY);
}
