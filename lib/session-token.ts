"use client"

import { getClientApiBaseUrl } from "@/lib/routes"
import { isLegacyTokenStorage } from "@/lib/auth-config"
import {
  bootstrapSessionFromBff,
  clearGuestToken,
  clearSessionTokens,
  getAccessToken,
  getGuestToken,
  getRefreshToken,
  isGuestTokenExpired,
  setGuestToken,
  setSessionTokens,
  type SessionTokens,
} from "@/lib/session-token-store"

export type { SessionTokens } from "@/lib/session-token-store"
export {
  bootstrapSessionFromBff,
  clearSessionTokens,
  getAccessExpiresAt,
  getAccessToken,
  clearGuestToken,
  getGuestToken,
  getRawAccessToken,
  getRefreshToken,
  hasAuthCredentials,
  hasLocalAppSession,
  isAccessTokenExpired,
  isGuestTokenExpired,
  setGuestToken,
  setSessionTokens,
} from "@/lib/session-token-store"

/** @deprecated Use setSessionTokens */
export function setAccessToken(token: string): void {
  setSessionTokens({ access_token: token })
}

/** @deprecated Use clearSessionTokens */
export function clearAccessToken(): void {
  clearSessionTokens()
}

type AuthTokenPayload = {
  access_token: string
  refresh_token?: string
  expires_in?: number
}

async function postAuthJson<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${getClientApiBaseUrl()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const data = (await res.json().catch(() => ({}))) as T & { detail?: string }
  if (!res.ok) {
    const detail =
      typeof (data as { detail?: unknown }).detail === "string"
        ? (data as { detail: string }).detail
        : `Request failed (${res.status})`
    throw new Error(detail)
  }
  return data
}

let refreshInFlight: Promise<string | null> | null = null

async function refreshViaBff(): Promise<string | null> {
  const res = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
  })
  const data = (await res.json().catch(() => ({}))) as AuthTokenPayload & { detail?: string }
  if (!res.ok) {
    throw new Error(typeof data.detail === "string" ? data.detail : "Refresh failed")
  }
  setSessionTokens({
    access_token: data.access_token,
    expires_in: data.expires_in,
  })
  return data.access_token
}

export async function refreshAccessToken(): Promise<string | null> {
  if (!isLegacyTokenStorage()) {
    return refreshViaBff()
  }
  const refresh = getRefreshToken()
  if (!refresh) return null
  const res = await postAuthJson<AuthTokenPayload>("/v1/auth/refresh", {
    refresh_token: refresh,
  })
  setSessionTokens({
    access_token: res.access_token,
    refresh_token: res.refresh_token,
    expires_in: res.expires_in,
  })
  return res.access_token
}

/** Return a valid access JWT, refreshing when within skew of expiry. */
export async function ensureValidAccessToken(): Promise<string | null> {
  let current = getAccessToken()
  if (current) return current

  if (!isLegacyTokenStorage()) {
    current = await bootstrapSessionFromBff()
    if (current) return current
    const { hasLocalAppSession } = await import("@/lib/session-token-store")
    if (!hasLocalAppSession()) return null
  } else {
    const refresh = getRefreshToken()
    if (!refresh) return null
  }

  if (!refreshInFlight) {
    refreshInFlight = refreshAccessToken()
      .catch(() => {
        clearSessionTokens()
        void import("@/lib/session-token-store").then(({ hasLocalAppSession }) => {
          if (hasLocalAppSession()) {
            void import("@/lib/app-auth").then(({ signOut }) =>
              signOut({ redirectTo: "/sign-in" })
            )
          }
        })
        return null
      })
      .finally(() => {
        refreshInFlight = null
      })
  }
  return refreshInFlight
}

export async function ensureGuestToken(): Promise<string> {
  const existing = getGuestToken()
  if (existing && !isGuestTokenExpired(existing)) return existing
  if (existing) clearGuestToken()
  const res = await fetch(`${getClientApiBaseUrl()}/v1/auth/guest`)
  if (!res.ok) {
    throw new Error(`Guest token request failed (${res.status})`)
  }
  const data = (await res.json()) as { access_token: string }
  const token = data.access_token
  setGuestToken(token)
  return token
}
