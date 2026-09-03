"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { clientChannelLabel } from "@/constants/client-channel"
import { useAppearancePrefs } from "@/hooks/use-appearance-prefs"
import { useLocaleDisplayPrefs } from "@/hooks/use-locale-display-prefs"
import { formatUserDateTime } from "@/lib/datetime-local"
import type { UsageRecord } from "@/types/api"

interface RecentUsageCardProps {
  records: UsageRecord[]
  isLoading: boolean
}

export function RecentUsageCard({ records, isLoading }: RecentUsageCardProps) {
  const { showTokenCostHints } = useAppearancePrefs()
  useLocaleDisplayPrefs()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Usage</CardTitle>
        <CardDescription>Latest usage records</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : records.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {records.slice(0, 10).map((record) => (
              <div
                key={record.usage_id}
                className="p-3 border border-border/50 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {showTokenCostHints ? (
                      <p className="text-sm font-medium">
                        {record.tokens_used?.toLocaleString() || 0} tokens
                      </p>
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                      {formatUserDateTime(record.created_at, { second: undefined })}
                    </p>
                    {record.task_id && (
                      <p className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-2">
                        <span>
                          Task: {record.task_id.slice(0, 8)}...
                        </span>
                        {record.client_channel && (
                          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                            {clientChannelLabel(record.client_channel)}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  {showTokenCostHints ? (
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        ${record.cost_usd?.toFixed(4) || "0.0000"}
                      </p>
                      {record.compute_time_ms ? (
                        <p className="text-xs text-muted-foreground">
                          {(record.compute_time_ms / 1000).toFixed(2)}s
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No usage records yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Start creating tasks to see usage data
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
