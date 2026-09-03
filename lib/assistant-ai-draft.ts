import type { UpsertAgentTemplateBody } from "@/types/api"
import type { AssistantOutputFormat } from "@/constants/assistant-output-formats"
import { templatesService } from "@/services/templates"
import { isGallerySampleTemplateId } from "@/lib/sample-agent-capability-defaults"

export interface AssistantAiDraftConfig {
  domain_focus?: string
  export_formats?: AssistantOutputFormat[]
  domain_pack?: string
  citation_mode?: "required" | "optional" | "off"
  rag_file_ids?: string[]
  web_search_default?: boolean
  image_style?: string
  preferred_model?: string
}

export interface AssistantAiDraft {
  name: string
  description?: string
  prompt_template: string
  variables?: string[]
  config?: AssistantAiDraftConfig
  suggested_template_id?: string
}

export interface AssistantAiDraftRequest {
  description: string
  domain_hint?: string
}

export interface AssistantAiDraftResponse {
  draft: AssistantAiDraft
  body: UpsertAgentTemplateBody
}

function slugifyId(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
  return base ? `custom-${base}` : `custom-assistant-${Date.now()}`
}

export function draftToUpsertBody(draft: AssistantAiDraft): UpsertAgentTemplateBody {
  const templateId = draft.suggested_template_id?.trim() || slugifyId(draft.name)
  const config: Record<string, unknown> = { ...(draft.config ?? {}) }
  if (draft.config?.preferred_model) {
    config.preferred_model = draft.config.preferred_model
  }
  if (!isGallerySampleTemplateId(templateId)) {
    delete config.domain_focus
    delete config.creator_description
  }
  return {
    template_id: templateId,
    name: draft.name.trim() || templateId,
    prompt_template: draft.prompt_template.trim(),
    description: draft.description?.trim() || undefined,
    variables: draft.variables,
    config: Object.keys(config).length > 0 ? config : undefined,
  }
}

export async function generateAssistantAiDraft(
  request: AssistantAiDraftRequest
): Promise<AssistantAiDraftResponse> {
  const result = await templatesService.aiDraft(request)
  const draft = result.draft
  return {
    draft,
    body: draftToUpsertBody(draft),
  }
}
