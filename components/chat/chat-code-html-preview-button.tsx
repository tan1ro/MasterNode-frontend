"use client"

import { Eye } from "lucide-react"
import { useChatPresentationPanelOptional } from "@/components/chat/chat-presentation-panel"
import { useChatSourcesPanelOptional } from "@/components/chat/chat-sources-panel"
import { canOpenHtmlVisualization } from "@/lib/html-writeup"
import { cn } from "@/lib/utils"

/** Opens HTML/SVG fenced code in the Claude-style side visualization panel. */
export function ChatCodeHtmlPreviewButton({
  code,
  languageId,
  className,
}: {
  code: string
  languageId: string
  className?: string
}) {
  const panel = useChatPresentationPanelOptional()
  const sourcesPanel = useChatSourcesPanelOptional()

  if (!panel?.openHtmlVisualization) return null
  if (!canOpenHtmlVisualization(code, languageId)) return null

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        sourcesPanel?.closeSources()
        panel.openHtmlVisualization({
          html: code,
          title: languageId === "svg" ? "SVG preview" : "HTML preview",
          filename: languageId === "svg" ? "preview.svg" : "preview.html",
        })
      }}
      className={cn(
        "code-block__copy inline-flex shrink-0 items-center gap-1.5 rounded-md border",
        "px-2.5 py-1.5 text-xs font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        className
      )}
      aria-label="Open preview"
    >
      <Eye className="h-3.5 w-3.5" aria-hidden />
      <span>Preview</span>
    </button>
  )
}
