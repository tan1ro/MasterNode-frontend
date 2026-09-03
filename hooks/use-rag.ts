"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ragService } from "@/services/rag"
import { DEFAULT_QUERY_OPTIONS } from "@/lib/query-config"
import { useProtectedQueryEnabled } from "@/providers/auth-session-provider"

const RAG_FILES_QUERY_KEY = ["rag-files"] as const

export function useRagFiles() {
  const queryEnabled = useProtectedQueryEnabled()
  return useQuery({
    queryKey: RAG_FILES_QUERY_KEY,
    queryFn: ragService.listFiles,
    enabled: queryEnabled,
    ...DEFAULT_QUERY_OPTIONS,
  })
}

export function useRagFileDetail(fileId: string | null) {
  return useQuery({
    queryKey: ["rag-file", fileId] as const,
    queryFn: () => ragService.getFile(fileId!),
    enabled: !!fileId,
    ...DEFAULT_QUERY_OPTIONS,
  })
}

export function useUploadRagFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => ragService.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RAG_FILES_QUERY_KEY })
    },
    ...DEFAULT_QUERY_OPTIONS,
  })
}

export function useDeleteRagFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (fileId: string) => ragService.deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RAG_FILES_QUERY_KEY })
    },
    ...DEFAULT_QUERY_OPTIONS,
  })
}
