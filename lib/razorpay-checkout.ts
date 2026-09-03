/** Razorpay Standard Checkout helpers (browser-only). */
import { razorpayService } from "@/services/billing"
import { planDisplayName } from "@/constants/pricing-plans"
import type { AccountPlan, AccountType } from "@/services/auth"
import type { RazorpayVerifyResponse } from "@/types/api"

export const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js"

export const RAZORPAY_CHECKOUT_TIMEOUT_SECONDS = 600

/** B2B SaaS checkout — card, UPI, netbanking only (no EMI / wallets / pay-later). */
export const RAZORPAY_SAAS_CHECKOUT_OPTIONS = {
  method: {
    netbanking: true,
    card: true,
    upi: true,
    wallet: false,
    emi: false,
    paylater: false,
  },
  config: {
    display: {
      hide: [{ method: "emi" }, { method: "wallet" }, { method: "paylater" }],
    },
  },
} as const

interface RazorpaySuccessResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

interface RazorpayFailureResponse {
  error?: { description?: string; reason?: string; code?: string }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  order_id: string
  name?: string
  description?: string
  prefill?: { name?: string; email?: string }
  theme?: { color?: string }
  method?: {
    netbanking?: boolean
    card?: boolean
    upi?: boolean
    wallet?: boolean
    emi?: boolean
    paylater?: boolean
  }
  config?: {
    display?: {
      hide?: Array<{ method: string }>
    }
  }
  /** Seconds before Razorpay closes the checkout (default 600 = 10 min). */
  timeout?: number
  handler?: (response: RazorpaySuccessResponse) => void
  modal?: { ondismiss?: () => void }
}

interface RazorpayInstance {
  open: () => void
  on: (event: "payment.failed", handler: (response: RazorpayFailureResponse) => void) => void
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance
  }
}

let scriptPromise: Promise<void> | null = null

export function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Not in a browser"))
  if (window.Razorpay) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${RAZORPAY_SCRIPT_SRC}"]`)
    if (existing) {
      existing.addEventListener("load", () => resolve())
      existing.addEventListener("error", () => reject(new Error("Failed to load Razorpay checkout")))
      if (window.Razorpay) resolve()
      return
    }
    const script = document.createElement("script")
    script.src = RAZORPAY_SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      scriptPromise = null
      reject(new Error("Failed to load Razorpay checkout. Check your network connection."))
    }
    document.body.appendChild(script)
  })
  return scriptPromise
}

export interface RazorpayPlanCheckoutInput {
  plan: AccountPlan
  account_type: AccountType
  email?: string
  onCancelled?: () => void
}

/** Open Razorpay modal for a plan upgrade; verify on server; return fulfillment payload. */
export async function openRazorpayPlanCheckout(
  input: RazorpayPlanCheckoutInput
): Promise<RazorpayVerifyResponse> {
  const order = await razorpayService.createPlanOrder(input.plan, input.account_type)
  await loadRazorpayScript()
  if (!window.Razorpay) throw new Error("Razorpay checkout is unavailable.")

  const key = order.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ""
  if (!key) throw new Error("Razorpay key id missing. Set NEXT_PUBLIC_RAZORPAY_KEY_ID.")

  const checkoutTimeout =
    order.checkout_timeout_seconds && order.checkout_timeout_seconds > 0
      ? order.checkout_timeout_seconds
      : RAZORPAY_CHECKOUT_TIMEOUT_SECONDS

  return new Promise<RazorpayVerifyResponse>((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key,
      amount: order.amount,
      currency: order.currency,
      order_id: order.order_id,
      name: "MasterNode",
      description: `${planDisplayName(input.plan)} plan (${input.account_type})`,
      prefill: input.email ? { email: input.email } : undefined,
      theme: { color: "#06b6d4" },
      timeout: checkoutTimeout,
      ...RAZORPAY_SAAS_CHECKOUT_OPTIONS,
      handler: (response) => {
        void (async () => {
          try {
            const result = await razorpayService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            resolve(result)
          } catch (err) {
            reject(err)
          }
        })()
      },
      modal: {
        ondismiss: () => {
          input.onCancelled?.()
          reject(new Error("Payment cancelled"))
        },
      },
    })

    rzp.on("payment.failed", (response) => {
      const desc =
        response?.error?.description || response?.error?.reason || "Payment failed. Please try again."
      reject(new Error(desc))
    })

    rzp.open()
  })
}
