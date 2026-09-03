import { normalizeAccountType, type AppAccountType } from "@/lib/account-types"
import {
  getCurrentUser,
  getRoleFromCookie,
  hasSuperuserCookie,
  isSuperUser as isSuperUserEmail,
  resolveIsSuperUser,
} from "@/lib/app-auth"
import type { AppUser } from "@/lib/app-auth"

/**
 * Business accounts and superusers use the chat-first workspace hub.
 * Uses only React auth state (no document.cookie) so SSR and hydration stay in sync.
 */
export function usesWorkspaceHub(
  accountType: AppAccountType | string | null | undefined,
  isSuperUser = false
): boolean {
  if (isSuperUser) return true
  if (accountType == null || String(accountType).trim() === "") return false
  return normalizeAccountType(accountType) === "business"
}

/** True when an API profile grants hub access (handles `developer` alias). */
export function isHubProfile(
  profile: { account_type?: string; is_superuser?: boolean } | null | undefined
): boolean {
  if (!profile) return false
  if (profile.is_superuser) return true
  return normalizeAccountType(profile.account_type) === "business"
}

/** Resolve hub access from the signed-in user record. */
export function usesWorkspaceHubForUser(user: AppUser | null | undefined): boolean {
  if (!user) return false
  return usesWorkspaceHub(user.accountType, isSuperUserEmail(user))
}

/** After profile sync, check API profile and refreshed local user. */
export function resolveWorkspaceHubAccess(
  profile: { account_type?: string; is_superuser?: boolean } | null | undefined
): boolean {
  if (isHubProfile(profile)) return true
  const user = getCurrentUser()
  return usesWorkspaceHubForUser(user)
}

export type HubDashboardAccessInput = {
  user?: AppUser | null
  profile?: { account_type?: string; is_superuser?: boolean } | null
  accountType?: string | null
  isSuperUser?: boolean
}

/** Whether `/dashboard` should render (aligned with middleware + hub roles). */
export function canAccessHubDashboard(input: HubDashboardAccessInput): boolean {
  const user = input.user ?? getCurrentUser()
  const isSuper =
    Boolean(input.isSuperUser) ||
    resolveIsSuperUser({ user, profile: input.profile }) ||
    hasSuperuserCookie()

  if (isSuper) return true
  if (getRoleFromCookie() === "business") return true
  if (usesWorkspaceHub(input.accountType, isSuper)) return true
  if (isHubProfile(input.profile)) return true
  if (usesWorkspaceHubForUser(user)) return true

  const roleCookie = getRoleFromCookie()
  if (roleCookie === "creator") return false

  const profileType = input.profile?.account_type
    ? normalizeAccountType(input.profile.account_type)
    : null
  const localType = input.accountType ? normalizeAccountType(input.accountType) : null
  if (profileType === "creator" && localType === "creator") return false

  // Signed-in with no explicit creator role (middleware may allow fallthrough).
  return Boolean(user)
}
