import type { SessionPayload } from "@/lib/server/auth-session"
import { SUPERUSER_EMAIL } from "@/lib/auth-constants"

export function buildSessionFromTokensAndProfile(
  tenantId: string,
  email: string | undefined,
  profile: { account_type?: string; plan?: string; is_superuser?: boolean; email?: string }
): SessionPayload {
  const roleRaw = String(profile.account_type || "creator").toLowerCase()
  const role = roleRaw === "developer" || roleRaw === "development" || roleRaw === "business" ? "business" : "creator"
  const resolvedEmail = String(email || profile.email || "")
    .trim()
    .toLowerCase()
  const isSuperuser =
    profile.is_superuser === true || resolvedEmail === SUPERUSER_EMAIL
  return {
    userId: tenantId,
    role,
    plan: String(profile.plan || "free"),
    isSuperuser,
  }
}
