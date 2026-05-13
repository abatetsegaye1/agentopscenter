import { MarketingLifecycleEventRecord } from "@agentops/contracts";

interface MarketingLifecycleEventsProps {
  events: MarketingLifecycleEventRecord[];
}

function summarizePayload(payload: Record<string, unknown>): string {
  const raw = JSON.stringify(payload);
  return raw.length > 180 ? `${raw.slice(0, 177)}...` : raw;
}

export function MarketingLifecycleEvents({ events }: MarketingLifecycleEventsProps): JSX.Element {
  return (
    <section className="card">
      <div className="section-title">
        <h2>Lifecycle Events</h2>
        <span className="hint">{events.length} recent records</span>
      </div>
      <ul className="feed-list">
        {events.map((event) => (
          <li key={event.id} className="feed-item severity-info">
            <p>
              <strong>{event.eventName}</strong> | {new Date(event.emittedAt).toLocaleString()}
            </p>
            <p>{summarizePayload(event.payload)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
