import type { IntegrationConnectionType } from "@/types/api"

export interface IntegrationCatalogEntry {
  id: string
  name: string
  description: string
  connectionType: IntegrationConnectionType
  brandColor: string
}

export const INTEGRATION_CATALOG: IntegrationCatalogEntry[] = [
  {
    id: "n8n",
    name: "n8n",
    description: "Trigger workflows from chat and task events",
    connectionType: "webhook",
    brandColor: "#EA4B71",
  },
  {
    id: "canva",
    name: "Canva",
    description: "Create and open designs in Canva",
    connectionType: "oauth",
    brandColor: "#00C4CC",
  },
  {
    id: "google_docs",
    name: "Google Docs",
    description: "Create and edit documents in Google Drive",
    connectionType: "oauth",
    brandColor: "#4285F4",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Create and update Notion pages",
    connectionType: "api_token",
    brandColor: "#000000",
  },
]
