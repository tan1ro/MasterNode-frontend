"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { usageService } from "@/services/usage"
import { DEFAULT_QUERY_OPTIONS } from "@/lib/query-config"
import { useProtectedQueryEnabled } from "@/providers/auth-session-provider"
import type { ClientChannel, UsageParams } from "@/types/api"

const USAGE_QUERY_KEY = ["usage"] as const

export function useUsage(params?: UsageParams) {
  const queryEnabled = useProtectedQueryEnabled()
  return useQuery({
    queryKey: [...USAGE_QUERY_KEY, params ?? "default"],
    queryFn: () => usageService.get(params),
    enabled: queryEnabled,
    ...DEFAULT_QUERY_OPTIONS,
  })
}

/** Usage for the last N days (convenience) */
export function useUsageInRange(days: number, clientChannel?: ClientChannel) {
  const params = useMemo(() => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    return {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      ...(clientChannel ? { client_channel: clientChannel } : {}),
    }
  }, [days, clientChannel])

  return useUsage(params)
}
