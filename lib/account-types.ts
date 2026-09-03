/**
 * Canonical workspace account types. Use normalizeAccountType() when reading cookies,
 * API payloads, or legacy stored values (`developer` / `development` → `business`).
 */
export type AppAccountType = "creator" | "business"

export const ACCOUNT_TYPES: readonly AppAccountType[] = ["creator", "business"] as const

export const ACCOUNT_TYPE_LABELS: Record<AppAccountType, string> = {
  creator: "Creator",
  business: "Business",
}

export const ACCOUNT_TYPE_DESCRIPTIONS: Record<AppAccountType, string> = {
  creator:
    "For content, creative workflows, and lighter-weight business tasks.",
  business:
    "End-to-end product work: engineering, product management, marketing, analytics, and team operations.",
}

export function normalizeAccountType(
  raw: string | null | undefined,
  fallback: AppAccountType = "creator"
): AppAccountType {
  const value = (raw || "").trim().toLowerCase()
  if (value === "developer" || value === "development" || value === "business") return "business"
  if (value === "creator" || value === "normal") return "creator"
  return fallback
}

export function isBusinessAccountType(
  accountType: string | null | undefined
): boolean {
  return normalizeAccountType(accountType) === "business"
}
