import { apiClient } from "@/lib/api-client"
import type {
  BillingInvoiceRow,
  BillingSubscriptionSummary,
  RazorpayOrderResponse,
  RazorpayVerifyResponse,
} from "@/types/api"
import type { AccountPlan, AccountType } from "@/services/auth"

export const billingService = {
  subscription: (): Promise<BillingSubscriptionSummary> =>
    apiClient.get<BillingSubscriptionSummary>("/v1/billing/subscription").then((r) => r.data),

  invoices: (limit = 20): Promise<{ invoices: BillingInvoiceRow[]; total: number }> =>
    apiClient.get<{ invoices: BillingInvoiceRow[]; total: number }>("/v1/billing/invoices", { params: { limit } }).then((r) => r.data),

  /** Download a stored receipt or invoice PDF (Razorpay or other provider). */
  downloadInvoiceDoc: async (
    invoiceId: string,
    doc: "invoice" | "receipt" = "invoice"
  ): Promise<Blob> => {
    const response = await apiClient.get<Blob>(`/v1/billing/invoices/${encodeURIComponent(invoiceId)}/download`, {
      params: { doc },
      responseType: "blob",
    })
    return response.data
  },
}

export const razorpayService = {
  /**
   * Create a Razorpay order for a plan upgrade. The price is computed
   * server-side (INR) from the plan catalog, so the client never sets it.
   */
  createPlanOrder: (plan: AccountPlan, account_type: AccountType): Promise<RazorpayOrderResponse> =>
    apiClient
      .post<RazorpayOrderResponse>("/v1/billing/razorpay/order", { plan, account_type })
      .then((r) => r.data),

  /** Create an ad-hoc Razorpay order. `amount` is in paise (minimum 100). */
  createOrder: (amount: number, opts?: { currency?: string; receipt?: string }): Promise<RazorpayOrderResponse> =>
    apiClient
      .post<RazorpayOrderResponse>("/v1/billing/razorpay/order", {
        amount,
        currency: opts?.currency,
        receipt: opts?.receipt,
      })
      .then((r) => r.data),

  /** Verify the signature returned by the checkout. Rejects (HTTP 400) on mismatch. */
  verifyPayment: (payload: {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
  }): Promise<RazorpayVerifyResponse> =>
    apiClient.post<RazorpayVerifyResponse>("/v1/billing/razorpay/verify", payload).then((r) => r.data),
}
