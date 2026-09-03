import { describe, expect, it } from "vitest"
import { getFlatNavForRole } from "@/constants/navigation"
import { ROUTES } from "@/lib/routes"

describe("navigation integrations link", () => {
  it("includes Integrations for creator workspace nav", () => {
    const flat = getFlatNavForRole("creator")
    expect(flat.some((item) => item.href === ROUTES.integrations)).toBe(true)
  })

  it("includes Integrations for business workspace nav", () => {
    const flat = getFlatNavForRole("business")
    expect(flat.some((item) => item.href === ROUTES.integrations)).toBe(true)
  })
})
