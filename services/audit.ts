import { apiClient } from "@/lib/api-client"
import type { AuditLogsResponse, ClientChannel } from "@/types/api"

export const auditService = {
  list: (params?: {
    tenant_id?: string
    limit?: number
    client_channel?: ClientChannel
  }): Promise<AuditLogsResponse> =>
    apiClient
      .get<AuditLogsResponse>("/audit/logs", {
        params: {
          limit: params?.limit ?? 50,
          ...(params?.tenant_id ? { tenant_id: params.tenant_id } : {}),
          ...(params?.client_channel ? { client_channel: params.client_channel } : {}),
        },
      })
      .then((res) => res.data),
}
