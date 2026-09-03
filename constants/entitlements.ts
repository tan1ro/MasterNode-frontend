/**
 * Central feature entitlement matrix — keep in sync with backend policy_engine.py
 */
import type { AppAccountType } from "@/lib/account-types"
import { normalizeAccountType } from "@/lib/account-types"
import type { AppPlan } from "@/lib/app-auth"
import { planMeetsMinimum } from "@/lib/app-auth"

export type FeatureId =
  | "routes.dashboard"
  | "routes.tasks"
  | "routes.api_keys"
  | "routes.team"
  | "routes.analytics"
  | "routes.llm_strategy"
  | "tasks.create"
  | "tasks.execute"
  | "rag.upload"
  | "templates.view"
  | "templates.manage"
  | "templates.use_locked"
  | "analytics.view"
  | "billing.subscription"
  | "billing.wallet_topup"
  | "memory.advanced"
  | "chat.pipeline"

export type AccountRole = AppAccountType | "any"

export interface FeatureRequirement {
  id: FeatureId
  label: string
  requiredRole: AccountRole
  minPlan: AppPlan
  /** Paid subscription required (not free tier) */
  requiresActiveSubscription?: boolean
}

export const PLAN_RANK: Record<AppPlan, number> = {
  free: 0,
  pro: 1,
  pro_plus: 2,
  premium: 3,
  enterprise: 4,
}

export const FEATURE_REQUIREMENTS: Record<FeatureId, FeatureRequirement> = {
  "routes.dashboard": {
    id: "routes.dashboard",
    label: "Dashboard",
    requiredRole: "business",
    minPlan: "free",
  },
  "routes.tasks": {
    id: "routes.tasks",
    label: "Tasks",
    requiredRole: "any",
    minPlan: "free",
  },
  "routes.api_keys": {
    id: "routes.api_keys",
    label: "API Keys",
    requiredRole: "business",
    minPlan: "free",
  },
  "routes.team": {
    id: "routes.team",
    label: "Team",
    requiredRole: "business",
    minPlan: "free",
  },
  "routes.analytics": {
    id: "routes.analytics",
    label: "Analytics",
    requiredRole: "business",
    minPlan: "pro",
  },
  "routes.llm_strategy": {
    id: "routes.llm_strategy",
    label: "LLM Strategy",
    requiredRole: "business",
    minPlan: "pro_plus",
  },
  "tasks.create": {
    id: "tasks.create",
    label: "Create tasks",
    requiredRole: "any",
    minPlan: "free",
  },
  "tasks.execute": {
    id: "tasks.execute",
    label: "Execute pipelines",
    requiredRole: "any",
    minPlan: "free",
  },
  "rag.upload": {
    id: "rag.upload",
    label: "RAG file upload",
    requiredRole: "any",
    minPlan: "pro",
  },
  "templates.view": {
    id: "templates.view",
    label: "View assistants",
    requiredRole: "any",
    minPlan: "free",
  },
  "templates.manage": {
    id: "templates.manage",
    label: "Create or edit templates",
    requiredRole: "any",
    minPlan: "pro",
  },
  "templates.use_locked": {
    id: "templates.use_locked",
    label: "Use premium templates",
    requiredRole: "any",
    minPlan: "premium",
  },
  "analytics.view": {
    id: "analytics.view",
    label: "Analytics",
    requiredRole: "business",
    minPlan: "pro",
  },
  "billing.subscription": {
    id: "billing.subscription",
    label: "Manage subscription",
    requiredRole: "any",
    minPlan: "free",
  },
  "billing.wallet_topup": {
    id: "billing.wallet_topup",
    label: "Wallet top-up",
    requiredRole: "business",
    minPlan: "free",
  },
  "memory.advanced": {
    id: "memory.advanced",
    label: "Advanced memory",
    requiredRole: "any",
    minPlan: "pro_plus",
  },
  "chat.pipeline": {
    id: "chat.pipeline",
    label: "Chat pipeline",
    requiredRole: "any",
    minPlan: "free",
  },
}

/** Plan limits used for display and client-side hints */
export const PLAN_LIMITS: Record<
  AppPlan,
  {
    maxRagFiles: number
    maxParallelAgents: number
    analyticsDays: number
    chatMaxDocumentMb: number
    chatMaxImageMb: number
    chatMaxFilesPerConversation: number
    projectMaxMb: number
  }
> = {
  free: {
    maxRagFiles: 3,
    maxParallelAgents: 4,
    analyticsDays: 7,
    chatMaxDocumentMb: 25,
    chatMaxImageMb: 25,
    chatMaxFilesPerConversation: 5,
    projectMaxMb: 10,
  },
  pro: {
    maxRagFiles: 20,
    maxParallelAgents: 8,
    analyticsDays: 30,
    chatMaxDocumentMb: 100,
    chatMaxImageMb: 100,
    chatMaxFilesPerConversation: 10,
    projectMaxMb: 20,
  },
  pro_plus: {
    maxRagFiles: 50,
    maxParallelAgents: 16,
    analyticsDays: 90,
    chatMaxDocumentMb: 250,
    chatMaxImageMb: 250,
    chatMaxFilesPerConversation: 15,
    projectMaxMb: 25,
  },
  premium: {
    maxRagFiles: 200,
    maxParallelAgents: 60,
    analyticsDays: 365,
    chatMaxDocumentMb: 500,
    chatMaxImageMb: 500,
    chatMaxFilesPerConversation: 20,
    projectMaxMb: 30,
  },
  enterprise: {
    maxRagFiles: 1000,
    maxParallelAgents: 64,
    analyticsDays: 730,
    chatMaxDocumentMb: 500,
    chatMaxImageMb: 500,
    chatMaxFilesPerConversation: 20,
    projectMaxMb: 30,
  },
}

export interface EntitlementContext {
  accountType: AppAccountType | null
  plan: AppPlan | null
  isSuperUser?: boolean
  subscriptionActive?: boolean
}

export function canAccessFeature(
  ctx: EntitlementContext,
  featureId: FeatureId
): boolean {
  if (ctx.isSuperUser) return true
  const req = FEATURE_REQUIREMENTS[featureId]
  if (!req) return false
  const role = ctx.accountType ? normalizeAccountType(ctx.accountType) : null
  const plan = ctx.plan ?? "free"
  if (req.requiredRole !== "any" && role !== req.requiredRole) return false
  if (!planMeetsMinimum(plan, req.minPlan)) return false
  if (req.requiresActiveSubscription && plan === "free" && !ctx.subscriptionActive) {
    return false
  }
  return true
}

export function featureBlockReason(
  ctx: EntitlementContext,
  featureId: FeatureId
): string | null {
  if (canAccessFeature(ctx, featureId)) return null
  const req = FEATURE_REQUIREMENTS[featureId]
  const normalizedType = ctx.accountType ? normalizeAccountType(ctx.accountType) : null
  if (req.requiredRole !== "any" && normalizedType !== req.requiredRole) {
    return `${req.label} requires a ${req.requiredRole} account.`
  }
  if (!planMeetsMinimum(ctx.plan, req.minPlan)) {
    return `${req.label} requires ${req.minPlan} plan or higher.`
  }
  if (req.requiresActiveSubscription) {
    return `${req.label} requires an active paid subscription.`
  }
  return `${req.label} is not available on your plan.`
}

export function upgradePlanForFeature(featureId: FeatureId): AppPlan {
  return FEATURE_REQUIREMENTS[featureId]?.minPlan ?? "pro"
}

/** Map pathname prefixes to feature gates for nav/footer */
export function featureForPath(pathname: string): FeatureId | null {
  if (pathname.startsWith("/dashboard")) return "routes.dashboard"
  if (pathname.startsWith("/tasks")) return "routes.tasks"
  if (pathname.startsWith("/api-keys")) return "routes.api_keys"
  if (pathname.startsWith("/team")) return "routes.team"
  if (pathname.startsWith("/analytics")) return "routes.analytics"
  if (pathname.startsWith("/llm-strategy")) return "routes.llm_strategy"
  return null
}
