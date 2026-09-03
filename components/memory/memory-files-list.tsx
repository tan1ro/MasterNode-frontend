"use client"

import { ArrowDown, ArrowUp, ArrowUpDown, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { FileTypeBadge } from "@/components/rag/file-type-badge"
import { RagFileIcon } from "@/components/rag/rag-file-icon"
import { formatFileSize, formatUserDate } from "@/lib/format-utils"
import {
  MEMORY_FILE_SORT_LABELS,
  type MemoryFileSortDir,
  type MemoryFileSortKey,
} from "@/lib/memory-file-sort"
import { ragFileDisplayExt, ragFileSourceKey } from "@/lib/rag-file-utils"
import { cn } from "@/lib/utils"
import { useAppAuth } from "@/hooks/use-app-auth"
import type { RagFile } from "@/types/api"

interface MemoryFilesListProps {
  files: RagFile[]
  onDelete: (fileId: string, filename: string) => void
  isDeleting: boolean
  isEnabled?: (sourceKey: string) => boolean
  onEnabledChange?: (sourceKey: string, enabled: boolean) => void
  togglingKey?: string | null
  sortKey: MemoryFileSortKey
  sortDir: MemoryFileSortDir
  onSortChange: (key: MemoryFileSortKey) => void
}

function fileUploadedAt(file: RagFile): string {
  const raw = file.created_at || file.updated_at
  if (!raw) return "—"
  return formatUserDate(raw)
}

function SortButton({
  label,
  active,
  sortDir,
  onClick,
  className,
}: {
  label: string
  active: boolean
  sortDir: MemoryFileSortDir
  onClick: () => void
  className?: string
}) {
  const Icon = active ? (sortDir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider transition-colors",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      {label}
      <Icon className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
    </button>
  )
}

export function MemoryFilesList({
  files,
  onDelete,
  isDeleting,
  isEnabled,
  onEnabledChange,
  togglingKey,
  sortKey,
  sortDir,
  onSortChange,
}: MemoryFilesListProps) {
  const { isSuperUser } = useAppAuth()
  const showEnable = Boolean(isEnabled && onEnabledChange)

  return (
    <div className="overflow-hidden rounded-lg border border-border/60">
      <div
        className={cn(
          "hidden border-b border-border/60 bg-muted/25 px-4 py-2.5 text-left md:grid md:items-center md:gap-3",
          showEnable
            ? isSuperUser
              ? "md:grid-cols-[2.5rem_minmax(0,1fr)_5rem_5.5rem_5rem_6rem_2.5rem]"
              : "md:grid-cols-[2.5rem_minmax(0,1fr)_5rem_5.5rem_6rem_2.5rem]"
            : isSuperUser
              ? "md:grid-cols-[minmax(0,1fr)_5rem_5.5rem_5rem_6rem_2.5rem]"
              : "md:grid-cols-[minmax(0,1fr)_5rem_5.5rem_6rem_2.5rem]"
        )}
      >
        {showEnable ? (
          <SortButton
            label="On"
            active={sortKey === "enabled"}
            sortDir={sortDir}
            onClick={() => onSortChange("enabled")}
          />
        ) : null}
        <SortButton
          label={MEMORY_FILE_SORT_LABELS.name}
          active={sortKey === "name"}
          sortDir={sortDir}
          onClick={() => onSortChange("name")}
          className="justify-start"
        />
        <SortButton
          label={MEMORY_FILE_SORT_LABELS.type}
          active={sortKey === "type"}
          sortDir={sortDir}
          onClick={() => onSortChange("type")}
        />
        <SortButton
          label={MEMORY_FILE_SORT_LABELS.size}
          active={sortKey === "size"}
          sortDir={sortDir}
          onClick={() => onSortChange("size")}
        />
        {isSuperUser ? (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Chunks
          </span>
        ) : null}
        <SortButton
          label={MEMORY_FILE_SORT_LABELS.added}
          active={sortKey === "added"}
          sortDir={sortDir}
          onClick={() => onSortChange("added")}
        />
        <span className="sr-only">Actions</span>
      </div>

      <ul className="divide-y divide-border/50">
        {files.map((file) => {
          const name = file.filename || file.file_id
          const sourceKey = ragFileSourceKey(file)
          const ext = ragFileDisplayExt(file)
          const size = file.size_bytes ?? file.file_size
          const enabled = showEnable ? isEnabled!(sourceKey) : false
          const busy = togglingKey === sourceKey

          return (
            <li
              key={file.file_id}
              className={cn(
                "px-4 py-3 transition-colors hover:bg-muted/15",
                enabled && "bg-cyan/[0.03]"
              )}
            >
              <div
                className={cn(
                  "grid items-center gap-3",
                  showEnable
                    ? isSuperUser
                      ? "grid-cols-[2.5rem_minmax(0,1fr)_auto] md:grid-cols-[2.5rem_minmax(0,1fr)_5rem_5.5rem_5rem_6rem_2.5rem]"
                      : "grid-cols-[2.5rem_minmax(0,1fr)_auto] md:grid-cols-[2.5rem_minmax(0,1fr)_5rem_5.5rem_6rem_2.5rem]"
                    : isSuperUser
                      ? "grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,1fr)_5rem_5.5rem_5rem_6rem_2.5rem]"
                      : "grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,1fr)_5rem_5.5rem_6rem_2.5rem]"
                )}
              >
                {showEnable ? (
                  <div className="flex items-center">
                    {busy ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden />
                    ) : (
                      <Switch
                        checked={enabled}
                        disabled={busy || isDeleting}
                        size="sm"
                        aria-label={`${enabled ? "Disable" : "Enable"} ${name} for chat`}
                        onCheckedChange={(checked) => onEnabledChange!(sourceKey, checked)}
                      />
                    )}
                  </div>
                ) : null}

                <div className="flex min-w-0 items-center gap-3">
                  <RagFileIcon ext={ext} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground" title={name}>
                      {name}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 md:hidden">
                      <FileTypeBadge ext={ext} />
                      {size != null ? (
                        <span className="text-xs text-muted-foreground">{formatFileSize(size)}</span>
                      ) : null}
                      <span className="text-xs text-muted-foreground">{fileUploadedAt(file)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1 md:contents">
                  <div className="hidden md:block">
                    <FileTypeBadge ext={ext} />
                  </div>
                  <span className="hidden whitespace-nowrap text-sm text-muted-foreground md:block">
                    {size != null ? formatFileSize(size) : "—"}
                  </span>
                  {isSuperUser ? (
                    <span className="hidden whitespace-nowrap text-sm text-muted-foreground tabular-nums md:block">
                      {file.chunks_count != null ? file.chunks_count.toLocaleString() : "—"}
                    </span>
                  ) : null}
                  <span className="hidden whitespace-nowrap text-sm text-muted-foreground md:block">
                    {fileUploadedAt(file)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(file.file_id, name)}
                    disabled={isDeleting || busy}
                    className="h-8 w-8 shrink-0 p-0 text-muted-foreground hover:text-destructive"
                    aria-label={`Delete ${name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
