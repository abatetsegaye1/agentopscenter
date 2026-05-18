"use client";

import { AuthSession } from "@/lib/auth";
import { FormEvent, useState } from "react";

interface MfaSettingsProps {
  session: AuthSession;
  onClose: () => void;
}

interface MfaSetupPayload {
  secret: string;
  otpauthUrl: string;
}

export function MfaSettings({ session, onClose }: MfaSettingsProps): JSX.Element {
  const [setup, setSetup] = useState<MfaSetupPayload>();
  const [code, setCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function startSetup(): Promise<void> {
    setBusy(true);
    setError(undefined);
    setNotice(undefined);
    setRecoveryCodes([]);
    try {
      const response = await fetch("/api/auth/mfa/setup", {
        method: "POST",
        headers: { authorization: `Bearer ${session.accessToken}` }
      });
      const raw = await response.text();
      if (!response.ok) {
        setError(parseApiMessage(raw) || `MFA setup failed (${response.status})`);
        return;
      }
      setSetup(JSON.parse(raw) as MfaSetupPayload);
      setNotice("Add this secret to Google Authenticator, Authy, or another TOTP app.");
    } catch (setupError) {
      setError(setupError instanceof Error ? setupError.message : "MFA setup failed");
    } finally {
      setBusy(false);
    }
  }

  async function enableMfa(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setError(undefined);
    setNotice(undefined);
    try {
      const response = await fetch("/api/auth/mfa/enable", {
        method: "POST",
        headers: {
          authorization: `Bearer ${session.accessToken}`,
          "content-type": "application/json"
        },
        body: JSON.stringify({ code })
      });
      const raw = await response.text();
      if (!response.ok) {
        setError(parseApiMessage(raw) || `MFA enable failed (${response.status})`);
        return;
      }
      const payload = JSON.parse(raw) as { recoveryCodes?: string[] };
      setRecoveryCodes(payload.recoveryCodes ?? []);
      setNotice("MFA is enabled. Store the recovery codes now; they will not be shown again.");
      setCode("");
    } catch (enableError) {
      setError(enableError instanceof Error ? enableError.message : "MFA enable failed");
    } finally {
      setBusy(false);
    }
  }

  async function disableMfa(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setError(undefined);
    setNotice(undefined);
    try {
      const response = await fetch("/api/auth/mfa/disable", {
        method: "POST",
        headers: {
          authorization: `Bearer ${session.accessToken}`,
          "content-type": "application/json"
        },
        body: JSON.stringify({ currentPassword: disablePassword })
      });
      const raw = await response.text();
      if (!response.ok) {
        setError(parseApiMessage(raw) || `MFA disable failed (${response.status})`);
        return;
      }
      setSetup(undefined);
      setCode("");
      setRecoveryCodes([]);
      setDisablePassword("");
      setNotice("MFA is disabled for this account.");
    } catch (disableError) {
      setError(disableError instanceof Error ? disableError.message : "MFA disable failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mfa-panel">
      <div className="section-title">
        <h2>MFA Setup</h2>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>

      {error ? <p className="form-error">{error}</p> : null}
      {notice ? <p className="form-success">{notice}</p> : null}

      {!setup ? (
        <button type="button" onClick={() => void startSetup()} disabled={busy}>
          {busy ? "Starting..." : "Enable MFA"}
        </button>
      ) : (
        <form className="control-form" onSubmit={enableMfa}>
          <label>
            Manual setup key
            <input value={setup.secret} readOnly />
          </label>
          <label>
            Authenticator URI
            <textarea rows={3} value={setup.otpauthUrl} readOnly />
          </label>
          <label>
            Verification code
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={busy || !code.trim()}>
            {busy ? "Verifying..." : "Verify and Enable"}
          </button>
        </form>
      )}

      {recoveryCodes.length > 0 ? (
        <div className="recovery-codes">
          <strong>Recovery Codes</strong>
          <ul>
            {recoveryCodes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <form className="control-form" onSubmit={disableMfa}>
        <h3>Disable MFA</h3>
        <label>
          Current password
          <input
            type="password"
            autoComplete="current-password"
            value={disablePassword}
            onChange={(event) => setDisablePassword(event.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={busy || !disablePassword}>
          {busy ? "Disabling..." : "Disable MFA"}
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
