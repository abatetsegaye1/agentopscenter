import { MarketingOverview } from "@agentops/contracts";

interface MarketingOverviewProps {
  overview: MarketingOverview;
}

export function MarketingOverviewCard({ overview }: MarketingOverviewProps): JSX.Element {
  return (
    <section className="card marketing-overview-card">
      <div className="section-title">
        <h2>Marketing Queue Health</h2>
        <span className={overview.failedTasks > 0 ? "pill-bad" : "pill-ok"}>
          Completion {overview.completionRatePct}%
        </span>
      </div>
      <div className="grid-cards marketing-overview-grid">
        <div className="card metric-card-compact">
          <p className="metric-label">Total Tasks</p>
          <p className="metric-value">{overview.totalTasks}</p>
        </div>
        <div className="card metric-card-compact">
          <p className="metric-label">Queued</p>
          <p className="metric-value">{overview.queuedTasks}</p>
        </div>
        <div className="card metric-card-compact">
          <p className="metric-label">Running</p>
          <p className="metric-value">{overview.runningTasks}</p>
        </div>
        <div className="card metric-card-compact">
          <p className="metric-label">Awaiting Provider</p>
          <p className="metric-value">{overview.awaitingProviderTasks}</p>
        </div>
        <div className="card metric-card-compact">
          <p className="metric-label">Retrying</p>
          <p className="metric-value">{overview.retryingTasks}</p>
        </div>
        <div className="card metric-card-compact">
          <p className="metric-label">Stalled</p>
          <p className="metric-value">{overview.stalledTasks}</p>
        </div>
        <div className="card metric-card-compact">
          <p className="metric-label">Completed</p>
          <p className="metric-value">{overview.completedTasks}</p>
        </div>
        <div className="card metric-card-compact">
          <p className="metric-label">Failed</p>
          <p className="metric-value">{overview.failedTasks}</p>
        </div>
      </div>
    </section>
  );
}
