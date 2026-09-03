"use client"

import { useId, useState } from "react"
import { ChevronDown, Presentation } from "lucide-react"
import { formatFileSize } from "@/lib/format-utils"
import { downloadBase64File } from "@/lib/download-base64-file"
import { extractPipelineArtifacts } from "@/lib/pipeline-output"
import { cn } from "@/lib/utils"

export interface PresentationArtifact {
  filename: string
  mime_type: string
  base64: string
  size_bytes?: number
}

export interface SlideOutline {
  title: string
  bullets: string[]
}

export interface PresentationSlidePreview {
  index: number
  title: string
  lines: string[]
  isTitle?: boolean
}

interface ChatPresentationArtifactProps {
  artifact: PresentationArtifact
  title?: string
  themeName?: string
  slidesCreated?: number
  slideOutline?: SlideOutline[] | null
  previewOpen?: boolean
  onOpenPreview?: () => void
  variant?: "card" | "presented"
  className?: string
}

export function buildPresentationDownloadHref(artifact: PresentationArtifact): string {
  return `data:${artifact.mime_type};base64,${artifact.base64}`
}

/** Claude-style compact card title (e.g. "Fullstackdevelopment"). */
export function displayPresentationCardName(filename: string, title?: string): string {
  const base = title?.trim() || filename.replace(/\.pptx$/i, "")
  const compact = base.replace(/[^a-zA-Z0-9]/g, "")
  if (compact) {
    return compact.charAt(0).toUpperCase() + compact.slice(1).toLowerCase()
  }
  return "Presentation"
}

export function displayPresentationName(filename: string, title?: string): string {
  return displayPresentationCardName(filename, title)
}

export function downloadPresentationArtifact(artifact: PresentationArtifact): void {
  downloadBase64File(
    artifact.base64,
    artifact.filename || "presentation.pptx",
    artifact.mime_type ||
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  )
}

export function parseSlideOutline(metadata?: Record<string, unknown>): SlideOutline[] | null {
  const raw = metadata?.slide_outline
  if (!Array.isArray(raw) || raw.length === 0) return null
  const slides: SlideOutline[] = []
  for (const item of raw) {
    if (!item || typeof item !== "object") continue
    const entry = item as Record<string, unknown>
    const slideTitle = String(entry.title || "").trim()
    if (!slideTitle) continue
    const bullets = Array.isArray(entry.bullets)
      ? entry.bullets.map((b) => String(b).trim()).filter(Boolean)
      : []
    slides.push({ title: slideTitle, bullets })
  }
  return slides.length > 0 ? slides : null
}

export function slidesFromOutline(
  outline: SlideOutline[],
  presentationTitle?: string
): PresentationSlidePreview[] {
  return outline.map((slide, idx) => ({
    index: idx + 1,
    title: slide.title,
    lines: slide.bullets,
    isTitle: idx === 0 && Boolean(presentationTitle),
  }))
}

export function slidesFromPptxPreview(
  slides: Array<{ index: number; lines: string[] }>,
  presentationTitle?: string
): PresentationSlidePreview[] {
  return slides.map((slide) => ({
    index: slide.index,
    title: slide.lines[0] || `Slide ${slide.index}`,
    lines: slide.lines.slice(1),
    isTitle: slide.index === 1 && Boolean(presentationTitle),
  }))
}

function PresentationDownloadButton({
  artifact,
  className,
}: {
  artifact: PresentationArtifact
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        downloadPresentationArtifact(artifact)
      }}
      className={className}
    >
      Download
    </button>
  )
}

function PresentationFileCard({
  artifact,
  title,
  themeName,
  slidesCreated,
  previewOpen = false,
  onOpenPreview,
  className,
}: {
  artifact: PresentationArtifact
  title?: string
  themeName?: string
  slidesCreated?: number
  previewOpen?: boolean
  onOpenPreview?: () => void
  className?: string
}) {
  const filename = artifact.filename || "presentation.pptx"
  const name = displayPresentationCardName(filename, title)
  const sizeLabel =
    artifact.size_bytes != null ? formatFileSize(artifact.size_bytes) : undefined
  const canPreview = Boolean(onOpenPreview)

  return (
    <div
      role={canPreview ? "button" : undefined}
      tabIndex={canPreview ? 0 : undefined}
      onClick={canPreview ? onOpenPreview : undefined}
      onKeyDown={
        canPreview
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onOpenPreview?.()
              }
            }
          : undefined
      }
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors",
        canPreview ? "cursor-pointer" : "",
        previewOpen
          ? "border-cyan/40 bg-card ring-1 ring-cyan/20"
          : "border-border/60 bg-card hover:border-border hover:bg-muted/25",
        className
      )}
      aria-label={canPreview ? `Preview ${name} presentation` : `Download ${name} presentation`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/40 bg-muted/30 text-muted-foreground">
        <Presentation className="h-4 w-4" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">
          Presentation · PPTX
          {themeName ? ` · ${themeName}` : ""}
          {slidesCreated != null ? ` · ${slidesCreated} slides` : ""}
          {sizeLabel ? ` · ${sizeLabel}` : ""}
        </p>
      </div>
      <PresentationDownloadButton
        artifact={artifact}
        className="inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-border/70 bg-transparent px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
      />
    </div>
  )
}

export function ChatPresentedFileSection({
  artifact,
  title,
  themeName,
  slidesCreated,
  previewOpen = false,
  onOpenPreview,
  className,
}: ChatPresentationArtifactProps) {
  const panelId = useId()
  const [open, setOpen] = useState(true)

  return (
    <div className={cn("mt-3 min-w-0", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={panelId}
        className="inline-flex max-w-full items-center gap-1.5 rounded-md px-0.5 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <span>Presented file</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 shrink-0 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {open ? (
        <div id={panelId} className="mt-2">
          <PresentationFileCard
            artifact={artifact}
            title={title}
            themeName={themeName}
            slidesCreated={slidesCreated}
            previewOpen={previewOpen}
            onOpenPreview={onOpenPreview}
          />
        </div>
      ) : null}
    </div>
  )
}

export function ChatPresentationArtifact({
  artifact,
  title,
  themeName,
  slidesCreated,
  slideOutline: _slideOutline,
  previewOpen = false,
  onOpenPreview,
  variant = "presented",
  className,
}: ChatPresentationArtifactProps) {
  if (variant === "presented") {
    return (
      <ChatPresentedFileSection
        artifact={artifact}
        title={title}
        themeName={themeName}
        slidesCreated={slidesCreated}
        previewOpen={previewOpen}
        onOpenPreview={onOpenPreview}
        className={className}
      />
    )
  }

  return (
    <PresentationFileCard
      artifact={artifact}
      title={title}
      themeName={themeName}
      slidesCreated={slidesCreated}
      previewOpen={previewOpen}
      onOpenPreview={onOpenPreview}
      className={className}
    />
  )
}

export interface PresentationMessageFields {
  artifact: PresentationArtifact
  title?: string
  themeName?: string
  slidesCreated?: number
}

export function extractPresentationFromTaskResult(
  result: unknown
): PresentationMessageFields | null {
  if (!result || typeof result !== "object") return null
  const record = result as Record<string, unknown>
  const pptArtifact = extractPipelineArtifacts(result).find((artifact) =>
    artifact.filename.toLowerCase().endsWith(".pptx")
  )
  if (!pptArtifact?.base64) return null

  const title =
    typeof record.presentation_title === "string"
      ? record.presentation_title
      : pptArtifact.label
  const themeName =
    typeof record.presentation_theme === "string" ? record.presentation_theme : undefined
  const slidesCreated =
    typeof record.slides_created === "number" ? record.slides_created : undefined

  return {
    artifact: {
      filename: pptArtifact.filename,
      mime_type: pptArtifact.mime_type,
      base64: pptArtifact.base64,
    },
    title,
    themeName,
    slidesCreated,
  }
}

export function resolvePresentationForMessage(
  metadata?: Record<string, unknown>
): PresentationMessageFields | null {
  const direct = parsePresentationArtifact(metadata)
  if (direct) {
    return {
      artifact: direct,
      title:
        typeof metadata?.presentation_title === "string"
          ? metadata.presentation_title
          : undefined,
      themeName:
        typeof metadata?.presentation_theme === "string"
          ? metadata.presentation_theme
          : undefined,
      slidesCreated:
        typeof metadata?.slides_created === "number" ? metadata.slides_created : undefined,
    }
  }
  return extractPresentationFromTaskResult(metadata?.task_result)
}

export function parsePresentationArtifact(
  metadata?: Record<string, unknown>
): PresentationArtifact | null {
  const raw = metadata?.presentation_artifact
  if (!raw || typeof raw !== "object") return null
  const artifact = raw as Record<string, unknown>
  const filename = String(artifact.filename || "").trim()
  const mimeType = String(artifact.mime_type || "").trim()
  const base64 = String(artifact.base64 || "").trim()
  if (!filename || !mimeType || !base64) return null
  const sizeBytes =
    typeof artifact.size_bytes === "number" && Number.isFinite(artifact.size_bytes)
      ? artifact.size_bytes
      : undefined
  return {
    filename,
    mime_type: mimeType,
    base64,
    size_bytes: sizeBytes,
  }
}
