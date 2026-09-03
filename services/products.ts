import { apiClient } from "@/lib/api-client"
import type { ProductTaskListResponse, WorkspaceProduct } from "@/types/api"
import type { ProductSdlcPhaseId } from "@/constants/product-sdlc"

const BASE = "/v1/products"

export const productsService = {
  list: (): Promise<{ products: WorkspaceProduct[] }> =>
    apiClient.get<{ products: WorkspaceProduct[] }>(BASE).then((res) => res.data),

  get: (productId: string): Promise<WorkspaceProduct> =>
    apiClient.get<WorkspaceProduct>(`${BASE}/${encodeURIComponent(productId)}`).then((res) => res.data),

  create: (payload: {
    name: string
    description?: string
    file_ids?: string[]
  }): Promise<WorkspaceProduct> =>
    apiClient.post<WorkspaceProduct>(BASE, payload).then((res) => res.data),

  update: (
    productId: string,
    payload: { name?: string; description?: string; file_ids?: string[] }
  ): Promise<WorkspaceProduct> =>
    apiClient
      .put<WorkspaceProduct>(`${BASE}/${encodeURIComponent(productId)}`, payload)
      .then((res) => res.data),

  delete: (productId: string): Promise<void> =>
    apiClient.delete(`${BASE}/${encodeURIComponent(productId)}`).then(() => undefined),

  listTasks: (
    productId: string,
    params?: { sdlc_phase?: ProductSdlcPhaseId; skip?: number; limit?: number }
  ): Promise<ProductTaskListResponse> =>
    apiClient
      .get<ProductTaskListResponse>(`${BASE}/${encodeURIComponent(productId)}/tasks`, {
        params: {
          skip: params?.skip ?? 0,
          limit: params?.limit ?? 100,
          ...(params?.sdlc_phase ? { sdlc_phase: params.sdlc_phase } : {}),
        },
      })
      .then((res) => res.data),
}
