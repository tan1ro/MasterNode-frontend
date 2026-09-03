"use client"

import { authService } from "@/services/auth"
import { isLegacyTokenStorage } from "@/lib/auth-config"
import { resetChatGreetingSession } from "@/lib/chat-first-greeting"
import { clearGuestChatSession } from "@/lib/guest-chat-session"
import { revokeServerSession } from "@/lib/revoke-server-session"
import {
  clearSessionTokens,
  getRefreshToken,
  setSessionTokens,
} from "@/lib/session-token"
import { ROUTES } from "@/lib/routes"
import { apiErrorFromResponse } from "@/lib/resolve-api-error"

import {
  normalizeAccountType as normalizeAppAccountType,
  type AppAccountType,
} from "@/lib/account-types"

export type { AppAccountType } from "@/lib/account-types"
export type AppPlan = "free" | "pro" | "pro_plus" | "premium" | "enterprise"

export interface AppOrganization {
  name: string
  logoDataUrl?: string
}

export interface AppUser {
  id: string
  email: string
  password: string
  username: string
  accountType: AppAccountType
  plan: AppPlan
  organization: AppOrganization
  createdAt: string
}

/** @deprecated Multi-user dump — migrated once then removed. */
const LEGACY_USERS_KEY = "mn_auth_users"
/** Single active profile only (no account directory in the browser). */
const PROFILE_KEY = "mn_auth_profile"
const SESSION_KEY = "mn_auth_session_user_id"
const ROLE_COOKIE_KEY = "mn_auth_role"
const PLAN_COOKIE_KEY = "mn_auth_plan"
const AUTH_EVENT = "mn_auth_changed"
const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

const VALID_ACCOUNT_TYPES: readonly AppAccountType[] = ["creator", "business"]
const VALID_PLANS: readonly AppPlan[] = ["free", "pro", "pro_plus", "premium", "enterprise"]
import {
  SUPERUSER_EMAIL,
  SUPERUSER_DEFAULT_PASSWORD,
  SUPERUSER_COOKIE_KEY,
  SUPERUSER_TENANT_ID,
} from "@/lib/auth-constants"
import { removeStoredApiKey } from "@/lib/storage"
import { trackProductEvent } from "@/lib/analytics/track-event"

export { SUPERUSER_EMAIL, SUPERUSER_DEFAULT_PASSWORD }

function isBrowser() {
  return typeof window !== "undefined"
}

/** Sanitize before any durable write — never keep passwords or logo blobs. */
function sanitizeStoredUser(user: AppUser): AppUser {
  return {
    id: user.id,
    email: user.email.trim().toLowerCase(),
    password: "",
    username: user.username.trim() || user.email.split("@")[0] || "user",
    accountType: user.accountType,
    plan: user.plan,
    organization: {
      name: (user.organization?.name || "My workspace").trim() || "My workspace",
    },
    createdAt: user.createdAt || new Date().toISOString(),
  }
}

function createDefaultSuperUser(): AppUser {
  return sanitizeStoredUser({
    id: "usr_superuser",
    email: SUPERUSER_EMAIL,
    // Password is never persisted; login always goes through the API.
    password: "",
    username: "superuser",
    accountType: "business",
    plan: "enterprise",
    organization: {
      name: "MasterNode Admin",
    },
    createdAt: new Date().toISOString(),
  })
}

/**
 * Single active-user profile cache (not a multi-account directory).
 * Migrates legacy `mn_auth_users` arrays once, then deletes them.
 */
function readStoredProfile(): AppUser | null {
  if (!isBrowser()) return null
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppUser
      if (parsed && typeof parsed === "object" && parsed.id) {
        return sanitizeStoredUser(parsed)
      }
    }
  } catch {
    // fall through to legacy migration
  }

  // One-time migration from the old multi-user dump.
  try {
    const legacy = localStorage.getItem(LEGACY_USERS_KEY)
    if (!legacy) {
      if (isLegacyTokenStorage()) {
        const seeded = createDefaultSuperUser()
        writeStoredProfile(seeded)
        return seeded
      }
      return null
    }
    const parsed = JSON.parse(legacy)
    const users = Array.isArray(parsed) ? (parsed as AppUser[]) : []
    const sessionId = localStorage.getItem(SESSION_KEY)?.trim() || ""
    const match =
      (sessionId && users.find((u) => u?.id === sessionId)) ||
      users.find((u) => String(u?.email || "").toLowerCase() === SUPERUSER_EMAIL) ||
      users[0]
    localStorage.removeItem(LEGACY_USERS_KEY)
    if (!match?.id) {
      if (isLegacyTokenStorage()) {
        const seeded = createDefaultSuperUser()
        writeStoredProfile(seeded)
        return seeded
      }
      return null
    }
    const cleaned = sanitizeStoredUser(match)
    writeStoredProfile(cleaned)
    return cleaned
  } catch {
    localStorage.removeItem(LEGACY_USERS_KEY)
    return null
  }
}

function writeStoredProfile(user: AppUser): void {
  if (!isBrowser()) return
  localStorage.setItem(PROFILE_KEY, JSON.stringify(sanitizeStoredUser(user)))
  localStorage.removeItem(LEGACY_USERS_KEY)
}

function emitAuthChanged(): void {
  if (!isBrowser()) return
  window.dispatchEvent(new Event(AUTH_EVENT))
}

function readCookie(name: string): string | null {
  if (!isBrowser()) return null
  const cookieKey = `${name}=`
  const pieces = document.cookie.split(";")
  for (const part of pieces) {
    const c = part.trim()
    if (c.startsWith(cookieKey)) {
      const val = decodeURIComponent(c.slice(cookieKey.length)).trim()
      return val || null
    }
  }
  return null
}

function getSessionFromCookie(): string | null {
  return readCookie(SESSION_KEY)
}

function writeCookie(name: string, value: string): void {
  if (!isBrowser()) return
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${SESSION_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`
}

function deleteCookie(name: string): void {
  if (!isBrowser()) return
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`
}

function persistSession(user: AppUser): void {
  if (!isBrowser()) return
  const safeId = user.id.trim()
  localStorage.setItem(SESSION_KEY, safeId)
  localStorage.setItem("user_id", safeId)
  writeCookie(ROLE_COOKIE_KEY, user.accountType)
  writeCookie(PLAN_COOKIE_KEY, user.plan)
  if (isSuperUser(user)) {
    writeCookie(SUPERUSER_COOKIE_KEY, "1")
  } else {
    deleteCookie(SUPERUSER_COOKIE_KEY)
  }
  if (isLegacyTokenStorage()) {
    writeCookie(SESSION_KEY, safeId)
  }
}

function clearSession(): void {
  if (!isBrowser()) return
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(PROFILE_KEY)
  localStorage.removeItem("user_id")
  localStorage.removeItem(LEGACY_USERS_KEY)
  removeStoredApiKey()
  clearSessionTokens()
  clearGuestChatSession()
  resetChatGreetingSession()
  deleteCookie(SESSION_KEY)
  deleteCookie(ROLE_COOKIE_KEY)
  deleteCookie(PLAN_COOKIE_KEY)
  deleteCookie(SUPERUSER_COOKIE_KEY)
}

export function getRoleFromCookie(): AppAccountType | null {
  const raw = readCookie(ROLE_COOKIE_KEY)
  if (!raw) return null
  const normalized = normalizeAppAccountType(raw)
  return VALID_ACCOUNT_TYPES.includes(normalized) ? normalized : null
}

/** Matches middleware `isSuperuserRequest` (legacy dev cookie). */
export function hasSuperuserCookie(): boolean {
  return readCookie(SUPERUSER_COOKIE_KEY) === "1"
}

export function getPlanFromCookie(): AppPlan | null {
  const raw = (readCookie(PLAN_COOKIE_KEY) || "").toLowerCase()
  return VALID_PLANS.includes(raw as AppPlan) ? (raw as AppPlan) : null
}

export function subscribeAuth(listener: () => void): () => void {
  if (!isBrowser()) return () => undefined
  const handler = () => listener()
  window.addEventListener(AUTH_EVENT, handler)
  window.addEventListener("storage", handler)
  return () => {
    window.removeEventListener(AUTH_EVENT, handler)
    window.removeEventListener("storage", handler)
  }
}

export function getCurrentUser(): AppUser | null {
  if (!isBrowser()) return null
  const sessionId = localStorage.getItem(SESSION_KEY) || getSessionFromCookie()
  if (!sessionId) return null
  if (!localStorage.getItem(SESSION_KEY)) {
    localStorage.setItem(SESSION_KEY, sessionId)
  }
  const user = readStoredProfile()
  if (!user || user.id !== sessionId) {
    // Profile missing or mismatched — do not keep a zombie session id.
    clearSession()
    void revokeServerSession()
    return null
  }
  if (!getRoleFromCookie()) writeCookie(ROLE_COOKIE_KEY, user.accountType)
  if (!getPlanFromCookie()) writeCookie(PLAN_COOKIE_KEY, user.plan)
  const superCookie = readCookie(SUPERUSER_COOKIE_KEY)
  if (isSuperUser(user) && superCookie !== "1") writeCookie(SUPERUSER_COOKIE_KEY, "1")
  if (!isSuperUser(user) && superCookie) deleteCookie(SUPERUSER_COOKIE_KEY)
  return user
}

export function isSignedIn(): boolean {
  return Boolean(getCurrentUser())
}

/** Re-write role/session cookies from localStorage after a stale-session cleanup race. */
export function refreshAuthCookies(): void {
  const user = getCurrentUser()
  if (!user) return
  persistSession(user)
}

export function resolveIsSuperUser(options: {
  user?: AppUser | null
  profile?: { is_superuser?: boolean; tenant_id?: string } | null
}): boolean {
  if (options.profile?.is_superuser === true) return true
  const user = options.user
  if (!user) return false
  const email = String(user.email || "").trim().toLowerCase()
  if (email === SUPERUSER_EMAIL) return true
  if (String(user.id || "").trim() === SUPERUSER_TENANT_ID) return true
  return false
}

export function isSuperUser(user: AppUser | null | undefined): boolean {
  return resolveIsSuperUser({ user })
}

export interface SignUpInput {
  email: string
  password: string
  username: string
  accountType: AppAccountType
  plan: AppPlan
  organizationName: string
  organizationLogoDataUrl?: string
}

function ensureSuperUserActor(): AppUser {
  const actor = getCurrentUser()
  if (!actor || !isSuperUser(actor)) {
    throw new Error("Superuser privileges required.")
  }
  return actor
}

async function registerViaBff(input: SignUpInput): Promise<{
  tenant_id: string
  email?: string
  access_token: string
  expires_in?: number
}> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      username: input.username,
      account_type: input.accountType,
      plan: input.plan,
    }),
  })
  const data = (await res.json()) as {
    tenant_id?: string
    email?: string
    access_token?: string
    expires_in?: number
    detail?: string
  }
  if (!res.ok) {
    const detail = typeof data.detail === "string" ? data.detail : "Registration failed"
    throw apiErrorFromResponse(res.status, data.detail, detail)
  }
  return data as {
    tenant_id: string
    email?: string
    access_token: string
    expires_in?: number
  }
}

export async function signUp(input: SignUpInput): Promise<AppUser> {
  const email = input.email.trim().toLowerCase()
  if (email === SUPERUSER_EMAIL) {
    throw new Error("This email is reserved for the built-in superuser account.")
  }

  let serverExists = false
  try {
    const availability = await authService.checkEmail(email)
    serverExists = availability.exists
  } catch {
    throw new Error("Could not verify this email. Check your connection and try again.")
  }
  if (serverExists) {
    throw new Error("An account with this email already exists.")
  }

  const tokens = isLegacyTokenStorage()
    ? await authService.register({
        email: input.email,
        password: input.password,
        username: input.username,
        account_type: input.accountType,
        plan: input.plan,
      })
    : await registerViaBff(input)
  clearGuestChatSession()
  resetChatGreetingSession()
  setSessionTokens({
    access_token: tokens.access_token,
    refresh_token:
      "refresh_token" in tokens && typeof tokens.refresh_token === "string"
        ? tokens.refresh_token
        : undefined,
    expires_in: tokens.expires_in ?? 3600,
  })
  const next = sanitizeStoredUser({
    id: tokens.tenant_id,
    email,
    password: "",
    username: input.username.trim(),
    accountType: input.accountType,
    plan: input.plan,
    organization: {
      name: input.organizationName.trim(),
    },
    createdAt: new Date().toISOString(),
  })
  // Drop any prior browser profile for a different email before writing.
  const prior = readStoredProfile()
  if (prior && prior.email !== email) {
    localStorage.removeItem(PROFILE_KEY)
  }
  writeStoredProfile(next)
  persistSession(next)
  emitAuthChanged()
  void trackProductEvent("signup", {
    account_type: next.accountType,
    plan: next.plan,
  })
  return next
}

async function loginViaBff(
  email: string,
  password: string
): Promise<{ tenant_id: string; email?: string; access_token: string; expires_in?: number }> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  })
  const data = (await res.json()) as {
    tenant_id?: string
    email?: string
    access_token?: string
    expires_in?: number
    detail?: string
  }
  if (!res.ok) {
    const fallback = res.status >= 500 ? "Login failed" : "Invalid credentials"
    const detail = typeof data.detail === "string" ? data.detail : fallback
    throw apiErrorFromResponse(res.status, data.detail, detail)
  }
  return data as { tenant_id: string; email?: string; access_token: string; expires_in?: number }
}

export async function signIn(email: string, password: string): Promise<AppUser> {
  let tokens
  try {
    tokens = isLegacyTokenStorage()
      ? await authService.login(email, password)
      : await loginViaBff(email, password)
  } catch (err) {
    clearSessionTokens()
    throw err
  }
  clearGuestChatSession()
  resetChatGreetingSession()
  setSessionTokens({
    access_token: tokens.access_token,
    refresh_token:
      "refresh_token" in tokens && typeof tokens.refresh_token === "string"
        ? tokens.refresh_token
        : undefined,
    expires_in: tokens.expires_in ?? 3600,
  })
  const normalizedEmail = (tokens.email || email).trim().toLowerCase()
  const isBuiltInSuperuser =
    normalizedEmail === SUPERUSER_EMAIL || tokens.tenant_id === SUPERUSER_TENANT_ID
  const existing = readStoredProfile()
  const user = sanitizeStoredUser({
    id: tokens.tenant_id,
    email: normalizedEmail,
    password: "",
    username:
      existing && existing.email === normalizedEmail
        ? existing.username
        : (tokens.email || email).split("@")[0],
    accountType: isBuiltInSuperuser
      ? "business"
      : existing && existing.email === normalizedEmail
        ? existing.accountType
        : "creator",
    plan: isBuiltInSuperuser
      ? "enterprise"
      : existing && existing.email === normalizedEmail
        ? existing.plan
        : "free",
    organization:
      existing && existing.email === normalizedEmail
        ? existing.organization
        : { name: "My workspace" },
    createdAt: existing?.createdAt || new Date().toISOString(),
  })
  writeStoredProfile(user)
  persistSession(user)
  emitAuthChanged()
  void trackProductEvent("login", { account_type: user.accountType, plan: user.plan })
  if (!isLegacyTokenStorage()) {
    try {
      const profile = await authService.me()
      const synced = updateLocalUserFromProfile({
        account_type: profile.account_type,
        plan: profile.plan,
        org_name: profile.org_name,
        org_logo_data_url: profile.org_logo_data_url,
      })
      if (synced) return synced
    } catch {
      // Profile sync is best-effort; session cookies may follow via AuthProfileSync.
    }
  }
  return user
}

export async function completeOAuthSignIn(input: {
  tenantId: string
  email: string
  accessToken: string
  expiresIn?: number
}): Promise<AppUser> {
  clearGuestChatSession()
  resetChatGreetingSession()
  setSessionTokens({
    access_token: input.accessToken,
    expires_in: input.expiresIn ?? 3600,
  })

  const email = input.email.trim().toLowerCase()
  const isBuiltInSuperuser =
    email === SUPERUSER_EMAIL || input.tenantId === SUPERUSER_TENANT_ID
  const existing = readStoredProfile()
  const user = sanitizeStoredUser({
    id: input.tenantId,
    email: email || `user-${input.tenantId}@oauth.local`,
    password: "",
    username:
      existing && (existing.id === input.tenantId || existing.email === email)
        ? existing.username
        : (email || input.tenantId).split("@")[0] || "user",
    accountType: isBuiltInSuperuser
      ? "business"
      : existing && existing.id === input.tenantId
        ? existing.accountType
        : "creator",
    plan: isBuiltInSuperuser
      ? "enterprise"
      : existing && existing.id === input.tenantId
        ? existing.plan
        : "free",
    organization:
      existing && existing.id === input.tenantId
        ? existing.organization
        : { name: "My workspace" },
    createdAt: existing?.createdAt || new Date().toISOString(),
  })
  writeStoredProfile(user)
  persistSession(user)
  emitAuthChanged()
  void trackProductEvent("login", { method: "oauth", account_type: user.accountType, plan: user.plan })
  return user
}

export function plansForAccountType(accountType: AppAccountType): AppPlan[] {
  return accountType === "business"
    ? ["free", "pro", "pro_plus", "premium", "enterprise"]
    : ["free", "pro", "pro_plus", "premium"]
}

export { normalizeAppAccountType as normalizeAccountType }

const PLAN_RANK: Record<AppPlan, number> = {
  free: 0,
  pro: 1,
  pro_plus: 2,
  premium: 3,
  enterprise: 4,
}

export function planMeetsMinimum(plan: AppPlan | null | undefined, minPlan: AppPlan): boolean {
  if (!plan) return false
  return (PLAN_RANK[plan] ?? -1) >= (PLAN_RANK[minPlan] ?? 0)
}

export interface SignOutOptions {
  redirectTo?: string
}

export async function signOut(options?: SignOutOptions): Promise<void> {
  if (!isBrowser()) return
  try {
    if (isLegacyTokenStorage()) {
      const refresh = getRefreshToken()
      if (refresh) await authService.logout(refresh)
    } else {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
    }
  } catch {
    // Best-effort server revocation
  }
  void trackProductEvent("logout", {})
  clearSession()

  // Desktop: always return to native sign-in — never website /sign-in.
  const desktop = window.masternodeDesktop
  if (typeof desktop?.returnToWelcome === "function") {
    try {
      const result = await desktop.returnToWelcome({ screen: "signin" })
      emitAuthChanged()
      if (result?.ok) return
    } catch {
      // Fall through only if the shell failed to switch screens.
    }
  }

  emitAuthChanged()
  const target = options?.redirectTo?.trim()
  if (target && target.startsWith("/") && !target.startsWith("//")) {
    window.location.href = target
  }
}

export function listUsersForSuperUser(): AppUser[] {
  ensureSuperUserActor()
  // Browser no longer keeps a multi-user directory — use admin APIs for user lists.
  const current = getCurrentUser()
  return current ? [sanitizeStoredUser(current)] : []
}

export async function updateUserAccessBySuperUser(
  targetUserId: string,
  next: { accountType: AppAccountType; plan: AppPlan }
): Promise<AppUser | null> {
  ensureSuperUserActor()
  const id = (targetUserId || "").trim()
  if (!id) throw new Error("Target user id is required.")
  if (id === SUPERUSER_TENANT_ID) {
    throw new Error("Superuser account access cannot be modified.")
  }
  const nextType = next.accountType
  const nextPlan = next.plan
  if (!VALID_ACCOUNT_TYPES.includes(nextType)) {
    throw new Error("Invalid account type.")
  }
  if (!VALID_PLANS.includes(nextPlan)) {
    throw new Error("Invalid plan.")
  }
  await authService.adminUpdateUserAccess(id, nextType, nextPlan)
  const current = getCurrentUser()
  if (current?.id === id) {
    const updated = sanitizeStoredUser({ ...current, accountType: nextType, plan: nextPlan })
    writeStoredProfile(updated)
    persistSession(updated)
    emitAuthChanged()
    return updated
  }
  emitAuthChanged()
  return null
}

/** Sync local user + session cookies from backend profile (account_type, plan, organization, username). */
export function updateLocalUserFromProfile(profile: {
  account_type?: string
  plan?: string
  is_superuser?: boolean
  org_name?: string
  org_logo_data_url?: string
  username?: string | null
  email?: string | null
}): AppUser | null {
  if (!isBrowser()) return null
  const user = getCurrentUser()
  if (!user) return null
  const nextType = normalizeAppAccountType(
    profile.account_type ?? user.accountType,
    user.accountType
  )
  const rawPlan = String(profile.plan || user.plan).toLowerCase()
  const nextPlan: AppPlan = VALID_PLANS.includes(rawPlan as AppPlan) ? (rawPlan as AppPlan) : user.plan
  const nextOrgName = profile.org_name?.trim() || user.organization.name
  // Org logos stay on the server / profile API — never cache base64 in localStorage.
  const nextUsername = (profile.username ?? "").trim() || user.username
  const nextEmail = (profile.email ?? "").trim() || user.email
  const orgUnchanged = nextOrgName === user.organization.name
  const identityUnchanged = nextUsername === user.username && nextEmail === user.email
  const superFromProfile = profile.is_superuser === true
  if (
    nextType === user.accountType &&
    nextPlan === user.plan &&
    orgUnchanged &&
    identityUnchanged &&
    !superFromProfile
  ) {
    persistSession(user)
    return user
  }
  const updated = sanitizeStoredUser({
    ...user,
    username: nextUsername,
    email: nextEmail,
    accountType: nextType,
    plan: nextPlan,
    organization: { name: nextOrgName },
  })
  writeStoredProfile(updated)
  persistSession(updated)
  if (superFromProfile) {
    writeCookie(SUPERUSER_COOKIE_KEY, "1")
  }
  emitAuthChanged()
  return updated
}

export function updateLocalUserOrganization(org: { name: string; logoDataUrl?: string }): AppUser | null {
  if (!isBrowser()) return null
  const user = getCurrentUser()
  if (!user) return null
  const updated = sanitizeStoredUser({
    ...user,
    organization: {
      name: org.name.trim(),
    },
  })
  writeStoredProfile(updated)
  persistSession(updated)
  emitAuthChanged()
  return updated
}

export async function deleteUserBySuperUser(targetUserId: string): Promise<void> {
  const actor = ensureSuperUserActor()
  const id = (targetUserId || "").trim()
  if (!id) throw new Error("Target user id is required.")
  if (id === actor.id) {
    throw new Error("Superuser cannot delete the active superuser account.")
  }
  if (id === SUPERUSER_TENANT_ID) {
    throw new Error("Built-in superuser account cannot be deleted.")
  }
  await authService.adminDeleteUser(id)
  const current = getCurrentUser()
  if (current?.id === id) {
    clearSession()
  }
  emitAuthChanged()
}
