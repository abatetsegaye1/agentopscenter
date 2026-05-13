"use client";

import { MarketingApprovalQueueSnapshot } from "@agentops/contracts";
import { useEffect, useMemo, useState } from "react";

interface ApprovalsConsoleProps {
  initialSnapshot: MarketingApprovalQueueSnapshot;
}

async function parseError(res: Response): Promise<string> {
  const raw = await res.text();
  if (!raw) return `Request failed (${res.status})`;
  try {
    const json = JSON.parse(raw) as { message?: string | string[] };
    if (Array.isArray(json.message)) return json.message.join("; ");
    if (typeof json.message === "string") return json.message;
  } catch {
    // ignore parse errors
  }
  return raw.slice(0, 240);
}

export function ApprovalsConsole({ initialSnapshot }: ApprovalsConsoleProps): JSX.Element {
  const [snapshot, setSnapshot] = useState<MarketingApprovalQueueSnapshot>(initialSnapshot);
  const [reviewer, setReviewer] = useState("dashboard_approver");
  const [notesById, setNotesById] = useState<Record<string, string>>({});
  const [busyAction, setBusyAction] = useState<string>();
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();

  useEffect(() => {
    setSnapshot(initialSnapshot);
  }, [initialSnapshot]);

  const pendingCount = useMemo(
    () => snapshot.pendingCampaigns.length + snapshot.pendingContent.length,
    [snapshot]
  );

  async function refresh(): Promise<void> {
    const res = await fetch("/api/marketing/approvals?limit=60", { cache: "no-store" });
    if (!res.ok) {
      setError(await parseError(res));
      return;
    }
    const json = (await res.json()) as MarketingApprovalQueueSnapshot;
    setSnapshot(json);
  }

  function noteFor(id: string): string {
    return notesById[id] ?? "";
  }

  function updateNote(id: string, value: string): void {
    setNotesById((prev) => ({ ...prev, [id]: value }));
  }

  async function runAction(actionKey: string, run: () => Promise<Response>, successText: string): Promise<void> {
    setBusyAction(actionKey);
    setError(undefined);
    setNotice(undefined);
    try {
      const res = await run();
      if (!res.ok) {
        setError(await parseError(res));
        return;
      }
      setNotice(successText);
      await refresh();
    } finally {
      setBusyAction(undefined);
    }
  }

  return (
    <section className="card">
      <div className="section-title">
        <h2>Approvals Console</h2>
        <span className="hint">{pendingCount} pending item(s)</span>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      {notice ? <p className="form-success">{notice}</p> : null}

      <div className="approval-toolbar">
        <label>
          Reviewer
          <input value={reviewer} onChange={(e) => setReviewer(e.target.value)} />
        </label>
      </div>

      <h3 className="hint">Campaign Approvals</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {snapshot.pendingCampaigns.map((campaign) => {
            const approveKey = `campaign:${campaign.id}:approve`;
            const rejectKey = `campaign:${campaign.id}:reject`;
            return (
              <tr key={campaign.id}>
                <td>{campaign.name}</td>
                <td>{campaign.status}</td>
                <td>{new Date(campaign.updatedAt).toLocaleString()}</td>
                <td className="row-actions">
                  <textarea
                    rows={2}
                    placeholder="Approval notes"
                    value={noteFor(campaign.id)}
                    onChange={(e) => updateNote(campaign.id, e.target.value)}
                  />
                  <div className="row-buttons">
                    <button
                      disabled={Boolean(busyAction)}
                      onClick={() =>
                        void runAction(
                          approveKey,
                          () =>
                            fetch(`/api/marketing/campaigns/${campaign.id}/approve`, {
                              method: "POST",
                              headers: { "content-type": "application/json" },
                              body: JSON.stringify({
                                reviewer,
                                notes: noteFor(campaign.id)
                              })
                            }),
                          `Campaign ${campaign.id} approved.`
                        )
                      }
                    >
                      {busyAction === approveKey ? "Approving..." : "Approve"}
                    </button>
                    <button
                      className="danger-btn"
                      disabled={Boolean(busyAction)}
                      onClick={() =>
                        void runAction(
                          rejectKey,
                          () =>
                            fetch(`/api/marketing/campaigns/${campaign.id}/reject`, {
                              method: "POST",
                              headers: { "content-type": "application/json" },
                              body: JSON.stringify({
                                reviewer,
                                notes: noteFor(campaign.id)
                              })
                            }),
                          `Campaign ${campaign.id} rejected.`
                        )
                      }
                    >
                      {busyAction === rejectKey ? "Rejecting..." : "Reject"}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h3 className="hint">Content Approvals</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Content</th>
            <th>Type</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {snapshot.pendingContent.map((content) => {
            const approveKey = `content:${content.id}:approve`;
            const publishKey = `content:${content.id}:publish`;
            return (
              <tr key={content.id}>
                <td>{content.title ?? content.id}</td>
                <td>{content.contentType}</td>
                <td>{content.status}</td>
                <td className="row-actions">
                  <textarea
                    rows={2}
                    placeholder="Approval notes"
                    value={noteFor(content.id)}
                    onChange={(e) => updateNote(content.id, e.target.value)}
                  />
                  {content.definitionCompliance ? (
                    <div className={`compliance-panel compliance-${content.definitionCompliance.status}`}>
                      <strong>Definition Compliance</strong>
                      <div>
                        {content.definitionCompliance.status.toUpperCase()} | v{content.definitionCompliance.standardVersion} |{" "}
                        {content.definitionCompliance.authorityName}
                      </div>
                      <div>{content.definitionCompliance.summary}</div>
                      {content.definitionCompliance.violations.length > 0 ? (
                        <div>
                          Violations:{" "}
                          {content.definitionCompliance.violations
                            .map((item) => item.code)
                            .join(", ")}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  {content.brandCompliance ? (
                    <div className={`compliance-panel compliance-${content.brandCompliance.status}`}>
                      <strong>Brand Compliance</strong>
                      <div>
                        {content.brandCompliance.status.toUpperCase()} | Asset{" "}
                        {content.brandCompliance.officialAssetKey ?? "unregistered"}
                        {content.brandCompliance.officialAssetVersion
                          ? ` v${content.brandCompliance.officialAssetVersion}`
                          : ""}
                      </div>
                      <div>{content.brandCompliance.summary}</div>
                      <div>
                        Checks: logo {content.brandCompliance.checks.logoIntegrity.toUpperCase()} | color{" "}
                        {content.brandCompliance.checks.colorPolicy.toUpperCase()} | trademark{" "}
                        {content.brandCompliance.checks.trademark.toUpperCase()} | text{" "}
                        {content.brandCompliance.checks.brandText.toUpperCase()}
                      </div>
                      {content.brandCompliance.violations.length > 0 ? (
                        <div>
                          Violations: {content.brandCompliance.violations.map((item) => item.code).join(", ")}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="row-buttons">
                    <button
                      disabled={Boolean(busyAction)}
                      onClick={() =>
                        void runAction(
                          approveKey,
                          () =>
                            fetch(`/api/marketing/content/${content.id}/approve`, {
                              method: "POST",
                              headers: { "content-type": "application/json" },
                              body: JSON.stringify({
                                reviewer,
                                notes: noteFor(content.id)
                              })
                            }),
                          `Content ${content.id} approved.`
                        )
                      }
                    >
                      {busyAction === approveKey ? "Approving..." : "Approve"}
                    </button>
                    <button
                      disabled={Boolean(busyAction)}
                      onClick={() =>
                        void runAction(
                          publishKey,
                          () =>
                            fetch(`/api/marketing/content/${content.id}/publish`, {
                              method: "POST",
                              headers: { "content-type": "application/json" },
                              body: JSON.stringify({
                                requestedBy: reviewer
                              })
                            }),
                          `Content ${content.id} publish queued.`
                        )
                      }
                    >
                      {busyAction === publishKey ? "Publishing..." : "Publish"}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
