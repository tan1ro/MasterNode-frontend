import { describe, expect, it } from "vitest"
import { buildSessionFromTokensAndProfile } from "./build-session-from-profile"
import { SUPERUSER_EMAIL } from "@/lib/auth-constants"

describe("buildSessionFromTokensAndProfile", () => {
  it("marks superuser from profile flag without email", () => {
    const session = buildSessionFromTokensAndProfile("usr_superuser", undefined, {
      is_superuser: true,
      account_type: "business",
      plan: "enterprise",
    })
    expect(session.isSuperuser).toBe(true)
  })

  it("marks superuser from email", () => {
    const session = buildSessionFromTokensAndProfile("usr_x", SUPERUSER_EMAIL, {
      account_type: "creator",
      plan: "free",
    })
    expect(session.isSuperuser).toBe(true)
  })
})
