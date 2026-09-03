import { apiClient } from "@/lib/api-client"

export interface OrganizationSummary {
  org_id: string
  name: string
  member_count: number
}

export interface OrganizationActionResponse {
  org_id: string
  name: string
  member_count?: number
  org_role?: string
}

export const organizationsService = {
  search: (q: string, limit = 15): Promise<{ organizations: OrganizationSummary[] }> =>
    apiClient
      .get<{ organizations: OrganizationSummary[] }>("/v1/organizations/search", {
        params: { q, limit },
      })
      .then((res) => res.data),

  create: (payload: { name: string; logo_data_url?: string }): Promise<OrganizationActionResponse> =>
    apiClient.post<OrganizationActionResponse>("/v1/organizations", payload).then((res) => res.data),

  join: (orgId: string): Promise<OrganizationActionResponse> =>
    apiClient
      .post<OrganizationActionResponse>(`/v1/organizations/${encodeURIComponent(orgId)}/join`)
      .then((res) => res.data),
}
