import { describe, expect, it } from "vitest"
import {
  countIntegrationsByCategory,
  getIntegrationCategory,
  integrationMatchesCategory,
} from "@/constants/integration-categories"
import { filterIntegrations } from "@/lib/integration-filters"
import type { IntegrationCatalogItem } from "@/types/api"

const sample = (id: string, status: IntegrationCatalogItem["status"] = "not_connected") =>
  ({
    id,
    name: id,
    description: "",
    connection_type: "api_token",
    brand_color: "#000",
    status,
  }) satisfies IntegrationCatalogItem

describe("integration categories", () => {
  it("maps providers to categories", () => {
    expect(getIntegrationCategory("n8n")).toBe("automations")
    expect(getIntegrationCategory("slack")).toBe("messaging")
    expect(getIntegrationCategory("github")).toBe("developer")
    expect(getIntegrationCategory("airtable")).toBe("data")
  })

  it("counts integrations per category", () => {
    const counts = countIntegrationsByCategory(["n8n", "slack", "github", "notion"])
    expect(counts.all).toBe(4)
    expect(counts.automations).toBe(1)
    expect(counts.messaging).toBe(1)
    expect(counts.developer).toBe(1)
    expect(counts.documents).toBe(1)
  })

  it("filters by category and status", () => {
    const items = [
      sample("n8n", "connected"),
      sample("slack", "not_connected"),
      sample("zapier", "not_connected"),
    ]
    const automations = filterIntegrations(items, { category: "automations" })
    expect(automations.map((i) => i.id).sort()).toEqual(["n8n", "zapier"])

    const connected = filterIntegrations(items, { statusFilter: "connected" })
    expect(connected).toHaveLength(1)
    expect(connected[0]?.id).toBe("n8n")
  })

  it("matches category all", () => {
    expect(integrationMatchesCategory("github", "all")).toBe(true)
    expect(integrationMatchesCategory("github", "developer")).toBe(true)
    expect(integrationMatchesCategory("github", "messaging")).toBe(false)
  })
})
