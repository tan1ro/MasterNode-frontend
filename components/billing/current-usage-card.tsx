"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlanUsageMeter } from "@/components/billing/plan-usage-meter"
import { useAppearancePrefs } from "@/hooks/use-appearance-prefs"
import type { PlanUsageSnapshot } from "@/lib/plan-usage"
import { cn } from "@/lib/utils"

export interface CurrentUsageCardProps {
  title?: string
  description?: string
  totalTasks?: number
  totalTokens?: number
  totalComputeMs?: number
  sourceLabel?: string
  isLoading?: boolean
  monthlyUsage?: PlanUsageSnapshot | null
}

export function CurrentUsageCard({
  title = "Current Usage",
  description,
  totalTasks = 0,
  totalTokens = 0,
  totalComputeMs = 0,
  sourceLabel = "selected",
  isLoading,
  monthlyUsage,
}: CurrentUsageCardProps) {
  const { showTokenCostHints } = useAppearancePrefs()
  const resolvedDescription =
    description ?? `Totals for the selected date range (${sourceLabel} task runs)`

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{resolvedDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {monthlyUsage && !monthlyUsage.isUnlimited ? (
          <div className="rounded-xl border border-border/60 bg-muted/15 p-5">
            <PlanUsageMeter usage={monthlyUsage} label="Plan usage this month" />
          </div>
        ) : null}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <dl className={cn("grid gap-4 text-sm", showTokenCostHints ? "sm:grid-cols-3" : "sm:grid-cols-1")}>
            <div className="rounded-xl border border-border/60 bg-muted/30 p-5">
              <dt className="text-muted-foreground text-xs uppercase tracking-wide">Tasks</dt>
              <dd className="mt-2 text-3xl font-semibold tabular-nums">{totalTasks}</dd>
            </div>
            {showTokenCostHints ? (
              <>
                <div className="rounded-xl border border-border/60 bg-muted/30 p-5">
                  <dt className="text-muted-foreground text-xs uppercase tracking-wide">Tokens</dt>
                  <dd className="mt-2 text-3xl font-semibold tabular-nums">{totalTokens.toLocaleString()}</dd>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/30 p-5">
                  <dt className="text-muted-foreground text-xs uppercase tracking-wide">Compute</dt>
                  <dd className="mt-2 text-3xl font-semibold tabular-nums">
                    {totalComputeMs >= 1000 ? `${(totalComputeMs / 1000).toFixed(1)}s` : `${totalComputeMs}ms`}
                  </dd>
                </div>
              </>
            ) : null}
          </dl>
        )}
      </CardContent>
    </Card>
  )
}
