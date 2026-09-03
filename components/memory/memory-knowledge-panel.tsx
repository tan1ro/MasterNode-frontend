"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { FileText, Loader2, Search, Upload } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FileTypeBadge } from "@/components/rag/file-type-badge"
import { MemoryFilesList } from "@/components/memory/memory-files-list"
import { ApiErrorCallout } from "@/components/shared/api-error-callout"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { LoadingState } from "@/components/shared/loading-state"
import { resolveUploadLimits, projectUploadLimitLabel } from "@/constants/upload-limits"
import { validateProjectFileUpload } from "@/lib/upload-validation"
import { useAppAuth } from "@/hooks/use-app-auth"
import {
  ACCEPTED_EXTENSIONS,
  FILE_TYPE_DISPLAY_ORDER,
  RAG_UPLOAD_FORMATS_LABEL,
} from "@/constants/rag"
import {
  CHAT_ENABLED_MEMORY_KEY,
  clearChatEnabledMemory,
  enableAllMemoryFiles,
  pruneChatEnabledMemoryKeys,
  setMemoryFileEnabled,
} from "@/lib/chat-enabled-memory"
import { ragFileSourceKey } from "@/lib/rag-file-utils"
import {
  memoryFileSortOptionLabel,
  MEMORY_FILE_SORT_OPTIONS,
  nextMemoryFileSort,
  sortMemoryFiles,
  type MemoryFileSortDir,
  type MemoryFileSortKey,
} from "@/lib/memory-file-sort"
import { useChatEnabledMemory } from "@/hooks/use-chat-enabled-memory"
import { cn } from "@/lib/utils"
import type { RagFile } from "@/types/api"

interface MemoryKnowledgePanelProps {
  files: RagFile[]
  isLoading: boolean
  error: Error | null
  onUpload: (file: File) => void
  isUploadPending: boolean
  onDelete: (fileId: string, filename: string) => void
  isDeleting: boolean
}

function fileMatchesQuery(file: RagFile, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const name = (file.filename || file.file_id).toLowerCase()
  const type = (file.file_type || "").toLowerCase()
  const chunks = String(file.chunks_count ?? "")
  return name.includes(q) || type.includes(q) || chunks.includes(q)
}

export function MemoryKnowledgePanel({
  files,
  isLoading,
  error,
  onUpload,
  isUploadPending,
  onDelete,
  isDeleting,
}: MemoryKnowledgePanelProps) {
  const { accountType, plan } = useAppAuth()
  const uploadLimits = useMemo(
    () => resolveUploadLimits(plan, accountType),
    [accountType, plan]
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [togglingKey, setTogglingKey] = useState<string | null>(null)
  const [bulkBusy, setBulkBusy] = useState(false)
  const [disableAllOpen, setDisableAllOpen] = useState(false)
  const [sortKey, setSortKey] = useState<MemoryFileSortKey>("added")
  const [sortDir, setSortDir] = useState<MemoryFileSortDir>("desc")
  const { enabledCount, isEnabled } = useChatEnabledMemory()

  const allSourceKeys = useMemo(
    () => files.map((file) => ragFileSourceKey(file)).filter(Boolean),
    [files]
  )

  useEffect(() => {
    if (files.length === 0) return
    pruneChatEnabledMemoryKeys(allSourceKeys)
    if (
      typeof window !== "undefined" &&
      !localStorage.getItem(CHAT_ENABLED_MEMORY_KEY) &&
      allSourceKeys.length > 0
    ) {
      enableAllMemoryFiles(allSourceKeys)
    }
  }, [allSourceKeys, files.length])

  const filteredFiles = useMemo(
    () => files.filter((file) => fileMatchesQuery(file, query)),
    [files, query]
  )

  const sortedFiles = useMemo(
    () => sortMemoryFiles(filteredFiles, sortKey, sortDir, isEnabled),
    [filteredFiles, sortKey, sortDir, isEnabled]
  )

  const handleSortChange = useCallback(
    (key: MemoryFileSortKey) => {
      const next = nextMemoryFileSort(sortKey, sortDir, key)
      setSortKey(next.sortKey)
      setSortDir(next.sortDir)
    },
    [sortKey, sortDir]
  )

  const setFileEnabled = useCallback((sourceKey: string, enabled: boolean) => {
    setTogglingKey(sourceKey)
    try {
      setMemoryFileEnabled(sourceKey, enabled)
    } finally {
      setTogglingKey(null)
    }
  }, [])

  const enableAll = useCallback(() => {
    setBulkBusy(true)
    try {
      enableAllMemoryFiles(allSourceKeys)
    } finally {
      setBulkBusy(false)
    }
  }, [allSourceKeys])

  const disableAll = useCallback(() => {
    setBulkBusy(true)
    try {
      clearChatEnabledMemory()
      setDisableAllOpen(false)
    } finally {
      setBulkBusy(false)
    }
  }, [])

  const processFile = useCallback(
    (file: File) => {
      const ext = "." + file.name.split(".").pop()?.toLowerCase()
      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        setValidationError(`Unsupported file type. Allowed: ${ACCEPTED_EXTENSIONS.join(", ")}`)
        return
      }
      const validation = validateProjectFileUpload(file, uploadLimits)
      if (!validation.ok) {
        setValidationError(validation.message || "File exceeds your plan limit.")
        return
      }
      setValidationError(null)
      onUpload(file)
      if (fileInputRef.current) fileInputRef.current.value = ""
    },
    [onUpload, uploadLimits]
  )

  const openFilePicker = () => {
    if (!isUploadPending) fileInputRef.current?.click()
  }

  return (
    <>
      <ConfirmDialog
        open={disableAllOpen}
        onOpenChange={setDisableAllOpen}
        title="Disable all files for chat?"
        description={`This turns off ${enabledCount} enabled file${enabledCount === 1 ? "" : "s"}. Your uploads stay in Knowledge — re-enable anytime.`}
        confirmLabel="Disable all"
        cancelLabel="Cancel"
        pendingLabel="Disabling…"
        variant="destructive"
        isPending={bulkBusy}
        onConfirm={disableAll}
      />

      <Card id="knowledge" variant="minimal" interactive={false} className="scroll-mt-24">
      <CardContent className="space-y-5 pt-6">
        <div className="space-y-2">
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                openFilePicker()
              }
            }}
            onClick={openFilePicker}
            onDragOver={(event) => {
              event.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={(event) => {
              event.preventDefault()
              setIsDragging(false)
            }}
            onDrop={(event) => {
              event.preventDefault()
              setIsDragging(false)
              const file = event.dataTransfer.files?.[0]
              if (file) processFile(file)
            }}
            className={cn(
              "rounded-xl border-2 border-dashed px-5 py-8 text-center transition-colors",
              isDragging
                ? "border-amber/60 bg-amber/5"
                : "border-border hover:border-amber/40 hover:bg-muted/30",
              isUploadPending && "pointer-events-none opacity-70"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="sr-only"
              accept={ACCEPTED_EXTENSIONS.join(",")}
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) processFile(file)
              }}
              disabled={isUploadPending}
            />

            {isUploadPending ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-7 w-7 animate-spin text-amber" aria-hidden />
                <p className="text-sm font-medium text-foreground">Uploading and indexing…</p>
                <p className="text-xs text-muted-foreground">Chunking and embedding your file</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber/10 text-amber">
                  <Upload className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Drop a file or click to browse</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {RAG_UPLOAD_FORMATS_LABEL} · {projectUploadLimitLabel(uploadLimits)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {FILE_TYPE_DISPLAY_ORDER.map((ext) => (
                    <FileTypeBadge key={ext} ext={ext} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {validationError ? (
            <p className="text-sm text-destructive" role="alert">
              {validationError}
            </p>
          ) : null}

          <div className="flex justify-end sm:hidden">
            <Button type="button" variant="outline" size="sm" disabled={isUploadPending} onClick={openFilePicker}>
              Browse files
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {!isLoading && files.length > 0 ? (
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative min-w-0 flex-1 lg:max-w-sm">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search files…"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-10 border-border/70 bg-background/60 pl-8"
                  aria-label="Search knowledge files"
                />
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground tabular-nums">
                {sortedFiles.length} shown · {enabledCount} enabled
              </span>
              <label className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                <span className="hidden sm:inline">Sort</span>
                <select
                  value={`${sortKey}:${sortDir}`}
                  onChange={(event) => {
                    const [key, dir] = event.target.value.split(":") as [
                      MemoryFileSortKey,
                      MemoryFileSortDir,
                    ]
                    setSortKey(key)
                    setSortDir(dir)
                  }}
                  className="h-10 rounded-md border border-border/70 bg-background/60 px-2.5 text-xs text-foreground outline-none focus-visible:border-cyan/40 focus-visible:ring-1 focus-visible:ring-cyan/30"
                  aria-label="Sort knowledge files"
                >
                  {MEMORY_FILE_SORT_OPTIONS.map(({ key, dir }) => (
                    <option key={`${key}:${dir}`} value={`${key}:${dir}`}>
                      {memoryFileSortOptionLabel(key, dir)}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex shrink-0 flex-wrap items-center gap-2 lg:ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-10 border-border/70 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  disabled={bulkBusy || togglingKey !== null || enabledCount === 0}
                  onClick={() => setDisableAllOpen(true)}
                >
                  Disable all
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="h-10 border-cyan/35 bg-cyan text-cyan-foreground hover:bg-cyan/90"
                  disabled={bulkBusy || togglingKey !== null || enabledCount === files.length}
                  onClick={enableAll}
                >
                  Enable all
                </Button>
              </div>
            </div>
          ) : null}

          {!isLoading && files.length > 0 && enabledCount === 0 ? (
            <div className="rounded-lg border border-dashed border-cyan/30 bg-cyan/[0.04] px-4 py-3 text-sm text-muted-foreground">
              No files enabled for chat yet. Turn on files below or use{" "}
              <span className="font-medium text-foreground">Enable all</span>.
            </div>
          ) : null}

          {isLoading ? (
            <LoadingState message="Loading knowledge files…" />
          ) : error ? (
            <ApiErrorCallout
              error={error}
              title="Could not load knowledge files"
              fallbackMessage="Failed to load files from the API."
            />
          ) : files.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No documents in your knowledge base"
              description="Upload documents, spreadsheets, presentations, or images to start building retrieval context."
              className="py-10"
            />
          ) : filteredFiles.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
              No files match &ldquo;{query.trim()}&rdquo;.{" "}
              <button
                type="button"
                className="text-amber underline-offset-2 hover:underline"
                onClick={() => setQuery("")}
              >
                Clear search
              </button>
            </div>
          ) : (
            <MemoryFilesList
              files={sortedFiles}
              onDelete={onDelete}
              isDeleting={isDeleting}
              isEnabled={isEnabled}
              onEnabledChange={setFileEnabled}
              togglingKey={togglingKey}
              sortKey={sortKey}
              sortDir={sortDir}
              onSortChange={handleSortChange}
            />
          )}
        </div>
      </CardContent>
    </Card>
    </>
  )
}
