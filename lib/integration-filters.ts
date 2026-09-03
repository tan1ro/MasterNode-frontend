import {
  getIntegrationCategory,
  integrationMatchesCategory,
  type IntegrationCategoryId,
  type IntegrationStatusFilter,
} from "@/constants/integration-categories"
import { getIntegrationMeta } from "@/constants/integration-directory"
import type { IntegrationCatalogItem } from "@/types/api"

export function filterIntegrations(
  integrations: IntegrationCatalogItem[],
  options: {
    query?: string
    category?: IntegrationCategoryId
    statusFilter?: IntegrationStatusFilter
  }
): IntegrationCatalogItem[] {
  const q = (options.query ?? "").trim().toLowerCase()
  const category = options.category ?? "all"
  const statusFilter = options.statusFilter ?? "all"

  return integrations.filter((item) => {
    if (!integrationMatchesCategory(item.id, category)) return false

    if (statusFilter === "connected" && item.status !== "connected") return false
    if (statusFilter === "available" && item.status === "connected") return false

    if (!q) return true

    const meta = getIntegrationMeta(item.id)
    const hay = [
      item.name,
      item.description,
      item.id,
      meta?.tagline,
      meta?.developer,
      getIntegrationCategory(item.id),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    return hay.includes(q)
  })
}
