"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { tasksService } from "@/services/tasks"
import { DEFAULT_QUERY_OPTIONS } from "@/lib/query-config"
import { useProtectedQueryEnabled } from "@/providers/auth-session-provider"
import { getTaskListRefetchIntervalMs } from "@/lib/settings-refetch"
import type { CreateTaskRequest } from "@/types/api"
import type { TaskListParams } from "@/services/tasks"
import type { ProductSdlcPhaseId } from "@/constants/product-sdlc"
import { productTasksQueryKey } from "@/hooks/use-products"
import { useRedirectOnServerError } from "@/hooks/use-redirect-on-server-error"

const TASKS_QUERY_KEY = ["tasks"] as const
const TASK_QUERY_KEY = (id: string) => ["task", id] as const

const TASK_TERMINAL_STATUSES = new Set(["completed", "failed", "error", "cancelled", "timeout"])

const DEFAULT_TASK_LIST: Required<Pick<TaskListParams, "skip" | "limit">> = {
  skip: 0,
  limit: 200,
}

/** Default list page size for task list UI (keeps responses fast). */
export const TASK_LIST_PAGE_LIMIT = 100

/** Max page size supported by `GET /v1/task` (backend `le=500`). */
export const TASK_LIST_MAX_LIMIT = 500

export function useTasks(params?: TaskListParams) {
  const queryEnabled = useProtectedQueryEnabled()
  const skip = params?.skip ?? DEFAULT_TASK_LIST.skip
  const limit = params?.limit ?? DEFAULT_TASK_LIST.limit
  const clientChannel = params?.client_channel
  const query = useQuery({
    queryKey: [...TASKS_QUERY_KEY, skip, limit, clientChannel ?? "all"] as const,
    queryFn: () => tasksService.list({ skip, limit, client_channel: clientChannel }),
    enabled: queryEnabled,
    refetchInterval: () => getTaskListRefetchIntervalMs(),
    ...DEFAULT_QUERY_OPTIONS,
  })
  useRedirectOnServerError(query.error, queryEnabled)
  return query
}

export function useTask(taskId: string | null, enabled = true) {
  return useQuery({
    queryKey: TASK_QUERY_KEY(taskId ?? ""),
    queryFn: () => tasksService.get(taskId!),
    enabled: Boolean(taskId) && enabled,
    refetchInterval: (query) => {
      const st = String(query.state.data?.status || "").toLowerCase()
      if (!st || TASK_TERMINAL_STATUSES.has(st)) return false
      // Keep pipeline live data fresh while running / awaiting plan input
      if (st === "running" || st === "awaiting_plan_review" || st === "pending" || st === "queued") {
        return 1500
      }
      return getTaskListRefetchIntervalMs() || 2000
    },
    ...DEFAULT_QUERY_OPTIONS,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTaskRequest) => tasksService.create(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY })
      if (variables.product_id) {
        queryClient.invalidateQueries({ queryKey: ["product-tasks", variables.product_id] })
        if (variables.sdlc_phase) {
          queryClient.invalidateQueries({
            queryKey: productTasksQueryKey(
              variables.product_id,
              variables.sdlc_phase as ProductSdlcPhaseId | undefined
            ),
          })
        }
      }
    },
    ...DEFAULT_QUERY_OPTIONS,
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (taskId: string) => tasksService.delete(taskId),
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY })
      queryClient.removeQueries({ queryKey: TASK_QUERY_KEY(taskId) })
    },
    ...DEFAULT_QUERY_OPTIONS,
  })
}
