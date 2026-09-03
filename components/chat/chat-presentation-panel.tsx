"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import {
  Check,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Eye,
  Loader2,
  Maximize2,
  Presentation,
  RefreshCw,
  X,
} from "lucide-react"
import {
  type PresentationArtifact,
  displayPresentationCardName,
  downloadPresentationArtifact,
  type SlideOutline,
  slidesFromOutline,
  slidesFromPptxPreview,
  type PresentationSlidePreview,
} from "@/components/chat/chat-presentation-artifact"
import { ChatCodeBlock } from "@/components/chat/chat-code-block"
import { ChatHtmlCanvas } from "@/components/chat/chat-html-canvas"
import { ChatSidePanelResizeHandle } from "@/components/chat/chat-side-panel-resize-handle"
import { useResizableSidePanelWidth } from "@/hooks/use-resizable-side-panel"
import { previewPptxFromBase64 } from "@/lib/document-file-preview"
import {
  openHtmlWriteupInNewTab,
  wrapHtmlWriteupDocument,
} from "@/lib/html-writeup"
import { ChatProjectDownloadMenu } from "@/components/chat/chat-project-download-menu"
import { copyTextToClipboard } from "@/lib/chat-code-language"
import type { ProjectExportFile } from "@/lib/project-zip-export"
import { cn } from "@/lib/utils"

const HTML_SIDE_PANEL_DEFAULT_WIDTH = 720
const HTML_SIDE_PANEL_VIEWPORT_RATIO = 0.5
const HTML_SIDE_PANEL_STORAGE_KEY = "mn-chat-html-side-panel-width-v2"

export interface HtmlVisualizationArtifact {
  html: string
  title?: string
  filename?: string
}

type ArtifactPanelState =
  | {
      open: false
      kind: null
      messageId: null
    }
  | {
      open: true
      kind: "presentation"
      artifact: PresentationArtifact
      title?: string
      slidesCreated?: number
      slideOutline: SlideOutline[] | null
      messageId: string | null
    }
  | {
      open: true
      kind: "html"
      html: string
      title?: string
      filename?: string
      files?: ProjectExportFile[]
      messageId: string | null
    }

interface ChatPresentationPanelContextValue {
  open: boolean
  kind: "presentation" | "html" | null
  messageId: string | null
  openPresentation: (options: {
    artifact: PresentationArtifact
    title?: string
    slidesCreated?: number
    slideOutline?: SlideOutline[] | null
    messageId?: string | null
  }) => void
  openHtmlVisualization: (options: {
    html: string
    title?: string
    filename?: string
    files?: ProjectExportFile[]
    messageId?: string | null
  }) => void
  closePresentation: () => void
  isOpenForMessage: (messageId: string) => boolean
}

const ChatPresentationPanelContext = createContext<ChatPresentationPanelContextValue | null>(
  null
)

const CLOSED_STATE: ArtifactPanelState = {
  open: false,
  kind: null,
  messageId: null,
}

export function useChatPresentationPanel(): ChatPresentationPanelContextValue {
  const ctx = useContext(ChatPresentationPanelContext)
  if (!ctx) {
    throw new Error("useChatPresentationPanel must be used within ChatPresentationPanelProvider")
  }
  return ctx
}

export function useChatPresentationPanelOptional(): ChatPresentationPanelContextValue | null {
  return useContext(ChatPresentationPanelContext)
}

export function ChatPresentationPanelProvider({
  children,
  conversationId = null,
}: {
  children: ReactNode
  /** Active chat id. Panel state is parked per conversation and restored on return. */
  conversationId?: string | null
}) {
  const [state, setState] = useState<ArtifactPanelState>(CLOSED_STATE)
  const stateRef = useRef(state)
  const conversationIdRef = useRef<string | null>(conversationId ?? null)
  const parkedByConversationRef = useRef<Map<string, ArtifactPanelState>>(new Map())
  stateRef.current = state

  useEffect(() => {
    const prev = conversationIdRef.current
    const next = conversationId ?? null
    if (prev === next) return

    if (prev) {
      parkedByConversationRef.current.set(prev, stateRef.current)
    }
    conversationIdRef.current = next

    if (!next) {
      setState(CLOSED_STATE)
      return
    }

    const parked = parkedByConversationRef.current.get(next)
    if (parked?.open) {
      setState(parked)
      return
    }

    // Draft chat becoming a real conversation — keep an already-open preview.
    if (!prev && stateRef.current.open) {
      return
    }

    setState(CLOSED_STATE)
  }, [conversationId])

  const openPresentation = useCallback(
    (options: {
      artifact: PresentationArtifact
      title?: string
      slidesCreated?: number
      slideOutline?: SlideOutline[] | null
      messageId?: string | null
    }) => {
      const next: ArtifactPanelState = {
        open: true,
        kind: "presentation",
        artifact: options.artifact,
        title: options.title,
        slidesCreated: options.slidesCreated,
        slideOutline: options.slideOutline ?? null,
        messageId: options.messageId ?? null,
      }
      setState(next)
      const id = conversationIdRef.current
      if (id) parkedByConversationRef.current.set(id, next)
    },
    []
  )

  const openHtmlVisualization = useCallback(
    (options: {
      html: string
      title?: string
      filename?: string
      files?: ProjectExportFile[]
      messageId?: string | null
    }) => {
      const html = options.html.trim()
      if (!html) return
      const next: ArtifactPanelState = {
        open: true,
        kind: "html",
        html,
        title: options.title,
        filename: options.filename,
        files: options.files,
        messageId: options.messageId ?? null,
      }
      setState(next)
      const id = conversationIdRef.current
      if (id) parkedByConversationRef.current.set(id, next)
    },
    []
  )

  const closePresentation = useCallback(() => {
    setState(CLOSED_STATE)
    const id = conversationIdRef.current
    if (id) parkedByConversationRef.current.set(id, CLOSED_STATE)
  }, [])

  const value = useMemo(
    () => ({
      open: state.open,
      kind: state.open ? state.kind : null,
      messageId: state.messageId,
      openPresentation,
      openHtmlVisualization,
      closePresentation,
      isOpenForMessage: (messageId: string) => state.open && state.messageId === messageId,
    }),
    [state, openPresentation, openHtmlVisualization, closePresentation]
  )

  return (
    <ChatPresentationPanelContext.Provider value={value}>
      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
        {state.open && state.kind === "html" ? (
          <ChatHtmlVisualizationSidebar
            html={state.html}
            title={state.title}
            filename={state.filename}
            files={state.files}
            onClose={closePresentation}
          />
        ) : (
          <ChatPresentationSidebar
            open={state.open && state.kind === "presentation"}
            artifact={state.open && state.kind === "presentation" ? state.artifact : null}
            title={state.open && state.kind === "presentation" ? state.title : undefined}
            slidesCreated={
              state.open && state.kind === "presentation" ? state.slidesCreated : undefined
            }
            slideOutline={
              state.open && state.kind === "presentation" ? state.slideOutline : null
            }
            onClose={closePresentation}
          />
        )}
      </div>
    </ChatPresentationPanelContext.Provider>
  )
}

function PresentationSlideCard({
  slide,
  total,
}: {
  slide: PresentationSlidePreview
  total: number
}) {
  const isHero = slide.isTitle || slide.index === 1

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border shadow-lg",
        isHero
          ? "border-cyan-500/25 bg-gradient-to-br from-[#0b1f3f] via-[#0d2847] to-[#061528] text-white"
          : "border-border/50 bg-gradient-to-br from-[#101a2e] via-[#0f1729] to-[#0a1020] text-white"
      )}
    >
      <div className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/25 px-2.5 py-0.5 text-[10px] font-medium text-white/70 tabular-nums">
        Page {slide.index} / {total}
      </div>
      <div className="px-6 py-8 sm:px-8 sm:py-10">
        {isHero ? (
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 text-lg font-mono">
            {"</>"}
          </div>
        ) : null}
        <h3
          className={cn(
            "pr-20 font-semibold leading-tight",
            isHero ? "text-2xl sm:text-3xl text-cyan-300 uppercase tracking-wide" : "text-lg text-white"
          )}
        >
          {slide.title}
        </h3>
        {slide.lines.length > 0 ? (
          <ul
            className={cn(
              "mt-4 space-y-2 text-sm leading-relaxed",
              isHero ? "text-white/75" : "text-white/80"
            )}
          >
            {slide.lines.map((line, idx) => (
              <li key={`${slide.index}-${idx}`} className="flex gap-2">
                {!isHero ? <span className="text-cyan-400/80">•</span> : null}
                <span>{line}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}

function ChatPresentationSidebar({
  open,
  artifact,
  title,
  slidesCreated,
  slideOutline,
  onClose,
}: {
  open: boolean
  artifact: PresentationArtifact | null
  title?: string
  slidesCreated?: number
  slideOutline: SlideOutline[] | null
  onClose: () => void
}) {
  const [slides, setSlides] = useState<PresentationSlidePreview[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const displayName = artifact
    ? displayPresentationCardName(artifact.filename, title)
    : "Presentation"

  useEffect(() => {
    if (!open || !artifact) {
      setSlides([])
      setError(null)
      setLoading(false)
      return
    }

    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        if (slideOutline && slideOutline.length > 0) {
          if (!cancelled) setSlides(slidesFromOutline(slideOutline, title))
          return
        }
        const preview = await previewPptxFromBase64(artifact.base64)
        if (cancelled) return
        if (preview.type === "slides") {
          setSlides(slidesFromPptxPreview(preview.slides, title))
        } else if (preview.type === "unsupported") {
          setSlides([])
          setError(preview.reason)
        } else {
          setSlides([])
          setError("Could not load slide preview.")
        }
      } catch {
        if (!cancelled) {
          setSlides([])
          setError("Could not load slide preview.")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [open, artifact, slideOutline, title])

  if (!open || !artifact) {
    return (
      <aside className="hidden w-0 shrink-0 overflow-hidden border-l-0 lg:block" aria-hidden />
    )
  }

  const total = slidesCreated ?? slides.length

  return (
    <>
      <button
        type="button"
        aria-label="Close presentation preview"
        className="fixed inset-0 z-[90] bg-background/55 backdrop-blur-[1px] lg:hidden"
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-[95] flex w-full max-w-md flex-col border-l border-border/60 bg-background shadow-2xl",
          "lg:static lg:z-auto lg:max-w-none lg:w-[min(50vw,34rem)] lg:shrink-0"
        )}
        aria-label="Presentation preview"
      >
        <header className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
          <Presentation className="h-4 w-4 shrink-0 text-orange-400" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
            <p className="text-xs text-muted-foreground">
              Presentation · PPTX{total > 0 ? ` · ${total} slides` : ""}
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            title="Download"
            onClick={() => downloadPresentationArtifact(artifact)}
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 scrollbar-thin">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Loading slides…
            </div>
          ) : error ? (
            <div className="space-y-3 py-8 text-center">
              <p className="text-sm text-muted-foreground">{error}</p>
              <button
                type="button"
                onClick={() => downloadPresentationArtifact(artifact)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-sm hover:bg-muted/40"
              >
                <Download className="h-3.5 w-3.5" />
                Download PPTX
              </button>
            </div>
          ) : slides.length > 0 ? (
            <div className="flex flex-col gap-4">
              {slides.map((slide) => (
                <PresentationSlideCard key={slide.index} slide={slide} total={slides.length} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No slide preview available.
            </div>
          )}
        </div>

        <footer className="border-t border-border/50 px-4 py-2.5 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <RefreshCw className="h-3 w-3 opacity-60" aria-hidden />
            Preview shows slide text; download for full formatting.
          </span>
        </footer>
      </aside>
    </>
  )
}

function slugifyFilename(title: string): string {
  const slug = title.replace(/[^a-z0-9]+/gi, "_").toLowerCase().replace(/^_|_$/g, "")
  return slug || "writeup"
}

function ChatHtmlVisualizationSidebar({
  html,
  title,
  filename,
  files,
  onClose,
}: {
  html: string
  title?: string
  filename?: string
  files?: ProjectExportFile[]
  onClose: () => void
}) {
  const [mode, setMode] = useState<"preview" | "code">("preview")
  const [canvasOpen, setCanvasOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const cardTitle = title?.trim() || "HTML preview"
  const downloadName = filename?.trim() || `${slugifyFilename(cardTitle)}.html`
  const srcDoc = useMemo(() => wrapHtmlWriteupDocument(html), [html])
  const {
    width: panelWidth,
    isDragging,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    nudgeWidth,
  } = useResizableSidePanelWidth({
    storageKey: HTML_SIDE_PANEL_STORAGE_KEY,
    defaultWidth: HTML_SIDE_PANEL_DEFAULT_WIDTH,
    minWidth: 320,
    minCompanionWidth: 360,
    maxViewportRatio: HTML_SIDE_PANEL_VIEWPORT_RATIO,
    defaultViewportRatio: HTML_SIDE_PANEL_VIEWPORT_RATIO,
  })

  useEffect(() => {
    setMode("preview")
    setCanvasOpen(false)
    setCopied(false)
  }, [html])

  const handleCopy = async () => {
    const ok = await copyTextToClipboard(html)
    if (!ok) return
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close HTML visualization"
        className="fixed inset-0 z-[90] bg-background/55 backdrop-blur-[1px] lg:hidden"
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-[95] flex w-full max-w-lg flex-col border-l border-border/60 bg-background shadow-2xl",
          "lg:relative lg:inset-auto lg:z-auto lg:max-w-[50vw] lg:w-[min(var(--chat-html-panel-w),50vw)] lg:shrink-0",
          isDragging && "select-none"
        )}
        style={{ ["--chat-html-panel-w" as string]: `${panelWidth}px` }}
        aria-label="HTML visualization"
      >
        <ChatSidePanelResizeHandle
          isDragging={isDragging}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onNudge={nudgeWidth}
        />
        <header className="flex items-center gap-2 border-b border-border/50 px-3 py-2.5 sm:px-4">
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
              title="Preview"
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
              title="Code"
            >
              <Code2 className="h-3.5 w-3.5" aria-hidden />
              <span className="hidden sm:inline">Code</span>
            </button>
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{cardTitle}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {downloadName} · HTML
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleCopy()}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border/60 px-2 text-[11px] font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            title="Copy HTML"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald" aria-hidden />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden />
            )}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </button>
          <ChatProjectDownloadMenu
            title={cardTitle}
            html={html}
            htmlFilename={downloadName}
            files={files}
            compact
          />
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            title="Open in new tab"
            onClick={() => openHtmlWriteupInNewTab(html)}
          >
            <ExternalLink className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            title="Expand to full page"
            aria-label="Expand to full page"
            onClick={() => setCanvasOpen(true)}
          >
            <Maximize2 className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div
          className={cn(
            "relative min-h-0 flex-1 overflow-hidden bg-muted/20 dark:bg-[#0b0d10]",
            isDragging && "pointer-events-none"
          )}
        >
          {mode === "preview" ? (
            <>
              <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-md border border-border/50 bg-background/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground backdrop-blur-sm">
                Preview
              </div>
              <iframe
                title={cardTitle}
                srcDoc={srcDoc}
                sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                className="h-full w-full border-0 bg-transparent"
              />
            </>
          ) : (
            <div className="h-full overflow-y-auto p-3 scrollbar-thin">
              <ChatCodeBlock
                code={html}
                className="language-html"
                highlight
                compact={false}
                hidePreviewAction
              />
            </div>
          )}
        </div>
      </aside>

      <ChatHtmlCanvas
        open={canvasOpen}
        html={html}
        title={cardTitle}
        filename={downloadName}
        files={files}
        onClose={() => setCanvasOpen(false)}
      />
    </>
  )
}

/** Compact Claude-style card: preview in side panel, download below chat. */
export function ChatHtmlVisualizationCard({
  html,
  title,
  filename,
  files,
  previewOpen,
  onOpenPreview,
  autoOpen = false,
  className,
}: {
  html: string
  title?: string
  filename?: string
  files?: ProjectExportFile[]
  previewOpen?: boolean
  onOpenPreview?: () => void
  /** Open the side panel once when this artifact first appears. */
  autoOpen?: boolean
  className?: string
}) {
  const cardTitle = title?.trim() || "Webpage"
  const downloadName = filename?.trim() || `${slugifyFilename(cardTitle)}.html`
  const [didAutoOpen, setDidAutoOpen] = useState(false)

  useEffect(() => {
    if (!autoOpen || didAutoOpen || !onOpenPreview || previewOpen) return
    setDidAutoOpen(true)
    onOpenPreview()
  }, [autoOpen, didAutoOpen, onOpenPreview, previewOpen])

  return (
    <div
      className={cn(
        "mt-3 flex min-w-0 items-center gap-3 rounded-xl border border-border/60 bg-muted/25 px-3 py-2.5",
        previewOpen && "border-violet/35 bg-violet/10",
        className
      )}
    >
      <button
        type="button"
        onClick={onOpenPreview}
        className="flex min-w-0 flex-1 items-center gap-3 text-left transition-opacity hover:opacity-90"
        aria-label={`Preview ${cardTitle}`}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-background/60 text-muted-foreground">
          <Code2 className="h-4 w-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">{cardTitle}</span>
          <span className="block truncate text-[11px] text-muted-foreground">
            {files && files.length > 1 ? `Project · ${files.length} files` : "Code · HTML"}
          </span>
        </span>
      </button>
      <ChatProjectDownloadMenu
        title={cardTitle}
        html={html}
        htmlFilename={downloadName}
        files={files}
      />
    </div>
  )
}
