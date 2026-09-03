"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { templatesService } from "@/services/templates"
import { DEFAULT_QUERY_OPTIONS } from "@/lib/query-config"
import { useProtectedQueryEnabled } from "@/providers/auth-session-provider"
import type { UpsertAgentTemplateBody } from "@/types/api"

const TEMPLATES_KEY = ["agent-templates"] as const

/**
 * List agent templates for the same tenant the API uses for tasks
 * (omit ``tenantId`` so the server scopes by API key / demo user id).
 */
export function useAgentTemplates(tenantId?: string) {
  const queryEnabled = useProtectedQueryEnabled()
  return useQuery({
    queryKey: [...TEMPLATES_KEY, tenantId ?? "__default__"] as const,
    queryFn: () =>
      templatesService.list({
        ...(tenantId ? { tenant_id: tenantId } : {}),
        limit: 100,
        offset: 0,
      }),
    enabled: queryEnabled,
    ...DEFAULT_QUERY_OPTIONS,
  })
}

export function useUpsertAgentTemplate(tenantId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpsertAgentTemplateBody) =>
      templatesService.upsert(body, tenantId ? { tenant_id: tenantId } : {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATES_KEY })
    },
    ...DEFAULT_QUERY_OPTIONS,
  })
}

export function useDeleteAgentTemplate(tenantId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (templateId: string) =>
      templatesService.delete(templateId, tenantId ? { tenant_id: tenantId } : {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATES_KEY })
    },
    ...DEFAULT_QUERY_OPTIONS,
  })
}
