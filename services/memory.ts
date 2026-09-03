import { apiClient } from "@/lib/api-client"

export interface UserMemoryItem {
  id: string
  user_id: string
  entities: string[]
  keywords: string[]
  preferences: string[]
  topic: string
  summary: string
  timestamp: number
  source: string
}

export type MemoryCreateInput = {
  summary?: string
  topic?: string
  entities?: string[]
  keywords?: string[]
  preferences?: string[]
}

export type MemoryUpdateInput = {
  summary?: string
  topic?: string
  entities?: string[]
  keywords?: string[]
  preferences?: string[]
}

const BASE = "/v1/memory"

export const memoryService = {
  list: (limit = 200): Promise<UserMemoryItem[]> =>
    apiClient.get<UserMemoryItem[]>(BASE, { params: { limit } }).then((res) => res.data),

  get: (id: string): Promise<UserMemoryItem> =>
    apiClient.get<UserMemoryItem>(`${BASE}/${id}`).then((res) => res.data),

  create: (body: MemoryCreateInput): Promise<UserMemoryItem> =>
    apiClient.post<UserMemoryItem>(BASE, body).then((res) => res.data),

  update: (id: string, body: MemoryUpdateInput): Promise<UserMemoryItem> =>
    apiClient.patch<UserMemoryItem>(`${BASE}/${id}`, body).then((res) => res.data),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`${BASE}/${id}`).then(() => undefined),

  clearAll: (): Promise<{ status: string; deleted: number }> =>
    apiClient.delete<{ status: string; deleted: number }>(BASE).then((res) => res.data),
}
