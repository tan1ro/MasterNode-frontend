export const RAG_MAX_UPLOAD_BYTES = 12 * 1024 * 1024

export interface FileTypeStyle {
  label: string
  hex: string
  /** Transparent tinted tile for chat composer attachment icons. */
  accentClass: string
  color: string
  bg: string
  border: string
  tile: string
  badge: string
}

function fileTypeStyle(label: string, hex: string): FileTypeStyle {
  const color = `text-[${hex}]`
  const bg = `bg-[${hex}]/15`
  const border = `border-[${hex}]/30`
  const tile = `bg-[${hex}]/15 text-[${hex}] border-[${hex}]/30`
  const badge = `bg-[${hex}]/15 text-[${hex}] border-[${hex}]/30`
  const accentClass = `bg-[${hex}]/20 text-[${hex}] border border-[${hex}]/35`
  return { label, hex, accentClass, color, bg, border, tile, badge }
}

/** Each format — same hue per type, transparent fills and borders. */
export const FILE_TYPE_STYLES: Record<string, FileTypeStyle> = {
  pdf: fileTypeStyle("PDF", "#DC2626"),
  docx: fileTypeStyle("DOCX", "#4338CA"),
  pptx: fileTypeStyle("PPTX", "#EA580C"),
  xlsx: fileTypeStyle("XLSX", "#16A34A"),
  png: fileTypeStyle("PNG", "#C026D3"),
  jpg: fileTypeStyle("JPG", "#DB2777"),
  txt: fileTypeStyle("TXT", "#0891B2"),
  md: fileTypeStyle("MD", "#7C3AED"),
  csv: fileTypeStyle("CSV", "#0D9488"),
  json: fileTypeStyle("JSON", "#D97706"),
  html: fileTypeStyle("HTML", "#0284C7"),
}

/** Order for format chips in upload zones. */
export const FILE_TYPE_DISPLAY_ORDER: readonly (keyof typeof FILE_TYPE_STYLES)[] = [
  "pdf",
  "docx",
  "pptx",
  "xlsx",
  "png",
  "jpg",
  "txt",
  "md",
  "csv",
  "json",
  "html",
]

const FILE_TYPE_ALIASES: Record<string, keyof typeof FILE_TYPE_STYLES> = {
  jpeg: "jpg",
  htm: "html",
  markdown: "md",
}

/** Tailwind safelist — explicit classes so JIT keeps every file-type color. */
export const FILE_TYPE_TAILWIND_SAFELIST = [
  ...Object.values(FILE_TYPE_STYLES).flatMap((style) => [
    style.color,
    style.bg,
    style.border,
    style.tile,
    style.badge,
    style.accentClass,
  ]),
  "bg-muted/50",
  "text-muted-foreground",
  "border-border/60",
  "bg-muted/30",
]

/** @deprecated Use `fileTypeStyleForExt` — kept for older imports. */
export const FILE_TYPE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = Object.fromEntries(
  Object.entries(FILE_TYPE_STYLES).map(([ext, style]) => [
    ext,
    { label: style.label, color: style.color, bg: style.bg, border: style.border },
  ])
)

export function normalizeFileTypeExt(ext: string): string {
  const key = String(ext || "")
    .trim()
    .toLowerCase()
    .replace(/^\./, "")
  if (key in FILE_TYPE_STYLES) return key
  if (key in FILE_TYPE_ALIASES) return FILE_TYPE_ALIASES[key]!
  return "txt"
}

export function fileTypeStyleForExt(ext: string): FileTypeStyle {
  return FILE_TYPE_STYLES[normalizeFileTypeExt(ext)] ?? FILE_TYPE_STYLES.txt
}

export const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "text/html",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]

export const ACCEPTED_EXTENSIONS = [
  ".pdf",
  ".txt",
  ".md",
  ".markdown",
  ".csv",
  ".json",
  ".html",
  ".htm",
  ".docx",
  ".pptx",
  ".xlsx",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
]

export const RAG_UPLOAD_FORMATS_LABEL =
  "PDF, DOCX, PPTX, XLSX, PNG, JPG, TXT, MD, CSV, JSON, HTML"
