"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CommandRecord } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "https://opsapi.digitalrealestate.today/api";

function summarizeResult(command: CommandRecord): string {
  if (command.responseText) return command.responseText;
  if (command.executionResult) {
    const raw = JSON.stringify(command.executionResult);
    return raw.length > 180 ? `${raw.slice(0, 177)}...` : raw;
  }
  if (command.executionType && command.executionRef) {
    return `${command.executionType}:${command.executionRef}`;
  }
  return command.parsed.summary;
}

function statusClass(status: CommandRecord["status"]): string {
  if (status === "executed") return "pill-ok";
  if (status === "pending_approval" || status === "proposed") return "pill-warn";
  if (status === "failed" || status === "rejected") return "pill-bad";
  return "pill-neutral";
}

async function parseError(res: Response): Promise<string> {
  const raw = await res.text();
  if (!raw) return `Request failed (${res.status})`;

  try {
    const json = JSON.parse(raw) as { message?: string | string[] };
    if (Array.isArray(json.message)) return json.message.join("; ");
    if (typeof json.message === "string") return json.message;
  } catch {
    // ignore
  }

  return raw.slice(0, 260);
}

export function AgentResults({ initialCommands }: { initialCommands: CommandRecord[] }): JSX.Element {
  const router = useRouter();
  const [commands, setCommands] = useState<CommandRecord[]>(initialCommands);
  const [reviewer, setReviewer] = useState("dashboard_reviewer");
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string>();
  const [actionError, setActionError] = useState<string>();

  useEffect(() => {
    setCommands(initialCommands);
  }, [initialCommands]);

  const pendingCount = useMemo(
    () => commands.filter((item) => item.status === "pending_approval" || item.status === "proposed").length,
    [commands]
  );

  const canApprove = (status: CommandRecord["status"]): boolean =>
    status === "pending_approval" || status === "proposed";

  async function refreshCommands(): Promise<void> {
    const response = await fetch(`${API_BASE}/commands?limit=30`, { cache: "no-store" });
    if (!response.ok) {
      setActionError(await parseError(response));
      return;
    }
    const json = (await response.json()) as CommandRecord[];
    setCommands(json);
  }

  async function approveCommand(commandId: string): Promise<void> {
    setBusyId(commandId);
    setActionError(undefined);

    try {
      const response = await fetch(`${API_BASE}/commands/${commandId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvedBy: reviewer.trim() || "dashboard_reviewer" })
      });

      if (!response.ok) {
        setActionError(await parseError(response));
        return;
      }

      await refreshCommands();
      router.refresh();
    } finally {
      setBusyId(undefined);
    }
  }

  async function rejectCommand(commandId: string): Promise<void> {
    setBusyId(commandId);
    setActionError(undefined);

    try {
      const reason = (rejectReasons[commandId] ?? "").trim();
      if (!reason) {
        setActionError("Provide a rejection reason before rejecting.");
        return;
      }

      const response = await fetch(`${API_BASE}/commands/${commandId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rejectedBy: reviewer.trim() || "dashboard_reviewer",
          reason
        })
      });

      if (!response.ok) {
        setActionError(await parseError(response));
        return;
      }

      setRejectReasons((current) => ({ ...current, [commandId]: "" }));
      await refreshCommands();
      router.refresh();
    } finally {
      setBusyId(undefined);
    }
  }

  return (
    <section className="card">
      <div className="section-title">
        <h2>Agent Results & Approvals</h2>
        <span className={pendingCount > 0 ? "pill-warn" : "pill-ok"}>
          {pendingCount} pending approval
        </span>
      </div>

      <div className="approval-toolbar">
        <label>
          Reviewer
          <input
            value={reviewer}
            onChange={(event) => setReviewer(event.target.value)}
            placeholder="dashboard_reviewer"
          />
        </label>
        <button type="button" onClick={() => void refreshCommands()}>
          Refresh Results
        </button>
      </div>

      {actionError ? <p className="form-error">{actionError}</p> : null}

      <table className="table command-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Requested By</th>
            <th>Command</th>
            <th>Status</th>
            <th>Result</th>
            <th>Approval</th>
          </tr>
        </thead>
        <tbody>
          {commands.length === 0 ? (
            <tr>
              <td colSpan={6}>
                <span className="hint">No commands yet. Submit a command to see approval actions.</span>
              </td>
            </tr>
          ) : (
            commands.map((command) => (
              <tr key={command.id}>
                <td>{new Date(command.updatedAt).toLocaleString()}</td>
                <td>{command.requestedBy}</td>
                <td>
                  <p className="command-summary">{command.parsed.summary}</p>
                  <p className="command-raw">{command.rawText}</p>
                </td>
                <td>
                  <span className={statusClass(command.status)}>{command.status}</span>
                </td>
                <td className="command-result">{summarizeResult(command)}</td>
                <td>
                  {canApprove(command.status) ? (
                    <div className="row-actions">
                      <textarea
                        rows={2}
                        placeholder="Rejection reason (required for reject)"
                        value={rejectReasons[command.id] ?? ""}
                        onChange={(event) =>
                          setRejectReasons((current) => ({
                            ...current,
                            [command.id]: event.target.value
                          }))
                        }
                      />
                      <div className="row-buttons">
                        <button
                          type="button"
                          disabled={busyId === command.id}
                          onClick={() => void approveCommand(command.id)}
                        >
                          {busyId === command.id ? "Working..." : "Approve"}
                        </button>
                        <button
                          type="button"
                          className="danger-btn"
                          disabled={busyId === command.id}
                          onClick={() => void rejectCommand(command.id)}
                        >
                          {busyId === command.id ? "Working..." : "Reject"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span className="hint">
                      {command.approvedBy
                        ? `Approved by ${command.approvedBy}`
                        : command.rejectedBy
                          ? `Rejected by ${command.rejectedBy}`
                          : "-"}
                    </span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}
