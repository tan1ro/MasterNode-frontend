"use client"

import {
  INTEGRATION_CATEGORIES,
  INTEGRATION_STATUS_FILTERS,
  type IntegrationCategoryId,
  type IntegrationStatusFilter,
} from "@/constants/integration-categories"
import { cn } from "@/lib/utils"

interface IntegrationCategoryFiltersProps {
  category: IntegrationCategoryId
  onCategoryChange: (category: IntegrationCategoryId) => void
  statusFilter: IntegrationStatusFilter
  onStatusFilterChange: (status: IntegrationStatusFilter) => void
  categoryCounts?: Partial<Record<IntegrationCategoryId, number>>
  connectedCount?: number
  availableCount?: number
  className?: string
}

export function IntegrationCategoryFilters({
  category,
  onCategoryChange,
  statusFilter,
  onStatusFilterChange,
  categoryCounts,
  connectedCount,
  availableCount,
  className,
}: IntegrationCategoryFiltersProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Categories">
        {INTEGRATION_CATEGORIES.map((cat) => {
          const active = category === cat.id
          const count = categoryCounts?.[cat.id]
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onCategoryChange(cat.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "border-amber/40 bg-amber/10 text-amber"
                  : "border-border/70 bg-transparent text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              {cat.label}
              {typeof count === "number" ? (
                <span
                  className={cn(
                    "tabular-nums text-xs",
                    active ? "text-amber/80" : "text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      <div
        className="flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Connection status"
      >
        <span className="text-xs font-medium text-muted-foreground mr-1">Status</span>
        {INTEGRATION_STATUS_FILTERS.map((filter) => {
          const active = statusFilter === filter.id
          const count =
            filter.id === "connected"
              ? connectedCount
              : filter.id === "available"
                ? availableCount
                : undefined
          return (
            <button
              key={filter.id}
              type="button"
              aria-pressed={active}
              onClick={() => onStatusFilterChange(active ? "all" : filter.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                active
                  ? "border-border bg-muted/40 text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/25"
              )}
            >
              {filter.label}
              {typeof count === "number" ? (
                <span className="tabular-nums text-muted-foreground">{count}</span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
