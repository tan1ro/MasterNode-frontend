"use client"

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  Check,
  Download,
  FileText,
  Loader2,
  Maximize2,
} from "lucide-react"
import { ChatDocumentCanvas } from "@/components/chat/chat-document-canvas"
import { pipelineDocumentMarkdownComponents } from "@/components/markdown/markdown-components"
import { exportMarkdownAsDocument } from "@/lib/document-export"
import {
  applyDocumentPlaceholders,
  resolveAuthorFromUser,
} from "@/lib/document-placeholders"
import { extractDocumentCardTitle } from "@/lib/document-card-title"
import { normalizeMarkdownProse } from "@/lib/pipeline-deliverables"
import { useAppAuth } from "@/hooks/use-app-auth"
import { cn } from "@/lib/utils"
import type { PresentationArtifact } from "@/components/chat/chat-presentation-artifact"

type ExportAction = "copy" | "markdown" | "docx" | "pdf"

interface ChatDocumentArtifactProps {
  markdown: string
  title?: string
  /** Pre-generated DOCX/PDF from pipeline when available. */
  artifacts?: PresentationArtifact[]
  subtitle?: string
  className?: string
}

function slugifyFilename(title: string): string {
  const slug = title.replace(/[^a-z0-9]+/gi, "_").toLowerCase().replace(/^_|_$/g, "")
  return slug || "document"
}

async function copyText(text: string): Promise<void> {
  await navigator.clipboard.writeText(text)
}

function downloadTextFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.rel = "noopener"
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

function ExportMenu({
  open,
  anchor,
  onClose,
  onSelect,
  loading,
}: {
  open: boolean
  anchor: DOMRect | null
  onClose: () => void
  onSelect: (action: ExportAction) => void
  loading: ExportAction | null
}) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node
      if (menuRef.current?.contains(target)) return
      onClose()
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("mousedown", onPointer)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onPointer)
      document.removeEventListener("keydown", onKey)
    }
  }, [open, onClose])

  if (!open || !anchor || typeof document === "undefined") return null

  const width = 200
  let left = anchor.right - width
  let top = anchor.bottom + 6
  if (left < 12) left = 12
  if (top + 180 > window.innerHeight - 12) {
    top = Math.max(12, anchor.top - 180 - 6)
  }

  const items: { id: ExportAction; label: string }[] = [
    { id: "copy", label: "Copy contents" },
    { id: "markdown", label: "Export to Markdown" },
    { id: "docx", label: "Export to Word" },
    { id: "pdf", label: "Export to PDF" },
  ]

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      className="fixed z-[200] rounded-xl border border-border/60 bg-popover p-1 shadow-lg"
      style={{ top, left, width }}
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="menuitem"
          disabled={loading !== null}
          onClick={() => onSelect(item.id)}
          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-muted/70 disabled:opacity-60"
        >
          <span>{item.label}</span>
          {loading === item.id ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" aria-hidden />
          ) : null}
        </button>
      ))}
    </div>,
    document.body
  )
}

export function ChatDocumentArtifact({
  markdown,
  title,
  artifacts: _artifacts = [],
  subtitle,
  className,
}: ChatDocumentArtifactProps) {
  const { user } = useAppAuth()
  const panelId = useId()
  const downloadRef = useRef<HTMLButtonElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState<DOMRect | null>(null)
  const [canvasOpen, setCanvasOpen] = useState(false)
  const [loading, setLoading] = useState<ExportAction | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const author = useMemo(() => resolveAuthorFromUser(user), [user])
  const preparedMarkdown = useMemo(
    () => applyDocumentPlaceholders(normalizeMarkdownProse(markdown), author),
    [markdown, author]
  )
  const preparedTitle = useMemo(() => {
    const passed = title?.trim()
    // Ignore generic backend titles so the filename reflects the real subject.
    const usePassed = passed && !/^(document|untitled)$/i.test(passed)
    const raw = usePassed ? passed : extractDocumentCardTitle(preparedMarkdown, passed || "Document")
    return applyDocumentPlaceholders(raw, author)
  }, [title, preparedMarkdown, author])
  const cardHeading = useMemo(
    () => extractDocumentCardTitle(preparedMarkdown, preparedTitle),
    [preparedMarkdown, preparedTitle]
  )
  // Derive the download name from the visible heading so they always match.
  const baseFilename = useMemo(
    () => slugifyFilename(cardHeading || preparedTitle),
    [cardHeading, preparedTitle]
  )

  const openMenuAt = useCallback((rect: DOMRect) => {
    setMenuAnchor(rect)
    setMenuOpen(true)
  }, [])

  const openMenu = useCallback(() => {
    const rect = downloadRef.current?.getBoundingClientRect()
    if (!rect) return
    openMenuAt(rect)
  }, [openMenuAt])

  const runExport = useCallback(
    async (action: ExportAction) => {
      setLoading(action)
      setError(null)
      try {
        if (action === "copy") {
          await copyText(preparedMarkdown)
          setCopied(true)
          window.setTimeout(() => setCopied(false), 2000)
          setMenuOpen(false)
          return
        }
        if (action === "markdown") {
          downloadTextFile(
            preparedMarkdown,
            `${baseFilename}.md`,
            "text/markdown;charset=utf-8"
          )
          setMenuOpen(false)
          return
        }
        if (action === "docx" || action === "pdf") {
          await exportMarkdownAsDocument({
            title: preparedTitle,
            markdown: preparedMarkdown,
            format: action,
            baseFilename,
          })
          setMenuOpen(false)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Export failed")
      } finally {
        setLoading(null)
      }
    },
    [baseFilename, preparedMarkdown, preparedTitle]
  )

  const handleCopy = useCallback(async () => {
    setError(null)
    try {
      await copyText(preparedMarkdown)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Copy failed")
    }
  }, [preparedMarkdown])

  return (
    <div className={cn("mt-3 min-w-0", className)}>
      {subtitle ? (
        <p className="mb-2 text-xs text-muted-foreground">{subtitle}</p>
      ) : null}

      <div
        id={panelId}
        className="overflow-hidden rounded-2xl border border-border/60 bg-card text-card-foreground shadow-sm"
      >
        <div className="flex items-center gap-2 border-b border-border/50 bg-muted/30 px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky/15 text-sky">
            <FileText className="h-4 w-4" aria-hidden />
          </div>
          <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
            {cardHeading}
          </p>
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              ref={downloadRef}
              type="button"
              aria-label="Export document"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => (menuOpen ? setMenuOpen(false) : openMenu())}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : copied ? (
                <Check className="h-4 w-4 text-emerald-500" aria-hidden />
              ) : (
                <Download className="h-4 w-4" aria-hidden />
              )}
            </button>
            <button
              type="button"
              aria-label="Expand document"
              onClick={() => setCanvasOpen(true)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              <Maximize2 className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="max-h-[min(22rem,42vh)] overflow-y-auto px-4 py-3">
            <div className="agent-md min-w-0">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={pipelineDocumentMarkdownComponents}
              >
                {preparedMarkdown}
              </ReactMarkdown>
            </div>
          </div>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent"
            aria-hidden
          />
        </div>
      </div>

      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}

      <ExportMenu
        open={menuOpen}
        anchor={menuAnchor}
        onClose={() => setMenuOpen(false)}
        onSelect={(action) => void runExport(action)}
        loading={loading}
      />

      <ChatDocumentCanvas
        open={canvasOpen}
        title={cardHeading}
        markdown={preparedMarkdown}
        onClose={() => setCanvasOpen(false)}
        onCopy={handleCopy}
        onDownload={openMenuAt}
        copyDone={copied}
        downloadLoading={loading !== null && loading !== "copy"}
      />
    </div>
  )
}
