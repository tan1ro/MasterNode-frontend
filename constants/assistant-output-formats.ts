/** Deliverable formats an assistant can steer in chat. */
export type AssistantOutputFormat =
  | "pptx"
  | "pdf"
  | "docx"
  | "html"
  | "image"
  | "video"
  | "research"

export const ASSISTANT_OUTPUT_FORMATS: readonly AssistantOutputFormat[] = [
  "pptx",
  "pdf",
  "docx",
  "html",
  "image",
  "video",
  "research",
] as const

export const OUTPUT_FORMAT_LABELS: Record<AssistantOutputFormat, string> = {
  pptx: "PPTX",
  pdf: "PDF",
  docx: "DOCX",
  html: "HTML",
  image: "Image",
  video: "Video",
  research: "Research",
}

export function outputFormatLabel(fmt: AssistantOutputFormat | string): string {
  const key = fmt as AssistantOutputFormat
  return OUTPUT_FORMAT_LABELS[key] ?? String(fmt).toUpperCase()
}

export function normalizeOutputFormats(raw: unknown): AssistantOutputFormat[] {
  if (!Array.isArray(raw)) return []
  const allowed = new Set(ASSISTANT_OUTPUT_FORMATS)
  return raw
    .map((v) => String(v).trim().toLowerCase())
    .filter((v): v is AssistantOutputFormat => allowed.has(v as AssistantOutputFormat))
}
