import { fileTypeStyleForExt, normalizeFileTypeExt } from "@/constants/rag"
import type { ChatAttachment } from "@/types/api"

export type ComposerAttachmentStatus = "local" | "uploading" | "ready" | "error"

export interface ComposerAttachmentItem {
  localId: string
  file: File
  previewUrl: string
  status: ComposerAttachmentStatus
  attachment?: ChatAttachment
  error?: string
  warning?: string
}

export function createComposerAttachmentPreviewUrl(file: File): string {
  const mime = (file.type || "").trim() || "application/octet-stream"
  return URL.createObjectURL(new Blob([file], { type: mime }))
}

export function createComposerAttachmentItem(file: File): ComposerAttachmentItem {
  return {
    localId: `local-att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    file,
    previewUrl: createComposerAttachmentPreviewUrl(file),
    status: "local",
  }
}

export function revokeComposerAttachmentPreview(item: ComposerAttachmentItem): void {
  if (item.previewUrl.startsWith("blob:")) {
    URL.revokeObjectURL(item.previewUrl)
  }
}

export function attachmentExtFromFile(file: File): string {
  const name = file.name.toLowerCase()
  const dot = name.lastIndexOf(".")
  if (dot >= 0) {
    return normalizeFileTypeExt(name.slice(dot + 1))
  }
  const mime = (file.type || "").toLowerCase()
  if (mime === "application/pdf") return "pdf"
  if (mime.includes("wordprocessingml")) return "docx"
  if (mime.includes("presentationml")) return "pptx"
  if (mime.includes("spreadsheetml")) return "xlsx"
  if (mime === "text/csv") return "csv"
  if (mime === "application/json") return "json"
  if (mime === "text/html") return "html"
  if (mime === "text/markdown") return "md"
  if (mime === "text/plain") return "txt"
  if (mime === "image/png") return "png"
  if (mime === "image/jpeg") return "jpg"
  return "txt"
}

/** @deprecated Prefer `attachmentExtFromFile` — broad category for preview routing. */
export function attachmentKindFromFile(
  file: File
): "image" | "pdf" | "presentation" | "document" | "other" {
  const ext = attachmentExtFromFile(file)
  if (ext === "png" || ext === "jpg") return "image"
  if (ext === "pdf") return "pdf"
  if (ext === "pptx") return "presentation"
  if (ext === "docx" || ext === "txt" || ext === "md" || ext === "html") return "document"
  return "other"
}

export function isImageAttachment(file: File): boolean {
  return attachmentKindFromFile(file) === "image"
}

export function attachmentTypeLabel(file: File): string {
  return fileTypeStyleForExt(attachmentExtFromFile(file)).label
}

export function attachmentAccentClass(file: File): string {
  return fileTypeStyleForExt(attachmentExtFromFile(file)).accentClass
}

/** Short badge label shown on colored file-type tiles (matches extension). */
export function attachmentBadgeLabel(file: File): string {
  return fileTypeStyleForExt(attachmentExtFromFile(file)).label
}

export function composerAttachmentsForSend(items: ComposerAttachmentItem[]): ChatAttachment[] {
  return items
    .filter((item) => item.attachment)
    .map((item) => item.attachment!)
}

export function canPreviewComposerAttachment(file: File): boolean {
  const ext = attachmentExtFromFile(file)
  return ["png", "jpg", "pdf", "docx", "txt", "md", "html", "pptx"].includes(ext)
}

export function attachmentWarningMessage(attachment?: ChatAttachment | null): string | null {
  const warning = (attachment?.warning || "").trim()
  if (warning) return warning
  if (attachment?.text_available && attachment.preview_available !== true) {
    return "Preview unavailable — text was still used in chat."
  }
  if (attachment?.preview_available === false) {
    return "Preview unavailable for this file."
  }
  if (attachment?.text_available === false) {
    return "No readable text was extracted from this file."
  }
  return null
}
