import { OpsAuditRecord } from "@agentops/contracts";

export function OpsAudit({ audit }: { audit: OpsAuditRecord[] }): JSX.Element {
  return (
    <section className="card">
      <h2>Policy & Audit Log</h2>
      <ul className="feed-list">
        {audit.slice(0, 12).map((entry) => (
          <li key={entry.id} className={`feed-item ${entry.outcome === "denied" ? "severity-critical" : "severity-info"}`}>
            <p>
              <strong>{entry.action}</strong> | {entry.actor} | {entry.outcome}
            </p>
            <p>{new Date(entry.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
