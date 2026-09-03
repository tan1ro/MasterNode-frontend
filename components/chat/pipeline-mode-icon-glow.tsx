"use client"

import { Workflow } from "lucide-react"
import { cn } from "@/lib/utils"

type IconSize = "sm" | "md"

const ICON_SIZE: Record<IconSize, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
}

const INNER_PAD: Record<IconSize, string> = {
  sm: "p-0.5",
  md: "p-1",
}

interface PipelineModeIconGlowProps {
  size?: IconSize
  className?: string
  /** Match parent surface so the ring inner fill blends (menu popover vs page). */
  surface?: "background" | "popover" | "card"
}

export function PipelineModeIconGlow({
  size = "sm",
  className,
  surface = "background",
}: PipelineModeIconGlowProps) {
  const innerSurface =
    surface === "popover"
      ? "bg-popover"
      : surface === "card"
        ? "bg-card"
        : "bg-background"

  return (
    <span
      className={cn(
        "pipeline-mode-icon-glow inline-flex shrink-0 rounded-full",
        className
      )}
      aria-hidden
    >
      <span
        className={cn(
          "pipeline-mode-icon-glow__inner inline-flex items-center justify-center rounded-full",
          innerSurface,
          INNER_PAD[size]
        )}
      >
        <Workflow className={cn(ICON_SIZE[size], "pipeline-mode-icon-glow__icon shrink-0")} />
      </span>
    </span>
  )
}
