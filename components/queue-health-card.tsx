import { QueueHealthSnapshot } from "@agentops/contracts";

interface QueueHealthCardProps {
  health: QueueHealthSnapshot;
}

export function QueueHealthCard({ health }: QueueHealthCardProps): JSX.Element {
  return (
    <section className="card">
      <div className="section-title">
        <h2>Queue Health</h2>
        <span className={health.enabled ? "pill-ok" : "pill-warn"}>
          {health.enabled ? "enabled" : "disabled"}
        </span>
      </div>
      <p className="hint">
        {health.queueName} | worker concurrency: {health.workerConcurrency}
      </p>
      <div className="grid-cards">
        <article className="card">
          <p className="metric-label">Waiting</p>
          <p className="metric-value">{health.counts.waiting}</p>
        </article>
        <article className="card">
          <p className="metric-label">Active</p>
          <p className="metric-value">{health.counts.active}</p>
        </article>
        <article className="card">
          <p className="metric-label">Delayed</p>
          <p className="metric-value">{health.counts.delayed}</p>
        </article>
        <article className="card">
          <p className="metric-label">Failed</p>
          <p className="metric-value">{health.counts.failed}</p>
        </article>
      </div>
    </section>
  );
}
