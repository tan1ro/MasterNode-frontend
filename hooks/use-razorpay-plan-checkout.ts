"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { openRazorpayPlanCheckout } from "@/lib/razorpay-checkout"
import { BILLING_INVOICES_KEY, BILLING_SUBSCRIPTION_KEY } from "@/hooks/use-billing"
import { useEntitlements } from "@/hooks/use-entitlements"
import type { AccountPlan, AccountType } from "@/services/auth"
import type { RazorpayVerifyResponse } from "@/types/api"

export function useRazorpayPlanCheckout() {
  const queryClient = useQueryClient()
  const entitlements = useEntitlements()

  return useMutation({
    mutationFn: async ({
      plan,
      account_type,
    }: {
      plan: AccountPlan
      account_type: AccountType
    }): Promise<RazorpayVerifyResponse> => {
      return openRazorpayPlanCheckout({
        plan,
        account_type,
        email: entitlements.profile?.email,
      })
    },
    onSuccess: () => {
      void entitlements.refetchProfile()
      void queryClient.invalidateQueries({ queryKey: BILLING_SUBSCRIPTION_KEY })
      void queryClient.invalidateQueries({ queryKey: BILLING_INVOICES_KEY })
    },
  })
}
