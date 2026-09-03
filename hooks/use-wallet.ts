"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { walletService } from "@/services/wallet"
import { DEFAULT_QUERY_OPTIONS } from "@/lib/query-config"
import { useProtectedQueryEnabled } from "@/providers/auth-session-provider"

export const WALLET_QUERY_KEY = ["wallet"] as const

export function useWallet(options?: { enabled?: boolean }) {
  const authReady = useProtectedQueryEnabled()
  return useQuery({
    queryKey: WALLET_QUERY_KEY,
    queryFn: walletService.get,
    enabled: options?.enabled ?? authReady,
    ...DEFAULT_QUERY_OPTIONS,
  })
}

export function useWalletDeposit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { amount_usd: number; key_id?: string }) => walletService.deposit(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEY })
    },
    ...DEFAULT_QUERY_OPTIONS,
  })
}
