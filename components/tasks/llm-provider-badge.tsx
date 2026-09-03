"use client"

import { cn } from "@/lib/utils"
import { isDefaultProviderLabel } from "@/lib/task-stage-metrics"
import type { AgentStageEntry } from "@/lib/parallel-agent-labels"
import { formatAgentStageEntryLabel } from "@/lib/parallel-agent-labels"

export function LlmProviderBadge({
  provider,
  showAutoRoute = true,
  className,
}: {
  provider: string
  showAutoRoute?: boolean
  className?: string
}) {
  const isDefault = isDefaultProviderLabel(provider)

  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1.5", className)}>
      <span
        className={cn(
          "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-semibold tracking-wide",
          isDefault
            ? "border-border/60 bg-muted/30 text-muted-foreground"
            : "border-cyan/30 bg-cyan/10 text-cyan"
        )}
      >
        {provider}
      </span>
      {isDefault && showAutoRoute ? (
        <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
          Auto route
        </span>
      ) : null}
    </span>
  )
}

export function LlmStagePills({
  entries,
  className,
}: {
  entries: AgentStageEntry[]
  className?: string
}) {
  if (entries.length === 0) return null

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {entries.map((entry) => {
        const pillClass =
          entry.kind === "pipeline"
            ? "border-violet/25 bg-violet/10 text-violet"
            : entry.kind === "repair"
              ? "border-rose/25 bg-rose/10 text-rose"
              : "border-amber/25 bg-amber/10 text-amber"

        return (
          <div
            key={entry.id}
            className={cn(
              "rounded-md border px-2 py-1.5 text-[11px] leading-snug",
              pillClass
            )}
            title={formatAgentStageEntryLabel(entry)}
          >
            <p className="font-semibold">{entry.title}</p>
            {entry.detail ? (
              <p className="mt-0.5 font-normal opacity-90 line-clamp-2">{entry.detail}</p>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
