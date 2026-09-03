import type { ApiError } from "@/types/api"
import { FEATURE_REQUIREMENTS, type FeatureId } from "@/constants/entitlements"
import { parseCreditQuotaDetail } from "@/lib/chat-quota-error"

const POLICY_FEATURE_RE =
  /Feature '([^']+)' requires .+?\(current:\s*([^)]+)\)/i

function parsePolicyFeatureMessage(message: string): {
  featureId?: FeatureId
  currentPlan?: string
} {
  const match = message.match(POLICY_FEATURE_RE)
  if (!match) return {}
  const featureId = match[1] as FeatureId
  if (!(featureId in FEATURE_REQUIREMENTS)) return {}
  return { featureId, currentPlan: match[2]?.trim() }
}

function friendlyEntitlementMessage(featureId: FeatureId, currentPlan?: string): string {
  const req = FEATURE_REQUIREMENTS[featureId]
  const planHint = currentPlan ? ` (current: ${currentPlan})` : ""
  return `${req.label} requires ${req.minPlan} plan or higher${planHint}.`
}

export function apiErrorFromResponse(status: number, detail: unknown, fallback: string): ApiError {
  let message = fallback
  if (typeof detail === "string" && detail.trim()) {
    message = detail.trim()
  } else if (detail && typeof detail === "object") {
    const o = detail as Record<string, unknown>
    if (typeof o.message === "string" && o.message.trim()) {
      message = o.message.trim()
    }
  }

  if (status >= 500 && !message.toLowerCase().includes("internal")) {
    message = `Internal server error (${status}): ${message}`
  }

  const policy = parsePolicyFeatureMessage(message)
  if (policy.featureId) {
    message = friendlyEntitlementMessage(policy.featureId, policy.currentPlan)
  }

  const err = new Error(message) as ApiError
  err.httpStatus = status
  err.isServerError = status >= 500
  if (status === 401) err.isAuthError = true
  if (status === 402) err.isWalletError = true
  if (status === 403) err.isForbidden = true
  const quota = parseCreditQuotaDetail(detail)
  if (quota) {
    err.isQuotaExceeded = true
    err.quotaResetsAt = quota.resetsAt ?? null
    err.quotaCode = "credit_quota_exceeded"
  }
  if (policy.featureId) {
    err.isEntitlementError = true
    err.entitlementFeature = policy.featureId
  }
  return err
}
