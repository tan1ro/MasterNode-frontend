"use client"

import { CornerDownLeft, X } from "lucide-react"
import { truncateQuotePreview } from "@/lib/chat-quote"
import { cn } from "@/lib/utils"

interface Props {
  excerpt: string
  onClear: () => void
  disabled?: boolean
  className?: string
}

/** Composer reply bar: quoted context + dismiss (Cursor / Claude ask-back). */
export function ChatQuotePreview({ excerpt, onClear, disabled, className }: Props) {
  const preview = truncateQuotePreview(excerpt, 220)

  return (
    <div
      className={cn(
        "flex items-start gap-2.5 border-b border-border/40 bg-muted/35 px-3 py-2.5 sm:px-3.5",
        className
      )}
      role="status"
      aria-label="Replying to selected text"
    >
      <CornerDownLeft
        className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
        aria-hidden
      />
      <p
        className={cn(
          "min-w-0 flex-1 text-[13px] leading-snug text-muted-foreground",
          "line-clamp-2"
        )}
        title={excerpt.trim()}
      >
        <span className="text-muted-foreground/70">“</span>
        {preview}
        <span className="text-muted-foreground/70">”</span>
      </p>
      <button
        type="button"
        disabled={disabled}
        onClick={onClear}
        className={cn(
          "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          "text-muted-foreground hover:bg-background/50 hover:text-foreground transition-colors",
          "disabled:opacity-40 disabled:pointer-events-none"
        )}
        aria-label="Remove quoted excerpt"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  )
}
