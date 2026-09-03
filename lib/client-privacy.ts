/**
 * Client storage hygiene: keep localStorage free of multi-user dumps and secrets.
 * Auth identity / OTP answers / product events live on the server.
 */

const LEGACY_USERS_KEY = "mn_auth_users"
const PROFILE_KEY = "mn_auth_profile"
const API_KEY_LOCAL = "api_key"
const SESSION_USER_KEY = "mn_auth_session_user_id"

/** Keys that should never hold durable secrets or multi-account PII. */
export const CLIENT_PRIVACY_KEYS = {
  profile: PROFILE_KEY,
  legacyUsers: LEGACY_USERS_KEY,
  sessionUserId: SESSION_USER_KEY,
  apiKeyLocal: API_KEY_LOCAL,
} as const

function canUseStorage(): boolean {
  try {
    return typeof window !== "undefined" && typeof localStorage?.getItem === "function"
  } catch {
    return false
  }
}

/**
 * One-shot migration: collapse historic `mn_auth_users` arrays, drop passwords /
 * logos, move API keys out of durable localStorage, and prune stale onboarding blobs.
 * Safe to call on every app boot.
 */
export function scrubClientPrivacyResidue(activeUserId?: string | null): void {
  if (!canUseStorage()) return

  try {
    const durableKey = localStorage.getItem(API_KEY_LOCAL)?.trim()
    if (durableKey) {
      try {
        sessionStorage.setItem(API_KEY_LOCAL, durableKey)
      } catch {
        // sessionStorage may be blocked; still remove the durable copy.
      }
      localStorage.removeItem(API_KEY_LOCAL)
    }
  } catch {
    // ignore
  }

  try {
    localStorage.removeItem(LEGACY_USERS_KEY)
  } catch {
    // ignore
  }

  try {
    const keepId = (activeUserId || localStorage.getItem(SESSION_USER_KEY) || "").trim()
    const toRemove: string[] = []
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i)
      if (!key) continue
      const isTenantScoped =
        key.startsWith("mn_onboarding_v1:") ||
        key.startsWith("mn_chat_intro_completed_v1:") ||
        key.startsWith("mn_pending_chat_intro_v1:")
      if (!isTenantScoped) continue
      if (keepId && key.endsWith(`:${keepId}`)) continue
      if (keepId) toRemove.push(key)
    }
    for (const key of toRemove) localStorage.removeItem(key)
  } catch {
    // ignore
  }

  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (!parsed || typeof parsed !== "object") return
    let changed = false
    if (parsed.password) {
      parsed.password = ""
      changed = true
    }
    const org = parsed.organization
    if (org && typeof org === "object" && "logoDataUrl" in (org as object)) {
      const nextOrg = { ...(org as Record<string, unknown>) }
      delete nextOrg.logoDataUrl
      parsed.organization = nextOrg
      changed = true
    }
    if (changed) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(parsed))
    }
  } catch {
    // ignore
  }
}
