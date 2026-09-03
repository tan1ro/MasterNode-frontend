import { apiClient } from "@/lib/api-client"
import type { ApiWalletResponse } from "@/types/api"

const BASE = "/v1/wallet"

export const walletService = {
  get: (): Promise<ApiWalletResponse> => apiClient.get<ApiWalletResponse>(BASE).then((res) => res.data),

  deposit: (body: { amount_usd: number; key_id?: string }): Promise<Record<string, unknown>> =>
    apiClient.post(`${BASE}/deposit`, body).then((res) => res.data),
}
