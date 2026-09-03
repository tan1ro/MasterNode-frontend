/** Integration directory categories and provider mapping. */

export type IntegrationCategoryId =
  | "all"
  | "automations"
  | "messaging"
  | "documents"
  | "developer"
  | "data"

export type IntegrationStatusFilter = "all" | "connected" | "available"

export interface IntegrationCategoryDef {
  id: IntegrationCategoryId
  label: string
  description: string
}

export const INTEGRATION_CATEGORIES: IntegrationCategoryDef[] = [
  {
    id: "all",
    label: "All apps",
    description: "Every connector in the directory",
  },
  {
    id: "automations",
    label: "Automations",
    description: "Workflow triggers and Zapier hooks",
  },
  {
    id: "messaging",
    label: "Messaging",
    description: "Slack, Discord, and team notifications",
  },
  {
    id: "documents",
    label: "Docs & files",
    description: "Documents, cloud storage, and design",
  },
  {
    id: "developer",
    label: "Developer",
    description: "Repos, issues, and project tracking",
  },
  {
    id: "data",
    label: "Data",
    description: "Spreadsheets and structured records",
  },
]

export const INTEGRATION_STATUS_FILTERS: { id: IntegrationStatusFilter; label: string }[] = [
  { id: "connected", label: "Connected" },
  { id: "available", label: "Not connected" },
]

/** Primary category per provider (used for filtering). */
export const INTEGRATION_PROVIDER_CATEGORY: Record<string, IntegrationCategoryId> = {
  n8n: "automations",
  zapier: "automations",
  slack: "messaging",
  discord: "messaging",
  google_docs: "documents",
  google_drive: "documents",
  dropbox: "documents",
  notion: "documents",
  canva: "documents",
  github: "developer",
  linear: "developer",
  jira: "developer",
  airtable: "data",
}

export function getIntegrationCategory(providerId: string): IntegrationCategoryId {
  return INTEGRATION_PROVIDER_CATEGORY[providerId] ?? "all"
}

export function getCategoryLabel(categoryId: IntegrationCategoryId): string {
  return INTEGRATION_CATEGORIES.find((c) => c.id === categoryId)?.label ?? categoryId
}

export function integrationMatchesCategory(
  providerId: string,
  category: IntegrationCategoryId
): boolean {
  if (category === "all") return true
  return getIntegrationCategory(providerId) === category
}

export function countIntegrationsByCategory(
  providerIds: string[]
): Record<IntegrationCategoryId, number> {
  const counts: Record<IntegrationCategoryId, number> = {
    all: providerIds.length,
    automations: 0,
    messaging: 0,
    documents: 0,
    developer: 0,
    data: 0,
  }
  for (const id of providerIds) {
    const cat = getIntegrationCategory(id)
    if (cat !== "all") counts[cat] += 1
  }
  return counts
}
