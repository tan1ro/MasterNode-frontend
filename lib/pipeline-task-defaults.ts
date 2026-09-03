import { PLAN_LIMITS } from "@/constants/entitlements"
import { getCurrentUser, type AppPlan } from "@/lib/app-auth"

/** Max parallel agents allowed for the user's subscription plan. */
export function resolvePlanMaxParallelAgents(plan: AppPlan | null | undefined): number {
  const key = plan && plan in PLAN_LIMITS ? plan : "free"
  return PLAN_LIMITS[key].maxParallelAgents
}

/** Read plan from the signed-in session when available (browser only). */
export function resolveSessionPlanMaxParallelAgents(): number {
  if (typeof window === "undefined") return PLAN_LIMITS.free.maxParallelAgents
  return resolvePlanMaxParallelAgents(getCurrentUser()?.plan ?? "free")
}

export function clampMaxParallelAgents(
  requested: number,
  plan: AppPlan | null | undefined
): number {
  const cap = resolvePlanMaxParallelAgents(plan)
  const n = Number.isFinite(requested) ? Math.trunc(requested) : cap
  return Math.min(Math.max(n, 1), cap)
}

/** Chat pipelines always run in parallel orchestration mode. */
export const CHAT_PIPELINE_EXECUTION_MODE = "parallel" as const

/** Human-in-the-loop is on by default for chat-launched pipelines. */
export const CHAT_PIPELINE_HUMAN_IN_LOOP = true
