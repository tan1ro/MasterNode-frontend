"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Plug } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ApiErrorCallout } from "@/components/shared/api-error-callout"
import {
  IntegrationCategoryFilters,
  IntegrationConnectDialog,
  IntegrationConnectorGrid,
  IntegrationDetailModal,
} from "@/components/integrations"
import {
  countIntegrationsByCategory,
  type IntegrationCategoryId,
  type IntegrationStatusFilter,
} from "@/constants/integration-categories"
import { useIntegrationsHub } from "@/hooks/use-integrations-hub"
import { filterIntegrations } from "@/lib/integration-filters"
import { ROUTES } from "@/lib/routes"
import type { IntegrationCatalogItem } from "@/types/api"

interface IntegrationsHubPanelProps {
  /** When true, show category filters and cap grid size with link to full directory. */
  compact?: boolean
}

export function IntegrationsHubPanel({ compact = false }: IntegrationsHubPanelProps) {
  const hub = useIntegrationsHub()
  const [detailItem, setDetailItem] = useState<IntegrationCatalogItem | null>(null)
  const [category, setCategory] = useState<IntegrationCategoryId>("all")
  const [statusFilter, setStatusFilter] = useState<IntegrationStatusFilter>("all")

  const providerIds = useMemo(() => hub.integrations.map((item) => item.id), [hub.integrations])
  const categoryCounts = useMemo(() => countIntegrationsByCategory(providerIds), [providerIds])

  const filtered = useMemo(() => {
    const base = filterIntegrations(hub.integrations, { category, statusFilter })
    if (!compact) return base
    const connected = base.filter((item) => item.status === "connected")
    const rest = base.filter((item) => item.status !== "connected")
    return [...connected, ...rest].slice(0, 8)
  }, [hub.integrations, category, statusFilter, compact])

  const availableCount = useMemo(
    () => hub.integrations.filter((item) => item.status !== "connected").length,
    [hub.integrations]
  )

  return (
    <>
      <Card id="integrations" variant="minimal" interactive={false} className="scroll-mt-24">
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <Plug className="h-5 w-5 text-amber mt-0.5" aria-hidden />
              <div>
                <CardTitle className="text-lg font-semibold">Connected apps</CardTitle>
                <CardDescription>
                  Link Notion, Google Drive, Slack, GitHub, and more. Connected apps are available
                  via MCP (<span className="font-mono text-xs">integration_invoke</span>) and agents.
                </CardDescription>
              </div>
            </div>
            {compact ? (
              <Link
                href={ROUTES.integrations}
                className="text-sm text-amber hover:underline shrink-0"
              >
                View all {hub.integrations.length} connectors →
              </Link>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          {hub.notice ? (
            <p
              className={
                hub.notice.variant === "success"
                  ? "text-sm text-emerald"
                  : "text-sm text-destructive"
              }
              role="status"
            >
              {hub.notice.text}
            </p>
          ) : null}

          {hub.isError ? (
            <ApiErrorCallout error={hub.error} />
          ) : hub.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading connectors…</p>
          ) : (
            <>
              <IntegrationCategoryFilters
                category={category}
                onCategoryChange={setCategory}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                categoryCounts={categoryCounts}
                connectedCount={hub.connectedCount}
                availableCount={availableCount}
              />
              <p className="text-sm text-muted-foreground">
                {hub.connectedCount} connected · {hub.integrations.length} available
                {compact && filtered.length < hub.integrations.length
                  ? ` · showing ${filtered.length}`
                  : ""}
              </p>
              <IntegrationConnectorGrid
                integrations={filtered}
                onOpen={setDetailItem}
                onToggleConnect={(item) => {
                  if (item.status === "connected") {
                    setDetailItem(item)
                  } else {
                    hub.openConnect(item)
                  }
                }}
              />
            </>
          )}
        </CardContent>
      </Card>

      <IntegrationDetailModal
        open={detailItem !== null}
        onOpenChange={(open) => !open && setDetailItem(null)}
        integration={detailItem}
        onConnect={() => {
          if (detailItem) hub.openConnect(detailItem)
        }}
        onDisconnect={() => {
          if (detailItem) void hub.handleDisconnect(detailItem.id)
        }}
        onTest={() => {
          if (detailItem) void hub.handleTest(detailItem.id)
        }}
        isDisconnecting={
          hub.disconnectMutation.isPending
            ? hub.disconnectMutation.variables === detailItem?.id
            : false
        }
        isTesting={hub.testingProvider === detailItem?.id}
      />

      <IntegrationConnectDialog
        open={hub.dialogOpen}
        onOpenChange={hub.setDialogOpen}
        integration={hub.activeIntegration}
        isPending={hub.connectMutation.isPending}
        error={hub.connectMutation.error}
        onConnectWebhook={(url, name, notify) =>
          void hub.handleConnectWebhook(url, name, notify)
        }
        onConnectToken={(token, extras) => void hub.handleConnectToken(token, extras)}
        onConnectOAuth={() => void hub.handleConnectOAuth()}
      />
    </>
  )
}
