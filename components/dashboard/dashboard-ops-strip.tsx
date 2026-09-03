"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/routes"
import type { HealthResponse } from "@/types/api"

interface DashboardOpsStripProps {
  health: HealthResponse | undefined
  isLoading: boolean
  error: Error | null
}

export function DashboardOpsStrip({ health, isLoading, error }: DashboardOpsStripProps) {
  const online = health?.online_count ?? 0
  const total = health?.total_count ?? 0
  const components = health?.components ?? []
  const offline = components.filter((c) => !c.online)

  return (
    <Card accent="sky" interactive={false} className="border-border/50 shadow-sm">
      <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium font-heading tracking-wide">System status</p>
          <p className="text-xs text-muted-foreground mt-0.5">Superuser — pipeline services overview</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {error ? (
            <span className="text-xs text-destructive">{error.message}</span>
          ) : (
            <span
              className={cn(
                "text-sm font-mono font-semibold tabular-nums",
                total > 0 && online === total && "text-emerald",
                total > 0 && online < total && "text-amber"
              )}
            >
              {isLoading ? "…" : total > 0 ? `${online}/${total} online` : "—"}
            </span>
          )}
          {!isLoading && offline.length > 0 ? (
            <span className="text-xs text-destructive truncate max-w-[200px] sm:max-w-xs" title={offline.map((c) => c.label).join(", ")}>
              Offline: {offline.map((c) => c.label).join(", ")}
            </span>
          ) : null}
          <Link href={ROUTES.settings} className="text-xs font-medium text-amber hover:underline shrink-0">
            Settings
          </Link>
          <Link href={ROUTES.apiKeys} className="text-xs font-medium text-amber hover:underline shrink-0">
            API keys
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
