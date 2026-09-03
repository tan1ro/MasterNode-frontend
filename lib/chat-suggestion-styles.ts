import { cn } from "@/lib/utils"

/** Accent keys for pipeline-mode suggestion pills (one per quick action). */
export type ChatSuggestionAccent = "amber" | "violet" | "emerald" | "cyan" | "orange"

/** Shared pill styling for empty-state and follow-up chat recommendations. */
export const chatSuggestionPillClass = cn(
  "chat-suggestion-pill inline-flex max-w-full items-center rounded-full px-4 py-2 text-sm font-medium"
)

export const chatSuggestionPillWithIconClass = cn(chatSuggestionPillClass, "gap-2 py-2.5")

export const chatSuggestionPillIconClass = cn(
  "chat-suggestion-pill__icon h-4 w-4 shrink-0"
)

export function chatSuggestionPillClasses(options: {
  accent?: ChatSuggestionAccent
  withIcon?: boolean
}) {
  const { accent, withIcon = false } = options
  const base = withIcon ? chatSuggestionPillWithIconClass : chatSuggestionPillClass
  if (!accent) return base
  return cn(base, `chat-suggestion-pill--${accent}`)
}
