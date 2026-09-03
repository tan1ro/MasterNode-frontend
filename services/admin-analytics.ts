import { apiClient } from "@/lib/api-client"

export interface AdminAnalyticsOverview {
  ok: boolean
  period_days: number
  overview: Record<string, unknown>
  charts: Record<string, Array<Record<string, unknown>>>
  tables: Record<string, Array<Record<string, unknown>>>
}

export const adminAnalyticsService = {
  getOverview(params?: {
    days?: number
    model?: string
    country?: string
    platform?: string
    app_version?: string
  }): Promise<AdminAnalyticsOverview> {
    return apiClient.get("/v1/admin/analytics/overview", { params }).then((res) => res.data)
  },

  exportCsv(days = 30): Promise<string> {
    return apiClient
      .get("/v1/admin/analytics/export", { params: { days, format: "csv" }, responseType: "text" })
      .then((res) => String(res.data))
  },
}
