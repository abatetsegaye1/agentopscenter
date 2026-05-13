import { PairingRequestRecord } from "@agentops/contracts";

export function PairingRequests({ requests }: { requests: PairingRequestRecord[] }): JSX.Element {
  return (
    <section className="card">
      <h2>Device Pairing Requests</h2>
      <ul className="feed-list">
        {requests.slice(0, 8).map((request) => (
          <li key={request.id} className="feed-item severity-warning">
            <p>
              <strong>{request.deviceId}</strong> | {request.channel} | {request.status}
            </p>
            <p>
              by {request.requestedBy} | {new Date(request.createdAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
