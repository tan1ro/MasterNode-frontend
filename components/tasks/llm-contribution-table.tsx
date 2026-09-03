"use client"

import { cn } from "@/lib/utils"
import type { LlmContributionRow } from "@/lib/task-stage-metrics"
import { LlmProviderBadge, LlmStagePills } from "@/components/tasks/llm-provider-badge"

interface LlmContributionTableProps {
  rows: LlmContributionRow[]
  /** True when metrics include per-stage provider call attribution. */
  stageAttributionAvailable?: boolean
  className?: string
}

export function LlmContributionTable({
  rows,
  stageAttributionAvailable = false,
  className,
}: LlmContributionTableProps) {
  if (rows.length === 0) return null

  return (
    <div className={cn("overflow-x-auto rounded-lg border border-border/50", className)}>
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border/50 bg-muted/40 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <th className="px-3 py-2">Provider</th>
            <th className="px-3 py-2 min-w-[12rem]">Used at stages</th>
            <th className="px-3 py-2 w-16">Stages</th>
            <th className="px-3 py-2 w-20">Time (s)</th>
            <th className="px-3 py-2">Share</th>
            <th className="px-3 py-2 w-24">API calls</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.provider}
              className={cn(
                "border-b border-border/30 align-top last:border-0",
                row.isDefault && "bg-muted/15"
              )}
            >
              <td className="px-3 py-2.5">
                <LlmProviderBadge provider={row.provider} />
              </td>
              <td className="px-3 py-2.5">
                {row.stageEntries.length > 0 ? (
                  <LlmStagePills entries={row.stageEntries} />
                ) : row.llmCalls > 0 ? (
                  <span className="text-xs text-muted-foreground">
                    {stageAttributionAvailable
                      ? "No per-stage attribution in saved metrics — re-run task after upgrade"
                      : "API usage only — stage not recorded"}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-3 py-2.5 tabular-nums text-muted-foreground">{row.stages}</td>
              <td className="px-3 py-2.5 tabular-nums text-muted-foreground">{row.seconds}</td>
              <td className="px-3 py-2.5 tabular-nums text-muted-foreground">{row.shareLabel}</td>
              <td className="px-3 py-2.5 tabular-nums text-muted-foreground">
                {row.isDefault ? "—" : row.llmCalls > 0 ? row.llmCalls : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
