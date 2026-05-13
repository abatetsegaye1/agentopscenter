"use client";

import { MarketingTaskRecord } from "@agentops/contracts";
import { useMemo, useState } from "react";
import { LiveTrendSnapshot } from "@/lib/api";

interface LiveTrendSignalsProps {
  initialSnapshot: LiveTrendSnapshot;
  tasks: MarketingTaskRecord[];
}

function toUsedSignals(tasks: MarketingTaskRecord[]): Array<{
  title: string;
  source?: string;
  link?: string;
  publishedAt?: string;
  score?: number;
  taskId: string;
  taskType: string;
}> {
  const list: Array<{
    title: string;
    source?: string;
    link?: string;
    publishedAt?: string;
    score?: number;
    taskId: string;
    taskType: string;
  }> = [];

  for (const task of tasks) {
    const value = task.result?.trendSignalsUsed;
    if (!Array.isArray(value)) continue;

    for (const raw of value) {
      if (!raw || typeof raw !== "object") continue;
      const item = raw as Record<string, unknown>;
      const title = typeof item.title === "string" ? item.title.trim() : "";
      if (!title) continue;

      list.push({
        title,
        source: typeof item.source === "string" ? item.source : undefined,
        link: typeof item.link === "string" ? item.link : undefined,
        publishedAt: typeof item.publishedAt === "string" ? item.publishedAt : undefined,
        score: Number.isFinite(Number(item.score)) ? Number(item.score) : undefined,
        taskId: task.id,
        taskType: task.taskType
      });
    }
  }

  const seen = new Set<string>();
  return list.filter((item) => {
    const key = item.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function parseError(res: Response): Promise<string> {
  const raw = await res.text();
  if (!raw) return `Request failed (${res.status})`;
  try {
    const parsed = JSON.parse(raw) as { message?: string | string[] };
    if (Array.isArray(parsed.message)) return parsed.message.join("; ");
    if (typeof parsed.message === "string") return parsed.message;
  } catch {
    // ignore
  }
  return raw.slice(0, 220);
}

export function LiveTrendSignals({ initialSnapshot, tasks }: LiveTrendSignalsProps): JSX.Element {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [query, setQuery] = useState(initialSnapshot.query);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const usedSignals = useMemo(() => toUsedSignals(tasks), [tasks]);

  async function refresh(): Promise<void> {
    setBusy(true);
    setError(undefined);
    try {
      const q = encodeURIComponent(query.trim() || "digital real estate");
      const res = await fetch(`/api/marketing/trends/live?q=${q}&limit=12`, { cache: "no-store" });
      if (!res.ok) {
        setError(await parseError(res));
        return;
      }
      const json = (await res.json()) as LiveTrendSnapshot;
      setSnapshot(json);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card">
      <div className="section-title">
        <h2>Live Trend Signals</h2>
        <span className="hint">{snapshot.signals.length} live signals</span>
      </div>

      <div className="approval-toolbar">
        <label>
          Query
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="digital real estate" />
        </label>
        <button type="button" onClick={() => void refresh()} disabled={busy}>
          {busy ? "Refreshing..." : "Refresh Signals"}
        </button>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="trend-grid">
        <article className="trend-card">
          <p className="trend-card-title">Live Headlines</p>
          <ul className="trend-list">
            {snapshot.signals.length === 0 ? <li className="hint">No live signals currently available.</li> : null}
            {snapshot.signals.map((signal, index) => (
              <li key={`${signal.title}-${index}`} className="trend-list-item">
                <a href={signal.link} target="_blank" rel="noreferrer">
                  {signal.title}
                </a>
                <p className="hint">
                  {signal.source} | score {signal.score.toFixed(2)}
                  {signal.publishedAt ? ` | ${new Date(signal.publishedAt).toLocaleString()}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </article>

        <article className="trend-card">
          <p className="trend-card-title">Headlines Used In Drafts</p>
          <ul className="trend-list">
            {usedSignals.length === 0 ? <li className="hint">No drafts have injected trend signals yet.</li> : null}
            {usedSignals.map((signal, index) => (
              <li key={`${signal.title}-${signal.taskId}-${index}`} className="trend-list-item">
                {signal.link ? (
                  <a href={signal.link} target="_blank" rel="noreferrer">
                    {signal.title}
                  </a>
                ) : (
                  <span>{signal.title}</span>
                )}
                <p className="hint">
                  {signal.taskType} | {signal.taskId}
                  {signal.source ? ` | ${signal.source}` : ""}
                  {Number.isFinite(signal.score) ? ` | score ${Number(signal.score).toFixed(2)}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
