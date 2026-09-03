import { apiClient } from "@/lib/api-client"
import type { BillingInvoiceRow, PromptQuotaSnapshot } from "@/types/api"

export type AdminBillingInvoice = BillingInvoiceRow & {
  tenant_id?: string
  region?: string | null
  country?: string | null
  customer_email?: string | null
}

export type AdminBillingInvoicesResponse = {
  invoices: AdminBillingInvoice[]
  count: number
  total: number
}

export type AdminBillingGeoResponse = {
  regions: string[]
  countries: string[]
}

export type AdminUserUsageResponse = {
  tenant_id: string
  email?: string
  plan?: string
  account_type?: string
  region?: string | null
  country?: string | null
  prompt_quota?: PromptQuotaSnapshot
  cost_totals?: {
    tenant_id?: string
    total_tokens?: number
    total_cost_usd?: number
    task_count?: number
  }
}

export type AdminUsageResetResponse = {
  ok: boolean
  tenant_id: string
  deleted_prompt_events: number
  cleared_cost_totals: boolean
}

export const adminBillingService = {
  listInvoices: (params?: {
    limit?: number
    skip?: number
    tenant_id?: string
    region?: string
    country?: string
  }): Promise<AdminBillingInvoicesResponse> =>
    apiClient
      .get<AdminBillingInvoicesResponse>("/v1/admin/billing/invoices", { params })
      .then((res) => res.data),

  listGeo: (): Promise<AdminBillingGeoResponse> =>
    apiClient.get<AdminBillingGeoResponse>("/v1/admin/billing/geo").then((res) => res.data),

  getUserUsage: (tenantId: string): Promise<AdminUserUsageResponse> =>
    apiClient
      .get<AdminUserUsageResponse>(`/v1/admin/users/${encodeURIComponent(tenantId)}/usage`)
      .then((res) => res.data),

  resetUserUsage: (
    tenantId: string,
    params?: { prompt_quota?: boolean; cost_totals?: boolean }
  ): Promise<AdminUsageResetResponse> =>
    apiClient
      .post<AdminUsageResetResponse>(
        `/v1/admin/users/${encodeURIComponent(tenantId)}/usage/reset`,
        null,
        { params }
      )
      .then((res) => res.data),
}
