"use client"

import { useEffect, useId, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import {
  Check,
  Code2,
  Copy,
  ExternalLink,
  Eye,
  X,
} from "lucide-react"
import { ChatCodeBlock } from "@/components/chat/chat-code-block"
import { ChatProjectDownloadMenu } from "@/components/chat/chat-project-download-menu"
import {
  openHtmlWriteupInNewTab,
  wrapHtmlWriteupDocument,
} from "@/lib/html-writeup"
import { copyTextToClipboard } from "@/lib/chat-code-language"
import type { ProjectExportFile } from "@/lib/project-zip-export"
import { cn } from "@/lib/utils"

interface ChatHtmlCanvasProps {
  open: boolean
  html: string
  title: string
  filename: string
  files?: ProjectExportFile[]
  onClose: () => void
}

/** Full-page HTML preview (same shell pattern as document canvas). */
export function ChatHtmlCanvas({
  open,
  html,
  title,
  filename,
  files,
  onClose,
}: ChatHtmlCanvasProps) {
  const titleId = useId()
  const [mode, setMode] = useState<"preview" | "code">("preview")
  const [copied, setCopied] = useState(false)
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null)
  const srcDoc = useMemo(() => wrapHtmlWriteupDocument(html), [html])

  useEffect(() => {
    const host =
      document.querySelector<HTMLElement>("[data-chat-main-pane]") ?? document.body
    setPortalHost(host)
  }, [open])

  useEffect(() => {
    if (!open) return
    setMode("preview")
    setCopied(false)
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose, html])

  if (!open || !portalHost) return null

  const coversFullViewport = portalHost === document.body

  const handleCopy = async () => {
    const ok = await copyTextToClipboard(html)
    if (!ok) return
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className={cn(
        "z-[180] flex flex-col bg-background text-foreground",
        coversFullViewport ? "fixed inset-0" : "absolute inset-0"
      )}
    >
      <header className="flex shrink-0 items-center gap-2 border-b border-border/40 px-3 py-2.5 sm:gap-3 sm:px-4">
        <button
          type="button"
          aria-label="Close HTML preview"
          onClick={onClose}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          <X className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </button>

        <div className="inline-flex shrink-0 items-center rounded-lg border border-border/60 bg-muted/30 p-0.5">
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-[11px] font-medium transition-colors",
              mode === "preview"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={mode === "preview"}
          >
            <Eye className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">Preview</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("code")}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-[11px] font-medium transition-colors",
              mode === "code"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={mode === "code"}
          >
            <Code2 className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">Code</span>
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <h2
            id={titleId}
            className="truncate text-sm font-medium text-foreground sm:text-[15px]"
          >
            {title}
          </h2>
          <p className="truncate text-[11px] text-muted-foreground">
            {filename} · HTML
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            aria-label="Copy HTML"
            onClick={() => void handleCopy()}
            className="inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-500" aria-hidden />
            ) : (
              <Copy className="h-4 w-4" aria-hidden />
            )}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </button>
          <ChatProjectDownloadMenu
            title={title}
            html={html}
            htmlFilename={filename}
            files={files}
            compact
          />
          <button
            type="button"
            aria-label="Open in new tab"
            onClick={() => openHtmlWriteupInNewTab(html)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </header>

      <div className="relative min-h-0 flex-1 overflow-hidden bg-muted/20 dark:bg-[#0b0d10]">
        {mode === "preview" ? (
          <iframe
            title={title}
            srcDoc={srcDoc}
            sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            className="h-full w-full border-0 bg-white dark:bg-transparent"
          />
        ) : (
          <div className="h-full overflow-y-auto p-4 scrollbar-thin sm:p-6">
            <div className="mx-auto w-full max-w-5xl">
              <ChatCodeBlock
                code={html}
                className="language-html"
                highlight
                compact={false}
                hidePreviewAction
              />
            </div>
          </div>
        )}
      </div>
    </div>,
    portalHost
  )
}
