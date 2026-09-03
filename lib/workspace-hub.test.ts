import { describe, expect, it } from "vitest"
import { SUPERUSER_EMAIL } from "@/lib/auth-constants"
import { canAccessHubDashboard } from "@/lib/workspace-hub"
import type { AppUser } from "@/lib/app-auth"

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

describe("canAccessHubDashboard", () => {
  it("allows superuser email", () => {
    expect(
      canAccessHubDashboard({
        user: { ...baseUser, email: SUPERUSER_EMAIL, accountType: "business" },
      })
    ).toBe(true)
  })

  it("allows API is_superuser even when account_type is creator", () => {
    expect(
      canAccessHubDashboard({
        user: baseUser,
        profile: { account_type: "creator", is_superuser: true },
      })
    ).toBe(true)
  })

  it("denies explicit creator without superuser signals", () => {
    expect(
      canAccessHubDashboard({
        user: baseUser,
        accountType: "creator",
        profile: { account_type: "creator", is_superuser: false },
        isSuperUser: false,
      })
    ).toBe(false)
  })

  it("allows business account type", () => {
    expect(
      canAccessHubDashboard({
        user: { ...baseUser, accountType: "business" },
        accountType: "business",
      })
    ).toBe(true)
  })
})
