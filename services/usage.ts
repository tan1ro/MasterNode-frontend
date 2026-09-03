import { apiClient } from "@/lib/api-client"
import type { UsageResponse, UsageParams } from "@/types/api"

const BASE = "/v1/usage"

export const usageService = {
  /** Get usage (optionally with date range) */
  get: (params?: UsageParams): Promise<UsageResponse> =>
    apiClient.get<UsageResponse>(BASE, { params }).then((res) => res.data),
}
