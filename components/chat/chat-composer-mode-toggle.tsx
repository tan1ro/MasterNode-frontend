"use client"

import { Code2, MessagesSquare } from "lucide-react"
import { cn } from "@/lib/utils"

export type ComposerShellMode = "chat" | "pipeline"

interface ChatComposerModeToggleProps {
  mode: ComposerShellMode
  onChange: (mode: ComposerShellMode) => void
  className?: string
}

const toggleButtonClass = (active: boolean) =>
  cn(
    "inline-flex h-7 w-8 shrink-0 items-center justify-center rounded-md p-0 leading-none",
    "transition-colors",
    active
      ? "bg-background text-foreground shadow-sm dark:bg-white/[0.12]"
      : "text-muted-foreground hover:text-foreground"
  )

/** Claude-style Chat / Pipeline segmented control for the sidebar header. */
export function ChatComposerModeToggle({ mode, onChange, className }: ChatComposerModeToggleProps) {
  return (
    <div
      role="group"
      aria-label="Composer mode"
      data-mn-composer-mode-toggle=""
      className={cn(
        "box-border inline-flex h-8 shrink-0 items-center self-center rounded-lg bg-muted/45 p-px",
        "border border-border/40 dark:border-white/[0.06]",
        className
      )}
    >
      <button
        type="button"
        aria-pressed={mode === "chat"}
        aria-label="Chat mode"
        title="Chat"
        onClick={() => onChange("chat")}
        className={toggleButtonClass(mode === "chat")}
      >
        <MessagesSquare className="block h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
      </button>
      <button
        type="button"
        aria-pressed={mode === "pipeline"}
        aria-label="Pipeline mode"
        title="Pipeline"
        onClick={() => onChange("pipeline")}
        className={toggleButtonClass(mode === "pipeline")}
      >
        <Code2 className="block h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
      </button>
    </div>
  )
}
