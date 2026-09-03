"use client"

import { useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { metricsService } from "@/services/metrics"
import { DEFAULT_QUERY_OPTIONS } from "@/lib/query-config"
import type { TaskMetricsResponse } from "@/types/api"

const METRICS_LIST_KEY = ["metrics", "list"] as const
const METRICS_SLO_KEY = ["metrics", "slo"] as const
const METRICS_TASK_KEY = (id: string) => ["metrics", "task", id] as const

const EMPTY_TASK_METRICS = {
  metrics: {} as TaskMetricsResponse["metrics"],
  benchmarks: {},
} satisfies TaskMetricsResponse

/** Statuses where execution metrics are meaningful to poll/fetch. */
export function taskMetricsFetchEnabled(status: string | undefined): boolean {
  const s = String(status || "").toLowerCase()
  if (!s) return false
  // Plan review / cancelled runs have no execution metrics yet (or ever).
  if (
    s === "awaiting_plan_review" ||
    s === "cancelled" ||
    s === "rejected" ||
    s === "pending"
  ) {
    return false
  }
  return true
}

export function useMetricsList(limit = 500, offset = 0) {
  return useQuery({
    queryKey: [...METRICS_LIST_KEY, limit, offset],
    queryFn: () => metricsService.list({ limit, offset }),
    ...DEFAULT_QUERY_OPTIONS,
  })
}

export function useMetricsSlo() {
  return useQuery({
    queryKey: METRICS_SLO_KEY,
    queryFn: () => metricsService.slo(),
    ...DEFAULT_QUERY_OPTIONS,
  })
}

export function useTaskMetrics(
  taskId: string | null,
  enabled = true,
  refetchInterval: number | false = false
) {
  return useQuery({
    queryKey: METRICS_TASK_KEY(taskId ?? ""),
    queryFn: async (): Promise<TaskMetricsResponse> => {
      try {
        return await metricsService.forTask(taskId!)
      } catch (err) {
        // Treat missing metrics as empty (plan review / not started) — avoid console 404 noise.
        if (isAxiosError(err) && err.response?.status === 404) {
          return { ...EMPTY_TASK_METRICS, metrics: { task_id: taskId! } }
        }
        throw err
      }
    },
    enabled: Boolean(taskId) && enabled,
    refetchInterval,
    ...DEFAULT_QUERY_OPTIONS,
  })
}
