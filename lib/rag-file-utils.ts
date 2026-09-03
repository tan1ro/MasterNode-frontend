import type { RagFile } from "@/types/api"
import { getFileExtension } from "@/lib/format-utils"

/** Stable source key used in chat context, enablement prefs, and RAG allowlists. */
export function ragFileSourceKey(file: Pick<RagFile, "file_id" | "filename">): string {
  return String(file.filename || file.file_id || "").trim()
}

const MIME_TO_EXT: Record<string, string> = {
  "application/pdf": "pdf",
  "text/plain": "txt",
  "text/markdown": "md",
  "text/html": "html",
  "text/csv": "csv",
  "application/json": "json",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
}

function normalizeFileTypeExt(raw?: string): string {
  const value = String(raw || "").trim().toLowerCase()
  if (!value) return ""
  if (MIME_TO_EXT[value]) return MIME_TO_EXT[value]
  if (value.includes("/")) {
    const subtype = value.split("/").pop() || ""
    if (subtype === "jpeg") return "jpg"
    if (subtype && subtype.length <= 6) return subtype
  }
  return value.replace(/^\./, "")
}

/** Extension for badges/icons — prefer filename suffix, then API file_type. */
export function ragFileDisplayExt(file: Pick<RagFile, "filename" | "file_type">): string {
  const fromName = getFileExtension(file.filename)
  const fromApi = normalizeFileTypeExt(file.file_type)
  if (file.filename?.includes(".")) return fromName
  if (fromApi) return fromApi
  return fromName
}
