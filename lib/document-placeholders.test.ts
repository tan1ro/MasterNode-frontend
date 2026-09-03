import { describe, expect, it } from "vitest"
import { applyDocumentPlaceholders, resolveAuthorFromUser } from "@/lib/document-placeholders"

describe("document-placeholders", () => {
  it("resolves author from logged-in user", () => {
    const author = resolveAuthorFromUser({
      id: "usr_abc",
      email: "ada@example.com",
      username: "Ada",
      password: "",
      accountType: "creator",
      plan: "free",
      organization: { name: "Analytical Engines" },
      createdAt: "2026-01-01",
    })
    expect(author.displayName).toBe("Ada")
    expect(author.company).toBe("Analytical Engines")
  })

  it("replaces template footer tokens", () => {
    const author = resolveAuthorFromUser(null)
    const out = applyDocumentPlaceholders(
      "Last updated: [Insert Date]\n© [Your Name/Company]. All rights reserved.",
      { ...author, date: "June 4, 2026", nameCompany: "Ada / Co" }
    )
    expect(out).toContain("June 4, 2026")
    expect(out).toContain("Ada / Co")
    expect(out).not.toContain("[Insert Date]")
  })
})
