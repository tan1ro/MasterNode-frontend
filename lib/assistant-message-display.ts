import {
  buildAssistantIntakeFields,
  type AssistantIntakeField,
} from "@/lib/assistant-intake"
import type { AgentTemplateApi, ChatMessage } from "@/types/api"

export type AssistantIntakeDisplayEntry = {
  templateId: string
  templateName: string
  keywords: Record<string, string>
}

export type AssistantKeywordChip = {
  key: string
  label: string
  value: string
}

export type AssistantIntakeClarifyTrailItem = {
  prompt: string
  answer: string
  reason?: string
}

export function buildIntakeDisplayEntries(
  templates: AgentTemplateApi[],
  valuesByTemplateId: Record<string, Record<string, string>>
): AssistantIntakeDisplayEntry[] {
  return templates
    .map((template) => {
      const templateId = String(template.template_id ?? "").trim()
      if (!templateId) return null
      const values = valuesByTemplateId[templateId] ?? {}
      const fields = buildAssistantIntakeFields(template)
      const keywords: Record<string, string> = {}
      for (const field of fields) {
        const value = String(values[field.name] ?? "").trim()
        if (value) keywords[field.name] = value
      }
      if (Object.keys(keywords).length === 0) return null
      return {
        templateId,
        templateName: String(template.name ?? templateId).trim() || templateId,
        keywords,
      }
    })
    .filter((entry): entry is AssistantIntakeDisplayEntry => Boolean(entry))
}

export function buildUserAssistantIntakeMetadata(
  entries: AssistantIntakeDisplayEntry[],
  options?: {
    userPrompt?: string
    clarifyTrail?: AssistantIntakeClarifyTrailItem[]
  }
): Record<string, unknown> | undefined {
  if (!entries.length && !options?.userPrompt?.trim()) return undefined
  const primary = entries[0]
  const userPrompt = String(options?.userPrompt || "").trim()
  const trail = (options?.clarifyTrail || [])
    .map((item) => ({
      prompt: String(item.prompt || "").trim(),
      answer: String(item.answer || "").trim(),
      reason: String(item.reason || "").trim() || undefined,
    }))
    .filter((item) => item.prompt && item.answer)

  const meta: Record<string, unknown> = {
    assistant_intake_display: true,
  }
  if (primary) {
    meta.agent_template_id = primary.templateId
    meta.agent_template_name = primary.templateName
    meta.assistant_keywords = primary.keywords
  }
  if (entries.length > 1) meta.assistant_intake_entries = entries
  if (userPrompt) meta.assistant_intake_user_prompt = userPrompt
  if (trail.length > 0) meta.assistant_intake_clarify_trail = trail
  return meta
}

function parseKeywordRecord(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {}
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(raw)) {
    const trimmed = String(value ?? "").trim()
    if (trimmed) out[key] = trimmed
  }
  return out
}

export function parseAssistantIntakeUserPrompt(
  metadata: ChatMessage["metadata"] | undefined
): string | null {
  const text = String(metadata?.assistant_intake_user_prompt || "").trim()
  return text || null
}

export function parseAssistantIntakeClarifyTrail(
  metadata: ChatMessage["metadata"] | undefined
): AssistantIntakeClarifyTrailItem[] {
  const raw = metadata?.assistant_intake_clarify_trail
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null
      const prompt = String((item as { prompt?: unknown }).prompt || "").trim()
      const answer = String((item as { answer?: unknown }).answer || "").trim()
      const reason = String((item as { reason?: unknown }).reason || "").trim()
      if (!prompt || !answer) return null
      return { prompt, answer, reason: reason || undefined }
    })
    .filter((item): item is AssistantIntakeClarifyTrailItem => Boolean(item))
}

export function parseAssistantIntakeDisplay(
  metadata: ChatMessage["metadata"] | undefined
): AssistantIntakeDisplayEntry[] | null {
  if (!metadata || metadata.assistant_intake_display !== true) return null

  const entriesRaw = metadata.assistant_intake_entries
  if (Array.isArray(entriesRaw) && entriesRaw.length > 0) {
    const parsed = entriesRaw
      .map((entry) => {
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null
        const templateId = String((entry as { templateId?: unknown }).templateId ?? "").trim()
        const templateName = String(
          (entry as { templateName?: unknown }).templateName ?? templateId
        ).trim()
        const keywords = parseKeywordRecord((entry as { keywords?: unknown }).keywords)
        if (!templateId || Object.keys(keywords).length === 0) return null
        return { templateId, templateName: templateName || templateId, keywords }
      })
      .filter((entry): entry is AssistantIntakeDisplayEntry => Boolean(entry))
    if (parsed.length > 0) return parsed
  }

  const templateId = String(metadata.agent_template_id ?? "").trim()
  const templateName = String(metadata.agent_template_name ?? templateId).trim()
  const keywords = parseKeywordRecord(metadata.assistant_keywords)
  if (!templateId || Object.keys(keywords).length === 0) return null
  return [{ templateId, templateName: templateName || templateId, keywords }]
}

export function shouldRenderAssistantIntakeBubble(
  metadata: ChatMessage["metadata"] | undefined
): boolean {
  if (parseAssistantIntakeUserPrompt(metadata)) return true
  return Boolean(parseAssistantIntakeDisplay(metadata)?.length)
}

export function resolveAssistantKeywordChips(
  entry: AssistantIntakeDisplayEntry,
  fields?: AssistantIntakeField[]
): AssistantKeywordChip[] {
  const fieldList = fields ?? []
  const labelByName = new Map(fieldList.map((field) => [field.name, field.label]))
  return Object.entries(entry.keywords).map(([key, value]) => ({
    key,
    label: labelByName.get(key) || formatKeywordLabel(key),
    value,
  }))
}

export function formatKeywordLabel(name: string): string {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}
