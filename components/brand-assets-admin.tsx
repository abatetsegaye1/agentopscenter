"use client";

import { BrandAssetRecord, BrandColorPolicyRecord, BrandComplianceSummary } from "@agentops/contracts";
import { useMemo, useState } from "react";

interface BrandAssetsAdminProps {
  assets: BrandAssetRecord[];
  activeMasterAsset?: BrandAssetRecord;
  colors: BrandColorPolicyRecord[];
  recentCompliance: BrandComplianceSummary[];
}

const assetTypeOptions = [
  "logo_svg_master",
  "logo_dark_background",
  "logo_light_background",
  "favicon",
  "text_lockup",
  "social_avatar"
];

export function BrandAssetsAdmin({
  assets,
  activeMasterAsset,
  colors,
  recentCompliance
}: BrandAssetsAdminProps): JSX.Element {
  const [busyAction, setBusyAction] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [error, setError] = useState<string>();
  const [assetKey, setAssetKey] = useState("dre_logo_primary_svg");
  const [assetType, setAssetType] = useState("logo_svg_master");
  const [file, setFile] = useState<File>();
  const [activate, setActivate] = useState(true);

  const groupedHistory = useMemo(
    () => assets.filter((item) => item.assetType === assetType || item.assetKey === assetKey),
    [assets, assetKey, assetType]
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
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } finally {
      setBusyAction(undefined);
    }
  }

  async function uploadAsset(): Promise<void> {
    if (!file) {
      setError("Choose a file before uploading.");
      return;
    }

    const base64 = await fileToBase64(file);
    await runAction(
      "upload",
      () =>
        fetch("/api/marketing/brand-assets", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            assetKey,
            assetType,
            fileName: file.name,
            contentBase64: base64,
            approvedBy: "dashboard_admin",
            activate,
            trademarkRequired: true
          })
        }),
      `Uploaded ${file.name} as ${assetKey}.`
    );
  }

  return (
    <section className="card">
      <div className="section-title">
        <h2>Brand Asset Governance</h2>
        <span className="hint">Canonical registry, palette, and compliance audit</span>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      {notice ? <p className="form-success">{notice}</p> : null}

      <div className="stack">
        <div>
          <strong>Active Master Asset</strong>
          {activeMasterAsset ? (
            <div>
              {activeMasterAsset.assetKey} | {activeMasterAsset.assetType} | v{activeMasterAsset.version}
            </div>
          ) : (
            <div className="form-error">No active logo master asset is registered yet.</div>
          )}
        </div>

        <div className="approval-toolbar">
          <label>
            Asset Key
            <input value={assetKey} onChange={(e) => setAssetKey(e.target.value)} />
          </label>
          <label>
            Asset Type
            <select value={assetType} onChange={(e) => setAssetType(e.target.value)}>
              {assetTypeOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            Upload Asset
            <input
              type="file"
              accept=".svg,.png,.jpg,.jpeg,.webp,.ico"
              onChange={(e) => setFile(e.target.files?.[0] ?? undefined)}
            />
          </label>
          <label>
            <input type="checkbox" checked={activate} onChange={(e) => setActivate(e.target.checked)} /> Activate on upload
          </label>
          <button disabled={Boolean(busyAction)} onClick={() => void uploadAsset()}>
            {busyAction === "upload" ? "Uploading..." : "Upload"}
          </button>
        </div>

        <div>
          <strong>Approved Palette</strong>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Hex</th>
                <th>Usage</th>
                <th>Tolerance</th>
              </tr>
            </thead>
            <tbody>
              {colors.map((color) => (
                <tr key={color.id}>
                  <td>{color.colorName}</td>
                  <td>{color.hexCode}</td>
                  <td>{color.usageType}</td>
                  <td>{color.toleranceDelta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <strong>Asset Versions</strong>
          <table className="table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Type</th>
                <th>Version</th>
                <th>Status</th>
                <th>Hash</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groupedHistory.map((asset) => {
                const activateKey = `activate:${asset.id}`;
                const archiveKey = `archive:${asset.id}`;
                return (
                  <tr key={asset.id}>
                    <td>{asset.assetKey}</td>
                    <td>{asset.assetType}</td>
                    <td>v{asset.version}</td>
                    <td>{asset.isActive ? "active" : "inactive"}</td>
                    <td>{asset.sha256Hash.slice(0, 16)}...</td>
                    <td className="row-buttons">
                      <button
                        disabled={Boolean(busyAction) || asset.isActive}
                        onClick={() =>
                          void runAction(
                            activateKey,
                            () =>
                              fetch(`/api/marketing/brand-assets/${asset.id}/activate`, {
                                method: "POST",
                                headers: { "content-type": "application/json" },
                                body: JSON.stringify({ actor: "dashboard_admin" })
                              }),
                            `Activated ${asset.assetKey} v${asset.version}.`
                          )
                        }
                      >
                        {busyAction === activateKey ? "Activating..." : "Activate"}
                      </button>
                      <button
                        className="danger-btn"
                        disabled={Boolean(busyAction) || !asset.isActive}
                        onClick={() =>
                          void runAction(
                            archiveKey,
                            () =>
                              fetch(`/api/marketing/brand-assets/${asset.id}/archive`, {
                                method: "POST",
                                headers: { "content-type": "application/json" },
                                body: JSON.stringify({ actor: "dashboard_admin" })
                              }),
                            `Archived ${asset.assetKey} v${asset.version}.`
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
          <strong>Recent Brand Compliance</strong>
          <table className="table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Asset</th>
                <th>Summary</th>
                <th>Checked</th>
              </tr>
            </thead>
            <tbody>
              {recentCompliance.map((item, index) => (
                <tr key={`${item.checkedAt}-${index}`}>
                  <td>{item.status.toUpperCase()}</td>
                  <td>{item.officialAssetKey ?? "n/a"}</td>
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

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}
