"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { IntegrationCategoryFilters } from "@/components/integrations/integration-category-filters"
import { IntegrationConnectorGrid } from "@/components/integrations/integration-connector-grid"
import { IntegrationDetailModal } from "@/components/integrations/integration-detail-modal"
import {
  countIntegrationsByCategory,
  getCategoryLabel,
  type IntegrationCategoryId,
  type IntegrationStatusFilter,
} from "@/constants/integration-categories"
import { filterIntegrations } from "@/lib/integration-filters"
import { settingsPanelHref } from "@/lib/settings-panel-routes"
import type { IntegrationCatalogItem } from "@/types/api"

interface IntegrationsDirectoryProps {
  integrations: IntegrationCatalogItem[]
  isLoading?: boolean
  onConnect: (item: IntegrationCatalogItem) => void
  onDisconnect: (id: string) => void
  onTest: (id: string) => void
  disconnectingId?: string | null
  testingId?: string | null
}

export function IntegrationsDirectory({
  integrations,
  isLoading = false,
  onConnect,
  onDisconnect,
  onTest,
  disconnectingId,
  testingId,
}: IntegrationsDirectoryProps) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<IntegrationCategoryId>("all")
  const [statusFilter, setStatusFilter] = useState<IntegrationStatusFilter>("all")
  const [detailItem, setDetailItem] = useState<IntegrationCatalogItem | null>(null)

  const providerIds = useMemo(() => integrations.map((item) => item.id), [integrations])

  const categoryCounts = useMemo(() => countIntegrationsByCategory(providerIds), [providerIds])

  const connectedCount = useMemo(
    () => integrations.filter((item) => item.status === "connected").length,
    [integrations]
  )

  const availableCount = useMemo(
    () => integrations.filter((item) => item.status !== "connected").length,
    [integrations]
  )

  const filtered = useMemo(
    () => filterIntegrations(integrations, { query, category, statusFilter }),
    [integrations, query, category, statusFilter]
  )

  const activeCategory = getCategoryLabel(category)

  return (
    <div className="space-y-4">
      <div className="relative max-w-xl">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search connectors…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
          aria-label="Search connectors"
        />
      </div>

      <IntegrationCategoryFilters
        category={category}
        onCategoryChange={setCategory}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        categoryCounts={categoryCounts}
        connectedCount={connectedCount}
        availableCount={availableCount}
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? "Loading connectors…"
            : filtered.length === integrations.length
              ? `${integrations.length} connector${integrations.length === 1 ? "" : "s"}`
              : `${filtered.length} of ${integrations.length} in ${activeCategory}`}
          {!isLoading && connectedCount > 0 ? (
            <span className="text-emerald"> · {connectedCount} connected</span>
          ) : null}
        </p>
        <p className="text-xs text-muted-foreground">
          Outbound task webhooks live in{" "}
          <Link href={settingsPanelHref("webhooks")} className="text-amber hover:underline">
            Settings
          </Link>
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading connectors…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
          No connectors match your filters.
          {(query || category !== "all" || statusFilter !== "all") && (
            <>
              {" "}
              <button
                type="button"
                className="text-amber underline-offset-2 hover:underline"
                onClick={() => {
                  setQuery("")
                  setCategory("all")
                  setStatusFilter("all")
                }}
              >
                Clear filters
              </button>
            </>
          )}
        </div>
      ) : (
        <IntegrationConnectorGrid
          integrations={filtered}
          onOpen={setDetailItem}
          onToggleConnect={(item) => {
            if (item.status === "connected") {
              setDetailItem(item)
            } else {
              onConnect(item)
            }
          }}
        />
      )}

      <IntegrationDetailModal
        open={detailItem !== null}
        onOpenChange={(open) => !open && setDetailItem(null)}
        integration={detailItem}
        onConnect={() => {
          if (detailItem) onConnect(detailItem)
        }}
        onDisconnect={() => {
          if (detailItem) onDisconnect(detailItem.id)
        }}
        onTest={() => {
          if (detailItem) onTest(detailItem.id)
        }}
        isDisconnecting={detailItem ? disconnectingId === detailItem.id : false}
        isTesting={detailItem ? testingId === detailItem.id : false}
      />
    </div>
  )
}
