"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface IntegrationToolPillsProps {
  tools: string[]
  maxVisible?: number
  className?: string
}

export function IntegrationToolPills({
  tools,
  maxVisible = 8,
  className,
}: IntegrationToolPillsProps) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? tools : tools.slice(0, maxVisible)
  const hidden = Math.max(0, tools.length - maxVisible)

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {visible.map((tool) => (
        <span
          key={tool}
          className="inline-flex rounded-full border border-border/70 bg-muted/30 px-2.5 py-1 font-mono text-[11px] text-foreground/85"
        >
          {tool}
        </span>
      ))}
      {!expanded && hidden > 0 ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="inline-flex rounded-full border border-dashed border-border/70 px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-amber/40 transition-colors"
        >
          +{hidden} more
        </button>
      ) : null}
    </div>
  )
}
