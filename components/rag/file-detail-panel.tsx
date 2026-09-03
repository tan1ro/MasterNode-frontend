"use client"

import { FileType2, HardDrive, Layers, Clock } from "lucide-react"
import { fileTypeStyleForExt } from "@/constants/rag"
import { formatFileSize, formatDate, getFileExtension } from "@/lib/format-utils"
import { cn } from "@/lib/utils"
import type { RagFile } from "@/types/api"

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-1.5">
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-xs font-medium truncate">{value}</p>
      </div>
    </div>
  )
}

interface FileDetailPanelProps {
  file: RagFile
}

export function FileDetailPanel({ file }: FileDetailPanelProps) {
  const ext = getFileExtension(file.filename)
  const typeConfig = fileTypeStyleForExt(ext)
  const fileSize = file.size_bytes ?? file.file_size

  return (
    <div className="mt-3 pt-3 border-t border-border/50">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <DetailItem
          icon={<FileType2 className={cn("h-3.5 w-3.5", typeConfig.color)} />}
          label="Type"
          value={file.file_type || getFileExtension(file.filename).toUpperCase()}
        />
        <DetailItem
          icon={<HardDrive className="h-3.5 w-3.5 text-muted-foreground" />}
          label="Size"
          value={formatFileSize(fileSize)}
        />
        <DetailItem
          icon={<Layers className="h-3.5 w-3.5 text-muted-foreground" />}
          label="Chunks"
          value={file.chunks_count != null ? `${file.chunks_count} chunks` : "—"}
        />
        <DetailItem
          icon={<Clock className="h-3.5 w-3.5 text-muted-foreground" />}
          label="Uploaded"
          value={formatDate(file.created_at)}
        />
      </div>
      {file.file_id && (
        <div className="mt-2.5 px-2.5 py-1.5 bg-muted/30 rounded text-[11px] text-muted-foreground font-mono truncate">
          ID: {file.file_id}
        </div>
      )}
    </div>
  )
}
