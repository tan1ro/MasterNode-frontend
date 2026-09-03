import { describe, expect, it } from "vitest"
import { canAccessFeature, featureBlockReason } from "@/constants/entitlements"

describe("entitlements", () => {
  it("allows business dashboard on free", () => {
    expect(
      canAccessFeature({ accountType: "business", plan: "free" }, "routes.dashboard")
    ).toBe(true)
  })

  it("allows legacy developer and development aliases for dashboard on free", () => {
    expect(
      canAccessFeature({ accountType: "developer" as "business", plan: "free" }, "routes.dashboard")
    ).toBe(true)
    expect(
      canAccessFeature({ accountType: "development" as "business", plan: "free" }, "routes.dashboard")
    ).toBe(true)
  })

  it("allows business team routes on free", () => {
    expect(
      canAccessFeature({ accountType: "business", plan: "free" }, "routes.team")
    ).toBe(true)
  })

  it("blocks creator from api keys", () => {
    expect(
      canAccessFeature({ accountType: "creator", plan: "premium" }, "routes.api_keys")
    ).toBe(false)
    expect(
      featureBlockReason({ accountType: "creator", plan: "premium" }, "routes.api_keys")
    ).toContain("business")
  })

  it("superuser bypasses gates", () => {
    expect(
      canAccessFeature(
        { accountType: "creator", plan: "free", isSuperUser: true },
        "routes.api_keys"
      )
    ).toBe(true)
  })
})
