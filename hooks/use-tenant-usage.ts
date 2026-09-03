"use client"

import { useQuery } from "@tanstack/react-query"
import { tenantService } from "@/services/tenant"
import { DEFAULT_QUERY_OPTIONS } from "@/lib/query-config"

const KEY = ["tenant", "usage"] as const

export function useTenantUsage(tenantId = "api-tenant") {
  return useQuery({
    queryKey: [...KEY, tenantId],
    queryFn: () => tenantService.usage(tenantId),
    ...DEFAULT_QUERY_OPTIONS,
  })
}
