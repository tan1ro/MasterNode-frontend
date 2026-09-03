"use client"

import { useQuery } from "@tanstack/react-query"
import { auditService } from "@/services/audit"
import { DEFAULT_QUERY_OPTIONS } from "@/lib/query-config"
import type { ClientChannel } from "@/types/api"

const AUDIT_KEY = ["audit", "logs"] as const

export function useAuditLogs(options?: {
  limit?: number
  tenant_id?: string
  client_channel?: ClientChannel
}) {
  const limit = options?.limit ?? 50
  const tenantId = options?.tenant_id
  const ch = options?.client_channel
  return useQuery({
    queryKey: [...AUDIT_KEY, limit, tenantId ?? "", ch ?? "all"] as const,
    queryFn: () =>
      auditService.list({
        limit,
        ...(tenantId ? { tenant_id: tenantId } : {}),
        ...(ch ? { client_channel: ch } : {}),
      }),
    ...DEFAULT_QUERY_OPTIONS,
  })
}
