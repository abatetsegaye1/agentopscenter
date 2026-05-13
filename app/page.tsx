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

async function withFallback<T>(label: string, promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    console.warn(`[page] ${label} fallback:`, error instanceof Error ? error.message : error);
    return fallback;
  }
}

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
      withFallback("overview", getOverview(), {
        activeRuns: 0,
        runsLast24h: 0,
        successRatePct: 0,
        avgLatencyMs: 0,
        totalCostUsd24h: 0,
        criticalIncidents24h: 0
      }),
      withFallback("workflows", getWorkflowSummaries(), []),
      withFallback("incidents", getIncidents(), []),
      withFallback("events", getEvents(), []),
      withFallback("openclaw status", getOpenClawStatus(), {
        connected: false,
        url: "",
        version: "",
        lastHeartbeatAt: "",
        channels: [],
        nodes: [],
        queueDepth: 0
      }),
      withFallback("openclaw events", getOpenClawEvents(), []),
      withFallback("openclaw connector", getOpenClawConnectorStatus(), {
        enabled: false,
        connected: false,
        url: "",
        reconnectAttempts: 0
      }),
      withFallback("openclaw processes", getOpenClawProcessStatus(), []),
      withFallback("ops tasks", getOpsTasks(), []),
      withFallback("pairing requests", getPairingRequests(), []),
      withFallback("ops audit", getOpsAudit(), []),
      withFallback("commands", getCommands(), []),
      withFallback("learning experiences", getLearningExperiences(), []),
      withFallback("learning lessons", getLearningLessons(), []),
      withFallback("marketing overview", getMarketingOverview(), {
        totalTasks: 0,
        queuedTasks: 0,
        runningTasks: 0,
        awaitingProviderTasks: 0,
        retryingTasks: 0,
        stalledTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        completionRatePct: 0
      }),
      withFallback("marketing tasks", getMarketingTasks(), []),
      withFallback("marketing opportunities", getMarketingOpportunities(), []),
      withFallback("marketing agent runs", getMarketingAgentRuns(), []),
      getMarketingLiveTrends(),
      withFallback("marketing approvals", getMarketingApprovals(), {
        pendingCampaigns: [],
        pendingContent: []
      }),
      withFallback("queue health", getMarketingQueueHealth(), {
        enabled: false,
        queueName: "",
        workerConcurrency: 0,
        counts: {
          waiting: 0,
          active: 0,
          delayed: 0,
          paused: 0,
          completed: 0,
          failed: 0
        }
      }),
      withFallback("integration readiness", getMarketingIntegrationReadiness(), []),
      withFallback("lifecycle events", getMarketingLifecycleEvents(), [])
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
