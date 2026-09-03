"use client"

import React, { useEffect, useState } from "react"
import { ExternalLink, Loader2, X } from "lucide-react"
import type { ComposerAttachmentItem } from "@/lib/chat-composer-attachments"
import {
  attachmentAccentClass,
  attachmentBadgeLabel,
  attachmentExtFromFile,
  attachmentKindFromFile,
  attachmentTypeLabel,
  attachmentWarningMessage,
  canPreviewComposerAttachment,
  isImageAttachment,
} from "@/lib/chat-composer-attachments"
import {
  buildDocumentFilePreview,
  type DocumentFilePreview,
} from "@/lib/document-file-preview"
import { cn } from "@/lib/utils"
import { ChatImageAttachmentCard } from "@/components/chat/chat-image-attachment-card"

function AttachmentTypeBadge({
  file,
  className,
}: {
  file: File
  className?: string
}) {
  const label = attachmentBadgeLabel(file)
  return (
    <span
      className={cn(
        "select-none text-[9px] font-bold leading-none tracking-[0.04em]",
        label.length > 3 ? "text-[8px]" : "text-[10px]",
        className
      )}
    >
      {label}
    </span>
  )
}

function DocumentPreviewBody({ preview }: { preview: DocumentFilePreview }) {
  if (preview.type === "html") {
    return (
      <article
        className={cn(
          "mx-auto max-w-3xl rounded-lg border border-border/40 bg-background p-6 shadow-sm",
          "prose prose-sm max-w-none dark:prose-invert",
          "[&_p]:leading-relaxed [&_li]:leading-relaxed"
        )}
        dangerouslySetInnerHTML={{ __html: preview.html }}
      />
    )
  }

  if (preview.type === "text") {
    return (
      <pre className="mx-auto max-w-3xl whitespace-pre-wrap rounded-lg border border-border/40 bg-background p-6 font-mono text-xs leading-relaxed text-foreground shadow-sm">
        {preview.text}
      </pre>
    )
  }

  if (preview.type === "slides") {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        {preview.slides.map((slide) => (
          <section
            key={slide.index}
            className="rounded-xl border border-border/50 bg-background p-5 shadow-sm"
          >
            <h3 className="mb-3 text-sm font-semibold text-foreground">Slide {slide.index}</h3>
            {slide.lines.length > 0 ? (
              <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
                {slide.lines.map((line, idx) => (
                  <li key={`${slide.index}-${idx}`}>{line}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No text on this slide.</p>
            )}
          </section>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <p className="max-w-md text-sm text-muted-foreground">{preview.reason}</p>
    </div>
  )
}

export function AttachmentPreviewModal({
  item,
  onClose,
}: {
  item: ComposerAttachmentItem
  onClose: () => void
}) {
  const ext = attachmentExtFromFile(item.file)
  const kind = attachmentKindFromFile(item.file)
  const needsDocumentPreview = kind === "document" || kind === "presentation"
  const [docPreview, setDocPreview] = useState<DocumentFilePreview | null>(null)
  const [docLoading, setDocLoading] = useState(needsDocumentPreview)
  const [docError, setDocError] = useState<string | null>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  useEffect(() => {
    if (!needsDocumentPreview) {
      setDocPreview(null)
      setDocLoading(false)
      setDocError(null)
      return
    }

    let cancelled = false
    setDocLoading(true)
    setDocPreview(null)
    setDocError(null)

    void buildDocumentFilePreview(item.file)
      .then((preview) => {
        if (cancelled) return
        setDocPreview(preview)
        if (preview.type === "unsupported") {
          setDocError(preview.reason)
        }
      })
      .catch((error) => {
        if (cancelled) return
        setDocError(error instanceof Error ? error.message : "Could not preview this file.")
      })
      .finally(() => {
        if (!cancelled) setDocLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [item.file, needsDocumentPreview])

  const showDownload =
    needsDocumentPreview &&
    !docLoading &&
    (docError !== null || docPreview?.type === "unsupported")

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative flex max-h-[min(88vh,52rem)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Preview ${item.file.name}`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border/50 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
                attachmentAccentClass(item.file)
              )}
            >
              <AttachmentTypeBadge file={item.file} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{item.file.name}</p>
              <p className="text-xs text-muted-foreground">{attachmentTypeLabel(item.file)}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <a
              href={item.previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              Open
            </a>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
              aria-label="Close preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-auto bg-muted/20 p-4">
          {isImageAttachment(item.file) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.previewUrl}
              alt={item.file.name}
              className="mx-auto max-h-[min(72vh,44rem)] w-auto max-w-full rounded-lg object-contain"
            />
          ) : ext === "pdf" ? (
            <object
              data={item.previewUrl}
              type="application/pdf"
              title={item.file.name}
              className="h-[min(72vh,44rem)] w-full rounded-lg border border-border/40 bg-white"
            >
              <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Your browser could not render this PDF inline.
                </p>
                <a
                  href={item.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-border/60 px-4 py-2 text-sm hover:bg-muted/60"
                >
                  Open in new tab
                </a>
              </div>
            </object>
          ) : docLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
              <p className="text-sm">Loading preview…</p>
            </div>
          ) : docPreview ? (
            <>
              <DocumentPreviewBody preview={docPreview} />
              {showDownload ? (
                <div className="mt-6 flex justify-center">
                  <a
                    href={item.previewUrl}
                    download={item.file.name}
                    className="rounded-full border border-border/60 px-4 py-2 text-sm hover:bg-muted/60"
                  >
                    Download to view in app
                  </a>
                </div>
              ) : null}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <p className="text-sm text-muted-foreground">
                {docError || "Could not load preview."}
              </p>
              <a
                href={item.previewUrl}
                download={item.file.name}
                className="rounded-full border border-border/60 px-4 py-2 text-sm hover:bg-muted/60"
              >
                Download to view
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ComposerAttachmentCard({
  item,
  onRemove,
  onOpen,
}: {
  item: ComposerAttachmentItem
  onRemove: () => void
  onOpen: () => void
}) {
  const isImage = isImageAttachment(item.file)
  const isBusy = item.status === "uploading"
  const warning = item.warning || attachmentWarningMessage(item.attachment)
  const canOpen =
    canPreviewComposerAttachment(item.file) &&
    item.status !== "error" &&
    item.status !== "uploading" &&
    (item.status === "local" || item.attachment?.preview_available === true)

  if (isImage) {
    return (
      <ChatImageAttachmentCard
        filename={item.file.name}
        previewUrl={item.previewUrl}
        busy={isBusy}
        disabled={!canOpen}
        error={item.status === "error"}
        onOpen={canOpen ? onOpen : undefined}
        onRemove={onRemove}
      />
    )
  }

  return (
    <div className="group relative h-[4.5rem] w-[11.5rem] shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted/40">
      <button
        type="button"
        onClick={() => canOpen && onOpen()}
        disabled={!canOpen}
        className={cn(
          "flex h-full w-full items-stretch text-left transition-colors",
          canOpen && "cursor-pointer hover:bg-muted/55",
          !canOpen && "cursor-default"
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2.5 px-2.5 py-2">
          <div
            className={cn(
              "relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md shadow-sm",
              attachmentAccentClass(item.file)
            )}
          >
            {isBusy ? (
              <Loader2 className="h-4 w-4 animate-spin opacity-80" aria-hidden />
            ) : (
              <AttachmentTypeBadge file={item.file} />
            )}
          </div>
          <div className="min-w-0 flex-1 pr-4">
            <p className="truncate text-[13px] font-medium leading-tight">{item.file.name}</p>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {item.status === "error"
                ? item.error || "Upload failed"
                : warning
                  ? warning
                  : attachmentTypeLabel(item.file)}
            </p>
          </div>
        </div>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        className={cn(
          "absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full",
          "bg-background/90 text-muted-foreground shadow-sm hover:bg-background hover:text-foreground"
        )}
        aria-label={`Remove ${item.file.name}`}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}

export function ChatComposerAttachments({
  items,
  onRemove,
  className,
}: {
  items: ComposerAttachmentItem[]
  onRemove: (localId: string) => void
  className?: string
}) {
  const [previewId, setPreviewId] = useState<string | null>(null)
  const previewItem = items.find((item) => item.localId === previewId) || null

  if (items.length === 0) return null

  return (
    <>
      <div className={cn("flex flex-wrap gap-2 pb-1", className)}>
        {items.map((item) => (
          <ComposerAttachmentCard
            key={item.localId}
            item={item}
            onRemove={() => onRemove(item.localId)}
            onOpen={() => setPreviewId(item.localId)}
          />
        ))}
      </div>
      {previewItem ? (
        <AttachmentPreviewModal item={previewItem} onClose={() => setPreviewId(null)} />
      ) : null}
    </>
  )
}
