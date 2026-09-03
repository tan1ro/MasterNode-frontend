import { apiClient } from "@/lib/api-client"

export interface TenantUsageSummary {
  tenant_id?: string
  total_tokens?: number
  total_cost_usd?: number
  task_count?: number
  region?: string
  source?: string
  by_feature?: Record<string, { tokens?: number; cost_usd?: number }>
}

export const tenantService = {
  usage: (tenantId = "api-tenant"): Promise<TenantUsageSummary> =>
    apiClient
      .get<TenantUsageSummary>(`/tenants/${encodeURIComponent(tenantId)}/usage`)
      .then((res) => res.data),
}
