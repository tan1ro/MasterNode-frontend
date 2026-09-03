"use client"

import { Globe, ImageIcon, Pencil } from "lucide-react"
import {
  chatSuggestionPillIconClass,
  chatSuggestionPillWithIconClass,
} from "@/lib/chat-suggestion-styles"
import { cn } from "@/lib/utils"

const INCOGNITO_SUGGESTIONS = [
  {
    label: "Write or edit",
    icon: Pencil,
    prompt: "Help me write and refine a short professional email.",
  },
  {
    label: "Create an image",
    icon: ImageIcon,
    prompt: "Describe a creative image concept I could generate for a tech startup.",
  },
  {
    label: "Look something up",
    icon: Globe,
    prompt: "Tell me about the latest developments in AI agent orchestration.",
  },
] as const

interface ChatIncognitoSuggestionsProps {
  disabled?: boolean
  onPick: (prompt: string) => void
  className?: string
}

export function ChatIncognitoSuggestions({
  disabled,
  onPick,
  className,
}: ChatIncognitoSuggestionsProps) {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-center",
        className
      )}
    >
      {INCOGNITO_SUGGESTIONS.map(({ label, icon: Icon, prompt }, index) => {
        const isLastOdd =
          index === INCOGNITO_SUGGESTIONS.length - 1 && INCOGNITO_SUGGESTIONS.length % 2 === 1
        return (
          <button
            key={label}
            type="button"
            disabled={disabled}
            onClick={() => onPick(prompt)}
            className={cn(
              chatSuggestionPillWithIconClass,
              "w-full justify-center sm:w-auto",
              isLastOdd && "col-span-2 mx-auto w-auto min-w-[11rem] sm:col-span-1 sm:mx-0 sm:min-w-0"
            )}
          >
            <Icon className={chatSuggestionPillIconClass} aria-hidden />
            {label}
          </button>
        )
      })}
    </div>
  )
}
