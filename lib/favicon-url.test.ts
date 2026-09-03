import { describe, expect, it } from "vitest"

import { faviconUrlForDomain } from "@/lib/favicon-url"

describe("faviconUrlForDomain", () => {
  it("builds same-origin favicon proxy URLs", () => {
    expect(faviconUrlForDomain("espncricinfo.com")).toBe(
      "/api/favicon?domain=espncricinfo.com"
    )
  })

  it("returns base path for empty domain", () => {
    expect(faviconUrlForDomain("")).toBe("/api/favicon")
  })
})
