"use client"

import { Check, Plus } from "lucide-react"
import { IntegrationBrandIcon } from "@/components/integrations/integration-brand-icon"
import { getCategoryLabel, getIntegrationCategory } from "@/constants/integration-categories"
import { getIntegrationMeta } from "@/constants/integration-directory"
import type { IntegrationCatalogItem } from "@/types/api"
import { cn } from "@/lib/utils"

interface IntegrationConnectorGridProps {
  integrations: IntegrationCatalogItem[]
  onOpen: (item: IntegrationCatalogItem) => void
  onToggleConnect: (item: IntegrationCatalogItem) => void
}

export function IntegrationConnectorGrid({
  integrations,
  onOpen,
  onToggleConnect,
}: IntegrationConnectorGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {integrations.map((item) => {
        const meta = getIntegrationMeta(item.id)
        const connected = item.status === "connected"
        const blurb = meta?.tagline ?? item.description
        const categoryId = getIntegrationCategory(item.id)
        const categoryLabel =
          categoryId !== "all" ? getCategoryLabel(categoryId) : null

        return (
          <article
            key={item.id}
            className={cn(
              "group relative flex items-start gap-3 rounded-xl border border-border/60 bg-muted/10 p-4",
              "hover:border-amber/35 hover:bg-muted/25 transition-colors"
            )}
          >
            <button
              type="button"
              onClick={() => onOpen(item)}
              className="flex min-w-0 flex-1 items-start gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/40 rounded-lg"
            >
              <IntegrationBrandIcon
                providerId={item.id}
                brandColor={item.brand_color}
                size="md"
              />
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-foreground">{item.name}</h3>
                  {connected ? (
                    <span className="rounded-full bg-emerald/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald">
                      Connected
                    </span>
                  ) : item.status === "setup_required" ? (
                    <span className="rounded-full bg-amber/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber">
                      Setup
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{blurb}</p>
                {categoryLabel ? (
                  <span className="mt-2 inline-flex rounded-full border border-border/50 bg-muted/20 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {categoryLabel}
                  </span>
                ) : null}
              </div>
            </button>
            <button
              type="button"
              aria-label={connected ? `Manage ${item.name}` : `Connect ${item.name}`}
              onClick={(e) => {
                e.stopPropagation()
                onToggleConnect(item)
              }}
              className={cn(
                "shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
                connected
                  ? "border-emerald/40 bg-emerald/10 text-emerald hover:bg-emerald/20"
                  : "border-border/70 bg-background text-muted-foreground hover:border-amber/40 hover:text-amber"
              )}
            >
              {connected ? (
                <Check className="h-4 w-4" aria-hidden />
              ) : (
                <Plus className="h-4 w-4" aria-hidden />
              )}
            </button>
          </article>
        )
      })}
    </div>
  )
}
