import { apiClient } from "@/lib/api-client"
import type { AgentTemplatesListResponse, UpsertAgentTemplateBody } from "@/types/api"

function optionalTenantParams(tenant_id?: string): Record<string, string> | undefined {
  const t = tenant_id?.trim()
  if (!t) return undefined
  return { tenant_id: t }
}

export const templatesService = {
  list: (params?: { tenant_id?: string; limit?: number; offset?: number }): Promise<AgentTemplatesListResponse> => {
    const limit = params?.limit ?? 50
    const offset = params?.offset ?? 0
    const q: Record<string, string | number> = { limit, offset }
    const tp = optionalTenantParams(params?.tenant_id)
    if (tp) Object.assign(q, tp)
    return apiClient.get<AgentTemplatesListResponse>("/templates", { params: q }).then((res) => res.data)
  },

  upsert: (
    body: UpsertAgentTemplateBody,
    params?: { tenant_id?: string }
  ): Promise<{ status: string; template_id: string }> =>
    apiClient
      .post<{ status: string; template_id: string }>("/templates", body, {
        params: optionalTenantParams(params?.tenant_id),
      })
      .then((res) => res.data),

  delete: (
    templateId: string,
    params?: { tenant_id?: string }
  ): Promise<{ status: string; template_id: string }> =>
    apiClient
      .delete<{ status: string; template_id: string }>(
        `/templates/${encodeURIComponent(templateId)}`,
        { params: optionalTenantParams(params?.tenant_id) }
      )
      .then((res) => res.data),

  aiDraft: (body: { description: string; domain_hint?: string }): Promise<{ draft: import("@/lib/assistant-ai-draft").AssistantAiDraft }> =>
    apiClient.post("/v1/templates/ai-draft", body).then((res) => res.data),
}
