"use client"

import { Archive, FileText, Presentation } from "lucide-react"
import { formatFileSize } from "@/lib/format-utils"
import { downloadBase64File } from "@/lib/download-base64-file"
import { cn } from "@/lib/utils"
import type { PresentationArtifact } from "@/components/chat/chat-presentation-artifact"

interface ChatDeliverableArtifactProps {
  artifact: PresentationArtifact
  label?: string
  className?: string
}

function artifactIcon(filename: string) {
  if (filename.toLowerCase().endsWith(".zip")) {
    return <Archive className="h-4 w-4 shrink-0 text-violet-500" aria-hidden />
  }
  if (filename.toLowerCase().endsWith(".pptx")) {
    return <Presentation className="h-4 w-4 shrink-0 text-orange-500" aria-hidden />
  }
  return <FileText className="h-4 w-4 shrink-0 text-sky-500" aria-hidden />
}

function artifactKindLabel(filename: string): string {
  const lower = filename.toLowerCase()
  if (lower.endsWith(".zip")) return "ZIP archive"
  if (lower.endsWith(".pptx")) return "Presentation · PPTX"
  if (lower.endsWith(".docx")) return "Document · DOCX"
  if (lower.endsWith(".pdf")) return "Document · PDF"
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) return "Spreadsheet"
  return "File"
}

export function ChatDeliverableArtifact({
  artifact,
  label,
  className,
}: ChatDeliverableArtifactProps) {
  const displayName = label?.trim() || artifact.filename.replace(/\.[^.]+$/, "")
  const sizeLabel =
    typeof artifact.size_bytes === "number" && Number.isFinite(artifact.size_bytes)
      ? formatFileSize(artifact.size_bytes)
      : null

  return (
    <div
      className={cn(
        "mt-3 flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5",
        className
      )}
    >
      {artifactIcon(artifact.filename)}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{displayName}</p>
        <p className="text-xs text-muted-foreground">
          {artifactKindLabel(artifact.filename)}
          {sizeLabel ? ` · ${sizeLabel}` : ""}
        </p>
      </div>
      <button
        type="button"
        className="shrink-0 rounded-lg border border-border/60 bg-background px-2.5 py-1 text-xs font-medium hover:bg-muted/60"
        onClick={() => downloadBase64File(artifact)}
      >
        {artifact.filename.toLowerCase().endsWith(".zip") ? "Download ZIP" : "Download"}
      </button>
    </div>
  )
}

export function ChatDeliverableArtifactList({
  artifacts,
  className,
}: {
  artifacts: PresentationArtifact[]
  className?: string
}) {
  if (!artifacts.length) return null
  return (
    <div className={cn("space-y-2", className)}>
      {artifacts.map((artifact) => (
        <ChatDeliverableArtifact key={`${artifact.filename}-${artifact.mime_type}`} artifact={artifact} />
      ))}
    </div>
  )
}
