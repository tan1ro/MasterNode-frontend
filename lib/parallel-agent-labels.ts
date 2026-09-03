import { isInternalPipelineAgentId } from "@/lib/pipeline-internal-agents"

export type AgentStageKind = "pipeline" | "parallel" | "repair"

export interface AgentStageEntry {
  id: string
  title: string
  detail?: string
  calls?: number
  kind: AgentStageKind
}

const PIPELINE_LABELS: Record<string, string> = {
  "pipeline:master": "Master",
  "pipeline:decomposer": "Decomposer",
  "pipeline:aggregator": "Aggregator",
  "pipeline:supervisor": "Supervisor",
}

const REPAIR_ID_RE = /^repair_(\d+)_([a-f0-9]+)$/i

const TOKEN_OVERRIDES: Record<string, string> = {
  ppt: "PPT",
  api: "API",
  ui: "UI",
  ux: "UX",
  gtm: "GTM",
  seo: "SEO",
  html: "HTML",
  css: "CSS",
  json: "JSON",
  pdf: "PDF",
  docx: "DOCX",
}

export function humanizeAgentId(id: string): string {
  return id
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLowerCase()
      if (TOKEN_OVERRIDES[lower]) return TOKEN_OVERRIDES[lower]
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(" ")
}

function truncateText(text: string, max = 140): string {
  const collapsed = text.replace(/\s+/g, " ").trim()
  if (collapsed.length <= max) return collapsed
  return `${collapsed.slice(0, max - 1).trimEnd()}…`
}

function firstNonEmptyLine(text: string): string {
  return (
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find(Boolean) ?? text.trim()
  )
}

function summarizePartialEntry(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return truncateText(firstNonEmptyLine(value))
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return null

  const row = value as Record<string, unknown>
  if (typeof row.result === "string" && row.result.trim()) {
    return truncateText(firstNonEmptyLine(row.result))
  }
  if (typeof row.error === "string" && row.error.trim()) {
    return truncateText(`Error: ${firstNonEmptyLine(row.error)}`)
  }
  if (typeof row.description === "string" && row.description.trim()) {
    return truncateText(firstNonEmptyLine(row.description))
  }
  if (row.result && typeof row.result === "object" && !Array.isArray(row.result)) {
    const nested = row.result as Record<string, unknown>
    if (typeof nested.summary === "string" && nested.summary.trim()) {
      return truncateText(firstNonEmptyLine(nested.summary))
    }
    if (typeof nested.message === "string" && nested.message.trim()) {
      return truncateText(firstNonEmptyLine(nested.message))
    }
  }
  return null
}

function normalizeFixDescription(text: string): string {
  return text.replace(/^Fix open point:\s*/i, "").trim()
}

/** Resolve a pipeline / parallel / repair agent id to a user-facing label. */
export function resolveParallelAgentLabel(
  agentId: string,
  partialResults?: Record<string, unknown> | null
): AgentStageEntry {
  const id = String(agentId || "").trim()
  if (!id) {
    return { id: "agent", title: "Agent", kind: "parallel" }
  }

  if (PIPELINE_LABELS[id]) {
    return { id, title: PIPELINE_LABELS[id], kind: "pipeline" }
  }
  if (id === "sequential") {
    return { id, title: "Sequential worker", kind: "parallel" }
  }

  const partial = partialResults?.[id]
  const summary = summarizePartialEntry(partial)
  const repairMatch = id.match(REPAIR_ID_RE)

  if (repairMatch) {
    const index = repairMatch[1]
    const detail = summary ? normalizeFixDescription(summary) : undefined
    return {
      id,
      title: `Repair ${index}`,
      detail,
      kind: "repair",
    }
  }

  if (isInternalPipelineAgentId(id)) {
    return {
      id,
      title: humanizeAgentId(id.replace(/^fix_open_point_?/i, "Fix ")),
      detail: summary ?? undefined,
      kind: "repair",
    }
  }

  return {
    id,
    title: humanizeAgentId(id),
    detail: summary ?? undefined,
    kind: "parallel",
  }
}

export function formatAgentStageEntryLabel(entry: AgentStageEntry): string {
  if (entry.detail) {
    return `${entry.title}: ${entry.detail}`
  }
  return entry.title
}
