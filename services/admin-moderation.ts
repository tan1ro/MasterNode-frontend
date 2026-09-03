import { apiClient } from "@/lib/api-client"

export interface ChatModerationReport {
  report_id: string
  tenant_id: string
  conversation_id: string
  message_id?: string | null
  categories: string[]
  matched_labels: string[]
  content_preview: string
  channel: string
  created_at: string
  reviewed: boolean
  email?: string
  username?: string
  violation_count?: number
}

export interface FlaggedChatUser {
  tenant_id: string
  email: string
  username: string
  violation_count: number
  last_moderation_at: string
  moderation_flagged: boolean
}

export const adminModerationService = {
  listReports: async (params?: { limit?: number; skip?: number; pending_only?: boolean }) => {
    const res = await apiClient.get<{ reports: ChatModerationReport[]; count: number }>(
      "/v1/admin/chat-moderation/reports",
      { params }
    )
    return res.data
  },

  listFlaggedUsers: async (limit = 100) => {
    const res = await apiClient.get<{ users: FlaggedChatUser[]; count: number }>(
      "/v1/admin/chat-moderation/flagged-users",
      { params: { limit } }
    )
    return res.data
  },

  markReviewed: async (reportId: string, reviewed = true) => {
    const res = await apiClient.patch<{ ok: boolean; report_id: string; reviewed: boolean }>(
      `/v1/admin/chat-moderation/reports/${encodeURIComponent(reportId)}`,
      null,
      { params: { reviewed } }
    )
    return res.data
  },
}
