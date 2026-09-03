"use client"

import { useQuery, type UseQueryOptions } from "@tanstack/react-query"
import { healthService } from "@/services/health"
import { DEFAULT_QUERY_OPTIONS } from "@/lib/query-config"
import type { HealthResponse } from "@/types/api"

const HEALTH_QUERY_KEY = ["health"] as const

export type UseHealthOptions = Partial<
  Pick<
    UseQueryOptions<HealthResponse, Error>,
    "refetchInterval" | "refetchIntervalInBackground" | "refetchOnWindowFocus" | "staleTime" | "enabled"
  >
>

/** Shared `/health` query; pass options for live polling (e.g. Settings). */
export function useHealth(options?: UseHealthOptions) {
  const { enabled, ...rest } = options ?? {}
  return useQuery<HealthResponse, Error>({
    queryKey: HEALTH_QUERY_KEY,
    queryFn: healthService.get,
    enabled: enabled ?? true,
    ...DEFAULT_QUERY_OPTIONS,
    ...rest,
  })
}
