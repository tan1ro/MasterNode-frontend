import { describe, expect, it } from "vitest"
import { ACCOUNT_HELP_MENU_SECTIONS } from "@/constants/account-help-menu"
import { ROUTES } from "@/lib/routes"

describe("ACCOUNT_HELP_MENU_SECTIONS", () => {
  it("includes ChatGPT-style help items with correct targets", () => {
    const items = ACCOUNT_HELP_MENU_SECTIONS.flatMap((s) => s.items)
    const byKey = Object.fromEntries(items.map((i) => [i.key, i]))

    expect(byKey.help?.href).toBe(ROUTES.help)
    expect(byKey["release-notes"]?.href).toBe(ROUTES.helpReleaseNotes)
    expect(byKey.apps?.href).toBe(ROUTES.helpDownloadApps)
    expect(byKey.shortcuts?.action).toBe("keyboard-shortcuts")
    expect(byKey.terms?.href).toBe(ROUTES.terms)
    expect(byKey.privacy?.href).toBe(ROUTES.privacy)
    expect(byKey.bug?.action).toBe("report-bug")
  })
})
