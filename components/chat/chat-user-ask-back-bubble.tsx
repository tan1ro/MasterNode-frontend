"use client"

import { CornerDownRight } from "lucide-react"
import { parseQuotedChatMessage, truncateQuotePreview } from "@/lib/chat-quote"
import { cn } from "@/lib/utils"

interface Props {
  content: string
  className?: string
}

/** User bubble: ↳ context line (left) + ask pill (right), Cursor-style. */
export function ChatUserAskBackBubble({ content, className }: Props) {
  const { quote, body } = parseQuotedChatMessage(content)

  if (!quote) {
    return (
      <div
        className={cn(
          "rounded-2xl rounded-br-md border border-border/60 bg-muted/70 px-3.5 py-2 shadow-sm",
          className
        )}
      >
        <div className="whitespace-pre-wrap leading-[1.55]">{content}</div>
      </div>
    )
  }

  const preview = truncateQuotePreview(quote, 120)
  const ask = body.trim()

  return (
    <div className={cn("flex w-full flex-col gap-1.5", className)}>
      <div className="flex w-full min-w-0 items-start gap-1.5 self-stretch pr-8 sm:pr-12">
        <CornerDownRight
          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/80"
          aria-hidden
        />
        <p
          className={cn(
            "min-w-0 flex-1 truncate text-[13px] leading-snug text-muted-foreground",
            /[{};=<>]|^(def |class |function |const |import )/m.test(quote.trim()) &&
              "font-mono text-[12px]"
          )}
          title={quote}
        >
          {preview}
        </p>
      </div>
      {ask ? (
        <div className="flex w-full justify-end">
          <div
            className={cn(
              "max-w-[min(100%,28rem)] rounded-2xl rounded-br-md border border-border/40",
              "bg-muted/70 px-3.5 py-2 shadow-sm"
            )}
          >
            <div className="whitespace-pre-wrap leading-[1.55] text-foreground">{ask}</div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
