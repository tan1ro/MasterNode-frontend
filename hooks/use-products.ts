"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { productsService } from "@/services/products"
import { tasksService } from "@/services/tasks"
import { DEFAULT_QUERY_OPTIONS } from "@/lib/query-config"
import { getTaskListRefetchIntervalMs } from "@/lib/settings-refetch"
import { useProtectedQueryEnabled } from "@/providers/auth-session-provider"
import type { ProductSdlcPhaseId } from "@/constants/product-sdlc"
import { TASK_LIST_MAX_LIMIT } from "@/hooks/use-tasks"
import type { ProductTaskListResponse } from "@/types/api"

export const PRODUCTS_QUERY_KEY = ["products"] as const
export const productTasksQueryKey = (
  productId: string,
  sdlcPhase?: ProductSdlcPhaseId | null
) => ["product-tasks", productId, sdlcPhase ?? "all"] as const

export function useProducts() {
  const queryEnabled = useProtectedQueryEnabled()
  return useQuery({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: () => productsService.list().then((d) => d.products),
    enabled: queryEnabled,
    refetchInterval: () => getTaskListRefetchIntervalMs(),
    ...DEFAULT_QUERY_OPTIONS,
  })
}

export function useProduct(productId: string | null) {
  const queryEnabled = useProtectedQueryEnabled()
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, productId],
    queryFn: () => productsService.get(productId!),
    enabled: queryEnabled && Boolean(productId),
    ...DEFAULT_QUERY_OPTIONS,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: productsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY })
    },
    ...DEFAULT_QUERY_OPTIONS,
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      productId,
      ...payload
    }: {
      productId: string
      name?: string
      description?: string
      file_ids?: string[]
    }) => productsService.update(productId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY })
    },
    ...DEFAULT_QUERY_OPTIONS,
  })
}

async function fetchProductTasksWithFallback(
  productId: string,
  sdlcPhase?: ProductSdlcPhaseId | null
): Promise<ProductTaskListResponse> {
  try {
    return await productsService.listTasks(productId, {
      ...(sdlcPhase ? { sdlc_phase: sdlcPhase } : {}),
      limit: 100,
    })
  } catch (err) {
    const status = axios.isAxiosError(err) ? err.response?.status : undefined
    if (status !== 404 && status !== 405 && status !== 501) {
      throw err
    }
    const all = await tasksService.list({ limit: TASK_LIST_MAX_LIMIT })
    const tasks = all.tasks.filter((t) => {
      if (t.product_id !== productId) return false
      if (sdlcPhase && t.sdlc_phase !== sdlcPhase) return false
      return true
    })
    return {
      product_id: productId,
      sdlc_phase: sdlcPhase ?? null,
      total: tasks.length,
      tasks,
    }
  }
}

export function useProductTasks(
  productId: string | null,
  sdlcPhase?: ProductSdlcPhaseId | null
) {
  const queryEnabled = useProtectedQueryEnabled()
  return useQuery({
    queryKey: productTasksQueryKey(productId ?? "", sdlcPhase),
    queryFn: () => fetchProductTasksWithFallback(productId!, sdlcPhase),
    enabled: queryEnabled && Boolean(productId),
    ...DEFAULT_QUERY_OPTIONS,
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (productId: string) => productsService.delete(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY })
    },
    ...DEFAULT_QUERY_OPTIONS,
  })
}
