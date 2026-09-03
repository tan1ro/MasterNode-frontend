import { apiClient } from "@/lib/api-client"
import type { MetricsListResponse } from "@/types/api"

export type AdminBugReport = {
  id?: string
  ts?: string
  tenant_id?: string
  principal?: string
  outcome?: string
  message?: string
  page_url?: string | null
  conversation_id?: string | null
}

export type AdminBugReportsResponse = {
  reports: AdminBugReport[]
  count: number
  total: number
}

export type AdminFeedbackItem = {
  id?: string
  conversation_id?: string
  message_id?: string
  user_id?: string | null
  feedback_type?: "positive" | "negative" | "report" | string
  reasons?: string[]
  comment?: string
  model?: string
  prompt_tokens?: number
  completion_tokens?: number
  latency?: number | null
  created_at?: string
}

export type AdminFeedbackResponse = {
  feedback: AdminFeedbackItem[]
  count: number
  total: number
}

export type AdminFeedbackTypeFilter = "positive" | "negative" | "report"

export const adminInboxService = {
  listBugReports: (params?: { limit?: number; skip?: number }): Promise<AdminBugReportsResponse> =>
    apiClient
      .get<AdminBugReportsResponse>("/v1/admin/bug-reports", { params })
      .then((res) => res.data),

  listFeedback: (params?: {
    limit?: number
    skip?: number
    feedback_type?: AdminFeedbackTypeFilter
  }): Promise<AdminFeedbackResponse> =>
    apiClient
      .get<AdminFeedbackResponse>("/v1/admin/feedback", { params })
      .then((res) => res.data),

  listPipelineMetrics: (params?: {
    limit?: number
    offset?: number
  }): Promise<MetricsListResponse> =>
    apiClient
      .get<MetricsListResponse>("/v1/admin/metrics", { params })
      .then((res) => res.data),
}
