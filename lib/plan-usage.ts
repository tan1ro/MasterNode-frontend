import type { AppPlan } from "@/lib/app-auth"
import type { PromptQuotaSnapshot } from "@/types/api"

/** Token budget per rolling window (mirrors backend plan_prompt_quota.py). */
export const PLAN_TOKEN_LIMITS: Record<AppPlan, number | null> = {
  free: 40_000,
  pro: 400_000,
  pro_plus: 1_500_000,
  premium: 6_000_000,
  enterprise: null,
}

export interface PlanUsageSnapshot {
  used: number
  limit: number | null
  percent: number | null
  isUnlimited: boolean
  windowHours?: number
  resetsAt?: string | null
}

export function getPlanTokenLimit(plan: AppPlan | null | undefined): number | null {
  const key = (plan ?? "free") as AppPlan
  return PLAN_TOKEN_LIMITS[key] ?? PLAN_TOKEN_LIMITS.free
}

export function computeCreditQuotaUsage(
  usedTokens: number,
  plan: AppPlan | null | undefined
): PlanUsageSnapshot {
  const limit = getPlanTokenLimit(plan)
  if (limit == null) {
    return { used: usedTokens, limit: null, percent: null, isUnlimited: true, windowHours: 5 }
  }
  const percent = limit > 0 ? Math.min(100, Math.round((usedTokens / limit) * 100)) : 0
  return { used: usedTokens, limit, percent, isUnlimited: false, windowHours: 5 }
}

export function promptQuotaFromApi(q: PromptQuotaSnapshot | null | undefined): PlanUsageSnapshot | null {
  if (!q) return null
  const used = q.used_tokens ?? q.used ?? 0
  const limit = q.limit_tokens ?? q.limit ?? null
  return {
    used,
    limit,
    percent: q.percent,
    isUnlimited: q.is_unlimited,
    windowHours: q.window_hours ?? 5,
    resetsAt: q.resets_at ?? null,
  }
}

export function usageBarColor(percent: number): string {
  if (percent >= 90) return "bg-rose-500"
  if (percent >= 70) return "bg-amber"
  return "bg-cyan-500"
}

export function formatQuotaResetLabel(resetsAt: string | null | undefined): string | null {
  if (!resetsAt) return null
  const reset = new Date(resetsAt)
  if (Number.isNaN(reset.getTime())) return null
  const diffMs = reset.getTime() - Date.now()
  if (diffMs <= 0) return "Resets soon"
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 0) return `Resets in ${hours}h ${minutes}m`
  return `Resets in ${minutes}m`
}

/** @deprecated Use computeCreditQuotaUsage */
export const computePromptQuotaUsage = computeCreditQuotaUsage
