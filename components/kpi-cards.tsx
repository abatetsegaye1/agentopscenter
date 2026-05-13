import { OverviewMetrics } from "@agentops/contracts";

export function KpiCards({ metrics }: { metrics: OverviewMetrics }): JSX.Element {
  const items = [
    ["Active Runs", String(metrics.activeRuns)],
    ["Runs (24h)", String(metrics.runsLast24h)],
    ["Success Rate", `${metrics.successRatePct}%`],
    ["Avg Latency", `${metrics.avgLatencyMs} ms`],
    ["Total Cost (24h)", `$${metrics.totalCostUsd24h}`],
    ["Critical Incidents", String(metrics.criticalIncidents24h)]
  ];

  return (
    <section className="grid-cards">
      {items.map(([label, value]) => (
        <article key={label} className="card metric-card">
          <p className="metric-label">{label}</p>
          <p className="metric-value">{value}</p>
        </article>
      ))}
    </section>
  );
}
