import { describe, expect, it } from "vitest"
import { displayTemplateName, resolveTemplateDisplayName } from "./template-role-utils"

describe("displayTemplateName", () => {
  it("title-cases words while preserving acronyms", () => {
    expect(displayTemplateName("Competitor financial analysis")).toBe(
      "Competitor Financial Analysis"
    )
    expect(displayTemplateName("Customer SWOT analysis")).toBe("Customer SWOT Analysis")
    expect(displayTemplateName("Go-to-market (GTM) planning")).toBe(
      "Go-To-Market (GTM) Planning"
    )
  })

  it("strips a trailing (custom) suffix", () => {
    expect(displayTemplateName("Research helper (custom)")).toBe("Research Helper")
  })

  it("resolves gallery names from template ids when API name is missing", () => {
    expect(resolveTemplateDisplayName("sample-legal-compliance-orchestrator")).toBe(
      "Legal & Compliance Orchestrator"
    )
    expect(resolveTemplateDisplayName("sample-custom-research")).toBe("Research Helper")
  })

  it("preserves intentional mixed-case tokens", () => {
    expect(displayTemplateName("P&L reviewer")).toBe("P&L Reviewer")
    expect(displayTemplateName("ICP & persona mapping")).toBe("ICP & Persona Mapping")
  })
})
