import type { BillingSubscriptionSummary } from "@/types/api"

/** Public Razorpay key present at build time (safe to expose). */
export function isRazorpayConfiguredClient(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim())
}

/** True when Razorpay checkout should be offered in the UI. */
export function isRazorpayCheckoutAvailable(
  billing: BillingSubscriptionSummary | null | undefined
): boolean {
  if (billing?.razorpay_enabled) return true
  return isRazorpayConfiguredClient()
}
