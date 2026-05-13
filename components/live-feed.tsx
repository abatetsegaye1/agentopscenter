"use client";

import { AgentEvent } from "@agentops/contracts";
import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "https://opsapi.digitalrealestate.today/api";
const WS_BASE = process.env.NEXT_PUBLIC_WS_BASE ?? "https://opsapi.digitalrealestate.today";

export function LiveFeed({ initialEvents }: { initialEvents: AgentEvent[] }): JSX.Element {
  const [events, setEvents] = useState<AgentEvent[]>(initialEvents);

  useEffect(() => {
    const socket = io(`${WS_BASE}/events`, { transports: ["websocket"] });

    socket.on("agent.event", (event: AgentEvent) => {
      setEvents((current) => [event, ...current].slice(0, 30));
    });

    return () => {
      socket.close();
    };
  }, []);

  const criticalCount = useMemo(
    () => events.filter((event) => event.severity === "critical").length,
    [events]
  );

  return (
    <section className="card">
      <div className="section-title">
        <h2>Live Agent Activity</h2>
        <span>{criticalCount} critical</span>
      </div>
      <ul className="feed-list">
        {events.map((event) => (
          <li key={event.id} className={`feed-item severity-${event.severity}`}>
            <p>
              <strong>{event.type}</strong> | {event.workflow} | {event.agentId}
            </p>
            <p>
              {new Date(event.timestamp).toLocaleString()} | {event.message}
            </p>
          </li>
        ))}
      </ul>
      <p className="hint">Backend API: {API_BASE}</p>
    </section>
  );
}
