import { apiClient } from "@/lib/api-client"
import type { HealthResponse } from "@/types/api"

const BASE = "/health"

export type HealthReadyResponse = {
  ready?: boolean
  queue_ok?: boolean
  health?: HealthResponse
}

export type HealthDegradationResponse = {
  level?: number
  levels?: Record<string, string>
}

export type HealthQueueResponse = Record<string, unknown>

export const healthService = {
  get: (): Promise<HealthResponse> =>
    apiClient.get<HealthResponse>(BASE).then((res) => res.data),

  getReady: (): Promise<HealthReadyResponse> =>
    apiClient.get<HealthReadyResponse>("/ready").then((res) => res.data),

  getQueue: (): Promise<HealthQueueResponse> =>
    apiClient.get<HealthQueueResponse>(`${BASE}/queue`).then((res) => res.data),

  getDegradation: (): Promise<HealthDegradationResponse> =>
    apiClient.get<HealthDegradationResponse>(`${BASE}/degradation`).then((res) => res.data),
}
