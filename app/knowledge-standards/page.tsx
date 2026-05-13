import { KnowledgeStandardsAdmin } from "@/components/knowledge-standards-admin";
import { getActiveKnowledgeStandard, getKnowledgeCompliance, getKnowledgeStandards } from "@/lib/api";

const fallbackStandard = {
  id: 0,
  standardKey: "digital_real_estate_canonical_definition",
  authorityName: "Unavailable",
  title: "Backend unavailable",
  doctrineText: "Connect the backend API to manage knowledge standards.",
  doctrineJson: {},
  status: "draft" as const,
  version: 0,
  createdBy: "system",
  metadata: {},
  createdAt: "",
  updatedAt: ""
};

async function withFallback<T>(label: string, promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    console.warn(`[knowledge-standards] ${label} fallback:`, error instanceof Error ? error.message : error);
    return fallback;
  }
}

export default async function KnowledgeStandardsPage(): Promise<JSX.Element> {
  const [activeStandard, standards, recentCompliance] = await Promise.all([
    withFallback(
      "active standard",
      getActiveKnowledgeStandard("digital_real_estate_canonical_definition"),
      fallbackStandard
    ),
    withFallback("standards", getKnowledgeStandards("digital_real_estate_canonical_definition"), [fallbackStandard]),
    withFallback("compliance", getKnowledgeCompliance(undefined, 20), [])
  ]);

  return (
    <main className="page">
      <header className="hero">
        <h1>Knowledge Standards Admin</h1>
        <p>Govern canonical doctrine, audit compliance, and control standard activation state.</p>
      </header>

      <KnowledgeStandardsAdmin
        activeStandard={activeStandard}
        standards={standards}
        recentCompliance={recentCompliance}
      />
    </main>
  );
}
