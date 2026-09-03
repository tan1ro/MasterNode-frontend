import { describe, expect, it } from "vitest"
import { apiErrorFromResponse } from "@/lib/resolve-api-error"
import {
  isAuthError,
  isEntitlementError,
  isForbidden,
  isServerError,
  isWalletError,
  getEntitlementFeature,
} from "@/types/api"

describe("apiErrorFromResponse", () => {
  it("flags 401 as auth error", () => {
    const err = apiErrorFromResponse(401, "nope", "fallback")
    expect(isAuthError(err)).toBe(true)
    expect(err.httpStatus).toBe(401)
  })

  it("flags 402 as wallet error", () => {
    const err = apiErrorFromResponse(402, "low balance", "fallback")
    expect(isWalletError(err)).toBe(true)
  })

  it("flags 403 as forbidden", () => {
    const err = apiErrorFromResponse(403, "denied", "fallback")
    expect(isForbidden(err)).toBe(true)
  })

  it("parses policy entitlement denials into friendly messages", () => {
    const err = apiErrorFromResponse(
      403,
      "Feature 'templates.manage' requires pro plan or higher (current: free).",
      "fallback"
    )
    expect(isForbidden(err)).toBe(true)
    expect(isEntitlementError(err)).toBe(true)
    expect(getEntitlementFeature(err)).toBe("templates.manage")
    expect(err.message).toMatch(/Create or edit templates requires pro plan/i)
    expect(err.message).toContain("current: free")
  })

  it("flags 5xx as server error", () => {
    const err = apiErrorFromResponse(500, "boom", "fallback")
    expect(isServerError(err)).toBe(true)
    expect(err.message).toMatch(/internal server error/i)
  })
})
