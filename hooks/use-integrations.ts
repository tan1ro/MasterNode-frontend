"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { integrationsService } from "@/services/integrations"
import { DEFAULT_QUERY_OPTIONS } from "@/lib/query-config"
import type { IntegrationConnectRequest } from "@/types/api"

export const INTEGRATIONS_QUERY_KEY = ["integrations"] as const

export function useIntegrations(enabled = true) {
  return useQuery({
    queryKey: INTEGRATIONS_QUERY_KEY,
    queryFn: () => integrationsService.list(),
    enabled,
    ...DEFAULT_QUERY_OPTIONS,
  })
}

export function useConnectIntegration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      provider,
      body,
    }: {
      provider: string
      body: IntegrationConnectRequest
    }) => integrationsService.connect(provider, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INTEGRATIONS_QUERY_KEY })
    },
  })
}

export function useDisconnectIntegration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (provider: string) => integrationsService.disconnect(provider),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INTEGRATIONS_QUERY_KEY })
    },
  })
}

export function useTestIntegration() {
  return useMutation({
    mutationFn: (provider: string) => integrationsService.test(provider),
  })
}
