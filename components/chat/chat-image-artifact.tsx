"use client"

import { Image as ImageIcon } from "lucide-react"
import { downloadBase64File } from "@/lib/download-base64-file"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ImageArtifact {
  filename: string
  mime_type: string
  base64: string
  size_bytes?: number
}

interface ChatImageArtifactProps {
  artifact: ImageArtifact
  className?: string
}

export function ChatImageArtifact({ artifact, className }: ChatImageArtifactProps) {
  const href = `data:${artifact.mime_type};base64,${artifact.base64}`
  return (
    <div className={cn("rounded-lg border border-border/60 bg-muted/15 p-3 space-y-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
          <ImageIcon className="h-3.5 w-3.5 text-amber" aria-hidden />
          {artifact.filename}
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          onClick={() =>
            downloadBase64File(artifact.base64, artifact.filename, artifact.mime_type)
          }
        >
          Download
        </Button>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={href}
        alt={artifact.filename}
        className="max-h-64 w-full rounded-md border border-border/50 object-contain bg-background"
      />
    </div>
  )
}
