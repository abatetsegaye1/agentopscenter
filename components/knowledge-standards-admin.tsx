"use client";

import { KnowledgeComplianceSummary, KnowledgeStandardRecord } from "@agentops/contracts";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [busyAction, setBusyAction] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [error, setError] = useState<string>();
  const [uploadFileName, setUploadFileName] = useState<string>();
  const [uploadText, setUploadText] = useState<string>("");

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
        setError(parseApiMessage(raw) || `Request failed (${res.status})`);
        return;
      }
      setNotice(successText);
      router.refresh();
    } finally {
      setBusyAction(undefined);
    }
  }

  async function handleFileChange(file?: File): Promise<void> {
    setNotice(undefined);
    setError(undefined);
    if (!file) {
      setUploadFileName(undefined);
      setUploadText("");
      return;
    }

    const raw = await file.text();
    const extractedText = extractDoctrineText(raw);
    setUploadFileName(file.name);
    setUploadText(extractedText);
  }

  async function uploadStandard(): Promise<void> {
    await runAction(
      "upload",
      () =>
        fetch("/api/marketing/knowledge-standards", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            actor: "dashboard_admin",
            standardKey: activeStandard.standardKey,
            authorityName: activeStandard.authorityName,
            title: activeStandard.title,
            doctrineText: uploadText,
            activate: true,
            sourceFileName: uploadFileName
          })
        }),
      "Uploaded and activated the knowledge standard. New agent outputs will use it."
    );
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

        <form
          className="control-form knowledge-upload-form"
          onSubmit={(event) => {
            event.preventDefault();
            void uploadStandard();
          }}
        >
          <h3>Upload Knowledge Standard</h3>
          <label>
            Standard file
            <input
              type="file"
              accept=".txt,.md,.json,text/plain,text/markdown,application/json"
              onChange={(event) => void handleFileChange(event.target.files?.[0])}
            />
          </label>
          <label>
            Doctrine content
            <textarea
              rows={7}
              value={uploadText}
              onChange={(event) => setUploadText(event.target.value)}
              placeholder="Upload or paste the canonical standard text the agents must follow."
            />
          </label>
          {uploadText.trim() ? (
            <p className="hint">
              {uploadFileName ? `${uploadFileName} | ` : ""}
              {uploadText.trim().length.toLocaleString()} characters. Uploading creates a new active version.
            </p>
          ) : null}
          <button disabled={Boolean(busyAction) || !uploadText.trim()} type="submit">
            {busyAction === "upload" ? "Uploading..." : "Upload and Activate"}
          </button>
        </form>

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

function extractDoctrineText(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object") {
      const record = parsed as Record<string, unknown>;
      const candidate = record.doctrineText ?? record.content ?? record.text;
      if (typeof candidate === "string" && candidate.trim()) {
        return candidate.trim();
      }
    }
  } catch {
    // Plain text and markdown uploads are expected here.
  }

  return raw.trim();
}

function parseApiMessage(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as { message?: unknown; error?: unknown };
    if (typeof parsed.message === "string") return parsed.message;
    if (Array.isArray(parsed.message)) return parsed.message.join(", ");
    if (typeof parsed.error === "string") return parsed.error;
  } catch {
    return raw;
  }

  return raw;
}
