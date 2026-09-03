import { describe, expect, it } from "vitest"
import { ACCOUNT_MORE_MENU_SECTIONS } from "@/constants/learn-more-menu"
import { ROUTES } from "@/lib/routes"

describe("ACCOUNT_MORE_MENU_SECTIONS", () => {
  it("includes help, faq, and core more-menu destinations", () => {
    const labels = ACCOUNT_MORE_MENU_SECTIONS.flatMap((s) => s.items.map((i) => i.label))
    expect(labels).toContain("Get help")
    expect(labels).toContain("FAQ")
    expect(labels).toContain("About MasterNode")
    expect(labels).toContain("Tutorials")
    expect(labels).toContain("Usage policy")
    expect(labels).toContain("Your privacy choices")
    expect(labels).toContain("Keyboard shortcuts")
  })


  it("links FAQ to the dedicated FAQ page", () => {
    const item = ACCOUNT_MORE_MENU_SECTIONS.flatMap((s) => s.items).find((i) => i.key === "faq")
    expect(item?.href).toBe(ROUTES.helpFaq)
  })

  it("links usage and privacy choices to dedicated legal pages", () => {
    const items = ACCOUNT_MORE_MENU_SECTIONS.flatMap((s) => s.items)
    expect(items.find((i) => i.key === "usage")?.href).toBe(ROUTES.usagePolicy)
    expect(items.find((i) => i.key === "privacy-choices")?.href).toBe(ROUTES.privacyChoices)
  })
})
