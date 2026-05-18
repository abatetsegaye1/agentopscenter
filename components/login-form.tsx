"use client";

import { storeSession } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export function LoginForm(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("admin@digitalrealestate.today");
  const [password, setPassword] = useState("");
  const [mfaToken, setMfaToken] = useState<string>();
  const [mfaCode, setMfaCode] = useState("");
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(undefined);
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const raw = await response.text();

      if (!response.ok) {
        setError(parseApiMessage(raw) || `Login failed (${response.status})`);
        return;
      }

      const payload = JSON.parse(raw) as {
        accessToken: string;
        role: string;
        email: string;
        expiresAt?: string;
        mfaRequired?: boolean;
        mfaToken?: string;
      };

      if (payload.mfaRequired && payload.mfaToken) {
        setMfaToken(payload.mfaToken);
        setMfaCode("");
        return;
      }

      storeSession(payload);
      router.replace(searchParams.get("next") || "/");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitMfa(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!mfaToken) return;
    setError(undefined);
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/mfa/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mfaToken, code: mfaCode })
      });
      const raw = await response.text();

      if (!response.ok) {
        setError(parseApiMessage(raw) || `MFA verification failed (${response.status})`);
        return;
      }

      const session = JSON.parse(raw) as {
        accessToken: string;
        role: string;
        email: string;
        expiresAt?: string;
      };
      storeSession(session);
      router.replace(searchParams.get("next") || "/");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "MFA verification failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (mfaToken) {
    return (
      <form className="login-panel" onSubmit={submitMfa}>
        <div>
          <h1>Verify MFA</h1>
          <p>Enter the 6-digit code from your authenticator app or a recovery code.</p>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <label>
          MFA code
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={mfaCode}
            onChange={(event) => setMfaCode(event.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={submitting}>
          {submitting ? "Verifying..." : "Verify"}
        </button>
        <button
          className="secondary-button"
          type="button"
          disabled={submitting}
          onClick={() => {
            setMfaToken(undefined);
            setMfaCode("");
            setError(undefined);
          }}
        >
          Back to Login
        </button>
      </form>
    );
  }

  return (
    <form className="login-panel" onSubmit={submit}>
      <div>
        <h1>AgentOps Admin</h1>
        <p>Sign in to manage the dashboard.</p>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <label>
        Email
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>

      <label>
        Password
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>

      <button type="submit" disabled={submitting}>
        {submitting ? "Signing in..." : "Login"}
      </button>
    </form>
  );
}

function parseApiMessage(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as { message?: unknown; error?: unknown };
    if (typeof parsed.message === "string") return parsed.message;
    if (Array.isArray(parsed.message)) return parsed.message.join(", ");
    if (typeof parsed.error === "string") return parsed.error;
  } catch {
    return raw;
  }

  return raw;
}
