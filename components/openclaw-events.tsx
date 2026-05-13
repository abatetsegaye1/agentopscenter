import { OpenClawRawEvent } from "@agentops/contracts";

export function OpenClawEvents({ events }: { events: OpenClawRawEvent[] }): JSX.Element {
  return (
    <section className="card">
      <h2>OpenClaw Raw Events</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Event</th>
            <th>Agent</th>
            <th>Run</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {events.slice(0, 12).map((event) => (
            <tr key={event.id}>
              <td>{new Date(event.ts).toLocaleTimeString()}</td>
              <td>{event.event}</td>
              <td>{event.agentId ?? "-"}</td>
              <td>{event.runId ?? "-"}</td>
              <td>{event.error ? "error" : event.status ?? "ok"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
