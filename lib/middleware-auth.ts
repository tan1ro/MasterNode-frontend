import {
  parseRole,
  prefersSignUpEntry,
  roleAllowsPath,
  type AppRole,
} from "@/lib/rbac"

export type ProtectedAccessDecision = "allow" | "sign_in" | "sign_up" | "role_home"

export interface MiddlewareSession {
  userId: string
  role: AppRole
  isSuperuser?: boolean
}

/** JWT role can lag behind Settings; prefer business when the role cookie was updated. */
export function effectiveRole(
  sessionRole: AppRole | undefined,
  legacyRole: AppRole | null
): AppRole | null {
  if (sessionRole && legacyRole === "business" && sessionRole === "creator") {
    return "business"
  }
  if (sessionRole) return sessionRole
  return legacyRole
}

/** True when middleware should treat the request as signed in for protected routes. */
export function hasAuthenticatedSession(
  session: MiddlewareSession | null | undefined,
  legacySessionId: string | null | undefined,
  legacyRole: AppRole | null
): boolean {
  if (session?.userId && session?.role) return true
  const legacyId = legacySessionId?.trim()
  return Boolean(legacyId && legacyRole)
}

export function resolveProtectedAccess(input: {
  pathname: string
  session: MiddlewareSession | null
  legacySessionId: string | null | undefined
  legacyRole: AppRole | null
  isSuperuser: boolean
}): ProtectedAccessDecision {
  if (
    !hasAuthenticatedSession(input.session, input.legacySessionId, input.legacyRole)
  ) {
    return prefersSignUpEntry(input.pathname) ? "sign_up" : "sign_in"
  }

  if (input.isSuperuser) return "allow"

  const role = effectiveRole(input.session?.role, input.legacyRole)
  if (!role) return "sign_in"

  if (roleAllowsPath(role, input.pathname)) return "allow"
  return "role_home"
}

export function parseLegacyRole(raw: string | undefined): AppRole | null {
  return parseRole(raw)
}
