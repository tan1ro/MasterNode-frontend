"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"
import { createPortal } from "react-dom"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { Components } from "react-markdown"
import { Check, Copy, Download, Loader2, X } from "lucide-react"
import { pipelineDocumentMarkdownComponents } from "@/components/markdown/markdown-components"
import { cn } from "@/lib/utils"

const CANVAS_MARKDOWN: Components = {
  ...pipelineDocumentMarkdownComponents,
  h1: ({ children }) => (
    <h1 className="font-heading text-[1.75rem] font-semibold tracking-tight text-foreground first:mt-0 mt-10 mb-4 leading-snug">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-heading text-xl font-semibold text-foreground mt-10 first:mt-0 mb-3">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-heading text-base font-semibold text-foreground mt-7 mb-2">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-[15px] leading-[1.7] text-foreground/90 mb-4 last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 ml-1 list-disc space-y-2 pl-5 text-[15px] leading-[1.7] text-foreground/90 marker:text-muted-foreground">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 ml-1 list-decimal space-y-2 pl-5 text-[15px] leading-[1.7] text-foreground/90 marker:text-muted-foreground">
      {children}
    </ol>
  ),
}

const MINIMAP_TICKS = 28

interface ChatDocumentCanvasProps {
  open: boolean
  title: string
  markdown: string
  onClose: () => void
  onCopy: () => Promise<void> | void
  onDownload: (anchor: DOMRect) => void
  copyDone?: boolean
  downloadLoading?: boolean
}

export function ChatDocumentCanvas({
  open,
  title,
  markdown,
  onClose,
  onCopy,
  onDownload,
  copyDone = false,
  downloadLoading = false,
}: ChatDocumentCanvasProps) {
  const titleId = useId()
  const scrollRef = useRef<HTMLDivElement>(null)
  const downloadRef = useRef<HTMLButtonElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [viewportRatio, setViewportRatio] = useState(1)
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null)
  const [dockPad, setDockPad] = useState(128)

  useEffect(() => {
    const host =
      document.querySelector<HTMLElement>("[data-chat-document-host]") ??
      document.querySelector<HTMLElement>("[data-chat-main-pane]") ??
      document.body
    setPortalHost(host)
  }, [open])

  useEffect(() => {
    if (!open) return
    const dock = document.querySelector<HTMLElement>("[data-chat-composer-dock]")
    if (!dock) return
    const sync = () => setDockPad(Math.max(dock.offsetHeight + 16, 112))
    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(dock)
    return () => observer.disconnect()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const frame = window.requestAnimationFrame(() => {
      const el = scrollRef.current
      if (!el) return
      setViewportRatio(Math.min(1, el.clientHeight / Math.max(el.scrollHeight, 1)))
      setScrollProgress(0)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [open, markdown])

  const updateScrollMetrics = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const max = Math.max(el.scrollHeight - el.clientHeight, 1)
    setScrollProgress(el.scrollTop / max)
    setViewportRatio(Math.min(1, el.clientHeight / Math.max(el.scrollHeight, 1)))
  }, [])

  if (!open || !portalHost) return null

  const thumbStart = Math.max(0, Math.min(1 - viewportRatio, scrollProgress * (1 - viewportRatio)))
  const thumbEnd = thumbStart + viewportRatio
  const coversFullViewport = portalHost === document.body
  const inChatHost = portalHost.hasAttribute("data-chat-document-host")

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className={cn(
        "flex flex-col bg-background text-foreground",
        coversFullViewport
          ? "fixed inset-0 z-[180]"
          : inChatHost
            ? "absolute inset-0 z-[15]"
            : "absolute inset-0 z-[180]"
      )}
    >
      <header className="flex shrink-0 items-center gap-3 border-b border-border/40 px-3 py-2.5 sm:px-4">
        <button
          type="button"
          aria-label="Close document"
          onClick={onClose}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          <X className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </button>
        <h2
          id={titleId}
          className="min-w-0 flex-1 truncate text-sm font-medium text-foreground sm:text-[15px]"
        >
          {title}
        </h2>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            aria-label="Copy document"
            onClick={() => void onCopy()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            {copyDone ? (
              <Check className="h-4 w-4 text-emerald-500" aria-hidden />
            ) : (
              <Copy className="h-4 w-4" aria-hidden />
            )}
          </button>
          <button
            ref={downloadRef}
            type="button"
            aria-label="Download document"
            onClick={() => {
              const rect = downloadRef.current?.getBoundingClientRect()
              if (rect) onDownload(rect)
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            {downloadLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Download className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        <div
          className="pointer-events-none absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-[3px] sm:left-3 sm:flex"
          aria-hidden
        >
          {Array.from({ length: MINIMAP_TICKS }, (_, index) => {
            const start = index / MINIMAP_TICKS
            const end = (index + 1) / MINIMAP_TICKS
            const active = end > thumbStart && start < thumbEnd
            return (
              <span
                key={index}
                className={cn(
                  "h-px w-3 rounded-full transition-colors duration-150",
                  active ? "bg-foreground/80" : "bg-foreground/20"
                )}
              />
            )
          })}
        </div>

        <div
          ref={scrollRef}
          onScroll={updateScrollMetrics}
          className="h-full overflow-y-auto px-4 pt-8 sm:px-8 sm:pt-10"
          style={{ paddingBottom: dockPad }}
        >
          <article className="mx-auto w-full max-w-[42rem]">
            <div className="agent-md min-w-0">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={CANVAS_MARKDOWN}>
                {markdown}
              </ReactMarkdown>
            </div>
          </article>
        </div>
      </div>
    </div>,
    portalHost
  )
}
