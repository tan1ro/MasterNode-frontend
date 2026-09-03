"use client"

import { isLegacyTokenStorage } from "@/lib/auth-config"
import { getStoredApiKey } from "@/lib/storage"

const ACCESS_KEY = "mn_access_token"
const REFRESH_KEY = "mn_refresh_token"
const EXPIRES_AT_KEY = "mn_access_expires_at"
const GUEST_KEY = "mn_guest_token"
export const APP_SESSION_KEY = "mn_auth_session_user_id"

/** Refresh access token this many ms before expiry. */
export const REFRESH_SKEW_MS = 60_000

export interface SessionTokens {
  access_token: string
  refresh_token?: string
  expires_in?: number
}

let memoryAccessToken: string | null = null
let memoryExpiresAt: number | null = null
let memoryGuestToken: string | null = null

function decodeJwtExpMs(token: string): number | null {
  try {
    const part = token.split(".")[1]
    if (!part) return null
    const padded = part.replace(/-/g, "+").replace(/_/g, "/")
    const json = JSON.parse(atob(padded)) as { exp?: number }
    return typeof json.exp === "number" ? json.exp * 1000 : null
  } catch {
    return null
  }
}

function setMemoryAccess(token: string, expiresIn?: number): void {
  memoryAccessToken = token.trim()
  const expMs =
    expiresIn != null
      ? Date.now() + expiresIn * 1000
      : decodeJwtExpMs(memoryAccessToken)
  memoryExpiresAt = expMs
}

export function getAccessExpiresAt(): number | null {
  if (memoryExpiresAt != null) return memoryExpiresAt
  if (typeof window === "undefined" || !isLegacyTokenStorage()) return null
  const raw = localStorage.getItem(EXPIRES_AT_KEY)
  if (!raw) return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

export function isAccessTokenExpired(token?: string | null): boolean {
  const raw = token ?? getRawAccessToken()
  const storedExp = getAccessExpiresAt()
  const jwtExp = raw ? decodeJwtExpMs(raw) : null
  const exp = storedExp ?? jwtExp
  if (!exp) return false
  return Date.now() >= exp - REFRESH_SKEW_MS
}

/** Access JWT from storage (ignores expiry metadata — use getAccessToken for API calls). */
export function getRawAccessToken(): string | null {
  if (memoryAccessToken) return memoryAccessToken
  if (typeof window === "undefined" || !isLegacyTokenStorage()) return null
  const token = localStorage.getItem(ACCESS_KEY)
  return token?.trim() || null
}

export function hasAuthCredentials(): boolean {
  if (typeof window === "undefined") return false
  if (getStoredApiKey()?.trim()) return true
  if (getAccessToken()) return true
  if (isLegacyTokenStorage() && localStorage.getItem(REFRESH_KEY)?.trim()) return true
  if (!isLegacyTokenStorage() && hasLocalAppSession()) return true
  return false
}

export function hasLocalAppSession(): boolean {
  if (typeof window === "undefined") return false
  return Boolean(localStorage.getItem(APP_SESSION_KEY)?.trim())
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  const token = getRawAccessToken()
  if (!token) return null
  if (isAccessTokenExpired()) return null
  return token
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined" || !isLegacyTokenStorage()) return null
  return localStorage.getItem(REFRESH_KEY)
}

export function setSessionTokens(tokens: SessionTokens): void {
  if (typeof window === "undefined") return
  const access = tokens.access_token.trim()
  setMemoryAccess(access, tokens.expires_in)
  if (isLegacyTokenStorage()) {
    localStorage.setItem(ACCESS_KEY, access)
    if (tokens.refresh_token) {
      localStorage.setItem(REFRESH_KEY, tokens.refresh_token.trim())
    }
    const expMs =
      tokens.expires_in != null
        ? Date.now() + tokens.expires_in * 1000
        : decodeJwtExpMs(access)
    if (expMs != null) {
      localStorage.setItem(EXPIRES_AT_KEY, String(expMs))
    }
  }
}

export function clearSessionTokens(): void {
  memoryAccessToken = null
  memoryExpiresAt = null
  if (typeof window === "undefined") return
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(EXPIRES_AT_KEY)
}

export function getGuestToken(): string | null {
  if (typeof window === "undefined") return null
  // Guest chat is ephemeral — never restore tokens from prior page loads.
  localStorage.removeItem(GUEST_KEY)
  return memoryGuestToken
}

export function clearGuestToken(): void {
  memoryGuestToken = null
  if (typeof window === "undefined") return
  localStorage.removeItem(GUEST_KEY)
}

export function isGuestTokenExpired(token?: string | null): boolean {
  const raw = token ?? getGuestToken()
  if (!raw) return true
  const exp = decodeJwtExpMs(raw)
  if (!exp) return false
  return Date.now() >= exp - REFRESH_SKEW_MS
}

export function setGuestToken(token: string): void {
  memoryGuestToken = token.trim()
}

/** Bootstrap in-memory access from BFF session endpoint (production). */
export async function bootstrapSessionFromBff(): Promise<string | null> {
  if (typeof window === "undefined" || isLegacyTokenStorage()) return getAccessToken()
  try {
    const res = await fetch("/api/auth/session", { credentials: "include" })
    if (!res.ok) return null
    const data = (await res.json()) as { access_token?: string | null }
    if (data.access_token?.trim()) {
      setMemoryAccess(data.access_token.trim())
      return data.access_token.trim()
    }
  } catch {
    // Non-fatal
  }
  return getAccessToken()
}
