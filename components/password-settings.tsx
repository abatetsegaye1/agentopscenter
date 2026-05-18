"use client";

import { AuthSession } from "@/lib/auth";
import { FormEvent, useState } from "react";

interface PasswordSettingsProps {
  session: AuthSession;
  onClose: () => void;
}

export function PasswordSettings({ session, onClose }: PasswordSettingsProps): JSX.Element {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function updatePassword(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(undefined);
    setNotice(undefined);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password confirmation does not match.");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/auth/password", {
        method: "POST",
        headers: {
          authorization: `Bearer ${session.accessToken}`,
          "content-type": "application/json"
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const raw = await response.text();
      if (!response.ok) {
        setError(parseApiMessage(raw) || `Password update failed (${response.status})`);
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setNotice("Password updated.");
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Password update failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mfa-panel">
      <div className="section-title">
        <h2>Password</h2>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>

      {error ? <p className="form-error">{error}</p> : null}
      {notice ? <p className="form-success">{notice}</p> : null}

      <form className="control-form" onSubmit={updatePassword}>
        <label>
          Current password
          <input
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
          />
        </label>
        <label>
          New password
          <input
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
            minLength={8}
          />
        </label>
        <label>
          Confirm new password
          <input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            minLength={8}
          />
        </label>
        <button
          type="submit"
          disabled={busy || !currentPassword || !newPassword || !confirmPassword}
        >
          {busy ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
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
