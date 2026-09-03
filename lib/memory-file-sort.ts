import { ragFileDisplayExt, ragFileSourceKey } from "@/lib/rag-file-utils"
import type { RagFile } from "@/types/api"

export type MemoryFileSortKey = "name" | "type" | "size" | "added" | "enabled"
export type MemoryFileSortDir = "asc" | "desc"

export const MEMORY_FILE_SORT_LABELS: Record<MemoryFileSortKey, string> = {
  name: "Name",
  type: "Type",
  size: "Size",
  added: "Added",
  enabled: "Enabled",
}

function fileTimestamp(file: RagFile): number {
  const raw = file.created_at || file.updated_at
  if (!raw) return 0
  const ts = Date.parse(raw)
  return Number.isFinite(ts) ? ts : 0
}

function fileSizeBytes(file: RagFile): number {
  return file.size_bytes ?? file.file_size ?? 0
}

export function compareMemoryFiles(
  a: RagFile,
  b: RagFile,
  sortKey: MemoryFileSortKey,
  isEnabled: (sourceKey: string) => boolean
): number {
  switch (sortKey) {
    case "name":
      return String(a.filename || a.file_id || "").localeCompare(
        String(b.filename || b.file_id || ""),
        undefined,
        { sensitivity: "base" }
      )
    case "type":
      return ragFileDisplayExt(a).localeCompare(ragFileDisplayExt(b))
    case "size":
      return fileSizeBytes(a) - fileSizeBytes(b)
    case "added":
      return fileTimestamp(a) - fileTimestamp(b)
    case "enabled": {
      const aOn = isEnabled(ragFileSourceKey(a)) ? 1 : 0
      const bOn = isEnabled(ragFileSourceKey(b)) ? 1 : 0
      return aOn - bOn
    }
    default:
      return 0
  }
}

export function sortMemoryFiles(
  files: RagFile[],
  sortKey: MemoryFileSortKey,
  sortDir: MemoryFileSortDir,
  isEnabled: (sourceKey: string) => boolean
): RagFile[] {
  const dir = sortDir === "asc" ? 1 : -1
  return [...files].sort(
    (a, b) => dir * compareMemoryFiles(a, b, sortKey, isEnabled)
  )
}

export function nextMemoryFileSort(
  currentKey: MemoryFileSortKey,
  currentDir: MemoryFileSortDir,
  nextKey: MemoryFileSortKey
): { sortKey: MemoryFileSortKey; sortDir: MemoryFileSortDir } {
  if (currentKey === nextKey) {
    return { sortKey: nextKey, sortDir: currentDir === "asc" ? "desc" : "asc" }
  }
  const defaultDesc: MemoryFileSortKey[] = ["added", "size", "enabled"]
  return {
    sortKey: nextKey,
    sortDir: defaultDesc.includes(nextKey) ? "desc" : "asc",
  }
}

const SORT_OPTION_LABELS: Record<`${MemoryFileSortKey}:${MemoryFileSortDir}`, string> = {
  "name:asc": "Name (A→Z)",
  "name:desc": "Name (Z→A)",
  "type:asc": "Type (A→Z)",
  "type:desc": "Type (Z→A)",
  "size:asc": "Size (smallest first)",
  "size:desc": "Size (largest first)",
  "added:asc": "Added (oldest first)",
  "added:desc": "Added (newest first)",
  "enabled:asc": "Enabled (off first)",
  "enabled:desc": "Enabled (on first)",
}

export function memoryFileSortOptionLabel(
  key: MemoryFileSortKey,
  dir: MemoryFileSortDir
): string {
  return SORT_OPTION_LABELS[`${key}:${dir}`]
}

export const MEMORY_FILE_SORT_OPTIONS: { key: MemoryFileSortKey; dir: MemoryFileSortDir }[] = (
  Object.keys(MEMORY_FILE_SORT_LABELS) as MemoryFileSortKey[]
).flatMap((key) => [
  { key, dir: "asc" as const },
  { key, dir: "desc" as const },
])
