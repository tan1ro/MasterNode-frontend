"use client"

import React, { useEffect, useState } from "react"
import { ThumbsDown, ThumbsUp, X } from "lucide-react"
import type { ChatMessage } from "@/types/api"
import { getActiveResponseVersion } from "@/lib/chat-response-versions"
import { CHAT_DOCK_PILL_CLASS } from "@/constants/chat-layout"
import { isAssistantErrorMessage } from "@/lib/chat-stream-errors"
import { cn } from "@/lib/utils"

const STORAGE_PREFIX = "chat-helpful-dismissed:"

function feedbackStorageKey(conversationId: string | null): string {
  return `${STORAGE_PREFIX}${conversationId || "draft"}`
}

export function shouldShowConversationFeedback(options: {
  messages: ChatMessage[]
  isStreaming?: boolean
  regeneratingMessageId?: string | null
}): boolean {
  const { messages, isStreaming = false, regeneratingMessageId = null } = options
  if (isStreaming) return false

  let lastAssistant: ChatMessage | null = null
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].role === "assistant") {
      lastAssistant = messages[i]
      break
    }
  }
  if (!lastAssistant) return false
  if (regeneratingMessageId === lastAssistant.message_id) return false
  if (lastAssistant.metadata?.moderation_notice) return false
  if (lastAssistant.metadata?.task_id) return false

  const content = getActiveResponseVersion(lastAssistant).content.trim()
  if (isAssistantErrorMessage(content)) return false
  if (lastAssistant.metadata?.stream_error) return false
  return content.length > 0
}

export function ChatConversationFeedback({
  conversationId,
  className,
}: {
  conversationId?: string | null
  className?: string
}) {
  const [dismissed, setDismissed] = useState(true)
  const [rating, setRating] = useState<"up" | "down" | null>(null)

  useEffect(() => {
    const key = feedbackStorageKey(conversationId)
    try {
      setDismissed(window.localStorage.getItem(key) === "1")
    } catch {
      setDismissed(false)
    }
  }, [conversationId])

  const dismiss = () => {
    const key = feedbackStorageKey(conversationId)
    try {
      window.localStorage.setItem(key, "1")
    } catch {
      // ignore
    }
    setDismissed(true)
  }

  if (dismissed) return null

  return (
    <div className={cn("flex w-full justify-center px-4", className)}>
      <div
        role="group"
        aria-label="Conversation feedback"
        className={cn(
          CHAT_DOCK_PILL_CLASS,
          "max-w-[calc(100vw-2rem)] gap-2 pr-2"
        )}
      >
      <span className="min-w-0 truncate leading-none">
        Is this conversation helpful so far?
      </span>
      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          aria-label="Yes, helpful"
          aria-pressed={rating === "up"}
          onClick={() => setRating((prev) => (prev === "up" ? null : "up"))}
          className={cn(
            "inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors",
            "hover:bg-muted/80 hover:text-foreground",
            rating === "up" && "bg-muted/80 text-foreground"
          )}
        >
          <ThumbsUp
            className={cn(
              "h-3.5 w-3.5",
              rating === "up" ? "fill-current stroke-current" : "fill-none"
            )}
            strokeWidth={rating === "up" ? 1.75 : 2}
            aria-hidden
          />
        </button>
        <button
          type="button"
          aria-label="No, not helpful"
          aria-pressed={rating === "down"}
          onClick={() => setRating((prev) => (prev === "down" ? null : "down"))}
          className={cn(
            "inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors",
            "hover:bg-muted/80 hover:text-foreground",
            rating === "down" && "bg-muted/80 text-foreground"
          )}
        >
          <ThumbsDown
            className={cn(
              "h-3.5 w-3.5",
              rating === "down" ? "fill-current stroke-current" : "fill-none"
            )}
            strokeWidth={rating === "down" ? 1.75 : 2}
            aria-hidden
          />
        </button>
        <span className="mx-0.5 h-3.5 w-px shrink-0 bg-border/60" aria-hidden />
        <button
          type="button"
          aria-label="Dismiss feedback"
          onClick={dismiss}
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted/80 hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
      </div>
    </div>
  )
}
