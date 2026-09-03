import { apiClient } from "@/lib/api-client"
import type {
  IntegrationConnectRequest,
  IntegrationConnectResponse,
  IntegrationsListResponse,
} from "@/types/api"

export interface McpConnectInfo {
  mcp_enabled: boolean
  api_base_url: string
  mcp_http_url: string
  mcp_actions_get_url: string
  integration_invoke_url_template: string
  zapier_get_url: string
  auth_header: string
  auth_note: string
  zapier_note: string
  claude_desktop_config: Record<string, unknown>
}

export const integrationsService = {
  list: (): Promise<IntegrationsListResponse> =>
    apiClient.get<IntegrationsListResponse>("/v1/integrations").then((res) => res.data),

  connect: (provider: string, body: IntegrationConnectRequest): Promise<IntegrationConnectResponse> =>
    apiClient
      .post<IntegrationConnectResponse>(`/v1/integrations/${encodeURIComponent(provider)}/connect`, body)
      .then((res) => res.data),

  disconnect: (provider: string): Promise<{ ok?: boolean }> =>
    apiClient
      .post<{ ok?: boolean }>(`/v1/integrations/${encodeURIComponent(provider)}/disconnect`, {})
      .then((res) => res.data),

  test: (provider: string): Promise<{ ok?: boolean; message?: string }> =>
    apiClient
      .post<{ ok?: boolean; message?: string }>(
        `/v1/integrations/${encodeURIComponent(provider)}/test`,
        {}
      )
      .then((res) => res.data),

  mcpConnectInfo: (): Promise<McpConnectInfo> =>
    apiClient.get<McpConnectInfo>("/v1/integrations/mcp/connect-info").then((res) => res.data),

  mcpActions: (): Promise<{
    connected: Record<string, { status?: string; actions?: string[] }>
    available_actions: Record<string, string[]>
    catalog: string[]
  }> =>
    apiClient
      .get("/v1/integrations/mcp/actions")
      .then((res) => res.data),

  invoke: (
    provider: string,
    action: string,
    params?: Record<string, unknown>
  ): Promise<Record<string, unknown>> =>
    apiClient
      .post(`/v1/integrations/${encodeURIComponent(provider)}/invoke`, {
        action,
        params: params ?? {},
      })
      .then((res) => res.data),
}
