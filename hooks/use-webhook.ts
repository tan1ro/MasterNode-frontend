"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { webhooksService } from "@/services/webhooks"
import { DEFAULT_QUERY_OPTIONS } from "@/lib/query-config"
import type { WebhookCreateRequest } from "@/types/api"

const WEBHOOK_QUERY_KEY = ["webhook", "task_finished"] as const

export function useWebhookConfig(enabled = true) {
  return useQuery({
    queryKey: WEBHOOK_QUERY_KEY,
    queryFn: () => webhooksService.getTaskFinished(),
    enabled,
    ...DEFAULT_QUERY_OPTIONS,
  })
}

export function useWebhookTaskFinished() {
  return useMutation({
    mutationFn: (data: WebhookCreateRequest) => webhooksService.createTaskFinished(data),
  })
}
