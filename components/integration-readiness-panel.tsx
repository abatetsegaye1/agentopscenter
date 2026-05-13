"use client";

import { IntegrationReadinessSnapshot } from "@agentops/contracts";
import { useEffect, useState } from "react";

interface IntegrationReadinessPanelProps {
  snapshots: IntegrationReadinessSnapshot[];
}

function pillClass(state: IntegrationReadinessSnapshot["state"]): string {
  switch (state) {
    case "ready":
      return "pill-ok";
    case "awaiting-approval":
      return "pill-warn";
    case "misconfigured":
    case "token-expired":
    case "account-not-linked":
    case "permission-missing":
      return "pill-bad";
    default:
      return "pill-neutral";
  }
}

export function IntegrationReadinessPanel({ snapshots }: IntegrationReadinessPanelProps): JSX.Element {
  const [rows, setRows] = useState(snapshots);
  const [probing, setProbing] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    setRows(snapshots);
  }, [snapshots]);

  async function runProbe(): Promise<void> {
    setProbing(true);
    setError(undefined);
    try {
      const response = await fetch("/api/marketing/integrations/readiness?probe=true", { cache: "no-store" });
      if (!response.ok) {
        setError(`Probe failed (${response.status})`);
        return;
      }
      setRows((await response.json()) as IntegrationReadinessSnapshot[]);
    } catch (probeError) {
      setError((probeError as Error).message);
    } finally {
      setProbing(false);
    }
  }

  return (
    <section className="card">
      <div className="section-title">
        <h2>Integration Readiness</h2>
        <button type="button" className="marketing-action-btn" disabled={probing} onClick={() => void runProbe()}>
          {probing ? "Probing..." : "Run Live Probe"}
        </button>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      <table className="table">
        <thead>
          <tr>
            <th>Platform</th>
            <th>State</th>
            <th>Summary</th>
            <th>Probe</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((snapshot) => (
            <tr key={snapshot.platform}>
              <td>{snapshot.platform}</td>
              <td>
                <span className={pillClass(snapshot.state)}>{snapshot.state}</span>
              </td>
              <td>{snapshot.summary}</td>
              <td>{String(snapshot.diagnostics.liveProbeStatus ?? "not-run")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
