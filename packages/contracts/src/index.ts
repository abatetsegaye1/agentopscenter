export type AgentEventType =
  | "run_started"
  | "tool_called"
  | "handoff"
  | "tool_failed"
  | "run_failed"
  | "run_completed"
  | "cost_recorded"
  | "human_escalation";

export type Severity = "info" | "warning" | "critical";

export interface AgentEvent {
  id: string;
  timestamp: string;
  type: AgentEventType;
  severity: Severity;
  workflow: string;
  agentId: string;
  subAgentId?: string;
  runId: string;
  taskId: string;
  latencyMs?: number;
  costUsd?: number;
  tokenCount?: number;
  status: "ok" | "error";
  message: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface OverviewMetrics {
  activeRuns: number;
  runsLast24h: number;
  successRatePct: number;
  avgLatencyMs: number;
  totalCostUsd24h: number;
  criticalIncidents24h: number;
}

export interface WorkflowSummary {
  workflow: string;
  totalRuns: number;
  failedRuns: number;
  avgLatencyMs: number;
  successRatePct: number;
}

export interface IncidentRecord {
  id: string;
  createdAt: string;
  runId: string;
  workflow: string;
  severity: Severity;
  reason: string;
  status: "open" | "investigating" | "resolved";
}

export interface OpenClawChannelStatus {
  name: string;
  connected: boolean;
  health: "ok" | "degraded" | "down";
}

export interface OpenClawNodeStatus {
  nodeId: string;
  connected: boolean;
  capabilities: string[];
  lastSeenAt: string;
}

export interface OpenClawGatewayStatus {
  connected: boolean;
  url: string;
  version: string;
  lastHeartbeatAt: string;
  channels: OpenClawChannelStatus[];
  nodes: OpenClawNodeStatus[];
  queueDepth: number;
}

export interface OpenClawConnectorStatus {
  enabled: boolean;
  connected: boolean;
  url: string;
  reconnectAttempts: number;
  lastConnectAt?: string;
  lastDisconnectAt?: string;
  lastError?: string;
}

export interface OpenClawProcessStatus {
  processRole: "api" | "worker";
  connector: OpenClawConnectorStatus;
  gateway: OpenClawGatewayStatus;
  updatedAt: string;
}

export interface OpenClawRawEvent {
  id: string;
  ts: string;
  event: string;
  status?: string;
  agentId?: string;
  subAgentId?: string;
  runId?: string;
  taskId?: string;
  workflow?: string;
  latencyMs?: number;
  tokenIn?: number;
  tokenOut?: number;
  costUsd?: number;
  message?: string;
  error?: string;
  parentRunId?: string;
  subRunId?: string;
  handoffReason?: string;
  stepIndex?: number;
  stepName?: string;
  stepStatus?: string;
  payload?: Record<string, unknown>;
}

export type OpsTaskStatus = "queued" | "running" | "completed" | "failed" | "rejected";
export type PairingStatus = "pending" | "approved" | "rejected";

export interface OpsTaskRecord {
  id: string;
  title: string;
  source: string;
  priority: "low" | "normal" | "high" | "critical";
  requestedBy: string;
  agentProfile: "admin" | "developer" | "operator" | "viewer";
  status: OpsTaskStatus;
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface OpsRunRecord {
  id: string;
  taskId: string;
  status: "accepted" | "running" | "completed" | "failed";
  startedAt: string;
  completedAt?: string;
}

export interface OpsTaskResultRecord {
  id: string;
  taskId: string;
  runId: string;
  source: string;
  resultType: "generic" | "research" | "article" | "image" | "video";
  summary?: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface OpenclawCheckpointRecord {
  id: string;
  openclawRunRecordId: string;
  openclawRunId?: string;
  taskId?: string;
  runId?: string;
  checkpointType: string;
  stepIndex?: number;
  status?: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface OpenclawRuntimeSummary {
  totalRuns: number;
  queuedRuns: number;
  runningRuns: number;
  waitingRuns: number;
  succeededRuns: number;
  failedRuns: number;
  timedOutRuns: number;
  autoRetriedRuns: number;
  avgLatencyMs: number;
  totalCostUsd: number;
  lastEventAt?: string;
  failureCategories: Array<{
    category: string;
    count: number;
  }>;
}

export interface OpsAuditRecord {
  id: string;
  taskId?: string;
  runId?: string;
  actor: string;
  action: string;
  outcome: "allowed" | "denied" | "ok" | "error";
  details: Record<string, unknown>;
  createdAt: string;
}

export interface PairingRequestRecord {
  id: string;
  deviceId: string;
  channel: string;
  requestedBy: string;
  status: PairingStatus;
  notes?: string;
  createdAt: string;
  approvedAt?: string;
}

export interface ModelRouteDecision {
  provider: "openai" | "anthropic" | "other";
  model: string;
  reason: string;
}

export interface LearningExperience {
  id: string;
  taskId: string;
  runId: string;
  objective: string;
  strategy: string;
  outcome: "success" | "failure";
  score: number;
  notes: string;
  createdAt: string;
}

export interface LearningLesson {
  id: string;
  title: string;
  pattern: string;
  recommendation: string;
  confidence: number;
  sourceExperienceIds: string[];
  createdAt: string;
}

export type KnowledgeComplianceStatus = "pass" | "warn" | "fail";

export interface KnowledgeViolationRecord {
  code: string;
  severity: "warn" | "fail";
  message: string;
  excerpt?: string;
}

export interface KnowledgeComplianceSummary {
  status: KnowledgeComplianceStatus;
  standardKey: string;
  standardVersion: number;
  authorityName: string;
  summary: string;
  violations: KnowledgeViolationRecord[];
  checkedAt: string;
}

export interface KnowledgeStandardRecord {
  id: number;
  standardKey: string;
  authorityName: string;
  title: string;
  doctrineText: string;
  doctrineJson: Record<string, unknown>;
  status: "draft" | "active" | "archived";
  version: number;
  createdBy: string;
  activatedAt?: string;
  archivedAt?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeCorrectionLessonRecord {
  id: number;
  standardKey: string;
  contentItemId?: string;
  complianceResultId?: number;
  correctionPattern: string;
  recommendation: string;
  sourceNotes?: string;
  createdBy: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface BrandViolationRecord {
  code: string;
  severity: "warn" | "fail";
  message: string;
  excerpt?: string;
}

export interface BrandComplianceSummary {
  status: "pass" | "warn" | "fail";
  summary: string;
  violations: BrandViolationRecord[];
  checks: {
    logoIntegrity: "pass" | "warn" | "fail";
    colorPolicy: "pass" | "warn" | "fail";
    trademark: "pass" | "warn" | "fail";
    brandText: "pass" | "warn" | "fail";
  };
  officialAssetKey?: string;
  officialAssetVersion?: number;
  checkedAt: string;
}

export interface BrandAssetRecord {
  id: number;
  assetKey: string;
  assetType: string;
  version: number;
  filePath: string;
  fileUrl?: string;
  mimeType: string;
  sha256Hash: string;
  normalizedHash?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  trademarkRequired: boolean;
  colorSignature: string[];
  geometrySignature: Record<string, unknown>;
  metadata: Record<string, unknown>;
  isActive: boolean;
  approvedBy?: string;
  approvedAt?: string;
  archivedAt?: string;
  createdAt: string;
}

export interface BrandColorPolicyRecord {
  id: number;
  colorName: string;
  hexCode: string;
  rgbValue: string;
  usageType: string;
  toleranceDelta: number;
  isStrict: boolean;
  isActive: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export type MarketingTaskType =
  | "GENERATE_VIDEO"
  | "GENERATE_IMAGE_POST"
  | "GENERATE_INFOGRAPHIC"
  | "GENERATE_SOCIAL_POST"
  | "GENERATE_ARTICLE"
  | "TREND_COLLECT"
  | "TREND_ANALYZE"
  | "CONCEPT_GENERATE"
  | "CONCEPT_SCORE"
  | "CONCEPT_APPROVAL_REQUEST"
  | "CONCEPT_APPROVAL_APPLY"
  | "CONTENT_PLAN_GENERATE"
  | "CONTENT_DRAFT_GENERATE"
  | "CONTENT_EXECUTION_PREPARE"
  | "CONTENT_EXECUTE_APPROVED"
  | "PERFORMANCE_EVALUATE"
  | "LEARNING_FEEDBACK_APPLY"
  | "COMPLIANCE_REVIEW"
  | "PUBLISH_CONTENT"
  | "FETCH_PLATFORM_METRICS"
  | "ENGAGE_COMMENTS"
  | "ATTRIBUTION_REFRESH"
  | "OPTIMIZE_CONTENT_PORTFOLIO";

export type MarketingTaskStatus =
  | "queued"
  | "running"
  | "awaiting-provider"
  | "retrying"
  | "stalled"
  | "completed"
  | "failed";

export interface MarketingTaskRecord {
  id: string;
  runId: string;
  campaignId?: string;
  contentItemId?: string;
  taskType: MarketingTaskType;
  status: MarketingTaskStatus;
  createdBy: string;
  platforms: string[];
  payload: Record<string, unknown>;
  result?: Record<string, unknown>;
  error?: string;
  openclaw?: {
    runRecordId: string;
    openclawRunId?: string;
    status: string;
    routeId?: string;
    currentStepIndex?: number;
    currentStepStatus?: string;
    retryCount: number;
    recoverable: boolean;
    failureCategory?: string;
    steps: Array<{
      stepIndex: number;
      stepName?: string;
      stepStatus: string;
      handoffTo?: string;
      startedAt?: string;
      finishedAt?: string;
    }>;
    checkpoints: Array<{
      checkpointType: string;
      stepIndex?: number;
      status?: string;
      createdAt: string;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MarketingOverview {
  totalTasks: number;
  queuedTasks: number;
  runningTasks: number;
  awaitingProviderTasks: number;
  retryingTasks: number;
  stalledTasks: number;
  completedTasks: number;
  failedTasks: number;
  completionRatePct: number;
}

export type IntegrationReadinessState =
  | "ready"
  | "misconfigured"
  | "token-expired"
  | "account-not-linked"
  | "permission-missing"
  | "awaiting-approval"
  | "unknown";

export interface IntegrationReadinessSnapshot {
  platform: string;
  state: IntegrationReadinessState;
  summary: string;
  missing: string[];
  diagnostics: Record<string, unknown>;
}

export interface MarketingLifecycleEventRecord {
  id: number;
  eventName: string;
  eventVersion: string;
  source: string;
  payload: Record<string, unknown>;
  emittedAt: string;
}

export interface DomainOpportunityRecord {
  id: number;
  opportunityKey: string;
  category: string;
  title: string;
  summary: string;
  confidenceScore: number;
  urgencyScore: number;
  strategicValueScore: number;
  status: string;
  whyNow?: string;
  recommendedAngle?: string;
  supportingSignals: Record<string, unknown>[];
  candidateDomains: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MarketingAgentRunRecord {
  id: string;
  runGroupId: string;
  agentName: string;
  layer: string;
  action: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  status: "queued" | "running" | "completed" | "failed";
  error?: string;
  startedAt: string;
  completedAt?: string;
}

export interface MarketingCampaignRecord {
  id: string;
  name: string;
  objective: string;
  status: string;
  channels: string[];
  createdBy: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface MarketingContentRecord {
  id: string;
  campaignId?: string;
  contentType: string;
  title?: string;
  body?: string;
  mediaUrls: string[];
  persona?: string;
  pillar?: string;
  status: string;
  metadata: Record<string, unknown>;
  definitionCompliance?: KnowledgeComplianceSummary;
  brandCompliance?: BrandComplianceSummary;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarketingApprovalQueueSnapshot {
  pendingCampaigns: MarketingCampaignRecord[];
  pendingContent: MarketingContentRecord[];
}

export interface QueueHealthSnapshot {
  enabled: boolean;
  queueName: string;
  workerConcurrency: number;
  counts: {
    waiting: number;
    active: number;
    delayed: number;
    paused: number;
    completed: number;
    failed: number;
  };
}
