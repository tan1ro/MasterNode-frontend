/**
 * Shared API types and error handling for MasterNode frontend.
 * Keeps contracts in one place for services and hooks.
 */

/** Extended Error for API responses (connection, auth, etc.) */
export interface ApiError extends Error {
  isConnectionError?: boolean
  /** MasterNode API unreachable, wrong server on the port, or not running */
  isBackendUnavailable?: boolean
  isAuthError?: boolean
  /** HTTP 402 insufficient prepaid API wallet */
  isWalletError?: boolean
  /** HTTP 403 plan or permission denied */
  isForbidden?: boolean
  /** Policy engine denied a feature (plan/role gate) */
  isEntitlementError?: boolean
  /** Feature id from policy denial, e.g. templates.manage */
  entitlementFeature?: string
  /** HTTP status when the error came from an API response */
  httpStatus?: number
  /** True for HTTP 5xx responses */
  isServerError?: boolean
  /** HTTP 429 chat credit quota exhausted */
  isQuotaExceeded?: boolean
  quotaResetsAt?: string | null
  quotaCode?: string
}

/** How the task was created: website session vs API key / MCP. */
export type ClientChannel = "web" | "api"

/** Task as returned by API */
export interface Task {
  task_id: string
  task: string
  status:
    | "pending"
    | "decomposing"
    | "running"
    | "awaiting_human"
    | "awaiting_plan_review"
    | "completed"
    | "failed"
  created_at: string
  updated_at: string
  graph?: Record<string, unknown>
  final_result?: unknown
  partial_results?: Record<string, unknown>
  /** Supervisor / static checks (e.g. webapp_coherence) */
  validation?: Record<string, unknown>
  error?: string
  /** Pipeline stage → custom agent ``template_id`` when the run used overrides */
  template_ids?: Record<string, string>
  /** Present when backend tracks website vs API traffic separately */
  client_channel?: ClientChannel
  /** Workspace product this task is assigned to */
  product_id?: string
  /** SDLC workstream within the product (engineering, product, marketing, legal) */
  sdlc_phase?: string
  /** Chat thread that launched this task (when created from /chat). */
  source_conversation_id?: string
  /** Editable markdown plan generated before execution (pipeline plan review). */
  pipeline_plan?: {
    plan_markdown: string
    questions?: Array<{ id: string; prompt: string; options: Array<{ id: string; label: string }> }>
    intent_kind?: string
    status?: string
    answers?: Record<string, string>
  }
  /** Approved plan text used for the run (after plan-continue). */
  approved_plan_markdown?: string
  /** When true, execution must wait for plan-continue (chat pipeline). */
  plan_review?: boolean
}

/** List tasks response */
export interface TaskListResponse {
  total: number
  tasks: Task[]
}

/** Create task request */
export interface CreateTaskRequest {
  task: string
  max_parallel_agents?: number
  use_rag?: boolean
  execution_mode?: "parallel" | "sequential"
  preferred_provider?: string
  template_ids?: Record<string, string>
  /** Filenames or source ids matching ingested RAG chunks; used when use_rag is true */
  rag_sources?: string[]
  /** When true, backend pauses after major stages until POST /v1/task/{id}/human-continue */
  human_in_loop?: boolean
  human_in_loop_gates?: string[]
  domain_pack?: string
  citation_mode?: "required" | "optional" | "off"
  freshness_mode?: "latest" | "balanced" | "archive"
  source_priorities?: Array<Record<string, unknown>>
  corpora?: string[]
  product_id?: string
  sdlc_phase?: string
  /** Chat thread that launched this pipeline task. */
  source_conversation_id?: string
  /** Pause for editable markdown plan review before execution (chat pipeline). */
  plan_review?: boolean
}

/** Tasks scoped to a product (optionally filtered by SDLC phase). */
export interface ProductTaskListResponse {
  product_id: string
  sdlc_phase?: string | null
  total: number
  tasks: Task[]
}

/** Create task response */
export interface CreateTaskResponse {
  task_id: string
}

/** API key as returned by API */
export interface ApiKeyRecord {
  key_id: string
  name: string
  api_key: string
  created_at: string
  last_used?: string
  /** When omitted (legacy), treat as full access */
  read?: boolean
  write?: boolean
}

/** Create API key request */
export interface CreateApiKeyRequest {
  name: string
  read?: boolean
  write?: boolean
}

/** Create API key response (wrapped in data by axios) */
export interface CreateApiKeyResponse {
  api_key: string
  key_id?: string
  read?: boolean
  write?: boolean
}

/** Auto-create API key response */
export interface AutoCreateApiKeyResponse {
  api_key: string
}

/** Per–API-key prepaid row (GET /v1/wallet) */
export interface ApiWalletRow {
  key_id?: string
  name?: string
  tenant_id: string
  balance_usd: number
  accrued_cost_usd: number
  available_usd: number
  starter_credit_usd?: number
  used_fraction?: number
  wallet_required: boolean
  api_wallet_enabled: boolean
  read?: boolean
  write?: boolean
}

export interface ApiWalletAppResponse {
  api_wallet_enabled: boolean
  starter_credit_usd?: number
  auth: "app"
  wallets: ApiWalletRow[]
}

export interface ApiWalletKeyResponse {
  api_wallet_enabled: boolean
  auth: "api_key"
  tenant_id: string
  balance_usd: number
  accrued_cost_usd: number
  available_usd: number
  starter_credit_usd?: number
  used_fraction?: number
  wallet_required: boolean
  read?: boolean
  write?: boolean
}

export type ApiWalletResponse = ApiWalletAppResponse | ApiWalletKeyResponse

/** Usage record */
export interface UsageRecord {
  usage_id: string
  task_id?: string
  tokens_used?: number
  cost_usd?: number
  compute_time_ms?: number
  created_at: string
  client_channel?: ClientChannel
}

/** Usage summary */
export interface UsageSummary {
  total_tokens?: number
  total_cost_usd?: number
  total_compute_time_ms?: number
  total_tasks?: number
}

/** Usage API response */
export interface UsageResponse {
  summary?: UsageSummary
  records?: UsageRecord[]
}

/** Single subsystem in /health breakdown */
export interface HealthComponent {
  id: string
  label: string
  detail?: string
  online: boolean
  latency_ms: number
}

/** LLM provider slot — configured means a non-placeholder key is set (no secret exposed) */
export interface LlmProviderKeyStatus {
  id: string
  configured: boolean
}

/** Health API response */
export interface HealthResponse {
  status: "ok" | "degraded" | string
  service?: string
  database?: "connected" | "unavailable" | string
  llm_providers?: "available" | "unavailable" | string
  /** e.g. 5 of 6 subsystems responding */
  online_count?: number
  total_count?: number
  components?: HealthComponent[]
  llm_provider_keys?: LlmProviderKeyStatus[]
  /** Convenience: ids with keys configured */
  llm_providers_configured?: string[]
}

/** Usage query params */
export interface UsageParams {
  start_date?: string
  end_date?: string
  client_channel?: ClientChannel
}

/** RAG file as returned by API */
export interface RagFile {
  file_id: string
  filename?: string
  file_type?: string
  file_size?: number
  size_bytes?: number
  created_at?: string
  updated_at?: string
  chunks_count?: number
}

/** File linked to a workspace product (enriched from RAG). */
export interface ProductLinkedFile {
  file_id: string
  filename?: string
  file_type?: string
  size_bytes?: number
  chunks_count?: number
  created_at?: string
  missing?: boolean
}

export interface WorkspaceProduct {
  product_id: string
  name: string
  description?: string
  file_ids: string[]
  files: ProductLinkedFile[]
  created_at?: string
  updated_at?: string
}

/** Support chat request */
export interface SupportChatRequest {
  message: string
  conversation_history?: { role: string; content: string }[]
  /** Task id, draft goal, etc. — improves follow-ups without resending full transcripts */
  context_hint?: string
}

/** Support chat response */
export interface SupportChatResponse {
  message: string
}

/** In-app bug report (account menu → Help → Report a bug). */
export interface BugReportRequest {
  message: string
  page_url?: string | null
  conversation_id?: string | null
}

export interface BugReportResponse {
  status: string
  message: string
}

export type ChatRole = "user" | "assistant" | "tool"
export type ThinkingMode = "off" | "standard" | "deep"

export interface ChatModelInfo {
  model_id: string
  provider_id: string
  label: string
  supports_thinking: boolean
  capabilities?: string[]
}

export interface ChatAttachment {
  attachment_id: string
  conversation_id: string
  filename: string
  mime_type?: string
  size_bytes?: number
  created_at?: string
  /** Whether raw bytes are stored server-side for preview/download. */
  preview_available?: boolean
  /** Whether readable text was extracted for the model. */
  text_available?: boolean
  /** User-facing note when preview or text extraction had issues. */
  warning?: string | null
  /** Workspace user that uploaded the file (same as tenant for solo accounts). */
  user_id?: string
}

export interface WebSearchSource {
  title: string
  url: string
  source?: string
  snippet?: string
}

export interface ChatToolEvent {
  type: "tool_call_started" | "tool_call_output" | "tool_call_completed" | "tool_call_error"
  name: string
  call_id?: string
  status?: string
  output?: string
  error?: string
  timestamp?: string
  query?: string
  queries?: string[]
  provider?: string | null
  result_count?: number
  sources?: WebSearchSource[] | string[]
  resolved_query?: string
  news_artifact?: {
    headlines: Array<{
      title: string
      url: string
      source?: string
      publisher?: string
      snippet?: string | null
      published_label?: string
    }>
    query?: string
    provider?: string
  }
  /** File-generation pipeline step (read, plan, command, script, qa, file). */
  step?: string
  label?: string
  detail?: string
  filename?: string
  slides_created?: number
}

export interface ChatMessage {
  message_id: string
  conversation_id: string
  role: ChatRole
  content: string
  created_at: string
  metadata?: Record<string, unknown>
  attachments?: ChatAttachment[]
  tool_events?: ChatToolEvent[]
  audio_url?: string | null
}

export interface PipelineParallelSummary {
  total: number
  running: number
  completed: number
  failed: number
}

export interface PipelineSubtaskPreview {
  subtask_id: string
  title: string
}

export interface PipelineStageOutputPreview {
  master?: unknown
  decomposer?: unknown
  workers?: unknown
  aggregator?: unknown
  supervisor?: unknown
}

export interface PipelineProgressPayload {
  current_stage: string
  stage_status?: "started" | "running" | "completed" | string
  subtask_count: number
  execution_order_count: number
  parallel_summary: PipelineParallelSummary
  subtasks_preview?: PipelineSubtaskPreview[]
  stage_output_preview?: PipelineStageOutputPreview
}

export interface ChatConversation {
  conversation_id: string
  title: string
  archived: boolean
  ghost_mode?: boolean
  model_id?: string | null
  thinking_mode?: ThinkingMode
  created_at: string
  updated_at: string
  last_message_preview?: string | null
}

/** Webhook create request */
export interface WebhookCreateRequest {
  url: string
  events: string[]
}

export type IntegrationConnectionType = "webhook" | "oauth" | "api_token"

export type IntegrationStatus = "connected" | "not_connected" | "setup_required"

export interface IntegrationConnection {
  tenant_id?: string
  provider?: string
  status?: string
  config?: Record<string, unknown>
  connected_at?: string
  updated_at?: string
}

export interface IntegrationCatalogItem {
  id: string
  name: string
  description: string
  connection_type: IntegrationConnectionType
  brand_color: string
  status: IntegrationStatus
  category?: string
  oauth_configured?: boolean | null
  connection?: IntegrationConnection | null
  workflow_name?: string | null
}

export interface IntegrationsListResponse {
  integrations: IntegrationCatalogItem[]
}

export interface IntegrationConnectRequest {
  webhook_url?: string
  workflow_name?: string
  notify_task_events?: boolean
  api_token?: string
  token?: string
  site_url?: string
  email?: string
}

export interface IntegrationConnectResponse {
  ok?: boolean
  oauth_configured?: boolean
  oauth_url?: string
  message?: string
  connection?: IntegrationConnection
  display_name?: string
}

/** Single row from GET /metrics */
export interface ExecutionMetricsRow {
  task_id: string
  execution_time_seconds?: number
  total_agents?: number
  success_count?: number
  failure_count?: number
  provider_usage?: Record<string, number>
  /** API calls per stage id, then provider id (AUTO → DEFAULT). */
  stage_provider_calls?: Record<string, Record<string, number>>
  total_tokens?: number
  prompt_tokens?: number
  completion_tokens?: number
  cost_estimate_usd?: number
  node_timings?: Record<string, { duration_seconds?: number }>
  agent_executions?: Array<{
    agent_id?: string
    duration_seconds?: number
    provider?: string
    success?: boolean
  }>
}

export interface MetricsListResponse {
  tasks: ExecutionMetricsRow[]
  total_tasks: number
  limit: number
  offset: number
}

export interface SloSnapshot {
  tenant_id?: string | null
  task_samples: number
  latency_p95_seconds: number
  latency_target_seconds?: number
  latency_ok?: boolean
  endpoint_latency_targets_seconds?: Record<string, number>
  success_rate?: number
  failure_tasks?: number
  error_rate: number
  error_rate_target?: number
  error_budget_ok?: boolean
}

export interface TaskMetricsResponse {
  metrics: ExecutionMetricsRow
  benchmarks?: Record<string, unknown>
}

export interface AuditEvent {
  id?: string
  ts?: string
  tenant_id?: string
  principal?: string
  action?: string
  resource?: string
  outcome?: string
  metadata?: Record<string, unknown>
}

export interface AuditLogsResponse {
  events: AuditEvent[]
}

export type AgentTemplateRequiredRole = "any" | "creator" | "business"
export type AgentTemplateMinPlan = "free" | "pro" | "pro_plus" | "premium" | "enterprise"

export interface AgentTemplateApi {
  template_id?: string
  name?: string
  description?: string
  agent_type?: string
  prompt_template?: string
  config?: Record<string, unknown>
  variables?: unknown[]
  required_role?: AgentTemplateRequiredRole
  min_plan?: AgentTemplateMinPlan
  /** Server-computed flag: true if the current viewer's role + plan satisfy the template's gating. */
  unlocked?: boolean
}

export interface AgentTemplatesListResponse {
  templates: AgentTemplateApi[]
  total: number
  limit: number
  offset: number
  viewer?: {
    account_type?: string
    plan?: string
  }
}

/** Body for ``POST /templates`` (matches FastAPI upsert handler). */
export interface UpsertAgentTemplateBody {
  template_id: string
  name: string
  /** Omitted for gallery assistants — server defaults to ``custom``. Pipeline stage is chosen at task/run time. */
  agent_type?: string
  prompt_template: string
  description?: string
  config?: Record<string, unknown>
  variables?: unknown[]
  tenant_id?: string
  required_role?: AgentTemplateRequiredRole
  min_plan?: AgentTemplateMinPlan
}

export interface BillingSubscriptionSummary {
  stripe_enabled: boolean
  razorpay_enabled?: boolean
  tenant_id: string
  account_type: string
  plan: string
  subscription?: {
    status?: string
    plan?: string
    current_period_end?: string | null
    stripe_subscription_id?: string | null
  } | null
  prompt_quota?: PromptQuotaSnapshot
}

export interface PromptQuotaSnapshot {
  used_tokens?: number
  limit_tokens?: number | null
  /** @deprecated Legacy alias */
  used?: number
  /** @deprecated Legacy alias */
  limit?: number | null
  percent: number | null
  is_unlimited: boolean
  window_hours: number
  resets_at?: string | null
  plan: string
  unit?: string
}

export interface BillingInvoiceRow {
  invoice_id?: string
  stripe_invoice_id?: string
  tenant_id?: string
  provider?: "stripe" | "razorpay" | string
  amount_usd?: number
  amount_inr?: number | null
  amount_paise?: number | null
  currency?: string
  status?: string
  plan?: string | null
  account_type?: string | null
  description?: string | null
  razorpay_order_id?: string | null
  razorpay_payment_id?: string | null
  receipt_number?: string | null
  invoice_number?: string | null
  invoice_pdf?: string | null
  receipt_pdf?: string | null
  customer_email?: string | null
  region?: string | null
  country?: string | null
  created_at?: string
}

export interface BillingCheckoutResponse {
  ok?: boolean
  checkout_url?: string
  session_id?: string
  error?: string
}

export interface BillingPortalResponse {
  ok?: boolean
  portal_url?: string
  error?: string
}

export interface RazorpayOrderResponse {
  order_id: string
  /** Amount in the smallest currency unit (paise for INR). */
  amount: number
  currency: string
  receipt?: string | null
  /** Public Razorpay key id used to open the checkout modal. */
  key_id: string
  /** Checkout must complete within this many seconds (Razorpay modal timer). */
  checkout_timeout_seconds?: number
  plan?: string | null
  account_type?: string | null
}

export interface RazorpayVerifyResponse {
  verified: boolean
  razorpay_order_id: string
  razorpay_payment_id: string
  /** Plan applied to the tenant on success (null for ad-hoc payments). */
  plan?: string | null
  account_type?: string | null
  applied?: boolean
  duplicate?: boolean
  invoice_id?: string | null
  receipt_number?: string | null
  invoice_number?: string | null
  amount_paise?: number | null
  currency?: string | null
  invoice_email_sent?: boolean
}

/** Type guard for ApiError */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof Error && "message" in error
}

/** Get display message from unknown error */
export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (isApiError(error)) return error.message
  if (error instanceof Error) return error.message
  if (typeof error === "string") return error
  return fallback
}

/** Check if error is connection-related */
export function isConnectionError(error: unknown): boolean {
  return isApiError(error) && Boolean(error.isConnectionError)
}

/** Check if the MasterNode API is unreachable or misconfigured */
export function isBackendUnavailable(error: unknown): boolean {
  if (!isApiError(error)) return false
  return Boolean(error.isBackendUnavailable || error.isConnectionError)
}

/** Check if error is auth-related */
export function isAuthError(error: unknown): boolean {
  return isApiError(error) && Boolean(error.isAuthError)
}

/** Check if error is wallet / prepaid balance (402) */
export function isWalletError(error: unknown): boolean {
  return isApiError(error) && Boolean(error.isWalletError)
}

/** Check if error is permission / plan denied (403) */
export function isForbidden(error: unknown): boolean {
  return isApiError(error) && Boolean(error.isForbidden)
}

/** Check if error is a policy / entitlement gate (403 with feature id) */
export function isEntitlementError(error: unknown): boolean {
  return isApiError(error) && Boolean(error.isEntitlementError)
}

/** Feature id when the API rejected an entitlement-gated action */
export function getEntitlementFeature(error: unknown): string | null {
  if (isApiError(error) && error.entitlementFeature) {
    return error.entitlementFeature
  }
  return null
}

/** Check if error is a backend 5xx failure */
export function isServerError(error: unknown): boolean {
  if (isApiError(error) && error.isServerError) return true
  const status = getHttpStatus(error)
  return status !== null && status >= 500
}

/** Extract HTTP status from ApiError or axios-like errors */
export function getHttpStatus(error: unknown): number | null {
  if (isApiError(error) && typeof error.httpStatus === "number") return error.httpStatus
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    (error as { response?: { status?: number } }).response?.status != null
  ) {
    return (error as { response: { status: number } }).response.status
  }
  return null
}
