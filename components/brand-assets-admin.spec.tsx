import { renderToStaticMarkup } from "react-dom/server";
import { BrandAssetsAdmin } from "./brand-assets-admin";

describe("BrandAssetsAdmin", () => {
  it("renders active asset, palette, and recent compliance", () => {
    const html = renderToStaticMarkup(
      <BrandAssetsAdmin
        assets={[
          {
            id: 1,
            assetKey: "dre_logo_primary_svg",
            assetType: "logo_svg_master",
            version: 2,
            filePath: "/tmp/logo.svg",
            fileUrl: "http://localhost:4000/api/marketing/brand-assets/files/logo.svg",
            mimeType: "image/svg+xml",
            sha256Hash: "abcdef1234567890",
            normalizedHash: "abcdef1234567890",
            aspectRatio: 2.1,
            trademarkRequired: true,
            colorSignature: ["#19365D", "#FEFEFE"],
            geometrySignature: { kind: "svg" },
            metadata: {},
            isActive: true,
            approvedBy: "admin",
            approvedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
          }
        ]}
        activeMasterAsset={{
          id: 1,
          assetKey: "dre_logo_primary_svg",
          assetType: "logo_svg_master",
          version: 2,
          filePath: "/tmp/logo.svg",
          fileUrl: "http://localhost:4000/api/marketing/brand-assets/files/logo.svg",
          mimeType: "image/svg+xml",
          sha256Hash: "abcdef1234567890",
          normalizedHash: "abcdef1234567890",
          aspectRatio: 2.1,
          trademarkRequired: true,
          colorSignature: ["#19365D", "#FEFEFE"],
          geometrySignature: { kind: "svg" },
          metadata: {},
          isActive: true,
          approvedBy: "admin",
          approvedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }}
        colors={[
          {
            id: 1,
            colorName: "Primary Blue",
            hexCode: "#19365D",
            rgbValue: "25,54,93",
            usageType: "core",
            toleranceDelta: 3,
            isStrict: true,
            isActive: true,
            metadata: {},
            createdAt: new Date().toISOString()
          }
        ]}
        recentCompliance={[
          {
            status: "pass",
            summary: "Official brand asset overlay passed integrity, color, and trademark checks.",
            violations: [],
            checks: {
              logoIntegrity: "pass",
              colorPolicy: "pass",
              trademark: "pass",
              brandText: "pass"
            },
            officialAssetKey: "dre_logo_primary_svg",
            officialAssetVersion: 2,
            checkedAt: new Date().toISOString()
          }
        ]}
      />
    );

    expect(html).toContain("Brand Asset Governance");
    expect(html).toContain("dre_logo_primary_svg");
    expect(html).toContain("Primary Blue");
    expect(html).toContain("Recent Brand Compliance");
  });
});
