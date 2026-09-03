"use client"

import { useState } from "react"
import { Trash2, ChevronUp, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatFileSize, formatDate, getFileExtension } from "@/lib/format-utils"
import { cn } from "@/lib/utils"
import { FileTypeBadge } from "./file-type-badge"
import { RagFileIcon } from "./rag-file-icon"
import { FileDetailPanel } from "./file-detail-panel"
import type { RagFile } from "@/types/api"

interface FileCardProps {
  file: RagFile
  onDelete: (fileId: string) => void
  isDeleting: boolean
}

export function FileCard({ file, onDelete, isDeleting }: FileCardProps) {
  const [expanded, setExpanded] = useState(false)
  const ext = getFileExtension(file.filename)
  const fileSize = file.size_bytes ?? file.file_size

  return (
    <div
      className={cn(
        "group relative rounded-lg border transition-all duration-200",
        "bg-card hover:bg-accent/30",
        expanded
          ? "border-amber-500/30 shadow-sm"
          : "border-border hover:border-border/80"
      )}
    >
      <div className="flex items-center gap-3 p-3 sm:p-4">
        <RagFileIcon ext={ext} size="lg" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate">
              {file.filename || file.file_id}
            </p>
            <FileTypeBadge ext={ext} />
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
            {fileSize != null && <span>{formatFileSize(fileSize)}</span>}
            {file.chunks_count != null && (
              <>
                <span className="text-border">·</span>
                <span>{file.chunks_count} chunks</span>
              </>
            )}
            {file.created_at && (
              <>
                <span className="text-border">·</span>
                <span className="hidden sm:inline">{formatDate(file.created_at)}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(file.file_id)}
            disabled={isDeleting}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 sm:px-4 sm:pb-4">
          <FileDetailPanel file={file} />
        </div>
      )}
    </div>
  )
}
