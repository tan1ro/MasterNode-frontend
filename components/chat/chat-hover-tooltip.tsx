"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ChatHoverTooltipProps {
  label: string
  description?: string
  children: ReactNode
  className?: string
  /** Tooltip placement relative to trigger. */
  side?: "top" | "bottom" | "left" | "right"
  /** Cross-axis alignment when `side` is left/right (use `end` for top-corner controls). */
  align?: "center" | "start" | "end"
  /** Fine-tune position (e.g. `translate-y-3` to nudge downward). */
  offsetClass?: string
}

/** Rich hover tooltip for chat chrome controls (incognito, pipeline, etc.). */
export function ChatHoverTooltip({
  label,
  description,
  children,
  className,
  side = "bottom",
  align = "center",
  offsetClass,
}: ChatHoverTooltipProps) {
  const rich = Boolean(description?.trim())
  const positionClass =
    side === "top"
      ? align === "start"
        ? "bottom-full left-0 mb-2"
        : align === "end"
          ? "bottom-full right-0 mb-2"
          : "bottom-full left-1/2 mb-2 -translate-x-1/2"
      : side === "left"
        ? align === "start"
          ? "right-full top-0 mr-2"
          : align === "end"
            ? "right-full bottom-0 mr-2"
            : "right-full top-1/2 mr-2 -translate-y-1/2"
        : side === "right"
          ? align === "start"
            ? "left-full top-0 ml-2"
            : align === "end"
              ? "left-full bottom-0 ml-2"
              : "left-full top-1/2 ml-2 -translate-y-1/2"
          : align === "start"
            ? "top-full left-0 mt-2"
            : align === "end"
              ? "top-full right-0 mt-2"
              : "top-full left-1/2 mt-2 -translate-x-1/2"

  return (
    <div className={cn("group/chat-tip relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-[120]",
          positionClass,
          offsetClass
        )}
      >
        <span
          className={cn(
            "block rounded-lg border border-border/70 bg-card text-card-foreground shadow-xl",
            "opacity-0 scale-95 transition-[opacity,transform] duration-150",
            "group-hover/chat-tip:opacity-100 group-hover/chat-tip:scale-100",
            "group-focus-within/chat-tip:opacity-100 group-focus-within/chat-tip:scale-100",
            rich
              ? "w-[min(16rem,calc(100vw-2rem))] px-3 py-2.5 text-left whitespace-normal"
              : "whitespace-nowrap px-2.5 py-1.5 text-xs font-medium"
          )}
        >
          <span className={cn("block", rich ? "text-sm font-semibold text-foreground" : "")}>
            {label}
          </span>
          {rich ? (
            <span className="mt-1 block text-xs leading-relaxed text-foreground/85">
              {description}
            </span>
          ) : null}
        </span>
      </span>
    </div>
  )
}
