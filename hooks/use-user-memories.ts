"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  memoryService,
  type MemoryCreateInput,
  type MemoryUpdateInput,
} from "@/services/memory"
import { DEFAULT_QUERY_OPTIONS } from "@/lib/query-config"
import { useProtectedQueryEnabled } from "@/providers/auth-session-provider"

export const USER_MEMORIES_QUERY_KEY = ["user-memories"] as const

export function useUserMemories() {
  const queryEnabled = useProtectedQueryEnabled()
  return useQuery({
    queryKey: USER_MEMORIES_QUERY_KEY,
    queryFn: () => memoryService.list(),
    enabled: queryEnabled,
    ...DEFAULT_QUERY_OPTIONS,
  })
}

export function useCreateUserMemory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: MemoryCreateInput) => memoryService.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_MEMORIES_QUERY_KEY })
    },
    ...DEFAULT_QUERY_OPTIONS,
  })
}

export function useUpdateUserMemory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: MemoryUpdateInput }) =>
      memoryService.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_MEMORIES_QUERY_KEY })
    },
    ...DEFAULT_QUERY_OPTIONS,
  })
}

export function useDeleteUserMemory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => memoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_MEMORIES_QUERY_KEY })
    },
    ...DEFAULT_QUERY_OPTIONS,
  })
}

export function useClearUserMemories() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => memoryService.clearAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_MEMORIES_QUERY_KEY })
    },
    ...DEFAULT_QUERY_OPTIONS,
  })
}
