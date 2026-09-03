"use client"

import { Code2, Coffee, GraduationCap, Pencil, Sparkles } from "lucide-react"
import {
  chatSuggestionPillClasses,
  chatSuggestionPillIconClass,
  type ChatSuggestionAccent,
} from "@/lib/chat-suggestion-styles"
import { cn } from "@/lib/utils"

const SUGGESTIONS: ReadonlyArray<{
  label: string
  icon: typeof Pencil
  accent: ChatSuggestionAccent
  prompt: string
}> = [
  {
    label: "Write",
    icon: Pencil,
    accent: "amber",
    prompt: "Help me draft a clear outline for an essay on Indian constitutional law.",
  },
  {
    label: "Create",
    icon: Sparkles,
    accent: "violet",
    prompt: "Brainstorm three creative project ideas I could build with an AI agent pipeline.",
  },
  {
    label: "Learn",
    icon: GraduationCap,
    accent: "emerald",
    prompt: "Tell me about law in India — key branches and how the system works.",
  },
  {
    label: "Code",
    icon: Code2,
    accent: "cyan",
    prompt: "Review this code for bugs, edge cases, and readability. Suggest concrete fixes.",
  },
  {
    label: "Life stuff",
    icon: Coffee,
    accent: "orange",
    prompt: "Help me plan my week: priorities, time blocks, and one thing to drop.",
  },
]

interface ChatEmptySuggestionsProps {
  disabled?: boolean
  onPick: (prompt: string) => void
  className?: string
}

export function ChatEmptySuggestions({
  disabled,
  onPick,
  className,
}: ChatEmptySuggestionsProps) {
  return (
    <div
      data-chat-tour="quick-prompts"
      className={cn(
        "grid w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-center",
        className
      )}
    >
      {SUGGESTIONS.map(({ label, icon: Icon, accent, prompt }, index) => {
        const isLastOdd = index === SUGGESTIONS.length - 1 && SUGGESTIONS.length % 2 === 1
        return (
          <button
            key={label}
            type="button"
            disabled={disabled}
            onClick={() => onPick(prompt)}
            className={cn(
              chatSuggestionPillClasses({
                accent,
                withIcon: true,
              }),
              "w-full justify-center sm:w-auto",
              isLastOdd && "col-span-2 mx-auto w-auto min-w-[10rem] sm:col-span-1 sm:mx-0 sm:min-w-0"
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
