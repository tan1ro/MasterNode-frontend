"use client"

import { useCallback, useState, type RefObject } from "react"
import { createPortal } from "react-dom"
import { Check, Copy } from "lucide-react"
import { BRANDING } from "@/constants/branding"
import { cn } from "@/lib/utils"
import type { ChatTextSelectionState } from "@/hooks/use-chat-text-selection"

interface Props {
  selection: ChatTextSelectionState
  toolbarRef: RefObject<HTMLDivElement | null>
  onCopy: (text: string) => void
  onAsk: (text: string) => void
}

function toolbarPosition(rect: DOMRect) {
  const top = Math.max(12, rect.top - 40)
  const left = Math.min(Math.max(rect.left, 12), window.innerWidth - 180)
  return { top, left }
}

export function ChatSelectionToolbar({ selection, toolbarRef, onCopy, onAsk }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    onCopy(selection.text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }, [onCopy, selection.text])

  if (typeof document === "undefined") return null

  const { top, left } = toolbarPosition(selection.rect)
  const askLabel = `Ask ${BRANDING.productName}`
  const copyLabel = copied ? "Copied" : "Copy"

  return createPortal(
    <div
      ref={toolbarRef}
      role="toolbar"
      aria-label="Text selection actions"
      className={cn(
        "fixed z-[120] flex items-center gap-0.5",
        "rounded-full border border-border/60 bg-popover px-1 py-1 shadow-lg",
        "animate-in fade-in-0 zoom-in-95 duration-150"
      )}
      style={{ top, left }}
      onMouseDown={(event) => event.preventDefault()}
    >
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
          "text-popover-foreground hover:bg-muted/80 transition-colors"
        )}
        onClick={() => onAsk(selection.text)}
      >
        <span className="text-sm leading-none" aria-hidden>
          &ldquo;
        </span>
        {askLabel}
      </button>
      <span className="h-4 w-px bg-border/70" aria-hidden />
      <button
        type="button"
        aria-label={copyLabel}
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium",
          "text-popover-foreground hover:bg-muted/80 transition-colors"
        )}
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden />
        ) : (
          <Copy className="h-3.5 w-3.5 shrink-0" aria-hidden />
        )}
        <span>{copyLabel}</span>
      </button>
    </div>,
    document.body
  )
}
