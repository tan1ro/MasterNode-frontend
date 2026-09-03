import { describe, expect, it } from "vitest"
import { enrichIntakeFromEntities } from "@/lib/assistant-intake-entities"
import { buildAssistantIntakeFields } from "@/lib/assistant-intake"
import { prefillIntakeValues } from "@/lib/assistant-intake-prefill"
import type { AgentTemplateApi } from "@/types/api"

const marketIntel: AgentTemplateApi = {
  template_id: "sample-market-intel-engine",
  name: "Market intelligence & research",
  prompt_template: "Market: {market}\nProduct: {product}\nGeo: {geo}\nGoal: {goal}",
  variables: ["market", "product", "geo"],
}

describe("enrichIntakeFromEntities", () => {
  it("expands TECHM ticker into product, market vertical, and geo", () => {
    const fields = buildAssistantIntakeFields(marketIntel)
    const enriched = enrichIntakeFromEntities(fields, { market: "TECHM" })
    expect(enriched.product).toBe("Tech Mahindra")
    expect(enriched.market).toBe("IT services & consulting")
    expect(enriched.geo).toBe("India")
  })
})

describe("prefillIntakeValues market intel", () => {
  it("resolves bare TECHM into company + industry without asking product again", () => {
    const fields = buildAssistantIntakeFields({
      ...marketIntel,
      variables: ["market", "product", "geo", "goal"],
    })
    const values = prefillIntakeValues(fields, "TECHM")
    expect(values.product).toBe("Tech Mahindra")
    expect(values.market).toBe("IT services & consulting")
    expect(values.geo).toBe("India")
    expect(values.goal).toBeUndefined()
  })

  it("extracts product from natural phrasing", () => {
    const fields = buildAssistantIntakeFields({
      ...marketIntel,
      variables: ["market", "product", "geo", "goal"],
    })
    const values = prefillIntakeValues(
      fields,
      "Market intelligence for Salesforce in North America"
    )
    expect(values.product).toBe("Salesforce")
    expect(values.geo).toMatch(/North America/i)
  })
})
