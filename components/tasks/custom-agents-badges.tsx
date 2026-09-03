"use client"

import { cn } from "@/lib/utils"

import { PIPELINE_STAGE_LABELS } from "@/constants/pipeline-template-roles"

const SLOT_LABEL = PIPELINE_STAGE_LABELS

function labelForSlot(slot: string): string {
  return SLOT_LABEL[slot.toLowerCase()] ?? slot
}

function shortId(id: string, max = 22): string {
  const s = id.trim()
  if (s.length <= max) return s
  return `${s.slice(0, max - 1)}…`
}

export interface CustomAgentsBadgesProps {
  templateIds?: Record<string, string> | null
  className?: string
  /** Smaller chips for dense layouts (e.g. task cards) */
  compact?: boolean
}

export function CustomAgentsBadges({ templateIds, className, compact }: CustomAgentsBadgesProps) {
  const entries = Object.entries(templateIds || {}).flatMap(([slot, raw]) => {
    const ids = String(raw || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    return ids.map((id) => [slot, id] as const)
  })
  if (entries.length === 0) return null

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <span
        className={cn(
          "font-medium text-amber/95 border border-amber/35 bg-amber/10",
          compact ? "text-[10px] px-1.5 py-0.5 rounded" : "text-xs px-2 py-0.5 rounded-md"
        )}
      >
        Custom agents
      </span>
      {entries.map(([slot, id]) => (
        <span
          key={`${slot}-${id}`}
          title={`${slot}: ${id}`}
          className={cn(
            "text-muted-foreground border border-border/70 bg-muted/30 font-mono",
            compact ? "text-[10px] px-1.5 py-0.5 rounded" : "text-[11px] px-2 py-0.5 rounded-md"
          )}
        >
          <span className="text-foreground/80 font-sans">{labelForSlot(slot)}</span>
          {" · "}
          {shortId(String(id))}
        </span>
      ))}
    </div>
  )
}
