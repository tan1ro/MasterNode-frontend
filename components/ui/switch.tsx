"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  id?: string
  className?: string
  size?: "sm" | "md"
  "aria-label"?: string
}

const sizeStyles = {
  sm: {
    track: "h-5 w-9",
    thumb: "h-3.5 w-3.5",
    on: "translate-x-[1.125rem]",
    off: "translate-x-0.5",
  },
  md: {
    track: "h-6 w-11",
    thumb: "h-4 w-4",
    on: "translate-x-5",
    off: "translate-x-1",
  },
} as const

export function Switch({
  checked,
  onCheckedChange,
  disabled,
  id,
  className,
  size = "md",
  "aria-label": ariaLabel,
}: SwitchProps) {
  const styles = sizeStyles[size]

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex shrink-0 items-center rounded-full border transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        styles.track,
        checked
          ? "border-amber/60 bg-amber shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
          : "border-border/70 bg-muted/80 hover:bg-muted",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block rounded-full bg-background shadow-sm ring-1 ring-black/5 transition-transform duration-200 ease-out dark:ring-white/10",
          styles.thumb,
          checked ? styles.on : styles.off
        )}
      />
    </button>
  )
}
