export interface AuthSession {
  accessToken: string;
  role: string;
  email: string;
  expiresAt?: string;
}

export const AUTH_SESSION_KEY = "agentops.auth.session";

export function readStoredSession(): AuthSession | undefined {
  if (typeof window === "undefined") return undefined;

  const raw = window.localStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) return undefined;

  try {
    const parsed = JSON.parse(raw) as Partial<AuthSession>;
    if (!parsed.accessToken || !parsed.email || !parsed.role) return undefined;
    if (parsed.expiresAt && Date.parse(parsed.expiresAt) <= Date.now()) {
      clearStoredSession();
      return undefined;
    }
    return {
      accessToken: parsed.accessToken,
      role: parsed.role,
      email: parsed.email,
      expiresAt: parsed.expiresAt
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
