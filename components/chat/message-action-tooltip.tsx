"use client"

import React, { type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface MessageActionTooltipProps {
  actionLabel: string
  children: ReactNode
  className?: string
}

/** Tooltip above icon buttons — action name only (timestamp shown inline beside icons). */
export function MessageActionTooltip({
  actionLabel,
  children,
  className,
}: MessageActionTooltipProps) {
  return (
    <div className={cn("group/msg-tip relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute bottom-full left-1/2 z-[80] mb-2 -translate-x-1/2",
          "whitespace-nowrap rounded-md border border-border/60 bg-popover px-2.5 py-1.5",
          "text-center text-xs font-medium text-popover-foreground shadow-md opacity-0 scale-95",
          "transition-[opacity,transform] duration-150",
          "group-hover/msg-tip:opacity-100 group-hover/msg-tip:scale-100",
          "group-focus-within/msg-tip:opacity-100 group-focus-within/msg-tip:scale-100"
        )}
      >
        {actionLabel}
      </span>
    </div>
  )
}
