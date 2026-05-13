import {
  AgentEvent,
  BrandAssetRecord,
  BrandColorPolicyRecord,
  BrandComplianceSummary,
  IncidentRecord,
  IntegrationReadinessSnapshot,
  KnowledgeComplianceSummary,
  KnowledgeStandardRecord,
  LearningExperience,
  LearningLesson,
  DomainOpportunityRecord,
  MarketingLifecycleEventRecord,
  MarketingApprovalQueueSnapshot,
  QueueHealthSnapshot,
  MarketingOverview,
  MarketingAgentRunRecord,
  MarketingTaskRecord,
  OpenClawConnectorStatus,
  OpenClawGatewayStatus,
  OpenClawProcessStatus,
  OpenClawRawEvent,
  OpsAuditRecord,
  OpsTaskRecord,
  OverviewMetrics,
  PairingRequestRecord,
  WorkflowSummary
} from "@agentops/contracts";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000/api";

export interface ParsedCommand {
  kind: "help" | "marketing" | "ops";
  summary: string;
  payload?: Record<string, unknown>;
  requiresApproval: boolean;
  riskLevel: "low" | "medium" | "high";
}

export interface CommandRecord {
  id: string;
  channel: "dashboard" | "api" | "telegram";
  requestedBy: string;
  rawText: string;
  mode: "proposal" | "execution";
  parsed: ParsedCommand;
  status: "proposed" | "pending_approval" | "approved" | "executing" | "executed" | "rejected" | "failed";
  requiresApproval: boolean;
  executionType?: "marketing" | "ops";
  executionRef?: string;
  executionResult?: Record<string, unknown>;
  responseText?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedReason?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LiveTrendSignal {
  source: string;
  title: string;
  link: string;
  publishedAt?: string;
  snippet?: string;
  relevanceScore: number;
  freshnessScore: number;
  score: number;
}

export interface LiveTrendSnapshot {
  query: string;
  signals: LiveTrendSignal[];
  insights: Array<{
    insightType: string;
    title: string;
    confidence: number;
    evidence: string[];
  }>;
  fetchedAt: string;
}

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    cache: "no-store"
  });

  if (!res.ok) {
    const body = await res.text();
    const detail = body ? ` | ${body.slice(0, 220)}` : "";
    throw new Error(`Request failed: ${path} (${res.status})${detail}`);
  }

  return (await res.json()) as T;
}

export function getOverview(): Promise<OverviewMetrics> {
  return request<OverviewMetrics>("/analytics/overview");
}

export function getWorkflowSummaries(): Promise<WorkflowSummary[]> {
  return request<WorkflowSummary[]>("/analytics/workflows");
}

export function getIncidents(): Promise<IncidentRecord[]> {
  return request<IncidentRecord[]>("/incidents");
}

export function getEvents(limit = 25): Promise<AgentEvent[]> {
  return request<AgentEvent[]>(`/events?limit=${limit}`);
}

export function getOpenClawStatus(): Promise<OpenClawGatewayStatus> {
  return request<OpenClawGatewayStatus>("/openclaw/status");
}

export function getOpenClawEvents(limit = 25): Promise<OpenClawRawEvent[]> {
  return request<OpenClawRawEvent[]>(`/openclaw/events?limit=${limit}`);
}

export function getOpenClawConnectorStatus(): Promise<OpenClawConnectorStatus> {
  return request<OpenClawConnectorStatus>("/openclaw/connector-status");
}

export function getOpenClawProcessStatus(): Promise<OpenClawProcessStatus[]> {
  return request<OpenClawProcessStatus[]>("/openclaw/process-status");
}

export function getOpsTasks(limit = 25): Promise<OpsTaskRecord[]> {
  return request<OpsTaskRecord[]>(`/ops/tasks?limit=${limit}`);
}

export function getOpsAudit(limit = 40): Promise<OpsAuditRecord[]> {
  return request<OpsAuditRecord[]>(`/ops/audit?limit=${limit}`);
}

export function getPairingRequests(limit = 25): Promise<PairingRequestRecord[]> {
  return request<PairingRequestRecord[]>(`/ops/pairing/requests?limit=${limit}`);
}

export function getLearningExperiences(limit = 20): Promise<LearningExperience[]> {
  return request<LearningExperience[]>(`/ops/learning/experiences?limit=${limit}`);
}

export function getLearningLessons(limit = 20): Promise<LearningLesson[]> {
  return request<LearningLesson[]>(`/ops/learning/lessons?limit=${limit}`);
}

export function getMarketingTasks(limit = 20): Promise<MarketingTaskRecord[]> {
  return request<MarketingTaskRecord[]>(`/marketing/tasks?limit=${limit}`);
}

export function getMarketingOverview(): Promise<MarketingOverview> {
  return request<MarketingOverview>("/marketing/overview");
}

export function getMarketingOpportunities(limit = 20): Promise<DomainOpportunityRecord[]> {
  return request<DomainOpportunityRecord[]>(`/marketing/opportunities?limit=${limit}`);
}

export function getMarketingAgentRuns(limit = 30): Promise<MarketingAgentRunRecord[]> {
  return request<MarketingAgentRunRecord[]>(`/marketing/agents/runs?limit=${limit}`);
}

export function getMarketingApprovals(limit = 50): Promise<MarketingApprovalQueueSnapshot> {
  return request<MarketingApprovalQueueSnapshot>(`/marketing/approvals?limit=${limit}`);
}

export function getMarketingQueueHealth(): Promise<QueueHealthSnapshot> {
  return request<QueueHealthSnapshot>("/marketing/queue-health");
}

export function getMarketingIntegrationReadiness(probe = false): Promise<IntegrationReadinessSnapshot[]> {
  return request<IntegrationReadinessSnapshot[]>(`/marketing/integrations/readiness?probe=${probe ? "true" : "false"}`);
}

export function getMarketingLifecycleEvents(limit = 50): Promise<MarketingLifecycleEventRecord[]> {
  return request<MarketingLifecycleEventRecord[]>(`/marketing/events?limit=${limit}`);
}

export function getKnowledgeStandards(standardKey?: string): Promise<KnowledgeStandardRecord[]> {
  const suffix = standardKey ? `?standardKey=${encodeURIComponent(standardKey)}` : "";
  return request<KnowledgeStandardRecord[]>(`/marketing/knowledge-standards${suffix}`);
}

export function getActiveKnowledgeStandard(standardKey?: string): Promise<KnowledgeStandardRecord> {
  const suffix = standardKey ? `?standardKey=${encodeURIComponent(standardKey)}` : "";
  return request<KnowledgeStandardRecord>(`/marketing/knowledge-standards/active${suffix}`);
}

export function getKnowledgeCompliance(contentItemId?: string, limit = 50): Promise<KnowledgeComplianceSummary[]> {
  const params = new URLSearchParams();
  if (contentItemId) params.set("contentItemId", contentItemId);
  params.set("limit", String(limit));
  return request<KnowledgeComplianceSummary[]>(`/marketing/knowledge-compliance?${params.toString()}`);
}

export function getBrandAssets(assetType?: string): Promise<BrandAssetRecord[]> {
  const suffix = assetType ? `?assetType=${encodeURIComponent(assetType)}` : "";
  return request<BrandAssetRecord[]>(`/marketing/brand-assets${suffix}`);
}

export function getActiveBrandAsset(assetType = "logo_svg_master"): Promise<BrandAssetRecord | undefined> {
  return request<BrandAssetRecord | undefined>(
    `/marketing/brand-assets/active?assetType=${encodeURIComponent(assetType)}`
  );
}

export function getBrandColorPolicy(): Promise<BrandColorPolicyRecord[]> {
  return request<BrandColorPolicyRecord[]>("/marketing/brand-assets/colors");
}

export function getBrandCompliance(contentItemId?: string, limit = 50): Promise<BrandComplianceSummary[]> {
  const params = new URLSearchParams();
  if (contentItemId) params.set("contentItemId", contentItemId);
  params.set("limit", String(limit));
  return request<BrandComplianceSummary[]>(`/marketing/brand-compliance?${params.toString()}`);
}

export async function getMarketingLiveTrends(query = "digital real estate", limit = 12): Promise<LiveTrendSnapshot> {
  const q = encodeURIComponent(query);
  try {
    return await request<LiveTrendSnapshot>(`/marketing/trends/live?q=${q}&limit=${limit}`);
  } catch (error) {
    console.warn("[api] getMarketingLiveTrends fallback:", (error as Error).message);
    return {
      query,
      signals: [],
      insights: [],
      fetchedAt: new Date().toISOString()
    };
  }
}

export async function getCommands(limit = 30): Promise<CommandRecord[]> {
  try {
    return await request<CommandRecord[]>(`/commands?limit=${limit}`);
  } catch (error) {
    // Commands are optional for page boot; keep dashboard rendering if backend command center fails.
    console.warn("[api] getCommands fallback to []:", (error as Error).message);
    return [];
  }
}
