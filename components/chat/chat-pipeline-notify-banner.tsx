"use client"

import { Bell, Workflow, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatPipelineNotifyBannerProps {
  /** When the user left the pipeline chat before answering. */
  switchedChat?: boolean
  onYes: () => void
  onNo: () => void
  className?: string
}

export function ChatPipelineNotifyBanner({
  switchedChat = false,
  onYes,
  onNo,
  className,
}: ChatPipelineNotifyBannerProps) {
  return (
    <div
      className={cn(
        "relative z-30 rounded-2xl border border-sky-500/40 bg-card px-4 py-3 shadow-md",
        className
      )}
      role="status"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500/20">
          {switchedChat ? (
            <Bell className="h-4 w-4 text-sky-700 dark:text-sky-300" aria-hidden />
          ) : (
            <Workflow className="h-4 w-4 text-sky-700 dark:text-sky-300" aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">
            {switchedChat
              ? "Still generating in your other chat"
              : "Generating your response"}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {switchedChat
              ? "Your pipeline is still running in another conversation. We can let you know once the response is ready — notify you?"
              : "This may take a few minutes. Switch chats freely — we can let you know once your response is ready."}
          </p>
          <div className="relative z-10 mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onYes()
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-500"
            >
              <Bell className="h-3.5 w-3.5" aria-hidden />
              Yes, notify me
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onNo()
              }}
              className="inline-flex items-center rounded-lg border border-border/60 bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/80"
            >
              No thanks
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onNo()
          }}
          className="relative z-10 shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}
