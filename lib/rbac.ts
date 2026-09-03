/**
 * Centralized role-based access rules. Pure helpers so they can be reused by the
 * Next.js middleware (edge runtime), client navigation, and tests.
 *
 * Roles map to the `mn_auth_role` cookie set by `lib/app-auth.ts`.
 */

import { normalizeAccountType, type AppAccountType } from "@/lib/account-types"

export type AppRole = AppAccountType

/** Routes that require authentication. Mirror this list in `middleware.ts`. */
export const PROTECTED_PREFIXES: readonly string[] = [
  "/chat",
  "/dashboard",
  "/product",
  "/assistants",
  "/memory",
  "/integrations",
  "/api-keys",
  "/billing",
  "/logs",
  "/settings",
  "/tasks",
  "/team",
  "/analytics",
  "/llm-strategy",
  "/superuser",
]

/** Guest hits on these paths are sent to sign-up (not sign-in) first. */
export const SIGNUP_FIRST_PREFIXES: readonly string[] = ["/integrations"]

/** Per-role allow-lists. */
export const CREATOR_ALLOWED: readonly string[] = [
  "/chat",
  "/tasks",
  "/billing",
  "/assistants",
  "/memory",
  "/integrations",
  "/logs",
  "/settings",
]

export const BUSINESS_ALLOWED: readonly string[] = [
  ...CREATOR_ALLOWED,
  "/dashboard",
  "/product",
  "/team",
  "/api-keys",
  "/tasks",
  "/llm-strategy",
  "/analytics",
]

export const ROLE_HOME: Record<AppRole, string> = {
  creator: "/chat",
  business: "/dashboard",
}

/** Sign-in / sign-up / onboarding — guests or post-auth setup. */
export const AUTH_ENTRY_PREFIXES: readonly string[] = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/onboarding",
  "/auth/oauth",
]

export function pathStartsWithAny(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export function isProtectedPath(pathname: string): boolean {
  return pathStartsWithAny(pathname, PROTECTED_PREFIXES)
}

export function prefersSignUpEntry(pathname: string): boolean {
  return pathStartsWithAny(pathname, SIGNUP_FIRST_PREFIXES)
}

export function isAuthEntryPath(pathname: string): boolean {
  return pathStartsWithAny(pathname, AUTH_ENTRY_PREFIXES)
}

/** Returns whether a given role can access a path. */
export function roleAllowsPath(role: AppRole | string, pathname: string): boolean {
  const normalized = normalizeAccountType(String(role), "creator")
  const allowed = normalized === "business" ? BUSINESS_ALLOWED : CREATOR_ALLOWED
  return pathStartsWithAny(pathname, allowed)
}

/** Resolve a string to a known role, or null. */
export function parseRole(raw: string | null | undefined): AppRole | null {
  if (raw == null || String(raw).trim() === "") return null
  const value = String(raw).trim().toLowerCase()
  if (value === "developer" || value === "development" || value === "business") return "business"
  if (value === "creator" || value === "normal") return "creator"
  return null
}
