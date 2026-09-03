"use client"

import React, { useCallback, useState } from "react"
import { Check, Copy } from "lucide-react"
import { MessageActionTooltip } from "@/components/chat/message-action-tooltip"
import { plainTextFromChatContent } from "@/lib/chat-markdown"
import { cn } from "@/lib/utils"

interface CopyMessageButtonProps {
  text: string
  className?: string
  disabled?: boolean
  onCopied?: () => void
}

export function CopyMessageButton({ text, className, disabled, onCopied }: CopyMessageButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    const payload = plainTextFromChatContent(text).trim()
    if (!payload) return
    try {
      await navigator.clipboard.writeText(payload)
      setCopied(true)
      onCopied?.()
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard may be unavailable outside a secure context.
    }
  }, [text])

  const label = copied ? "Copied" : "Copy"

  return (
    <MessageActionTooltip actionLabel={label}>
      <button
        type="button"
        onClick={() => void handleCopy()}
        disabled={disabled || !text.trim()}
        aria-label={label}
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-md",
          "text-muted-foreground transition-colors",
          "hover:bg-muted/80 hover:text-foreground",
          "disabled:pointer-events-none disabled:opacity-35",
          className
        )}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden />
        ) : (
          <Copy className="h-3.5 w-3.5 shrink-0" aria-hidden />
        )}
      </button>
    </MessageActionTooltip>
  )
}
