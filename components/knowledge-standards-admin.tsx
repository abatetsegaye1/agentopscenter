"use client";

import { KnowledgeComplianceSummary, KnowledgeStandardRecord } from "@agentops/contracts";
import { useMemo, useState } from "react";

interface KnowledgeStandardsAdminProps {
  activeStandard: KnowledgeStandardRecord;
  standards: KnowledgeStandardRecord[];
  recentCompliance: KnowledgeComplianceSummary[];
}

export function KnowledgeStandardsAdmin({
  activeStandard,
  standards,
  recentCompliance
}: KnowledgeStandardsAdminProps): JSX.Element {
  const [busyAction, setBusyAction] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [error, setError] = useState<string>();

  const history = useMemo(
    () => standards.filter((item) => item.standardKey === activeStandard.standardKey),
    [activeStandard.standardKey, standards]
  );

  async function runAction(key: string, request: () => Promise<Response>, successText: string): Promise<void> {
    setBusyAction(key);
    setNotice(undefined);
    setError(undefined);
    try {
      const res = await request();
      const raw = await res.text();
      if (!res.ok) {
        setError(raw || `Request failed (${res.status})`);
        return;
      }
      setNotice(successText);
    } finally {
      setBusyAction(undefined);
    }
  }

  return (
    <section className="card">
      <div className="section-title">
        <h2>Knowledge Standards</h2>
        <span className="hint">Platform doctrine governance</span>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      {notice ? <p className="form-success">{notice}</p> : null}

      <div className="stack">
        <div>
          <strong>Active Standard</strong>
          <div>
            {activeStandard.title} | v{activeStandard.version} | {activeStandard.authorityName}
          </div>
          <p>{activeStandard.doctrineText}</p>
        </div>

        <div>
          <strong>Version History</strong>
          <table className="table">
            <thead>
              <tr>
                <th>Version</th>
                <th>Status</th>
                <th>Authority</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map((standard) => {
                const activateKey = `activate:${standard.id}`;
                const archiveKey = `archive:${standard.id}`;
                return (
                  <tr key={standard.id}>
                    <td>v{standard.version}</td>
                    <td>{standard.status}</td>
                    <td>{standard.authorityName}</td>
                    <td>{new Date(standard.updatedAt).toLocaleString()}</td>
                    <td className="row-buttons">
                      <button
                        disabled={Boolean(busyAction) || standard.status === "active"}
                        onClick={() =>
                          void runAction(
                            activateKey,
                            () =>
                              fetch(`/api/marketing/knowledge-standards/${standard.id}/activate`, {
                                method: "POST",
                                headers: { "content-type": "application/json" },
                                body: JSON.stringify({ actor: "dashboard_admin" })
                              }),
                            `Activated standard version ${standard.version}.`
                          )
                        }
                      >
                        {busyAction === activateKey ? "Activating..." : "Activate"}
                      </button>
                      <button
                        className="danger-btn"
                        disabled={Boolean(busyAction) || standard.status === "archived"}
                        onClick={() =>
                          void runAction(
                            archiveKey,
                            () =>
                              fetch(`/api/marketing/knowledge-standards/${standard.id}/archive`, {
                                method: "POST",
                                headers: { "content-type": "application/json" },
                                body: JSON.stringify({ actor: "dashboard_admin" })
                              }),
                            `Archived standard version ${standard.version}.`
                          )
                        }
                      >
                        {busyAction === archiveKey ? "Archiving..." : "Archive"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div>
          <strong>Recent Compliance Checks</strong>
          <table className="table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Version</th>
                <th>Summary</th>
                <th>Checked</th>
              </tr>
            </thead>
            <tbody>
              {recentCompliance.map((item, index) => (
                <tr key={`${item.checkedAt}-${index}`}>
                  <td>{item.status.toUpperCase()}</td>
                  <td>v{item.standardVersion}</td>
                  <td>{item.summary}</td>
                  <td>{new Date(item.checkedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
