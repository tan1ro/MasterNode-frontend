import { apiClient } from "@/lib/api-client"
import type { WebhookCreateRequest } from "@/types/api"

export interface WebhookConfigResponse {
  url: string
  events: string[]
  subscription_id?: string
}

export const webhooksService = {
  getTaskFinished: (): Promise<WebhookConfigResponse> =>
    apiClient.get<WebhookConfigResponse>("/v1/webhooks/task_finished").then((res) => res.data),

  createTaskFinished: (data: WebhookCreateRequest): Promise<WebhookConfigResponse> =>
    apiClient.post<WebhookConfigResponse>("/v1/webhooks/task_finished", data).then((res) => res.data),
}
