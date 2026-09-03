import { describe, expect, it } from "vitest"
import { safeRedirectPath } from "@/lib/safe-redirect"

describe("safeRedirectPath", () => {
  it("allows same-origin paths", () => {
    expect(safeRedirectPath("/dashboard", "/chat")).toBe("/dashboard")
  })

  it("blocks external URLs", () => {
    expect(safeRedirectPath("https://evil.com", "/chat")).toBe("/chat")
    expect(safeRedirectPath("//evil.com", "/chat")).toBe("/chat")
  })
})
