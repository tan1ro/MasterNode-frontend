// ---------------------------------------------------------------------------
// Centralized routes & URLs — update here, everything else follows.
// ---------------------------------------------------------------------------

const DEFAULT_API_BASE_URL = "http://localhost:8000"

/** Every valid http(s) origin listed in `NEXT_PUBLIC_API_URL` (comma-separated). */
export function parseApiBaseUrls(raw?: string): string[] {
  const trimmed = (raw || "").trim()
  if (!trimmed) return [DEFAULT_API_BASE_URL]

  const urls: string[] = []
  for (const candidate of trimmed.split(",")) {
    const part = candidate.trim()
    if (!part) continue
    try {
      const url = new URL(part)
      if (url.protocol === "http:" || url.protocol === "https:") {
        urls.push(url.origin)
      }
    } catch {
      continue
    }
  }
  return urls.length > 0 ? urls : [DEFAULT_API_BASE_URL]
}

/** Pick the first valid http(s) URL when env was pasted with commas or stray spaces. */
export function resolveApiBaseUrl(raw?: string): string {
  return parseApiBaseUrls(raw)[0] ?? DEFAULT_API_BASE_URL
}

/** Backend API base URL (`NEXT_PUBLIC_API_URL` at build time). Default: http://localhost:8000. */
export const API_BASE_URL = resolveApiBaseUrl(process.env.NEXT_PUBLIC_API_URL)

/**
 * Same-origin proxy prefix (`/api/backend` forwards to the live MasterNode API).
 * Browser XHR uses this to avoid CORS when the API runs on another host.
 */
export const DEV_API_PROXY_PREFIX = "/api/backend"

/** API base for browser `fetch` / axios — proxied by default unless opted out. */
export function getClientApiBaseUrl(): string {
  if (typeof window === "undefined") return API_BASE_URL
  if (process.env.NEXT_PUBLIC_USE_API_PROXY === "0") return API_BASE_URL
  return DEV_API_PROXY_PREFIX
}

/** Build a client API URL that respects the dev proxy prefix. */
export function joinClientApiPath(path: string): string {
  const base = getClientApiBaseUrl().replace(/\/$/, "")
  const segment = path.replace(/^\//, "")
  return `${base}/${segment}`
}

/** WebSocket base URL derived from the API base URL. */
export const WS_BASE_URL = API_BASE_URL.replace(/^http/, "ws")

/** Swagger / interactive API docs hosted by the backend. */
export const API_DOCS_URL = `${API_BASE_URL}/docs`

/** Backend health-check endpoint. */
export const API_HEALTH_URL = `${API_BASE_URL}/health`

// ---------------------------------------------------------------------------
// Internal (Next.js) page routes
// ---------------------------------------------------------------------------
export const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  /** @deprecated Use `dashboard` — kept for imports; same URL. */
  chatDashboard: "/dashboard",
  /** Business account hub — full product lifecycle workstreams. */
  product: "/product",
  productDetail: (productId: string) => `/product/${encodeURIComponent(productId)}` as const,
  productSdlc: (productId: string, sdlcPhase: string) =>
    `/product/${encodeURIComponent(productId)}/${encodeURIComponent(sdlcPhase)}` as const,
  productSdlcTask: (productId: string, sdlcPhase: string, taskId: string) =>
    `/product/${encodeURIComponent(productId)}/${encodeURIComponent(sdlcPhase)}/${encodeURIComponent(taskId)}` as const,
  chat: "/chat",
  chatConversation: (chatId: string) => `/chat/${encodeURIComponent(chatId)}` as const,
  /** Public read-only shared chat snapshot (`/share/:shareId`). */
  chatShare: (shareId: string) => `/share/${encodeURIComponent(shareId)}` as const,
  /** In-app pricing for draft chat (`/chat/pricing`). */
  chatPricing: "/chat/pricing",
  /** In-app pricing while a conversation is open (`/chat/:id/pricing`). */
  chatConversationPricing: (chatId: string) =>
    `/chat/${encodeURIComponent(chatId)}/pricing` as const,
  /** Public plans & pricing with full feature comparison. */
  pricing: "/pricing",
  /** @deprecated Use `ROUTES.pricing` — public marketing pricing page. */
  homePricing: "/pricing",
  tasks: "/tasks",
  /** Interactive pipeline runner with DAG + optional per-stage human validation (demo UI). */
  taskExecute: "/tasks/execute",
  taskDetail: (id: string) => `/tasks/${id}` as const,
  apiKeys: "/api-keys",
  /** Provider priority and routing policy preferences (stored in this browser). */
  llmStrategy: "/llm-strategy",
  /** Pipeline metrics, executions, and stage timing. */
  analytics: "/analytics",
  /** Saved instructions per workflow step (UI: Assistants). */
  agents: "/assistants",
  /** Memory page — working memory + knowledge base (RAG upload in #knowledge). */
  memory: "/memory",
  /** @deprecated Use `memory` — redirects to `/memory`. */
  knowledge: "/memory",
  /** Third-party app connections (n8n, Canva, Google Docs, Notion). */
  integrations: "/integrations",
  /** Deep link to knowledge base section on Memory (legacy /rag bookmarks). */
  rag: "/memory#knowledge",
  settings: "/settings",
  /** Workspace members and audit activity (demo UI). Redirects to /team/management. */
  team: "/team",
  /** Members and admin controls (business accounts). */
  teamManagement: "/team/management",
  /** Team-scoped activity feed (business accounts). */
  teamLogs: "/team/logs",
  /** Superuser-only operations page for governance and elevated actions. */
  superuserTasks: "/superuser/tasks",
  /** Superuser user and plan administration. */
  superuserUsers: "/superuser/users",
  /** Superuser review of chat moderation / flagged users. */
  superuserModeration: "/superuser/moderation",
  /** Superuser product analytics dashboard. */
  superuserAnalytics: "/superuser/analytics",
  /** Dashboard Monitor hub (health / metrics / execution analytics). */
  superuserMonitor: "/superuser/monitor",
  /** System health for Dashboard Monitor. */
  superuserMonitorHealth: "/superuser/monitor/health",
  /** Pipeline execution metrics for Dashboard Monitor. */
  superuserMonitorMetrics: "/superuser/monitor/metrics",
  /** Execution analytics for Dashboard Monitor. */
  superuserMonitorAnalytics: "/superuser/monitor/analytics",
  /** Chat response feedback inbox. */
  superuserFeedback: "/superuser/feedback",
  /** In-app bug / error reports inbox. */
  superuserErrors: "/superuser/errors",
  /** Payment history + token usage reset (region/country filters). */
  superuserBilling: "/superuser/billing",
  billing: "/billing",
  /** Billing dashboard — usage charts and credits. */
  billingUsage: "/billing#usage",
  /** Billing dashboard — invoice history. */
  billingInvoices: "/billing#invoices",
  /** Plan comparison and checkout — dedicated pricing page (not embedded on billing). */
  billingPlans: "/chat/pricing",
  /** Workspace activity log (task lifecycle and related audit events). */
  logs: "/logs",
  docs: "/docs",
  /** In-app API reference (coming soon). */
  apiDocs: "/api/docs",
  help: "/help",
  helpFaq: "/help/faq",
  helpTutorials: "/help/tutorials",
  helpCourses: "/help/courses",
  helpKeyboardShortcuts: "/help/keyboard-shortcuts",
  /** Public changelog — maintained in `content/help/release-notes.ts`. */
  helpReleaseNotes: "/release-notes",
  /** Technical semver changelog — maintained in `content/help/changelog.ts`. */
  changelog: "/changelog",
  helpDownloadApps: "/help/download-apps",
  /** Public desktop / laptop app download. */
  download: "/download",
  support: "/support",
  contact: "/contact",
  about: "/about",
  /** Combined Agent Factory + features (not in navbar; legacy /factory and /roadmap redirect here). */
  platform: "/platform",
  /** @deprecated Redirects to /platform */
  factory: "/factory",
  /** Company blog / product updates (marketing). */
  blog: "/blog",
  /** @deprecated Redirects to /platform#features */
  roadmap: "/roadmap",
  /** Community hub (marketing). */
  community: "/community",
  /** Solutions hub — use cases and industries. */
  solutions: "/solutions",
  solution: (slug: string) => `/solutions/${encodeURIComponent(slug)}` as const,
  /** Legal hub and consolidated policy documents. */
  legal: "/legal",
  privacy: "/legal/privacy",
  privacyChoices: "/legal/privacy-choices",
  usagePolicy: "/legal/usage-policy",
  terms: "/legal/terms",
  trust: "/legal/trust",
  accessibility: "/legal/accessibility",
  signIn: "/sign-in",
  signUp: "/sign-up",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  onboarding: "/onboarding",
  /** Reference index for documented HTTP status pages. */
  errorsIndex: "/errors",
  /** Branded static pages for HTTP status semantics (e.g. reverse-proxy error routes). */
  httpStatus: {
    400: "/errors/400",
    401: "/errors/401",
    500: "/errors/500",
    501: "/errors/501",
    502: "/errors/502",
  },
} as const

/** Canonical HTTP error page, e.g. `/errors/404`. */
export function httpErrorRoute(code: number): string {
  return `/errors/${code}`
}
