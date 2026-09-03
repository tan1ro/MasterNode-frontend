"use client"

import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from "react"
import { cn } from "@/lib/utils"

interface ChatSidePanelResizeHandleProps {
  isDragging: boolean
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void
  onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void
  /** Positive delta widens the right-hand panel (ArrowLeft). */
  onNudge?: (delta: number) => void
  className?: string
}

/** Claude-style vertical grip on the left edge of a right-hand chat side panel. */
export function ChatSidePanelResizeHandle({
  isDragging,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onNudge,
  className,
}: ChatSidePanelResizeHandleProps) {
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!onNudge) return
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      onNudge(24)
    } else if (event.key === "ArrowRight") {
      event.preventDefault()
      onNudge(-24)
    }
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize preview panel"
      aria-valuetext="Drag to resize"
      tabIndex={0}
      className={cn(
        "group/resize absolute inset-y-0 left-0 z-20 hidden w-3 -translate-x-1/2 cursor-col-resize touch-none lg:flex",
        "items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-cyan/40",
        className
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border/70 transition-colors",
          isDragging && "bg-cyan/50",
          "group-hover/resize:bg-cyan/40"
        )}
      />
      <span
        aria-hidden
        className={cn(
          "pointer-events-none relative z-[1] h-9 w-[3px] rounded-full bg-cyan/75 shadow-sm transition-[height,background-color,opacity]",
          "opacity-80 group-hover/resize:opacity-100 group-hover/resize:h-11",
          isDragging && "h-11 bg-cyan opacity-100"
        )}
      />
    </div>
  )
}
