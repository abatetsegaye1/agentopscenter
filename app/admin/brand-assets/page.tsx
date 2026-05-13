import { BrandAssetsAdmin } from "@/components/brand-assets-admin";
import {
  getActiveBrandAsset,
  getBrandAssets,
  getBrandColorPolicy,
  getBrandCompliance
} from "@/lib/api";

export default async function BrandAssetsPage(): Promise<JSX.Element> {
  const [assets, activeMasterAsset, colors, recentCompliance] = await Promise.all([
    getBrandAssets(),
    getActiveBrandAsset("logo_svg_master"),
    getBrandColorPolicy(),
    getBrandCompliance(undefined, 20)
  ]);

  return (
    <main className="page">
      <header className="hero">
        <h1>Brand Asset Governance</h1>
        <p>
          Govern canonical brand assets, enforce palette rules, and audit brand compliance before
          approval or publishing.
        </p>
      </header>

      <BrandAssetsAdmin
        assets={assets}
        activeMasterAsset={activeMasterAsset}
        colors={colors}
        recentCompliance={recentCompliance}
      />
    </main>
  );
}
