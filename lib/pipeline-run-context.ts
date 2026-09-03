/** Memory + agent template selections for pipeline runs (Execute, Chat). */

import type { CreateTaskRequest } from "@/types/api"
import { PIPELINE_TEMPLATE_ROLE_SLOTS } from "@/constants/pipeline-template-roles"
import { loadSettingsPreferences } from "@/lib/settings-preferences"

/** Per pipeline stage: zero or more template IDs. */
export type PipelineTemplateSelection = Record<string, string[]>

export interface PipelineRunContext {
  useMemory: boolean
  memorySources: string[]
  templateIds: PipelineTemplateSelection
}

export const RUN_CONTEXT_STORAGE_KEY = "pref_pipeline_run_context"

export function emptyPipelineTemplateSelection(): PipelineTemplateSelection {
  return Object.fromEntries(PIPELINE_TEMPLATE_ROLE_SLOTS.map(({ key }) => [key, []])) as PipelineTemplateSelection
}

export function defaultPipelineRunContext(): PipelineRunContext {
  return {
    useMemory: false,
    memorySources: [],
    templateIds: emptyPipelineTemplateSelection(),
  }
}

/** Indexed knowledge files exist for tenant-scoped RAG retrieval. */
export function memoryRetrievalSupported(ragFileCount: number): boolean {
  return ragFileCount > 0
}

/** Pre-enable Memory when settings default RAG on and the knowledge base has files. */
export function memoryRetrievalEnabledByDefault(ragFileCount: number): boolean {
  if (!memoryRetrievalSupported(ragFileCount)) return false
  if (typeof window === "undefined") return false
  const prefs = loadSettingsPreferences()
  return prefs.defaultUseRag
}

/** API stores one comma-separated string per stage. */
export function encodeTemplateSelection(sel: PipelineTemplateSelection): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, ids] of Object.entries(sel)) {
    const clean = (ids || []).map((id) => String(id).trim()).filter(Boolean)
    if (clean.length > 0) out[key] = clean.join(",")
  }
  return out
}

export function decodeTemplateSelection(raw: Record<string, string> | null | undefined): PipelineTemplateSelection {
  const base = emptyPipelineTemplateSelection()
  if (!raw || typeof raw !== "object") return base
  for (const [key, value] of Object.entries(raw)) {
    const v = String(value || "").trim()
    if (!v) continue
    base[key] = v.split(",").map((s) => s.trim()).filter(Boolean)
  }
  return base
}

export function countSelectedTemplates(sel: PipelineTemplateSelection): number {
  return Object.values(sel).reduce((n, ids) => n + (ids?.length || 0), 0)
}

export function runContextToTaskOptions(ctx: PipelineRunContext): Pick<CreateTaskRequest, "use_rag" | "rag_sources" | "template_ids"> {
  const out: Pick<CreateTaskRequest, "use_rag" | "rag_sources" | "template_ids"> = {}
  if (ctx.useMemory) {
    out.use_rag = true
    if (ctx.memorySources.length > 0) {
      out.rag_sources = [...ctx.memorySources]
    }
  }
  const encoded = encodeTemplateSelection(ctx.templateIds)
  if (Object.keys(encoded).length > 0) {
    out.template_ids = encoded
  }
  return out
}

/** Chat/run context wins per stage; settings defaults fill empty stages. */
export function mergeEncodedTemplateIds(
  primary: Record<string, string> | null | undefined,
  fallback: Record<string, string> | null | undefined
): Record<string, string> | undefined {
  const merged = emptyPipelineTemplateSelection()
  const a = decodeTemplateSelection(primary ?? undefined)
  const b = decodeTemplateSelection(fallback ?? undefined)
  for (const { key } of PIPELINE_TEMPLATE_ROLE_SLOTS) {
    const primaryIds = a[key] || []
    const fallbackIds = b[key] || []
    merged[key] = primaryIds.length > 0 ? primaryIds : fallbackIds
  }
  const encoded = encodeTemplateSelection(merged)
  return Object.keys(encoded).length > 0 ? encoded : undefined
}

export function loadStoredRunContext(ragFileCount = 0): PipelineRunContext {
  if (typeof window === "undefined") return defaultPipelineRunContext()
  try {
    const raw = localStorage.getItem(RUN_CONTEXT_STORAGE_KEY)
    if (!raw) {
      return {
        useMemory: memoryRetrievalEnabledByDefault(ragFileCount),
        memorySources: [],
        templateIds: emptyPipelineTemplateSelection(),
      }
    }
    const parsed = JSON.parse(raw) as Partial<PipelineRunContext>
    return {
      useMemory: Boolean(parsed.useMemory),
      memorySources: Array.isArray(parsed.memorySources)
        ? parsed.memorySources.filter((s) => typeof s === "string" && s.trim())
        : [],
      templateIds: parsed.templateIds && typeof parsed.templateIds === "object"
        ? { ...emptyPipelineTemplateSelection(), ...parsed.templateIds }
        : emptyPipelineTemplateSelection(),
    }
  } catch {
    return defaultPipelineRunContext()
  }
}

export function persistStoredRunContext(ctx: PipelineRunContext): void {
  if (typeof window === "undefined") return
  localStorage.setItem(RUN_CONTEXT_STORAGE_KEY, JSON.stringify(ctx))
  window.dispatchEvent(new Event("masternode-run-context-changed"))
}

/** Merge stored run context with settings defaults (template ids from settings as comma strings). */
export function runContextFromSettingsAndStore(
  settingsTemplateIds: Record<string, string>,
  ragFileCount = 0
): PipelineRunContext {
  const stored = loadStoredRunContext(ragFileCount)
  const fromSettings = decodeTemplateSelection(settingsTemplateIds)
  const templateIds = { ...emptyPipelineTemplateSelection() }
  for (const { key } of PIPELINE_TEMPLATE_ROLE_SLOTS) {
    const a = stored.templateIds[key] || []
    const b = fromSettings[key] || []
    templateIds[key] = a.length > 0 ? a : b
  }
  return {
    useMemory: stored.useMemory,
    memorySources: stored.memorySources,
    templateIds,
  }
}
