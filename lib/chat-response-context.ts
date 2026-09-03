import { resolveTemplateDisplayName } from "@/components/agent-templates/template-role-utils"
import {
  assistantContextChipStyleForTemplate,
  memoryContextChipStyle,
  type ContextChipStyle,
} from "@/lib/chat-context-chip-styles"
import { cn } from "@/lib/utils"
import type { AgentTemplateApi, ChatToolEvent } from "@/types/api"

export type ResponseContextKind =
  | "agent"
  | "memory"
  | "keyword_memory"
  | "web_search"
  | "knowledge"

export interface ResponseContextItem {
  kind: ResponseContextKind
  label: string
  templateId?: string
  memoryExt?: string | null
  source?: string
}

const INLINE_CHIP_LIMIT = 2

/** Reply bar: attached assistants + memory files used for this answer (above the output). */
const USER_VISIBLE_CONTEXT_KINDS = new Set<ResponseContextKind>(["agent", "memory", "knowledge"])

const MEMORY_FILE_EXTS = [
  ".pdf",
  ".doc",
  ".docx",
  ".txt",
  ".md",
  ".csv",
  ".json",
  ".xlsx",
  ".xls",
  ".pptx",
  ".ppt",
  ".rtf",
  ".html",
  ".htm",
] as const

/** Only Memory-page uploads — never prompt text or broken snippet labels. */
export function isMemoryFileSourceLabel(label: string, source?: string): boolean {
  const raw = (source || label || "").trim()
  if (!raw) return false
  if (/^(knowledge|memory|rag)$/i.test(raw)) return false
  if (raw.length > 180) return false
  const base = (raw.split(/[\\/]/).pop() || raw).trim()
  const lower = base.toLowerCase()
  if (MEMORY_FILE_EXTS.some((ext) => lower.endsWith(ext))) return true
  // Stable file ids from the Memory page (no spaces / sentence punctuation).
  if (!/\s/.test(base) && base.length >= 4 && !/[)\].?!,]$/.test(base)) return true
  return false
}

function isUserVisibleContextItem(item: ResponseContextItem): boolean {
  if (!USER_VISIBLE_CONTEXT_KINDS.has(item.kind)) return false
  if (item.kind === "memory" || item.kind === "knowledge") {
    return isMemoryFileSourceLabel(item.label, item.source)
  }
  return true
}

function filterUserVisibleContextItems(items: ResponseContextItem[]): ResponseContextItem[] {
  return items.filter(isUserVisibleContextItem)
}

/** Prompt text often ends up stored as a custom agent "name" — don't show it as a chip label. */
export function isPromptLikeAssistantLabel(label: string): boolean {
  const text = label.trim()
  if (!text) return true
  if (text.length > 56) return true
  if (text.split(/\s+/).length > 8) return true
  if (/[.!?]$/.test(text) && text.length > 36) return true
  return false
}

function templateNameForId(
  templateId: string | undefined,
  templates: AgentTemplateApi[] | undefined
): string | undefined {
  const id = String(templateId || "").trim()
  if (!id) return undefined
  const match = (templates || []).find((t) => String(t.template_id || "").trim() === id)
  const name = String(match?.name || "").trim()
  return name || undefined
}

export function resolveAttachedAssistantLabel(
  item: Pick<ResponseContextItem, "templateId" | "label">,
  templates: AgentTemplateApi[] | undefined
): string {
  const templateId = String(item.templateId || "").trim()
  const apiName = templateNameForId(templateId, templates)
  const candidates = [apiName, item.label].filter(
    (value): value is string => Boolean(value && value.trim())
  )
  for (const candidate of candidates) {
    if (!isPromptLikeAssistantLabel(candidate)) {
      return resolveTemplateDisplayName(templateId || candidate, candidate)
    }
  }
  if (templateId) return resolveTemplateDisplayName(templateId, null)
  return "Assistant"
}

function extFromSource(source: string | undefined): string | null {
  const raw = (source || "").trim()
  if (!raw) return null
  const base = raw.split(/[\\/]/).pop() || raw
  const dot = base.lastIndexOf(".")
  if (dot <= 0 || dot === base.length - 1) return null
  return base.slice(dot + 1).toLowerCase()
}

function parseStoredItems(metadata: Record<string, unknown> | undefined): ResponseContextItem[] {
  const block = metadata?.response_context
  if (!block || typeof block !== "object" || Array.isArray(block)) return []
  const rawItems = (block as { items?: unknown }).items
  if (!Array.isArray(rawItems)) return []

  const out: ResponseContextItem[] = []
  for (const entry of rawItems) {
    if (!entry || typeof entry !== "object") continue
    const row = entry as Record<string, unknown>
    const kind = String(row.kind || "").trim() as ResponseContextKind
    const label = String(row.label || "").trim()
    if (!label) continue
    if (
      kind !== "agent" &&
      kind !== "memory" &&
      kind !== "keyword_memory" &&
      kind !== "web_search" &&
      kind !== "knowledge"
    ) {
      continue
    }
    const source = String(row.source || "").trim() || undefined
    out.push({
      kind,
      label: kind === "web_search" ? "Web search" : label,
      templateId: String(row.template_id || "").trim() || undefined,
      memoryExt: extFromSource(source) ?? extFromSource(label),
      source:
        kind === "web_search" && label && label !== "Web search"
          ? label
          : source,
    })
  }
  return out
}

function legacyAgentItems(
  metadata: Record<string, unknown> | undefined,
  templates: AgentTemplateApi[] | undefined
): ResponseContextItem[] {
  const names = Array.isArray(metadata?.agent_template_names)
    ? metadata!.agent_template_names.map((v) => String(v || "").trim()).filter(Boolean)
    : []
  const ids = Array.isArray(metadata?.agent_template_ids)
    ? metadata!.agent_template_ids.map((v) => String(v || "").trim()).filter(Boolean)
    : []

  const pairs: Array<{ id: string; label: string }> = []
  if (ids.length) {
    ids.forEach((id, index) => {
      const label = names[index] || names[0] || id
      pairs.push({ id, label })
    })
  } else {
    const id = String(metadata?.agent_template_id || "").trim()
    const label = String(metadata?.agent_template_name || id).trim()
    if (id) pairs.push({ id, label: label || id })
  }

  return pairs.map(({ id, label }) => {
    const match = (templates || []).find((t) => String(t.template_id || "").trim() === id)
    return {
      kind: "agent" as const,
      templateId: id,
      label: match?.name?.trim() || label,
    }
  })
}

function toolEventItems(toolEvents: ChatToolEvent[] | undefined): ResponseContextItem[] {
  const out: ResponseContextItem[] = []
  const seen = new Set<string>()

  for (const event of toolEvents || []) {
    if (event.type !== "tool_call_completed") continue

    if (event.name === "knowledge_read") {
      const sources = Array.isArray(event.sources)
        ? event.sources.map((s) => String(s || "").trim()).filter(Boolean)
        : []
      for (const source of sources) {
        if (!isMemoryFileSourceLabel(source, source)) continue
        const key = `memory:${source}`
        if (seen.has(key)) continue
        seen.add(key)
        out.push({
          kind: "memory",
          label: source.split(/[\\/]/).pop() || source,
          source,
          memoryExt: extFromSource(source),
        })
      }
      // Do not fall back to free-text knowledge labels — only Memory-page files.
      continue
    }

    if (event.name === "keyword_memory") {
      const key = "keyword_memory:matched"
      if (!seen.has(key)) {
        seen.add(key)
        out.push({
          kind: "keyword_memory",
          label: String(event.label || "Saved memory"),
        })
      }
      continue
    }

    if (event.name === "web_search" && event.status === "ok") {
      continue
    }
  }

  return out
}

function dedupeItems(items: ResponseContextItem[]): ResponseContextItem[] {
  const out: ResponseContextItem[] = []
  const seen = new Set<string>()
  for (const item of items) {
    const key = `${item.kind}:${item.templateId || ""}:${item.source || ""}:${item.label}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(item)
  }
  return out
}

export function buildResponseContextItems(
  metadata: Record<string, unknown> | undefined,
  toolEvents: ChatToolEvent[] | undefined,
  templates: AgentTemplateApi[] | undefined
): ResponseContextItem[] {
  const stored = parseStoredItems(metadata)
  const raw = stored.length
    ? filterUserVisibleContextItems(stored)
    : filterUserVisibleContextItems(
        dedupeItems([...legacyAgentItems(metadata, templates), ...toolEventItems(toolEvents)])
      )

  return raw.map((item) => {
    if (item.kind !== "agent") return item
    return {
      ...item,
      label: resolveAttachedAssistantLabel(item, templates),
    }
  })
}

export function responseContextDisplayLabel(
  item: ResponseContextItem,
  templates?: AgentTemplateApi[]
): string {
  if (item.kind === "web_search") return "Web search"
  if (item.kind === "agent") return resolveAttachedAssistantLabel(item, templates)
  if (item.kind === "memory" || item.kind === "knowledge") {
    const raw = (item.label || "").trim()
    const name = raw.replace(/^Memory\s*·\s*/i, "").trim() || raw || "file"
    return `Memory · ${name}`
  }
  return item.label
}

export function responseContextChipStyle(
  item: ResponseContextItem,
  templates: AgentTemplateApi[] | undefined
): ContextChipStyle {
  if (item.kind === "agent" && item.templateId) {
    return assistantContextChipStyleForTemplate(item.templateId, templates)
  }
  if (item.kind === "memory" || item.kind === "knowledge") {
    return memoryContextChipStyle(item.memoryExt ?? extFromSource(item.label))
  }
  if (item.kind === "keyword_memory") {
    return memoryContextChipStyle(null)
  }
  return {
    chipClass: cn(
      "chat-context-chip inline-flex max-w-full items-center gap-1.5 rounded-full border shadow-sm",
      "border-sky/40 bg-background/45 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur-md"
    ),
    iconClass:
      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky/15 text-sky",
    clearClass: "",
    Icon: memoryContextChipStyle(null).Icon,
  }
}

export function splitResponseContextItems(items: ResponseContextItem[]): {
  inline: ResponseContextItem[]
  overflow: ResponseContextItem[]
} {
  if (items.length <= INLINE_CHIP_LIMIT) {
    return { inline: items, overflow: [] }
  }
  return {
    inline: items.slice(0, INLINE_CHIP_LIMIT),
    overflow: items.slice(INLINE_CHIP_LIMIT),
  }
}

export function responseContextKindLabel(kind: ResponseContextKind): string {
  switch (kind) {
    case "agent":
      return "Assistant"
    case "memory":
      return "Memory file"
    case "knowledge":
      return "Knowledge"
    case "keyword_memory":
      return "Saved memory"
    case "web_search":
      return "Web search"
    default:
      return "Context"
  }
}
