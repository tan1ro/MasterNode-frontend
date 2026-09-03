import { SignJWT, jwtVerify } from "jose"
import { getAuthSessionSecret } from "@/lib/server/session-secret"

export const SESSION_COOKIE_NAME = "mn_session"

export interface SessionPayload {
  userId: string
  role: "creator" | "business"
  plan: string
  isSuperuser: boolean
}

const SESSION_TTL = "30d"

export async function signSessionPayload(payload: SessionPayload): Promise<string> {
  const secret = getAuthSessionSecret()
  return new SignJWT({
    userId: payload.userId,
    role: payload.role,
    plan: payload.plan,
    isSuperuser: payload.isSuperuser,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(secret)
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<SessionPayload | null> {
  if (!token?.trim()) return null
  try {
    const secret = getAuthSessionSecret()
    const { payload } = await jwtVerify(token.trim(), secret)
    const userId = String(payload.userId ?? "").trim()
    const role = String(payload.role ?? "").trim()
    const normalized =
      role === "developer" || role === "development" || role === "business"
        ? "business"
        : role === "creator"
          ? "creator"
          : null
    if (!userId || !normalized) return null
    return {
      userId,
      role: normalized,
      plan: String(payload.plan ?? "free"),
      isSuperuser: Boolean(payload.isSuperuser),
    }
  } catch {
    return null
  }
}
