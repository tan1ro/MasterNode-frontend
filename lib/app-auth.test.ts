import { describe, expect, it } from "vitest"
import {
  SUPERUSER_EMAIL,
  planMeetsMinimum,
  plansForAccountType,
  resolveIsSuperUser,
  type AppUser,
} from "./app-auth"
import { SUPERUSER_TENANT_ID } from "./auth-constants"

describe("plansForAccountType", () => {
  it("creator gets free, pro, pro_plus, premium", () => {
    expect(plansForAccountType("creator")).toEqual(["free", "pro", "pro_plus", "premium"])
  })

  it("business gets the creator plans plus enterprise", () => {
    expect(plansForAccountType("business")).toEqual([
      "free",
      "pro",
      "pro_plus",
      "premium",
      "enterprise",
    ])
  })
})

describe("planMeetsMinimum", () => {
  it("returns true when plan tier is equal to or higher than minimum", () => {
    expect(planMeetsMinimum("free", "free")).toBe(true)
    expect(planMeetsMinimum("pro", "free")).toBe(true)
    expect(planMeetsMinimum("pro_plus", "pro")).toBe(true)
    expect(planMeetsMinimum("premium", "pro_plus")).toBe(true)
    expect(planMeetsMinimum("enterprise", "premium")).toBe(true)
  })

  it("returns false when plan tier is below minimum", () => {
    expect(planMeetsMinimum("free", "pro")).toBe(false)
    expect(planMeetsMinimum("pro", "pro_plus")).toBe(false)
    expect(planMeetsMinimum("premium", "enterprise")).toBe(false)
  })

  it("returns false for missing plan", () => {
    expect(planMeetsMinimum(null, "free")).toBe(false)
    expect(planMeetsMinimum(undefined, "pro")).toBe(false)
  })
})

describe("superuser constants", () => {
  it("uses a stable superuser email", () => {
    expect(SUPERUSER_EMAIL).toBe("superuser@masternode.ai")
  })
})

describe("resolveIsSuperUser", () => {
  const baseUser: AppUser = {
    id: "usr_other",
    email: "user@example.com",
    password: "",
    username: "user",
    accountType: "creator",
    plan: "free",
    organization: { name: "Org" },
    createdAt: new Date().toISOString(),
  }

  it("returns true for built-in superuser email", () => {
    expect(
      resolveIsSuperUser({
        user: { ...baseUser, email: SUPERUSER_EMAIL, accountType: "business" },
      })
    ).toBe(true)
  })

  it("returns true for dev superuser tenant id", () => {
    expect(resolveIsSuperUser({ user: { ...baseUser, id: SUPERUSER_TENANT_ID } })).toBe(true)
  })

  it("returns true when API profile marks is_superuser", () => {
    expect(resolveIsSuperUser({ user: baseUser, profile: { is_superuser: true } })).toBe(true)
  })

  it("returns false for normal creator", () => {
    expect(resolveIsSuperUser({ user: baseUser })).toBe(false)
  })
})
