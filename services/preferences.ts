import { apiClient } from "@/lib/api-client"
import type { SettingsPreferences } from "@/lib/settings-preferences"

export type PreferencesPayload = Partial<SettingsPreferences> & Record<string, unknown>

export const preferencesService = {
  get: async (): Promise<{ preferences: PreferencesPayload; updated_at?: string | null }> => {
    const res = await apiClient.get<{
      preferences?: PreferencesPayload
      updated_at?: string | null
    }>("/v1/preferences")
    return {
      preferences: res.data.preferences || {},
      updated_at: res.data.updated_at ?? null,
    }
  },

  put: async (
    preferences: PreferencesPayload
  ): Promise<{ preferences: PreferencesPayload; updated_at?: string | null }> => {
    const res = await apiClient.put<{
      preferences?: PreferencesPayload
      updated_at?: string | null
    }>("/v1/preferences", { preferences })
    return {
      preferences: res.data.preferences || preferences,
      updated_at: res.data.updated_at ?? null,
    }
  },
}

export const artifactsService = {
  list: async (params?: { conversationId?: string; limit?: number }) => {
    const res = await apiClient.get<{ artifacts: Array<Record<string, unknown>> }>("/v1/artifacts", {
      params: {
        conversation_id: params?.conversationId,
        limit: params?.limit ?? 50,
      },
    })
    return res.data.artifacts || []
  },
}

export const projectsService = {
  list: async () => {
    const res = await apiClient.get<{ projects: Array<Record<string, unknown>> }>("/v1/projects")
    return res.data.projects || []
  },
  create: async (body: { name: string; instructions?: string; knowledge_ids?: string[] }) => {
    const res = await apiClient.post("/v1/projects", body)
    return res.data
  },
}

export const privacyService = {
  exportJson: async (): Promise<Record<string, unknown>> => {
    const res = await apiClient.get<Record<string, unknown>>("/v1/privacy/export")
    return res.data
  },
}
