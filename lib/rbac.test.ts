import { describe, expect, it } from "vitest"
import {
  CREATOR_ALLOWED,
  BUSINESS_ALLOWED,
  ROLE_HOME,
  isAuthEntryPath,
  isProtectedPath,
  prefersSignUpEntry,
  parseRole,
  pathStartsWithAny,
  roleAllowsPath,
} from "./rbac"

describe("pathStartsWithAny", () => {
  it("matches exact path", () => {
    expect(pathStartsWithAny("/chat", ["/chat"])).toBe(true)
  })

  it("matches nested path with trailing segment", () => {
    expect(pathStartsWithAny("/chat/123", ["/chat"])).toBe(true)
  })

  it("does not match a different prefix sharing a substring", () => {
    expect(pathStartsWithAny("/chatter", ["/chat"])).toBe(false)
  })

  it("returns false when no prefix matches", () => {
    expect(pathStartsWithAny("/dashboard", ["/chat", "/billing"])).toBe(false)
  })
})

describe("isProtectedPath", () => {
  it("flags app routes as protected", () => {
    expect(isProtectedPath("/chat")).toBe(true)
    expect(isProtectedPath("/chat/abc-123")).toBe(true)
    expect(isProtectedPath("/dashboard")).toBe(true)
    expect(isProtectedPath("/integrations")).toBe(true)
    expect(isProtectedPath("/tasks")).toBe(true)
    expect(isProtectedPath("/assistants")).toBe(true)
    expect(isProtectedPath("/memory")).toBe(true)
    expect(isProtectedPath("/knowledge")).toBe(false)
    expect(isProtectedPath("/team/management")).toBe(true)
    expect(isProtectedPath("/team/logs")).toBe(true)
    expect(isProtectedPath("/api-keys")).toBe(true)
    expect(isProtectedPath("/superuser/tasks")).toBe(true)
  })

  it("does not flag public routes", () => {
    expect(isProtectedPath("/")).toBe(false)
    expect(isProtectedPath("/docs")).toBe(false)
    expect(isProtectedPath("/sign-in")).toBe(false)
    expect(isProtectedPath("/about")).toBe(false)
    expect(isProtectedPath("/share/abc")).toBe(false)
  })
})

describe("prefersSignUpEntry", () => {
  it("routes integrations guests to sign-up first", () => {
    expect(prefersSignUpEntry("/integrations")).toBe(true)
    expect(prefersSignUpEntry("/dashboard")).toBe(false)
  })
})

describe("isAuthEntryPath", () => {
  it("matches sign-in and sign-up routes", () => {
    expect(isAuthEntryPath("/sign-in")).toBe(true)
    expect(isAuthEntryPath("/sign-up")).toBe(true)
    expect(isAuthEntryPath("/sign-in/foo")).toBe(true)
    expect(isAuthEntryPath("/auth/oauth/google")).toBe(true)
    expect(isAuthEntryPath("/auth/oauth/complete")).toBe(true)
  })

  it("does not match other routes", () => {
    expect(isAuthEntryPath("/chat")).toBe(false)
    expect(isAuthEntryPath("/dashboard")).toBe(false)
  })
})

describe("roleAllowsPath: creator", () => {
  it("allows creator-listed pages", () => {
    expect(roleAllowsPath("creator", "/chat")).toBe(true)
    expect(roleAllowsPath("creator", "/billing")).toBe(true)
    expect(roleAllowsPath("creator", "/assistants")).toBe(true)
    expect(roleAllowsPath("creator", "/memory")).toBe(true)
    expect(roleAllowsPath("creator", "/knowledge")).toBe(false)
    expect(roleAllowsPath("creator", "/integrations")).toBe(true)
    expect(roleAllowsPath("creator", "/logs")).toBe(true)
    expect(roleAllowsPath("creator", "/settings")).toBe(true)
    expect(roleAllowsPath("creator", "/tasks")).toBe(true)
  })

  it("blocks business-only pages", () => {
    expect(roleAllowsPath("creator", "/dashboard")).toBe(false)
    expect(roleAllowsPath("creator", "/product")).toBe(false)
    expect(roleAllowsPath("creator", "/api-keys")).toBe(false)
    expect(roleAllowsPath("creator", "/team")).toBe(false)
    expect(roleAllowsPath("creator", "/team/management")).toBe(false)
    expect(roleAllowsPath("creator", "/team/logs")).toBe(false)
    expect(roleAllowsPath("creator", "/llm-strategy")).toBe(false)
    expect(roleAllowsPath("creator", "/analytics")).toBe(false)
    expect(roleAllowsPath("creator", "/superuser/tasks")).toBe(false)
  })
})

describe("roleAllowsPath: business", () => {
  it("allows everything in creator allow-list plus business-only pages", () => {
    for (const p of CREATOR_ALLOWED) {
      expect(roleAllowsPath("business", p)).toBe(true)
    }
    expect(roleAllowsPath("business", "/dashboard")).toBe(true)
    expect(roleAllowsPath("business", "/product")).toBe(true)
    expect(roleAllowsPath("business", "/team")).toBe(true)
    expect(roleAllowsPath("business", "/team/management")).toBe(true)
    expect(roleAllowsPath("business", "/team/logs")).toBe(true)
    expect(roleAllowsPath("business", "/api-keys")).toBe(true)
    expect(roleAllowsPath("business", "/tasks")).toBe(true)
    expect(roleAllowsPath("business", "/llm-strategy")).toBe(true)
    expect(roleAllowsPath("business", "/analytics")).toBe(true)
  })

  it("normalizes legacy developer and development cookie values", () => {
    expect(roleAllowsPath("developer", "/dashboard")).toBe(true)
    expect(roleAllowsPath("development", "/dashboard")).toBe(true)
    expect(roleAllowsPath("DEVELOPER", "/api-keys")).toBe(true)
  })

  it("does not allow paths outside both allow-lists", () => {
    expect(roleAllowsPath("business", "/some/random/path")).toBe(false)
    expect(roleAllowsPath("business", "/superuser/tasks")).toBe(false)
  })
})

describe("parseRole", () => {
  it("returns canonical role for valid values", () => {
    expect(parseRole("creator")).toBe("creator")
    expect(parseRole("DEVELOPER")).toBe("business")
    expect(parseRole("development")).toBe("business")
    expect(parseRole("business")).toBe("business")
    expect(parseRole("  Creator ")).toBe("creator")
  })

  it("returns null for unknown or empty values", () => {
    expect(parseRole("")).toBe(null)
    expect(parseRole(null)).toBe(null)
    expect(parseRole(undefined)).toBe(null)
    expect(parseRole("admin")).toBe(null)
  })
})

describe("ROLE_HOME map", () => {
  it("creator lands on /chat", () => {
    expect(ROLE_HOME.creator).toBe("/chat")
  })

  it("business lands on the workspace dashboard", () => {
    expect(ROLE_HOME.business).toBe("/dashboard")
  })
})

describe("BUSINESS_ALLOWED is a superset of CREATOR_ALLOWED", () => {
  it("contains every creator-allowed prefix", () => {
    for (const p of CREATOR_ALLOWED) {
      expect(BUSINESS_ALLOWED).toContain(p)
    }
  })
})
