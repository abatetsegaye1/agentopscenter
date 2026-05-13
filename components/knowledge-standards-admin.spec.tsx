import { renderToStaticMarkup } from "react-dom/server";
import { KnowledgeStandardsAdmin } from "./knowledge-standards-admin";

describe("KnowledgeStandardsAdmin", () => {
  it("renders active standard version and recent compliance summary", () => {
    const html = renderToStaticMarkup(
      <KnowledgeStandardsAdmin
        activeStandard={{
          id: 1,
          standardKey: "digital_real_estate_canonical_definition",
          authorityName: "KING KUSSU",
          title: "Digital Real Estate Canonical Definition",
          doctrineText: "Canonical doctrine text",
          doctrineJson: {},
          status: "active",
          version: 1,
          createdBy: "system",
          metadata: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }}
        standards={[
          {
            id: 1,
            standardKey: "digital_real_estate_canonical_definition",
            authorityName: "KING KUSSU",
            title: "Digital Real Estate Canonical Definition",
            doctrineText: "Canonical doctrine text",
            doctrineJson: {},
            status: "active",
            version: 1,
            createdBy: "system",
            metadata: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]}
        recentCompliance={[
          {
            status: "pass",
            standardKey: "digital_real_estate_canonical_definition",
            standardVersion: 1,
            authorityName: "KING KUSSU",
            summary: "Complies with doctrine.",
            violations: [],
            checkedAt: new Date().toISOString()
          }
        ]}
      />
    );

    expect(html).toContain("Knowledge Standards");
    expect(html).toContain("v1");
    expect(html).toContain("Complies with doctrine.");
  });
});
