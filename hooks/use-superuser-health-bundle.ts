"use client"

import { useQueries } from "@tanstack/react-query"
import { healthService } from "@/services/health"

const BUNDLE_KEY = ["superuser", "health-bundle"] as const

export function useSuperuserHealthBundle(enabled: boolean) {
  const results = useQueries({
    queries: [
      {
        queryKey: [...BUNDLE_KEY, "main"],
        queryFn: () => healthService.get(),
        enabled,
        staleTime: 15_000,
        refetchInterval: enabled ? 30_000 : false,
        refetchOnWindowFocus: enabled,
      },
      {
        queryKey: [...BUNDLE_KEY, "ready"],
        queryFn: () => healthService.getReady(),
        enabled,
        staleTime: 15_000,
        retry: false,
      },
      {
        queryKey: [...BUNDLE_KEY, "queue"],
        queryFn: () => healthService.getQueue(),
        enabled,
        staleTime: 15_000,
        retry: false,
      },
      {
        queryKey: [...BUNDLE_KEY, "degradation"],
        queryFn: () => healthService.getDegradation(),
        enabled,
        staleTime: 60_000,
        retry: false,
      },
    ],
  })

  const [main, ready, queue, degradation] = results

  const refetchAll = () => {
    void main.refetch()
    void ready.refetch()
    void queue.refetch()
    void degradation.refetch()
  }

  return {
    health: main.data,
    healthError: main.error as Error | null,
    healthLoading: main.isLoading,
    healthFetching: main.isFetching,
    healthUpdatedAt: main.dataUpdatedAt,
    ready: ready.data,
    readyError: ready.error as Error | null,
    queue: queue.data,
    queueError: queue.error as Error | null,
    degradation: degradation.data,
    degradationError: degradation.error as Error | null,
    isFetching: results.some((r) => r.isFetching),
    refetchAll,
  }
}
