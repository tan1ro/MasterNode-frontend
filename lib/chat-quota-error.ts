import type { ApiError } from "@/types/api"
import { isApiError } from "@/types/api"

export interface CreditQuotaExceededPayload {
  message?: string
  resetsAt?: string | null
  percent?: number | null
}

export function isCreditQuotaExceededError(error: unknown): error is ApiError & {
  isQuotaExceeded: true
} {
  return isApiError(error) && Boolean(error.isQuotaExceeded)
}

export function parseCreditQuotaDetail(detail: unknown): CreditQuotaExceededPayload | null {
  if (!detail || typeof detail !== "object") return null
  const o = detail as Record<string, unknown>
  if (o.code !== "credit_quota_exceeded") return null
  return {
    message: typeof o.message === "string" ? o.message : undefined,
    resetsAt: typeof o.resets_at === "string" ? o.resets_at : null,
    percent: typeof o.percent === "number" ? o.percent : null,
  }
}

/** Friendly clock time for reset, e.g. "9:30 PM". */
export function formatQuotaResetClock(resetsAt: string | null | undefined): string | null {
  if (!resetsAt) return null
  const reset = new Date(resetsAt)
  if (Number.isNaN(reset.getTime())) return null
  return reset.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
}

export function quotaExceededBodyText(
  payload: CreditQuotaExceededPayload,
  windowHours = 5
): string {
  const resetClock = formatQuotaResetClock(payload.resetsAt)
  if (resetClock) {
    return `You hit your ${windowHours}-hour credit limit. It resets at ${resetClock}, or you can upgrade for higher limits.`
  }
  return (
    payload.message ??
    `You've used all of your credits for this ${windowHours}-hour window. Upgrade for higher limits or wait for the limit to reset.`
  )
}

/** One-line composer notice, e.g. "You are out of free credits until 6:40 PM". */
export function quotaExceededComposerLine(
  payload: CreditQuotaExceededPayload,
  windowHours = 5
): string {
  const resetClock = formatQuotaResetClock(payload.resetsAt)
  if (resetClock) {
    return `You are out of free credits until ${resetClock}`
  }
  return `You are out of credits for this ${windowHours}-hour window`
}

export function isQuotaResetPending(resetsAt: string | null | undefined): boolean {
  if (!resetsAt) return true
  const t = new Date(resetsAt).getTime()
  if (Number.isNaN(t)) return true
  return t > Date.now()
}
