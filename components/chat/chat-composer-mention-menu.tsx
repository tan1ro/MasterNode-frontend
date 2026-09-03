"use client"

import { Bot, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MentionCandidate } from "@/lib/chat-composer-mentions"

interface Props {
  items: MentionCandidate[]
  activeIndex: number
  onHoverIndex: (index: number) => void
  onSelect: (item: MentionCandidate) => void
  loading?: boolean
}

export function ChatComposerMentionMenu({
  items,
  activeIndex,
  onHoverIndex,
  onSelect,
  loading = false,
}: Props) {
  if (!loading && items.length === 0) {
    return (
      <div
        className={cn(
          "absolute bottom-full left-2 right-2 z-40 mb-1 overflow-hidden rounded-xl",
          "border border-border/60 bg-popover/95 p-2 text-xs text-muted-foreground shadow-lg backdrop-blur-md"
        )}
        role="listbox"
        aria-label="Mentions"
      >
        No matching files or assistants
      </div>
    )
  }

  return (
    <div
      className={cn(
        "absolute bottom-full left-2 right-2 z-40 mb-1 max-h-56 overflow-y-auto scrollbar-thin",
        "rounded-xl border border-border/60 bg-popover/95 p-1 shadow-lg backdrop-blur-md"
      )}
      role="listbox"
      aria-label="Mentions"
    >
      {loading ? (
        <p className="px-2.5 py-2 text-xs text-muted-foreground">Loading…</p>
      ) : null}
      {items.map((item, index) => {
        const active = index === activeIndex
        const Icon = item.kind === "assistant" ? Bot : FileText
        return (
          <button
            key={`${item.kind}:${item.id}`}
            type="button"
            role="option"
            aria-selected={active}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
              active ? "bg-muted/70 text-foreground" : "text-foreground/90 hover:bg-muted/40"
            )}
            onMouseEnter={() => onHoverIndex(index)}
            onMouseDown={(e) => {
              e.preventDefault()
              onSelect(item)
            }}
          >
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/50",
                item.kind === "assistant" ? "bg-violet/10 text-violet" : "bg-cyan/10 text-cyan"
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{item.label}</span>
              {item.detail ? (
                <span className="block truncate text-[11px] text-muted-foreground">
                  {item.detail}
                </span>
              ) : (
                <span className="block text-[11px] text-muted-foreground">
                  {item.kind === "assistant" ? "Assistant" : "Knowledge file"}
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
