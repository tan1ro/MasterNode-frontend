"use client"

import React from "react"
import { chatSuggestionPillClass } from "@/lib/chat-suggestion-styles"
import { cn } from "@/lib/utils"

interface ChatMessageFollowUpsProps {
  suggestions: string[]
  onPick: (prompt: string) => void
  disabled?: boolean
  className?: string
}

/** Right-aligned follow-up pills below the message action row. */
export function ChatMessageFollowUps({
  suggestions,
  onPick,
  disabled,
  className,
}: ChatMessageFollowUpsProps) {
  if (suggestions.length === 0) return null

  return (
    <div className={cn("mt-3 flex flex-wrap justify-end gap-2", className)}>
      {suggestions.map((label) => (
        <button
          key={label}
          type="button"
          disabled={disabled}
          onClick={() => onPick(label)}
          className={cn(chatSuggestionPillClass)}
        >
          <span className="truncate">{label}</span>
        </button>
      ))}
    </div>
  )
}
