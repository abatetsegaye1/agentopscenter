"use client";

import { storeSession } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export function LoginForm(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("admin@digitalrealestate.today");
  const [password, setPassword] = useState("");
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
        setError(raw || `Login failed (${response.status})`);
        return;
      }

      const session = JSON.parse(raw) as {
        accessToken: string;
        role: string;
        email: string;
      };
      storeSession(session);
      router.replace(searchParams.get("next") || "/");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
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
