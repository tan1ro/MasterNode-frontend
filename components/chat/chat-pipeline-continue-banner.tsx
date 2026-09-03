"use client"

import { Workflow, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatPipelineContinueBannerProps {
  onContinue: () => void
  onSwitchToQuickChat: () => void
  className?: string
}

/** Shown once after a pipeline run finishes — not on every message. */
export function ChatPipelineContinueBanner({
  onContinue,
  onSwitchToQuickChat,
  className,
}: ChatPipelineContinueBannerProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 shadow-sm",
        className
      )}
      role="status"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
          <Workflow className="h-4 w-4 text-amber-700 dark:text-amber-300" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">Continue in pipeline mode?</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            Your pipeline run finished. Keep pipeline mode on for the next multi-step task, or switch
            back to quick chat for faster replies.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onContinue}
              className="inline-flex items-center rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-amber-950 hover:bg-amber-400"
            >
              Stay in pipeline mode
            </button>
            <button
              type="button"
              onClick={onSwitchToQuickChat}
              className="inline-flex items-center rounded-lg border border-border/60 bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/60"
            >
              Use quick chat
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={onSwitchToQuickChat}
          className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
