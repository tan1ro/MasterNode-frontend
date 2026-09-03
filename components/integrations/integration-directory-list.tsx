"use client"

import { ChevronRight, CheckCircle2, CircleDashed, Settings2 } from "lucide-react"
import { IntegrationBrandIcon } from "@/components/integrations/integration-brand-icon"
import { getIntegrationMeta } from "@/constants/integration-directory"
import type { IntegrationCatalogItem, IntegrationStatus } from "@/types/api"
import { cn } from "@/lib/utils"

interface IntegrationDirectoryListProps {
  integrations: IntegrationCatalogItem[]
  onSelect: (id: string) => void
}

function StatusDot({ status }: { status: IntegrationStatus }) {
  if (status === "connected") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald">
        <CheckCircle2 className="h-3 w-3" aria-hidden />
        Connected
      </span>
    )
  }
  if (status === "setup_required") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber">
        <Settings2 className="h-3 w-3" aria-hidden />
        Setup required
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
      <CircleDashed className="h-3 w-3" aria-hidden />
      Not connected
    </span>
  )
}

export function IntegrationDirectoryList({ integrations, onSelect }: IntegrationDirectoryListProps) {
  return (
    <ul className="divide-y divide-border/60 rounded-xl border border-border/60 bg-muted/10 overflow-hidden">
      {integrations.map((item) => {
        const meta = getIntegrationMeta(item.id)
        const tagline = meta?.tagline ?? item.description
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item.id)}
              className={cn(
                "flex w-full items-center gap-4 px-4 py-4 text-left transition-colors",
                "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/40"
              )}
            >
              <IntegrationBrandIcon
                providerId={item.id}
                brandColor={item.brand_color}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-foreground">{item.name}</span>
                  <StatusDot status={item.status} />
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">{tagline}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            </button>
          </li>
        )
      })}
    </ul>
  )
}
