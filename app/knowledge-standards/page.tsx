import { KnowledgeStandardsAdmin } from "@/components/knowledge-standards-admin";
import { getActiveKnowledgeStandard, getKnowledgeCompliance, getKnowledgeStandards } from "@/lib/api";

export default async function KnowledgeStandardsPage(): Promise<JSX.Element> {
  const [activeStandard, standards, recentCompliance] = await Promise.all([
    getActiveKnowledgeStandard("digital_real_estate_canonical_definition"),
    getKnowledgeStandards("digital_real_estate_canonical_definition"),
    getKnowledgeCompliance(undefined, 20)
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
