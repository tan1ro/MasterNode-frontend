"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiKeysService } from "@/services/api-keys"
import { getOrCreateUserId, getStoredApiKey, getStoredUserId, removeStoredApiKey, setStoredApiKey } from "@/lib/storage"
import { DEFAULT_QUERY_OPTIONS } from "@/lib/query-config"
import { useProtectedQueryEnabled } from "@/providers/auth-session-provider"
import type { ApiKeyRecord, CreateApiKeyRequest } from "@/types/api"
import { WALLET_QUERY_KEY } from "@/hooks/use-wallet"

const API_KEYS_QUERY_KEY = ["api-keys"] as const

export type DeleteApiKeyContext = { apiKeys?: ApiKeyRecord[] }

export function useApiKeys(options?: { enabled?: boolean }) {
  const authReady = useProtectedQueryEnabled()
  return useQuery({
    queryKey: API_KEYS_QUERY_KEY,
    queryFn: apiKeysService.list,
    enabled: options?.enabled ?? authReady,
    ...DEFAULT_QUERY_OPTIONS,
  })
}

export function useCreateApiKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateApiKeyRequest) => apiKeysService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: API_KEYS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEY })
      if (!getStoredApiKey() && data?.api_key) {
        setStoredApiKey(data.api_key)
      }
    },
    ...DEFAULT_QUERY_OPTIONS,
  })
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (keyId: string) => apiKeysService.delete(keyId),
    onSuccess: (_, keyId) => {
      queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEY })
      const apiKeys = queryClient.getQueryData<ApiKeyRecord[]>(API_KEYS_QUERY_KEY)
      const deletedKey = apiKeys?.find((k) => k.key_id === keyId)
      if (deletedKey && getStoredApiKey() === deletedKey.api_key) {
        removeStoredApiKey()
        const remaining = apiKeys?.filter((k) => k.key_id !== keyId) ?? []
        if (remaining.length > 0) {
          setStoredApiKey(remaining[0].api_key)
        }
      }
      queryClient.invalidateQueries({ queryKey: API_KEYS_QUERY_KEY })
    },
    ...DEFAULT_QUERY_OPTIONS,
  })
}

/** Call auto-create API key (e.g. on first visit). Uses axios. */
export async function autoCreateApiKey(userId?: string | null): Promise<string | null> {
  if (typeof window !== "undefined") {
    const { hasLocalAppSession } = await import("@/lib/session-token-store")
    if (hasLocalAppSession()) {
      try {
        const res = await apiKeysService.ensureDefault()
        if (res?.api_key) {
          setStoredApiKey(res.api_key)
          return res.api_key
        }
      } catch {
        // Fall through to legacy auto-create
      }
    }
  }

  let finalUserId: string
  if (typeof userId === "string" && userId.trim()) {
    finalUserId = userId.trim().slice(0, 100)
  } else if (typeof window !== "undefined") {
    finalUserId = getStoredUserId() || getOrCreateUserId()
  } else {
    finalUserId = "user_anonymous"
  }
  const res = await apiKeysService.autoCreate(finalUserId)
  if (res?.api_key && typeof window !== "undefined") {
    setStoredApiKey(res.api_key)
    return res.api_key
  }
  return res?.api_key ?? null
}
