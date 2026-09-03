import { describe, expect, it } from "vitest"
import { signSessionPayload, verifySessionToken } from "@/lib/server/auth-session"

describe("auth session token", () => {
  it("round-trips business role and superuser flag", async () => {
    const token = await signSessionPayload({
      userId: "u1",
      role: "business",
      plan: "free",
      isSuperuser: false,
    })
    const payload = await verifySessionToken(token)
    expect(payload).toMatchObject({
      userId: "u1",
      role: "business",
      plan: "free",
      isSuperuser: false,
    })
  })

  it("normalizes legacy developer and development roles in token", async () => {
    const token = await signSessionPayload({
      userId: "u2",
      role: "business",
      plan: "pro",
      isSuperuser: false,
    })
    const { SignJWT } = await import("jose")
    const { getAuthSessionSecret } = await import("@/lib/server/session-secret")
    const legacyToken = await new SignJWT({
      userId: "u2",
      role: "developer",
      plan: "pro",
      isSuperuser: false,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(getAuthSessionSecret())

    expect(legacyToken).not.toBe(token)
    const payload = await verifySessionToken(legacyToken)
    expect(payload?.role).toBe("business")
  })
})
