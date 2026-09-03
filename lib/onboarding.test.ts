import { describe, expect, it } from "vitest"
import {
  hydrateOnboardingFromProfile,
  isOnboardingComplete,
  onboardingDestination,
  onboardingUseCaseSummary,
} from "@/lib/onboarding"

describe("onboarding helpers", () => {
  it("treats completed local state as done", () => {
    const tenant = "usr_test"
    const key = `mn_onboarding_v1:${tenant}`
    localStorage.setItem(
      key,
      JSON.stringify({ completed_at: "2026-01-01T00:00:00.000Z" })
    )
    expect(isOnboardingComplete(tenant)).toBe(true)
    localStorage.removeItem(key)
  })

  it("prefers profile flag when set", () => {
    expect(isOnboardingComplete("usr_x", true)).toBe(true)
  })

  it("hydrates local completion from server profile", () => {
    const tenant = "usr_hydrate"
    const key = `mn_onboarding_v1:${tenant}`
    localStorage.removeItem(key)
    hydrateOnboardingFromProfile(tenant, {
      onboarding_completed: true,
      onboarding: { role: "professional", completed_at: "2026-02-01T00:00:00.000Z" },
    })
    expect(isOnboardingComplete(tenant)).toBe(true)
    const stored = JSON.parse(localStorage.getItem(key) || "{}") as Record<string, unknown>
    expect(stored.completed_at).toBeTruthy()
    expect(stored.role).toBeUndefined()
    localStorage.removeItem(key)
  })

  it("resolves post-onboarding destination", () => {
    expect(onboardingDestination("/chat", "/dashboard")).toBe("/chat")
    expect(onboardingDestination("/onboarding", "/chat")).toBe("/chat")
    expect(onboardingDestination(null, "/chat")).toBe("/chat")
  })

  it("builds a readable use-case summary", () => {
    expect(
      onboardingUseCaseSummary({
        role: "professional",
        build_goal: "productivity",
        attribution: "google",
      })
    ).toBe("Working professional · An app to boost my productivity · Google")
  })
})
