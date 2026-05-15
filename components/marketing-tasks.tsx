"use client";

import { MarketingTaskRecord } from "@agentops/contracts";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";

interface MarketingTasksProps {
  tasks: MarketingTaskRecord[];
}

interface FinalOutputDetails {
  headline?: string;
  body?: string;
  note?: string;
  platformBodyLabel?: string;
}

type OutputState = "draft" | "error" | "pending" | "empty";
type ContentAgentSelection = "openclaw" | "custom";

const openclawTaskTypes = [
  "GENERATE_ARTICLE",
  "GENERATE_SOCIAL_POST",
  "CONTENT_DRAFT_GENERATE",
  "TREND_ANALYZE",
  "CONCEPT_GENERATE",
  "CONCEPT_SCORE",
  "CONTENT_PLAN_GENERATE"
] as const;

function toSingleLine(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function extractImageUrlsFromText(text: string): string[] {
  const matches = text.match(/https?:\/\/[^\s)"']+\.(?:png|jpe?g|gif|webp|svg)(?:\?[^\s)"']*)?/gi);
  return matches ?? [];
}

function extractVideoUrlsFromText(text: string): string[] {
  const matches = text.match(/https?:\/\/[^\s)"']+\.(?:mp4|mov|webm|m3u8)(?:\?[^\s)"']*)?/gi);
  return matches ?? [];
}

function parseStructuredResultString(value: unknown): Record<string, unknown> | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) return undefined;

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : undefined;
  } catch {
    return undefined;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getNestedRecord(root: Record<string, unknown>, path: string[]): Record<string, unknown> | undefined {
  let current: unknown = root;
  for (const segment of path) {
    if (!isRecord(current)) return undefined;
    current = current[segment];
  }
  return isRecord(current) ? current : undefined;
}

function getNestedString(root: Record<string, unknown>, path: string[]): string | undefined {
  let current: unknown = root;
  for (const segment of path) {
    if (!isRecord(current)) return undefined;
    current = current[segment];
  }
  return typeof current === "string" && current.trim().length > 0 ? current.trim() : undefined;
}

function getPlainString(root: Record<string, unknown>, path: string[]): string | undefined {
  const value = getNestedString(root, path);
  if (!value) return undefined;
  return parseStructuredResultString(value) ? undefined : value;
}

function walkStructuredValues(
  value: unknown,
  visitor: (record: Record<string, unknown>) => string | undefined,
  seen = new Set<unknown>()
): string | undefined {
  if (!value || seen.has(value)) return undefined;
  seen.add(value);

  if (typeof value === "string") {
    const parsed = parseStructuredResultString(value);
    if (parsed) {
      return walkStructuredValues(parsed, visitor, seen);
    }
    return undefined;
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = walkStructuredValues(entry, visitor, seen);
      if (found) return found;
    }
    return undefined;
  }

  if (!isRecord(value)) {
    return undefined;
  }

  const direct = visitor(value);
  if (direct) return direct;

  for (const entry of Object.values(value)) {
    const found = walkStructuredValues(entry, visitor, seen);
    if (found) return found;
  }

  return undefined;
}

function getImageUrls(task: MarketingTaskRecord, draft?: string): string[] {
  const result = (task.result ?? {}) as Record<string, unknown>;
  const payload = task.payload as Record<string, unknown>;
  const payloadInput =
    payload.input && typeof payload.input === "object"
      ? (payload.input as Record<string, unknown>)
      : {};

  const imageUrls = toStringArray(result.imageUrls);
  const mediaUrls = toStringArray(result.mediaUrls);
  const inputMediaUrls = toStringArray(payloadInput.mediaUrls);
  const draftUrls = draft ? extractImageUrlsFromText(draft) : [];

  return [...new Set([...imageUrls, ...mediaUrls, ...inputMediaUrls, ...draftUrls])].slice(0, 8);
}

function getVideoUrls(task: MarketingTaskRecord, draft?: string): string[] {
  const result = (task.result ?? {}) as Record<string, unknown>;
  const payload = task.payload as Record<string, unknown>;
  const payloadInput =
    payload.input && typeof payload.input === "object"
      ? (payload.input as Record<string, unknown>)
      : {};

  const videoUrls = toStringArray(result.videoUrls);
  const mediaUrls = toStringArray(result.mediaUrls).filter((url) =>
    /\.(mp4|mov|webm|m3u8)(?:\?|$)/i.test(url)
  );
  const inputMediaUrls = toStringArray(payloadInput.mediaUrls).filter((url) =>
    /\.(mp4|mov|webm|m3u8)(?:\?|$)/i.test(url)
  );
  const draftUrls = draft ? extractVideoUrlsFromText(draft) : [];

  return [...new Set([...videoUrls, ...mediaUrls, ...inputMediaUrls, ...draftUrls])].slice(0, 6);
}

function getDraftOutput(task: MarketingTaskRecord): string | undefined {
  const finalOutput = getFinalOutputDetails(task);
  if (typeof finalOutput.body === "string" && finalOutput.body.trim().length > 0) {
    return finalOutput.body.trim();
  }

  const draftText = task.result?.draftText;
  if (typeof draftText === "string" && draftText.trim().length > 0) {
    return draftText.trim();
  }

  const article = task.result?.article;
  if (typeof article === "string" && article.trim().length > 0) {
    return article.trim();
  }

  const finalText = task.result?.finalText;
  if (typeof finalText === "string" && finalText.trim().length > 0) {
    return finalText.trim();
  }

  const notes = task.result?.notes;
  if (typeof notes === "string" && notes.trim().length > 0) {
    return notes.trim();
  }

  const transcript = task.result?.transcript;
  if (transcript && typeof transcript === "object") {
    const messages = Array.isArray((transcript as Record<string, unknown>).messages)
      ? ((transcript as Record<string, unknown>).messages as unknown[])
      : [];

    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const entry = messages[index];
      if (!entry || typeof entry !== "object") continue;
      const message = entry as Record<string, unknown>;
      if (message.role !== "assistant") continue;

      const content = message.content;
      if (Array.isArray(content)) {
        const textParts = content
          .map((item) => {
            if (!item || typeof item !== "object") return undefined;
            const part = item as Record<string, unknown>;
            return typeof part.text === "string" && part.text.trim().length > 0 ? part.text.trim() : undefined;
          })
          .filter((value): value is string => Boolean(value));

        if (textParts.length > 0) {
          return textParts.join("\n");
        }
      }

      if (typeof message.text === "string" && message.text.trim().length > 0) {
        return message.text.trim();
      }
    }
  }

  return undefined;
}

function getFinalOutputDetails(task: MarketingTaskRecord): FinalOutputDetails {
  const result = (task.result ?? {}) as Record<string, unknown>;
  const headline =
    walkStructuredValues(result, (record) =>
      getNestedString(record, ["article_draft", "headline"]) ??
      getNestedString(record, ["normalized_result", "payload", "headline"]) ??
      getNestedString(record, ["headline"]) ??
      getNestedString(record, ["title"])
    ) ??
    undefined;
  const body =
    walkStructuredValues(result, (record) =>
      getNestedString(record, ["article_draft", "draftText"]) ??
      getNestedString(record, ["normalized_result", "payload", "body"]) ??
      getPlainString(record, ["draftText"]) ??
      getPlainString(record, ["article"]) ??
      getPlainString(record, ["finalText"])
    ) ??
    undefined;
  const note =
    walkStructuredValues(result, (record) => {
      const articleDraft = getNestedRecord(record, ["article_draft"]);
      return (
        (articleDraft && getNestedString(articleDraft, ["notes"])) ??
        getPlainString(record, ["notes"]) ??
        (articleDraft && getNestedString(articleDraft, ["cta"])) ??
        undefined
      );
    }) ?? undefined;
  const platform = Array.isArray(task.platforms) && typeof task.platforms[0] === "string" ? task.platforms[0] : undefined;
  const platformBodyLabel =
    platform && platform.trim().length > 0
      ? `${platform.trim().charAt(0).toUpperCase()}${platform.trim().slice(1)} Text`
      : "Final Text";

  return {
    headline: headline?.trim(),
    body: body?.trim(),
    note: note?.trim(),
    platformBodyLabel
  };
}

function getTaskNote(task: MarketingTaskRecord): string | undefined {
  const notes = task.result?.notes;
  if (typeof notes === "string" && notes.trim().length > 0) {
    return notes.trim();
  }
  return undefined;
}

function getOpenclawDebug(task: MarketingTaskRecord): MarketingTaskRecord["openclaw"] | undefined {
  return task.openclaw;
}

function getRequestedOpenclaw(task: MarketingTaskRecord): boolean | undefined {
  const payload = task.payload as Record<string, unknown>;
  const payloadInput =
    payload.input && typeof payload.input === "object"
      ? (payload.input as Record<string, unknown>)
      : {};

  return typeof payloadInput.useOpenclaw === "boolean" ? payloadInput.useOpenclaw : undefined;
}

function getSelectedContentAgent(task: MarketingTaskRecord): string {
  const payload = task.payload as Record<string, unknown>;
  const payloadInput =
    payload.input && typeof payload.input === "object"
      ? (payload.input as Record<string, unknown>)
      : {};
  const selectedAgent = payloadInput.selectedContentAgent;

  if (selectedAgent === "openclaw") return "OpenClaw";
  if (selectedAgent === "custom") return "Our custom agent";
  return getRequestedOpenclaw(task) === true ? "OpenClaw" : "Our custom agent";
}

function summarizeTaskOutput(task: MarketingTaskRecord): string {
  if (task.error) return toSingleLine(`Error: ${task.error}`);
  if (["running", "queued", "awaiting-provider", "retrying"].includes(task.status)) {
    return task.status === "awaiting-provider"
      ? "Waiting on provider confirmation..."
      : task.status === "retrying"
        ? "Retrying after transient provider failure..."
        : "Generating draft...";
  }
  if (!task.result) return "-";

  const draftOutput = getDraftOutput(task);
  if (draftOutput) {
    return toSingleLine(draftOutput);
  }

  const publications = task.result.publications;
  if (Array.isArray(publications)) {
    const okCount = publications.filter(
      (item) => item && typeof item === "object" && (item as { status?: string }).status === "ok"
    ).length;
    return `Published ${okCount}/${publications.length} platform(s)`;
  }

  const raw = JSON.stringify(task.result);
  const singleLineRaw = toSingleLine(raw);
  return singleLineRaw.length > 240 ? `${singleLineRaw.slice(0, 237)}...` : singleLineRaw;
}

async function parseError(res: Response): Promise<string> {
  const raw = await res.text();
  if (!raw) return `Request failed (${res.status})`;

  try {
    const json = JSON.parse(raw) as { message?: string | string[] };
    if (Array.isArray(json.message)) return json.message.join("; ");
    if (typeof json.message === "string") return json.message;
  } catch {
    // ignore parse failures
  }

  return raw.slice(0, 260);
}

export function MarketingTasks({ tasks }: MarketingTasksProps): JSX.Element {
  const router = useRouter();
  const [rows, setRows] = useState<MarketingTaskRecord[]>(tasks);
  const [createTaskType, setCreateTaskType] = useState<(typeof openclawTaskTypes)[number]>("GENERATE_SOCIAL_POST");
  const [createPlatforms, setCreatePlatforms] = useState("facebook");
  const [createObjective, setCreateObjective] = useState("Write one short post for DigitalRealEstate.Today");
  const [createBy, setCreateBy] = useState("dashboard_operator");
  const [createPersona, setCreatePersona] = useState("founder-investor");
  const [createPillar, setCreatePillar] = useState("education");
  const [createContentAgent, setCreateContentAgent] = useState<ContentAgentSelection>("openclaw");
  const [createBusy, setCreateBusy] = useState(false);
  const [busyAction, setBusyAction] = useState<string>();
  const [actionError, setActionError] = useState<string>();
  const [actionNotice, setActionNotice] = useState<string>();

  useEffect(() => {
    setRows(tasks);
  }, [tasks]);

  const outputEntries = rows.map((task) => {
    const draft = getDraftOutput(task);
    const note = getTaskNote(task);
    const imageUrls = getImageUrls(task, draft);
    const videoUrls = getVideoUrls(task, draft);
    const isActive = ["running", "queued", "awaiting-provider", "retrying"].includes(task.status);
    if (draft) {
      return {
        task,
        content: draft,
        state: "draft" as OutputState,
        imageUrls,
        videoUrls,
        note
      };
    }

    if (task.error) {
      return {
        task,
        content: `Task failed: ${task.error}`,
        state: "error" as OutputState,
        imageUrls,
        videoUrls,
        note
      };
    }

    return {
      task,
      content: `No generated draft yet (status: ${task.status}).`,
      state: (isActive ? "pending" : "empty") as OutputState,
      imageUrls,
      videoUrls,
      note
    };
  });

  const draftCount = outputEntries.filter((entry) => entry.state === "draft").length;
  const listLimit = Math.max(50, rows.length);
  const hasActiveTasks = rows.some((task) =>
    ["running", "queued", "awaiting-provider", "retrying"].includes(task.status)
  );

  const refreshTasks = useCallback(async (): Promise<void> => {
    const response = await fetch(`/api/marketing/tasks?limit=${listLimit}`, { cache: "no-store" });
    if (!response.ok) {
      setActionError(await parseError(response));
      return;
    }

    const json = (await response.json()) as MarketingTaskRecord[];
    setRows(json);
  }, [listLimit]);

  useEffect(() => {
    const intervalMs = hasActiveTasks ? 3000 : 15000;
    const timer = window.setInterval(() => {
      if (busyAction) return;
      void refreshTasks();
    }, intervalMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [busyAction, hasActiveTasks, refreshTasks]);

  async function createMarketingTask(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setCreateBusy(true);
    setActionError(undefined);
    setActionNotice(undefined);

    try {
      const platforms = createPlatforms
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);

      const response = await fetch("/api/marketing/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskType: createTaskType,
          createdBy: createBy.trim() || "dashboard_operator",
          platforms,
          useOpenclaw: createContentAgent === "openclaw",
          payload: {
            objective: createObjective.trim(),
            persona: createPersona.trim() || undefined,
            pillar: createPillar.trim() || undefined,
            input: {
              brandName: "DigitalRealEstate.Today",
              selectedContentAgent: createContentAgent,
              useOpenclaw: createContentAgent === "openclaw"
            }
          }
        })
      });

      if (!response.ok) {
        setActionError(await parseError(response));
        return;
      }

      const json = (await response.json()) as { task?: { id?: string }; queued?: boolean };
      const selectedAgentLabel = createContentAgent === "openclaw" ? "OpenClaw" : "our custom agent";
      setActionNotice(
        `Created ${createTaskType} ${json.task?.id ? `as ${json.task.id}` : "task"} with ${selectedAgentLabel}.`
      );
      await refreshTasks();
      router.refresh();
    } finally {
      setCreateBusy(false);
    }
  }

  async function stopTask(taskId: string): Promise<void> {
    const key = `${taskId}:stop`;
    setBusyAction(key);
    setActionError(undefined);
    setActionNotice(undefined);

    try {
      const response = await fetch(`/api/marketing/tasks/${taskId}/stop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stoppedBy: "dashboard_operator" })
      });

      if (!response.ok) {
        setActionError(await parseError(response));
        return;
      }

      setActionNotice(`Stopped task ${taskId}.`);
      await refreshTasks();
      router.refresh();
    } finally {
      setBusyAction(undefined);
    }
  }

  async function restartTask(taskId: string): Promise<void> {
    const key = `${taskId}:restart`;
    setBusyAction(key);
    setActionError(undefined);
    setActionNotice(undefined);

    try {
      const response = await fetch(`/api/marketing/tasks/${taskId}/restart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restartedBy: "dashboard_operator" })
      });

      if (!response.ok) {
        setActionError(await parseError(response));
        return;
      }

      const json = (await response.json()) as { task?: { id?: string } };
      const newTaskId = json.task?.id;
      setActionNotice(newTaskId ? `Restarted as ${newTaskId}.` : `Restarted task ${taskId}.`);
      await refreshTasks();
      router.refresh();
    } finally {
      setBusyAction(undefined);
    }
  }

  return (
    <section className="card">
      <div className="section-title">
        <h2>Marketing Tasks</h2>
        <span className="hint">
          {hasActiveTasks ? "Auto-refreshing every 3s while tasks are running" : "Recent queue executions"}
        </span>
      </div>
      <form className="control-form" onSubmit={(event) => void createMarketingTask(event)}>
        <h3>Create Marketing Task</h3>
        <label>
          Task Type
          <select value={createTaskType} onChange={(event) => setCreateTaskType(event.target.value as (typeof openclawTaskTypes)[number])}>
            {openclawTaskTypes.map((taskType) => (
              <option key={taskType} value={taskType}>
                {taskType}
              </option>
            ))}
          </select>
        </label>
        <label>
          Platforms
          <input value={createPlatforms} onChange={(event) => setCreatePlatforms(event.target.value)} placeholder="facebook,linkedin" />
        </label>
        <label>
          Requested By
          <input value={createBy} onChange={(event) => setCreateBy(event.target.value)} required />
        </label>
        <label>
          Persona
          <input value={createPersona} onChange={(event) => setCreatePersona(event.target.value)} />
        </label>
        <label>
          Pillar
          <input value={createPillar} onChange={(event) => setCreatePillar(event.target.value)} />
        </label>
        <label>
          Content Agent
          <select
            value={createContentAgent}
            onChange={(event) => setCreateContentAgent(event.target.value as ContentAgentSelection)}
          >
            <option value="openclaw">OpenClaw</option>
            <option value="custom">Our custom agent</option>
          </select>
        </label>
        <label>
          Objective
          <textarea value={createObjective} onChange={(event) => setCreateObjective(event.target.value)} rows={3} required />
        </label>
        <button type="submit" disabled={createBusy}>
          {createBusy ? "Creating..." : "Create Marketing Task"}
        </button>
      </form>
      {actionError ? <p className="form-error">{actionError}</p> : null}
      {actionNotice ? <p className="form-success">{actionNotice}</p> : null}
      <table className="table">
        <thead>
          <tr>
            <th>Task</th>
            <th>Status</th>
            <th>Content Agent</th>
            <th>Platforms</th>
            <th>Output</th>
            <th>Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((task) => {
            const output = summarizeTaskOutput(task);
            const stopKey = `${task.id}:stop`;
            const restartKey = `${task.id}:restart`;
            const isStopping = busyAction === stopKey;
            const isRestarting = busyAction === restartKey;
            return (
              <tr key={task.id}>
                <td>{task.taskType}</td>
                <td>{task.status}</td>
                <td>{getSelectedContentAgent(task)}</td>
                <td>{task.platforms.join(",") || "-"}</td>
                <td className="marketing-output" title={output}>
                  {output}
                </td>
                <td>{new Date(task.updatedAt).toLocaleString()}</td>
                <td className="marketing-actions">
                  <div className="marketing-action-buttons">
                    {["running", "queued", "awaiting-provider", "retrying"].includes(task.status) ? (
                      <button
                        type="button"
                        className="marketing-action-btn marketing-stop-btn"
                        disabled={Boolean(busyAction)}
                        onClick={() => void stopTask(task.id)}
                      >
                        {isStopping ? "Stopping..." : "Stop"}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="marketing-action-btn"
                      disabled={Boolean(busyAction)}
                      onClick={() => void restartTask(task.id)}
                    >
                      {isRestarting ? "Restarting..." : "Restart"}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="marketing-drafts-area">
        <div className="section-title">
          <h3>Generated Draft Output</h3>
          <span className="hint">{draftCount} draft(s)</span>
        </div>

        <div className="marketing-drafts-list">
          {outputEntries.map(({ task, content, state, imageUrls, videoUrls, note }) => (
            <article key={`${task.id}-draft`} className="marketing-draft-card">
              {(() => {
                const finalOutput = getFinalOutputDetails(task);
                if (!finalOutput.headline && !finalOutput.body) {
                  return null;
                }

                return (
                  <div className="marketing-final-output">
                    <p className="marketing-final-label">Final Generated Text</p>
                    {finalOutput.headline ? <h4 className="marketing-final-headline">{finalOutput.headline}</h4> : null}
                    <p className="marketing-final-subtitle">{finalOutput.platformBodyLabel ?? "Final Text"} to post</p>
                    {finalOutput.body ? (
                      <p className="marketing-draft-text marketing-draft-text-draft">{finalOutput.body}</p>
                    ) : null}
                    {finalOutput.note ? <p className="hint">{finalOutput.note}</p> : null}
                  </div>
                );
              })()}
              {(() => {
                const openclaw = getOpenclawDebug(task);
                return openclaw ? (
                  <div className="marketing-openclaw-debug">
                    <p className="marketing-openclaw-meta">
                      OpenClaw | route: {openclaw.routeId ?? "-"} | run: {openclaw.status}
                      {openclaw.currentStepIndex ? ` | step ${openclaw.currentStepIndex}` : ""}
                      {openclaw.currentStepStatus ? ` (${openclaw.currentStepStatus})` : ""}
                      {openclaw.retryCount > 0 ? ` | retries: ${openclaw.retryCount}` : ""}
                      {openclaw.failureCategory ? ` | failure: ${openclaw.failureCategory}` : ""}
                    </p>
                    {openclaw.steps.length > 0 ? (
                      <ul className="marketing-openclaw-steps">
                        {openclaw.steps.map((step) => (
                          <li key={`${task.id}-step-${step.stepIndex}`}>
                            <span>
                              {step.stepIndex}. {step.stepName ?? "step"}
                            </span>
                            <span>{step.stepStatus}</span>
                            {step.handoffTo ? <span>handoff: {step.handoffTo}</span> : null}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {openclaw.checkpoints.length > 0 ? (
                      <p className="marketing-openclaw-checkpoints">
                        checkpoints:{" "}
                        {openclaw.checkpoints
                          .map((checkpoint) =>
                            `${checkpoint.checkpointType}${checkpoint.stepIndex ? `@${checkpoint.stepIndex}` : ""}${checkpoint.status ? `:${checkpoint.status}` : ""}`
                          )
                          .join(" | ")}
                      </p>
                    ) : null}
                  </div>
                ) : null;
              })()}
              <p className="marketing-draft-meta">
                {task.taskType} | {task.platforms.join(",") || "-"} |{" "}
                {new Date(task.updatedAt).toLocaleString()}
              </p>
              {state === "pending" ? (
                <div className="marketing-progress-wrap" aria-live="polite">
                  <p className="marketing-progress-line">
                    <span className="marketing-progress-dot" />
                    <span>
                      {task.status === "awaiting-provider"
                        ? "Provider confirmation in progress..."
                        : task.status === "retrying"
                          ? "Retrying provider operation..."
                          : "Agent is generating draft..."}
                    </span>
                    <span className="marketing-progress-status">status: {task.status}</span>
                  </p>
                  <div className="marketing-progress-bar" role="progressbar" aria-valuetext="In progress">
                    <span className="marketing-progress-fill" />
                  </div>
                </div>
              ) : null}
              {!getFinalOutputDetails(task).body ? (
                <>
                  <p className={`marketing-draft-text marketing-draft-text-${state}`}>{content}</p>
                  {note ? <p className="hint">{note}</p> : null}
                </>
              ) : null}
              {imageUrls.length > 0 ? (
                <div className="marketing-image-grid">
                  {imageUrls.map((url, index) => (
                    <figure key={`${task.id}-img-${index}`} className="marketing-image-card">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Generated marketing asset ${index + 1}`} loading="lazy" />
                    </figure>
                  ))}
                </div>
              ) : null}
              {videoUrls.length > 0 ? (
                <div className="marketing-video-grid">
                  {videoUrls.map((url, index) => (
                    <figure key={`${task.id}-video-${index}`} className="marketing-image-card">
                      <video src={url} controls preload="metadata" playsInline />
                    </figure>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
