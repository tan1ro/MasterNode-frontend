import { describe, expect, it } from "vitest"
import {
  effectiveRole,
  hasAuthenticatedSession,
  resolveProtectedAccess,
} from "./middleware-auth"

describe("hasAuthenticatedSession", () => {
  it("accepts a valid JWT session", () => {
    expect(
      hasAuthenticatedSession({ userId: "u1", role: "creator" }, null, null)
    ).toBe(true)
  })

  it("accepts legacy session id with role cookie", () => {
    expect(hasAuthenticatedSession(null, "u1", "creator")).toBe(true)
  })

  it("rejects orphaned legacy session id without role", () => {
    expect(hasAuthenticatedSession(null, "u1", null)).toBe(false)
  })

  it("rejects empty credentials", () => {
    expect(hasAuthenticatedSession(null, null, null)).toBe(false)
  })
})

describe("effectiveRole", () => {
  it("prefers business when role cookie was upgraded", () => {
    expect(effectiveRole("creator", "business")).toBe("business")
  })

  it("falls back to legacy role when JWT has no role", () => {
    expect(effectiveRole(undefined, "creator")).toBe("creator")
  })
})

describe("resolveProtectedAccess", () => {
  it("sends guests on /tasks to sign-in", () => {
    expect(
      resolveProtectedAccess({
        pathname: "/tasks",
        session: null,
        legacySessionId: null,
        legacyRole: null,
        isSuperuser: false,
      })
    ).toBe("sign_in")
  })

  it("allows creator on /assistants with JWT session", () => {
    expect(
      resolveProtectedAccess({
        pathname: "/assistants",
        session: { userId: "u1", role: "creator" },
        legacySessionId: null,
        legacyRole: null,
        isSuperuser: false,
      })
    ).toBe("allow")
  })

  it("rejects orphaned legacy session on /memory", () => {
    expect(
      resolveProtectedAccess({
        pathname: "/memory",
        session: null,
        legacySessionId: "orphan",
        legacyRole: null,
        isSuperuser: false,
      })
    ).toBe("sign_in")
  })

  it("redirects creator away from business-only /dashboard", () => {
    expect(
      resolveProtectedAccess({
        pathname: "/dashboard",
        session: { userId: "u1", role: "creator" },
        legacySessionId: null,
        legacyRole: null,
        isSuperuser: false,
      })
    ).toBe("role_home")
  })
})
