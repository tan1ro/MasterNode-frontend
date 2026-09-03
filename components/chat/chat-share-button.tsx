"use client"

import React from "react"
import { Share2 } from "lucide-react"
import type { ChatMessage } from "@/types/api"
import { shareChatConversation } from "@/lib/chat-share"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export function ChatShareButton({
  conversationId,
  messages,
  title,
  disabled = false,
  className,
}: {
  conversationId: string
  messages: ChatMessage[]
  title?: string
  disabled?: boolean
  className?: string
}) {
  const { showToast, ToastSlot } = useToast()

  const handleShare = async () => {
    try {
      const result = await shareChatConversation(messages, conversationId, title)
      showToast(
        result === "shared" ? "Share link ready." : "Share link copied.",
        "success"
      )
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return
      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : "Could not share this chat."
      showToast(message, "error")
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void handleShare()}
        disabled={disabled}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3.5 py-2",
          "text-[13px] font-medium text-foreground shadow-sm backdrop-blur-sm transition-colors",
          "hover:bg-muted/60 disabled:opacity-50",
          className
        )}
      >
        <Share2 className="h-4 w-4 shrink-0" aria-hidden />
        Share
      </button>
      <ToastSlot />
    </>
  )
}
