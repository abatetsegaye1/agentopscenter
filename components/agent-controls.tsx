"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { OpsTaskRecord } from "@agentops/contracts";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "https://opsapi.digitalrealestate.today/api";

interface CommandRecord {
  id: string;
  status: string;
  responseText?: string;
  executionType?: "marketing" | "ops";
  executionRef?: string;
  requiresApproval: boolean;
}

interface OpsCreateResponse {
  task: OpsTaskRecord;
  run: {
    id: string;
    status: string;
  };
}

type AgentProfile = "admin" | "developer" | "operator" | "viewer";

async function parseError(res: Response): Promise<string> {
  const raw = await res.text();
  if (!raw) return `Request failed (${res.status})`;

  try {
    const json = JSON.parse(raw) as { message?: string | string[] };
    if (Array.isArray(json.message)) return json.message.join("; ");
    if (typeof json.message === "string") return json.message;
  } catch {
    // Ignore parse failures and return raw text.
  }

  return raw.slice(0, 300);
}

export function AgentControls(): JSX.Element {
  const router = useRouter();

  const [commandRequestedBy, setCommandRequestedBy] = useState("dashboard_operator");
  const [commandMode, setCommandMode] = useState<"proposal" | "execution">("execution");
  const [commandText, setCommandText] = useState("/marketing GENERATE_SOCIAL_POST linkedin,x | Draft a high-converting founder post");
  const [commandBusy, setCommandBusy] = useState(false);
  const [commandError, setCommandError] = useState<string>();
  const [commandResult, setCommandResult] = useState<CommandRecord>();
  const [commandReviewBusy, setCommandReviewBusy] = useState(false);
  const [commandRejectReason, setCommandRejectReason] = useState("");

  const [taskTitle, setTaskTitle] = useState("Investigate drop in conversion rate for paid traffic");
  const [taskRequestedBy, setTaskRequestedBy] = useState("dashboard_operator");
  const [taskPriority, setTaskPriority] = useState<OpsTaskRecord["priority"]>("normal");
  const [taskProfile, setTaskProfile] = useState<AgentProfile>("operator");
  const [taskPayloadText, setTaskPayloadText] = useState("{\n  \"source\": \"dashboard-control\"\n}");
  const [taskBusy, setTaskBusy] = useState(false);
  const [taskError, setTaskError] = useState<string>();
  const [taskResult, setTaskResult] = useState<OpsCreateResponse>();

  async function handleCommandSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setCommandBusy(true);
    setCommandError(undefined);
    setCommandResult(undefined);
    setCommandRejectReason("");

    try {
      const response = await fetch(`${API_BASE}/commands`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "dashboard",
          requestedBy: commandRequestedBy.trim(),
          text: commandText.trim(),
          mode: commandMode
        })
      });

      if (!response.ok) {
        setCommandError(await parseError(response));
        return;
      }

      const json = (await response.json()) as CommandRecord;
      setCommandResult(json);
      router.refresh();
    } finally {
      setCommandBusy(false);
    }
  }

  async function handleApproveLatestCommand(): Promise<void> {
    if (!commandResult) return;
    setCommandReviewBusy(true);
    setCommandError(undefined);

    try {
      const response = await fetch(`${API_BASE}/commands/${commandResult.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvedBy: commandRequestedBy.trim() || "dashboard_reviewer" })
      });

      if (!response.ok) {
        setCommandError(await parseError(response));
        return;
      }

      const json = (await response.json()) as CommandRecord;
      setCommandResult(json);
      router.refresh();
    } finally {
      setCommandReviewBusy(false);
    }
  }

  async function handleRejectLatestCommand(): Promise<void> {
    if (!commandResult) return;
    const reason = commandRejectReason.trim();
    if (!reason) {
      setCommandError("Provide a rejection reason before rejecting.");
      return;
    }

    setCommandReviewBusy(true);
    setCommandError(undefined);

    try {
      const response = await fetch(`${API_BASE}/commands/${commandResult.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rejectedBy: commandRequestedBy.trim() || "dashboard_reviewer",
          reason
        })
      });

      if (!response.ok) {
        setCommandError(await parseError(response));
        return;
      }

      const json = (await response.json()) as CommandRecord;
      setCommandResult(json);
      setCommandRejectReason("");
      router.refresh();
    } finally {
      setCommandReviewBusy(false);
    }
  }

  async function handleTaskSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setTaskBusy(true);
    setTaskError(undefined);
    setTaskResult(undefined);

    try {
      let payload: Record<string, unknown> = {};
      try {
        const parsed = JSON.parse(taskPayloadText);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          setTaskError("Payload must be a JSON object.");
          return;
        }
        payload = parsed as Record<string, unknown>;
      } catch {
        setTaskError("Payload is not valid JSON.");
        return;
      }

      const response = await fetch(`${API_BASE}/ops/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskTitle.trim(),
          source: "dashboard",
          priority: taskPriority,
          requestedBy: taskRequestedBy.trim(),
          agentProfile: taskProfile,
          payload
        })
      });

      if (!response.ok) {
        setTaskError(await parseError(response));
        return;
      }

      const json = (await response.json()) as OpsCreateResponse;
      setTaskResult(json);
      router.refresh();
    } finally {
      setTaskBusy(false);
    }
  }

  return (
    <section className="card">
      <div className="section-title">
        <h2>Agent Controls</h2>
        <span className="hint">Direct backend execution controls</span>
      </div>

      <div className="agent-controls-grid">
        <form className="control-form" onSubmit={(event) => void handleCommandSubmit(event)}>
          <h3>Send Agent Command</h3>
          <label>
            Requested By
            <input
              value={commandRequestedBy}
              onChange={(event) => setCommandRequestedBy(event.target.value)}
              required
            />
          </label>

          <label>
            Mode
            <select value={commandMode} onChange={(event) => setCommandMode(event.target.value as "proposal" | "execution")}>
              <option value="execution">execution</option>
              <option value="proposal">proposal</option>
            </select>
          </label>

          <label>
            Command
            <textarea
              value={commandText}
              onChange={(event) => setCommandText(event.target.value)}
              rows={4}
              required
            />
          </label>

          <button type="submit" disabled={commandBusy}>
            {commandBusy ? "Sending..." : "Send Command"}
          </button>

          {commandError ? <p className="form-error">{commandError}</p> : null}
          {commandResult ? (
            <>
              <p className="form-success">
                {commandResult.status.toUpperCase()} | id={commandResult.id}
                {commandResult.executionType ? ` | execution=${commandResult.executionType}` : ""}
                {commandResult.executionRef ? ` | ref=${commandResult.executionRef}` : ""}
                {commandResult.responseText ? ` | ${commandResult.responseText}` : ""}
              </p>
              {(commandResult.status === "pending_approval" || commandResult.status === "proposed") && (
                <div className="row-actions">
                  <textarea
                    rows={2}
                    placeholder="Rejection reason (required for reject)"
                    value={commandRejectReason}
                    onChange={(event) => setCommandRejectReason(event.target.value)}
                  />
                  <div className="row-buttons">
                    <button type="button" disabled={commandReviewBusy} onClick={() => void handleApproveLatestCommand()}>
                      {commandReviewBusy ? "Working..." : "Approve"}
                    </button>
                    <button
                      type="button"
                      className="danger-btn"
                      disabled={commandReviewBusy}
                      onClick={() => void handleRejectLatestCommand()}
                    >
                      {commandReviewBusy ? "Working..." : "Reject"}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </form>

        <form className="control-form" onSubmit={(event) => void handleTaskSubmit(event)}>
          <h3>Create Ops Task</h3>
          <label>
            Title
            <input value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} required />
          </label>

          <label>
            Requested By
            <input
              value={taskRequestedBy}
              onChange={(event) => setTaskRequestedBy(event.target.value)}
              required
            />
          </label>

          <label>
            Agent Profile
            <select value={taskProfile} onChange={(event) => setTaskProfile(event.target.value as AgentProfile)}>
              <option value="admin">admin</option>
              <option value="developer">developer</option>
              <option value="operator">operator</option>
              <option value="viewer">viewer</option>
            </select>
          </label>

          <label>
            Priority
            <select value={taskPriority} onChange={(event) => setTaskPriority(event.target.value as OpsTaskRecord["priority"])}>
              <option value="low">low</option>
              <option value="normal">normal</option>
              <option value="high">high</option>
              <option value="critical">critical</option>
            </select>
          </label>

          <label>
            Payload (JSON object)
            <textarea
              value={taskPayloadText}
              onChange={(event) => setTaskPayloadText(event.target.value)}
              rows={4}
            />
          </label>

          <button type="submit" disabled={taskBusy}>
            {taskBusy ? "Creating..." : "Create Ops Task"}
          </button>

          {taskError ? <p className="form-error">{taskError}</p> : null}
          {taskResult ? (
            <p className="form-success">
              CREATED | task={taskResult.task.id} ({taskResult.task.status}) | run={taskResult.run.id} ({taskResult.run.status})
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
