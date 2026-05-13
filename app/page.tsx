import { AgentRunsBoard } from "@/components/agent-runs-board";
import { ApprovalsConsole } from "@/components/approvals-console";
import { IncidentsList } from "@/components/incidents-list";
import { AgentControls } from "@/components/agent-controls";
import { AgentResults } from "@/components/agent-results";
import { KpiCards } from "@/components/kpi-cards";
import { LearningPanel } from "@/components/learning-panel";
import { LiveFeed } from "@/components/live-feed";
import { MarketingOverviewCard } from "@/components/marketing-overview";
import { MarketingTasks } from "@/components/marketing-tasks";
import { LiveTrendSignals } from "@/components/live-trend-signals";
import { OpportunitiesBoard } from "@/components/opportunities-board";
import { QueueHealthCard } from "@/components/queue-health-card";
import { IntegrationReadinessPanel } from "@/components/integration-readiness-panel";
import { MarketingLifecycleEvents } from "@/components/marketing-lifecycle-events";
import { OpenClawEvents } from "@/components/openclaw-events";
import { OpenClawStatus } from "@/components/openclaw-status";
import { OpsAudit } from "@/components/ops-audit";
import { OpsTasks } from "@/components/ops-tasks";
import { PairingRequests } from "@/components/pairing-requests";
import { WorkflowTable } from "@/components/workflow-table";
import {
  getEvents,
  getIncidents,
  getLearningExperiences,
  getLearningLessons,
  getMarketingOverview,
  getMarketingOpportunities,
  getMarketingApprovals,
  getMarketingTasks,
  getMarketingAgentRuns,
  getMarketingLiveTrends,
  getMarketingIntegrationReadiness,
  getMarketingLifecycleEvents,
  getMarketingQueueHealth,
  getOpenClawConnectorStatus,
  getOpenClawEvents,
  getOpenClawProcessStatus,
  getOpenClawStatus,
  getOpsAudit,
  getOpsTasks,
  getPairingRequests,
  getCommands,
  getOverview,
  getWorkflowSummaries
} from "@/lib/api";

export default async function Page(): Promise<JSX.Element> {
  const [
    overview,
    workflows,
    incidents,
    events,
    openclawStatus,
    openclawEvents,
    connectorStatus,
    processStatuses,
    opsTasks,
    pairingRequests,
    opsAudit,
    commands,
    learningExperiences,
    learningLessons,
    marketingOverview,
    marketingTasks,
    opportunities,
    agentRuns,
    liveTrends,
    approvals,
    queueHealth,
    integrationReadiness,
    lifecycleEvents
  ] =
    await Promise.all([
      getOverview(),
      getWorkflowSummaries(),
      getIncidents(),
      getEvents(),
      getOpenClawStatus(),
      getOpenClawEvents(),
      getOpenClawConnectorStatus(),
      getOpenClawProcessStatus(),
      getOpsTasks(),
      getPairingRequests(),
      getOpsAudit(),
      getCommands(),
      getLearningExperiences(),
      getLearningLessons(),
      getMarketingOverview(),
      getMarketingTasks(),
      getMarketingOpportunities(),
      getMarketingAgentRuns(),
      getMarketingLiveTrends(),
      getMarketingApprovals(),
      getMarketingQueueHealth(),
      getMarketingIntegrationReadiness(),
      getMarketingLifecycleEvents()
    ]);

  return (
    <main className="page">
      <header className="hero">
        <h1>AgentOps Dashboard</h1>
        <p>
          Unified monitoring for agents and sub-agents across customer service, marketing, and
          social workflows.
        </p>
        <p>
          <a href="/knowledge-standards">Open Knowledge Standards Admin</a>
        </p>
        <p>
          <a href="/admin/brand-assets">Open Brand Asset Governance</a>
        </p>
      </header>

      <AgentControls />
      <AgentResults initialCommands={commands} />

      <KpiCards metrics={overview} />

      <section className="split">
        <WorkflowTable rows={workflows} />
        <IncidentsList incidents={incidents} />
      </section>

      <section className="split">
        <OpenClawStatus status={openclawStatus} connector={connectorStatus} processStatuses={processStatuses} />
        <OpenClawEvents events={openclawEvents} />
      </section>

      <section className="split">
        <OpsTasks tasks={opsTasks} />
        <PairingRequests requests={pairingRequests} />
      </section>

      <OpsAudit audit={opsAudit} />

      <LearningPanel experiences={learningExperiences} lessons={learningLessons} />

      <section className="split">
        <MarketingOverviewCard overview={marketingOverview} />
        <MarketingTasks tasks={marketingTasks} />
      </section>

      <section className="split">
        <IntegrationReadinessPanel snapshots={integrationReadiness} />
        <MarketingLifecycleEvents events={lifecycleEvents} />
      </section>

      <LiveTrendSignals initialSnapshot={liveTrends} tasks={marketingTasks} />

      <section className="split">
        <OpportunitiesBoard opportunities={opportunities} />
        <AgentRunsBoard runs={agentRuns} />
      </section>

      <section className="split">
        <ApprovalsConsole initialSnapshot={approvals} />
        <QueueHealthCard health={queueHealth} />
      </section>

      <LiveFeed initialEvents={events} />
    </main>
  );
}
