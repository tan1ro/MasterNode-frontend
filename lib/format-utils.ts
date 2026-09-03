import { formatUserDate, formatUserDateTime } from "@/lib/datetime-local"

export function formatFileSize(bytes?: number): string {
  if (!bytes && bytes !== 0) return "—"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return "—"
  return formatUserDateTime(dateStr, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export { formatUserDate, formatUserDateTime }

export function getFileExtension(filename?: string): string {
  if (!filename) return "txt"
  const parts = filename.split(".")
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "txt"
}
