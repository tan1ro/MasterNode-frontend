"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export interface SubscriptionPlanCardProps {
  taskCount?: number
  totalTokens?: number
  totalCostUsd?: number
  region?: string
  source?: string
  isLoading?: boolean
  /** Shown when wallet workspace is not resolved yet */
  waitingForWorkspace?: boolean
}

export function SubscriptionPlanCard({
  taskCount = 0,
  totalTokens = 0,
  totalCostUsd = 0,
  region,
  source,
  isLoading,
  waitingForWorkspace,
}: SubscriptionPlanCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API key usage</CardTitle>
        <CardDescription>
          LLM cost accrued on your active API key — same prepaid wallet as above. Browser-only chat runs are tracked
          separately in the charts when filtered to Website.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {waitingForWorkspace ? (
          <p className="text-sm text-muted-foreground">Create or select an API key to see workspace usage.</p>
        ) : isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">API tasks</span>
                <span className="font-medium tabular-nums">{taskCount}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Tokens</span>
                <span className="font-medium tabular-nums">{totalTokens.toLocaleString()}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Est. cost (USD)</span>
                <span className="font-medium tabular-nums">${totalCostUsd.toFixed(4)}</span>
              </div>
              {region && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Region</span>
                  <span className="font-medium">{region}</span>
                </div>
              )}
              {source && (
                <p className="text-[10px] text-muted-foreground pt-1">Source: {source}</p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
