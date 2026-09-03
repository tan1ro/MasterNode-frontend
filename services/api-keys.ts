import { apiClient } from "@/lib/api-client"
import type {
  ApiKeyRecord,
  CreateApiKeyRequest,
  CreateApiKeyResponse,
  AutoCreateApiKeyResponse,
} from "@/types/api"

const BASE = "/v1/api-keys"

export const apiKeysService = {
  /** List all API keys */
  list: (): Promise<ApiKeyRecord[]> =>
    apiClient.get<ApiKeyRecord[]>(BASE).then((res) => res.data),

  /** Create a new API key */
  create: (data: CreateApiKeyRequest): Promise<CreateApiKeyResponse> =>
    apiClient.post<CreateApiKeyResponse>(BASE, data).then((res) => res.data),

  /** Delete an API key by key_id */
  delete: (keyId: string): Promise<void> =>
    apiClient.delete(`${BASE}/${keyId}`).then(() => undefined),

  /**
   * Auto-create an API key (no auth required).
   * Pass X-User-ID header for tenant association.
   */
  autoCreate: (userId: string): Promise<AutoCreateApiKeyResponse> =>
    apiClient
      .post<AutoCreateApiKeyResponse>(`${BASE}/auto-create`, undefined, {
        headers: { "X-User-ID": userId },
      })
      .then((res) => res.data),

  /** Ensure default API key + $5 starter credit for signed-in app users (creators). */
  ensureDefault: (): Promise<AutoCreateApiKeyResponse> =>
    apiClient.post<AutoCreateApiKeyResponse>(`${BASE}/ensure-default`).then((res) => res.data),
}
