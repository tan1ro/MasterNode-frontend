/** Deliverable kinds users can pick on the pipeline plan card. */
export const PIPELINE_PLAN_OUTPUT_FORMATS = [
  { value: "text", label: "Text" },
  { value: "document", label: "Document" },
  { value: "presentation", label: "Presentation" },
  { value: "code", label: "Code" },
  { value: "spreadsheet", label: "Spreadsheet" },
  { value: "image", label: "Image" },
] as const

export type PipelinePlanOutputFormat =
  (typeof PIPELINE_PLAN_OUTPUT_FORMATS)[number]["value"]

const FORMAT_LABEL: Record<PipelinePlanOutputFormat, string> = {
  text: "Text",
  document: "Document (DOCX/PDF)",
  presentation: "Presentation (PPTX)",
  code: "Code / frontend project",
  spreadsheet: "Spreadsheet",
  image: "Image",
}

/** Phrases that help backend deliverable intent inference from approved plan text. */
const FORMAT_HINT: Record<PipelinePlanOutputFormat, string> = {
  text: "Deliver as a clear text analysis write-up.",
  document: "Deliver as a document (DOCX/PDF).",
  presentation: "Deliver as a presentation (PPTX slides).",
  code: "Deliver as code / a frontend project (HTML/React).",
  spreadsheet: "Deliver as a spreadsheet.",
  image: "Deliver as an image.",
}

export function isPipelinePlanOutputFormat(value: string): value is PipelinePlanOutputFormat {
  return PIPELINE_PLAN_OUTPUT_FORMATS.some((item) => item.value === value)
}

export function pipelinePlanOutputFormatLabel(kind: string | null | undefined): string {
  const key = String(kind || "text").toLowerCase()
  if (isPipelinePlanOutputFormat(key)) return FORMAT_LABEL[key]
  return key ? key.charAt(0).toUpperCase() + key.slice(1) : "Text"
}

/**
 * Keep plan markdown in sync with the chosen output format so continue/resume
 * and intent inference see the user's selection.
 */
export function applyOutputFormatToPlanMarkdown(
  planMarkdown: string,
  kind: PipelinePlanOutputFormat
): string {
  const base = (planMarkdown || "").trim()
  const section = [
    "## Output format",
    "",
    `- **Chosen format:** ${FORMAT_LABEL[kind]}`,
    `- ${FORMAT_HINT[kind]}`,
  ].join("\n")

  const replaced = base.replace(
    /(?:^|\n)##\s*Output format\b[\s\S]*?(?=\n##\s|\n#\s|$)/i,
    "\n"
  )
  const cleaned = replaced.replace(/\n{3,}/g, "\n\n").trim()
  return cleaned ? `${cleaned}\n\n${section}\n` : `${section}\n`
}

/** Trigger a browser download of the plan markdown file. */
export function downloadPlanMarkdownFile(filename: string, markdown: string): void {
  if (typeof window === "undefined") return
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename.endsWith(".md") ? filename : `${filename}.plan.md`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
