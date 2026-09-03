"use client"

import { SAMPLE_AGENT_TEMPLATES } from "@/constants/sample-agent-templates"
import {
  emptyPipelineTemplateSelection,
  type PipelineTemplateSelection,
} from "@/lib/pipeline-run-context"
import { isGallerySampleTemplateId, isUserCustomAgentTemplateId } from "@/lib/sample-agent-capability-defaults"
import type { AgentTemplateApi } from "@/types/api"

export const CHAT_ATTACHED_ASSISTANTS_KEY = "pref_chat_attached_assistants"
export const CHAT_ATTACHED_ASSISTANTS_CHANGED = "masternode-chat-attached-assistants-changed"

/** Chat attachments are not pipeline stage assignments — always bucket under ``custom``. */
const CHAT_ATTACHMENT_SLOT = "custom"

export function loadChatAttachedTemplates(): PipelineTemplateSelection {
  if (typeof window === "undefined") return emptyPipelineTemplateSelection()
  try {
    const raw = localStorage.getItem(CHAT_ATTACHED_ASSISTANTS_KEY)
    if (!raw) return emptyPipelineTemplateSelection()
    const parsed = JSON.parse(raw) as Partial<PipelineTemplateSelection>
    if (!parsed || typeof parsed !== "object") return emptyPipelineTemplateSelection()
    const base = emptyPipelineTemplateSelection()
    for (const [role, ids] of Object.entries(parsed)) {
      if (!Array.isArray(ids)) continue
      base[role] = ids.map((id) => String(id).trim()).filter(Boolean)
    }
    return base
  } catch {
    return emptyPipelineTemplateSelection()
  }
}

export function persistChatAttachedTemplates(templateIds: PipelineTemplateSelection): void {
  if (typeof window === "undefined") return
  const cleaned = emptyPipelineTemplateSelection()
  for (const [role, ids] of Object.entries(templateIds)) {
    const next = (ids || []).map((id) => String(id).trim()).filter(Boolean)
    if (next.length > 0) cleaned[role] = next
  }
  localStorage.setItem(CHAT_ATTACHED_ASSISTANTS_KEY, JSON.stringify(cleaned))
  window.dispatchEvent(new Event(CHAT_ATTACHED_ASSISTANTS_CHANGED))
}

export function isTemplateAttachedToChat(
  templateId: string,
  selection: PipelineTemplateSelection = loadChatAttachedTemplates()
): boolean {
  const id = templateId.trim()
  if (!id) return false
  return Object.values(selection).some((ids) => (ids || []).includes(id))
}

export function listAttachedTemplateIds(
  selection: PipelineTemplateSelection = loadChatAttachedTemplates()
): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const ids of Object.values(selection)) {
    for (const rawId of ids || []) {
      const id = String(rawId || "").trim()
      if (!id || seen.has(id)) continue
      seen.add(id)
      out.push(id)
    }
  }
  return out
}

export function attachTemplateToChat(templateId: string): PipelineTemplateSelection {
  const id = templateId.trim()
  if (!id) return loadChatAttachedTemplates()
  const current = loadChatAttachedTemplates()
  const next = { ...emptyPipelineTemplateSelection(), ...current }
  const roleIds = [...(next[CHAT_ATTACHMENT_SLOT] || [])]
  if (!roleIds.includes(id)) roleIds.push(id)
  next[CHAT_ATTACHMENT_SLOT] = roleIds
  persistChatAttachedTemplates(next)
  return next
}

export function detachTemplateFromChat(templateId: string): PipelineTemplateSelection {
  const id = templateId.trim()
  const current = loadChatAttachedTemplates()
  if (!id) return current
  const next = { ...emptyPipelineTemplateSelection(), ...current }
  for (const [role, ids] of Object.entries(next)) {
    next[role] = (ids || []).filter((value) => value !== id)
  }
  persistChatAttachedTemplates(next)
  return next
}

export function clearChatAttachedTemplates(): PipelineTemplateSelection {
  const next = emptyPipelineTemplateSelection()
  persistChatAttachedTemplates(next)
  return next
}

export function gallerySampleToApiTemplate(
  sample: (typeof SAMPLE_AGENT_TEMPLATES)[number]
): AgentTemplateApi {
  const { category: _category, ...body } = sample
  return {
    template_id: body.template_id,
    name: body.name,
    description: body.description,
    prompt_template: body.prompt_template,
    config: body.config,
    variables: body.variables,
    unlocked: true,
  }
}

function resolveAttachedTemplate(
  id: string,
  apiById: Map<string, AgentTemplateApi>
): AgentTemplateApi | null {
  const fromApi = apiById.get(id)
  if (fromApi) return fromApi
  const sample = SAMPLE_AGENT_TEMPLATES.find((s) => s.template_id === id)
  if (sample) return gallerySampleToApiTemplate(sample)
  return {
    template_id: id,
    name: id,
    description: "",
    prompt_template: "",
    variables: [],
  }
}

/** Resolve enabled chat assistants (chat pickers) from API templates + built-in samples. */
export function resolveChatEnabledTemplates(
  attachedIds: string[],
  apiTemplates: AgentTemplateApi[] | undefined
): AgentTemplateApi[] {
  const apiById = new Map(
    (apiTemplates ?? []).map((t) => [String(t.template_id || "").trim(), t])
  )
  const out: AgentTemplateApi[] = []
  for (const id of attachedIds) {
    const resolved = resolveAttachedTemplate(id, apiById)
    if (resolved) out.push(resolved)
  }
  return out
}

export type CustomizeAssistantRow = {
  template: AgentTemplateApi
  /** Whether this assistant is enabled for chat. */
  attached: boolean
}

/** User-created assistants from the API (excludes built-in ``sample-*`` gallery seeds). */
export function listUserCustomAgentTemplates(
  apiTemplates: AgentTemplateApi[] | undefined
): AgentTemplateApi[] {
  return (apiTemplates ?? []).filter((template) =>
    isUserCustomAgentTemplateId(template.template_id)
  )
}

export function customAgentGalleryBlurb(template: AgentTemplateApi): string | null {
  const cfg =
    template.config && typeof template.config === "object"
      ? (template.config as Record<string, unknown>)
      : {}
  const creator = String(cfg.creator_description ?? "").trim()
  if (creator) {
    const firstLine = creator.split(/\n/)[0]?.trim() ?? creator
    if (firstLine.length <= 200) return firstLine
    return `${firstLine.slice(0, 199).trim()}…`
  }
  const summary = String(template.description ?? "").trim()
  return summary || null
}

/**
 * Customize tab: attached gallery assistants + all user-created custom templates from the API.
 */
export function resolveCustomizeAssistants(
  attachedIds: string[],
  apiTemplates: AgentTemplateApi[] | undefined
): CustomizeAssistantRow[] {
  const apiById = new Map(
    (apiTemplates ?? []).map((t) => [String(t.template_id || "").trim(), t])
  )
  const attachedSet = new Set(attachedIds)
  const seen = new Set<string>()
  const out: CustomizeAssistantRow[] = []

  for (const id of attachedIds) {
    if (!id || seen.has(id)) continue
    const template = resolveAttachedTemplate(id, apiById)
    if (!template) continue
    seen.add(id)
    out.push({ template, attached: true })
  }

  for (const template of apiTemplates ?? []) {
    const id = String(template.template_id || "").trim()
    if (!id || seen.has(id) || !isUserCustomAgentTemplateId(id)) continue
    seen.add(id)
    out.push({ template, attached: attachedSet.has(id) })
  }

  return out
}
