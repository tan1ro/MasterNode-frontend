"use client"

import { updateLocalUserFromProfile } from "@/lib/app-auth"
import { logClientError } from "@/lib/log-error"
import { hydrateUserExperienceFromProfile } from "@/lib/user-experience-state"
import { getAccessToken } from "@/lib/session-token"
import { authService, type AuthProfileResponse } from "@/services/auth"

/**
 * Fetch /v1/auth/me and align local session with backend tenant profile.
 * Safe to call after sign-in or on app load when signed in.
 */
export async function syncAuthProfileFromApi(): Promise<AuthProfileResponse | null> {
  try {
    const profile = await authService.me()
    updateLocalUserFromProfile({
      account_type: profile.account_type,
      plan: profile.plan,
      is_superuser: profile.is_superuser,
      org_name: profile.org_name,
      org_logo_data_url: profile.org_logo_data_url,
      username: profile.username,
      email: profile.email,
    })
    // Seed device display name from account username when unset.
    try {
      const { loadSettingsPreferences, saveSettingsPreferences } = await import(
        "@/lib/settings-preferences"
      )
      const prefs = loadSettingsPreferences()
      const serverName = (profile.username || "").trim()
      const emailLocal = (profile.email || "").split("@")[0]?.trim() || ""
      const current = prefs.displayName.trim()
      if (serverName && (!current || current === emailLocal)) {
        saveSettingsPreferences({ ...prefs, displayName: serverName })
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("masternode-settings-changed"))
        }
      }
    } catch {
      // non-fatal
    }
    hydrateUserExperienceFromProfile(profile.tenant_id, profile)
    try {
      const access = getAccessToken()
      const headers: HeadersInit = {}
      if (access) headers.Authorization = `Bearer ${access}`
      const res = await fetch("/api/auth/sync-session", {
        method: "POST",
        credentials: "include",
        headers,
      })
      if (!res.ok && res.status !== 401) {
        logClientError("sync-auth-profile.sync-session", new Error(`sync-session ${res.status}`))
      }
    } catch (syncErr) {
      logClientError("sync-auth-profile.sync-session", syncErr)
    }
    if (profile.tenant_id?.startsWith("usr_")) {
      const { hasLocalAppSession } = await import("@/lib/session-token-store")
      const { getStoredApiKey, setStoredApiKey } = await import("@/lib/storage")
      if (hasLocalAppSession() && !getStoredApiKey()) {
        try {
          const { apiKeysService } = await import("@/services/api-keys")
          const keyRes = await apiKeysService.ensureDefault()
          if (keyRes?.api_key) {
            setStoredApiKey(keyRes.api_key)
          }
        } catch {
          // Wallet fetch also provisions; non-fatal
        }
      }
    }
    return profile
  } catch (err) {
    logClientError("sync-auth-profile", err)
    return null
  }
}
