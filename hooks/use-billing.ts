"use client"

import { useQuery } from "@tanstack/react-query"
import { billingService } from "@/services/billing"
import { useProtectedQueryEnabled } from "@/providers/auth-session-provider"

export const BILLING_SUBSCRIPTION_KEY = ["billing", "subscription"]
export const BILLING_INVOICES_KEY = ["billing", "invoices"]

export function useBillingSubscription() {
  const queryEnabled = useProtectedQueryEnabled()
  return useQuery({
    queryKey: BILLING_SUBSCRIPTION_KEY,
    queryFn: () => billingService.subscription(),
    enabled: queryEnabled,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}

export function useBillingInvoices(limit = 20) {
  const queryEnabled = useProtectedQueryEnabled()
  return useQuery({
    queryKey: [...BILLING_INVOICES_KEY, limit],
    queryFn: () => billingService.invoices(limit),
    enabled: queryEnabled,
    staleTime: 60_000,
  })
}
