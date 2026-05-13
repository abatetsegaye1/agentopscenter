import { BrandAssetsAdmin } from "@/components/brand-assets-admin";
import {
  getActiveBrandAsset,
  getBrandAssets,
  getBrandColorPolicy,
  getBrandCompliance
} from "@/lib/api";

async function withFallback<T>(label: string, promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    console.warn(`[brand-assets] ${label} fallback:`, error instanceof Error ? error.message : error);
    return fallback;
  }
}

export default async function BrandAssetsPage(): Promise<JSX.Element> {
  const [assets, activeMasterAsset, colors, recentCompliance] = await Promise.all([
    withFallback("assets", getBrandAssets(), []),
    withFallback("active asset", getActiveBrandAsset("logo_svg_master"), undefined),
    withFallback("colors", getBrandColorPolicy(), []),
    withFallback("compliance", getBrandCompliance(undefined, 20), [])
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
