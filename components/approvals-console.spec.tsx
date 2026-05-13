import { renderToStaticMarkup } from "react-dom/server";
import { ApprovalsConsole } from "./approvals-console";

describe("ApprovalsConsole", () => {
  it("renders the definition compliance panel for pending content", () => {
    const html = renderToStaticMarkup(
      <ApprovalsConsole
        initialSnapshot={{
          pendingCampaigns: [],
          pendingContent: [
            {
              id: "content_1",
              contentType: "article",
              title: "Digital Real Estate explainer",
              body: "Draft body",
              mediaUrls: [],
              status: "review_required",
              metadata: {},
              definitionCompliance: {
                status: "fail",
                standardKey: "digital_real_estate_canonical_definition",
                standardVersion: 1,
                authorityName: "KING KUSSU",
                summary: "Doctrine violations detected.",
                violations: [
                  {
                    code: "dre_crypto_reclassification",
                    severity: "fail",
                    message: "Bad definition"
                  }
                ],
                checkedAt: new Date().toISOString()
              },
              brandCompliance: {
                status: "warn",
                summary: "Visual asset used an approved logo but requires reviewer attention.",
                violations: [
                  {
                    code: "background_contrast_violation",
                    severity: "warn",
                    message: "Contrast is marginal."
                  }
                ],
                checks: {
                  logoIntegrity: "pass",
                  colorPolicy: "warn",
                  trademark: "pass",
                  brandText: "pass"
                },
                officialAssetKey: "dre_logo_primary_svg",
                officialAssetVersion: 2,
                checkedAt: new Date().toISOString()
              },
              createdBy: "tester",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        }}
      />
    );

    expect(html).toContain("Definition Compliance");
    expect(html).toContain("FAIL");
    expect(html).toContain("KING KUSSU");
    expect(html).toContain("dre_crypto_reclassification");
    expect(html).toContain("Brand Compliance");
    expect(html).toContain("dre_logo_primary_svg");
    expect(html).toContain("background_contrast_violation");
  });
});
