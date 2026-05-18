"use client";

import { AuthSession, clearStoredSession, readStoredSession } from "@/lib/auth";
import { MfaSettings } from "@/components/mfa-settings";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

export function AuthShell({ children }: { children: ReactNode }): JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<AuthSession>();
  const [showMfaSettings, setShowMfaSettings] = useState(false);
  const [ready, setReady] = useState(false);
  const isLoginPage = pathname === "/login";
  const isPublicHealthRoute = pathname === "/health";

  useEffect(() => {
    const currentSession = readStoredSession();
    setSession(currentSession);
    setReady(true);

    if (!currentSession && !isLoginPage && !isPublicHealthRoute) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/")}`);
    }

    if (currentSession && isLoginPage) {
      router.replace("/");
    }
  }, [isLoginPage, isPublicHealthRoute, pathname, router]);

  function logout(): void {
    clearStoredSession();
    setSession(undefined);
    router.replace("/login");
  }

  if (isLoginPage || isPublicHealthRoute) {
    return <>{children}</>;
  }

  if (!ready || !session) {
    return (
      <main className="auth-loading">
        <p>Checking session...</p>
      </main>
    );
  }

  return (
    <>
      <div className="session-bar">
        <div>
          <strong>{session.email}</strong>
          <span>{session.role}</span>
        </div>
        <div>
          <button type="button" onClick={() => setShowMfaSettings((value) => !value)}>
            MFA
          </button>
          <button type="button" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
      {showMfaSettings ? <MfaSettings session={session} onClose={() => setShowMfaSettings(false)} /> : null}
      {children}
    </>
  );
}
