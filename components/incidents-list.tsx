import { IncidentRecord } from "@agentops/contracts";

export function IncidentsList({ incidents }: { incidents: IncidentRecord[] }): JSX.Element {
  return (
    <section className="card">
      <h2>Incident Queue</h2>
      <ul className="feed-list">
        {incidents.slice(0, 10).map((incident) => (
          <li key={incident.id} className={`feed-item severity-${incident.severity}`}>
            <p>
              <strong>{incident.workflow}</strong> | {incident.runId} | {incident.status}
            </p>
            <p>{incident.reason}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
