import { apiClient } from "@/lib/api-client"
import type { MetricsListResponse, SloSnapshot, TaskMetricsResponse } from "@/types/api"

export const metricsService = {
  list: (params?: { limit?: number; offset?: number }): Promise<MetricsListResponse> =>
    apiClient.get<MetricsListResponse>("/metrics", { params }).then((res) => res.data),

  slo: (): Promise<SloSnapshot> => apiClient.get<SloSnapshot>("/metrics/slo").then((res) => res.data),

  forTask: (taskId: string): Promise<TaskMetricsResponse> =>
    apiClient.get<TaskMetricsResponse>(`/metrics/${encodeURIComponent(taskId)}`).then((res) => res.data),
}
