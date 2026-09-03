"use client"

import { useMutation } from "@tanstack/react-query"
import { supportService } from "@/services/support"
import type { SupportChatRequest } from "@/types/api"
import { getStoredApiKey } from "@/lib/storage"

export function useSupportChat() {
  return useMutation({
    retry: false,
    mutationFn: (params: {
      data: SupportChatRequest
      usePublic?: boolean
    }) => {
      const usePublic =
        params.usePublic ??
        (typeof window !== "undefined" ? !getStoredApiKey() : true)
      return supportService.chat(params.data, { usePublic })
    },
  })
}
