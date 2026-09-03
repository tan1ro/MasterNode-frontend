"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, IndianRupee, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Callout } from "@/components/ui/callout"
import { ApiErrorCallout } from "@/components/shared/api-error-callout"
import { billingService } from "@/services/billing"
import { useRazorpayPlanCheckout } from "@/hooks/use-razorpay-plan-checkout"
import { useEntitlements } from "@/hooks/use-entitlements"
import {
  PRICING_PLANS,
  canUpgradeTo,
  planDisplayName,
  type PricingPlanId,
} from "@/constants/pricing-plans"
import { getPricingMarket } from "@/constants/pricing-markets"
import { formatPlanPriceForMarket } from "@/lib/pricing-market"
import type { AccountPlan, AccountType } from "@/services/auth"

const INR_MARKET = getPricingMarket("in")
const RAZORPAY_PLAN_IDS: PricingPlanId[] = ["pro", "pro_plus", "premium"]

/** Standalone Razorpay upgrade card (also available via CurrentPlanCard on Billing). */
export function RazorpayCheckoutCard() {
  const entitlements = useEntitlements()
  const razorpayCheckout = useRazorpayPlanCheckout()
  const currentPlan = (entitlements.plan ?? "free") as PricingPlanId
  const accountType: AccountType = entitlements.accountType === "business" ? "business" : "creator"

  const upgradePlans = useMemo(
    () =>
      PRICING_PLANS.filter(
        (p) => RAZORPAY_PLAN_IDS.includes(p.id) && canUpgradeTo(currentPlan, p.id)
      ),
    [currentPlan]
  )

  const [selectedPlan, setSelectedPlan] = useState<PricingPlanId | "">("")
  const [error, setError] = useState<unknown>(null)
  const [successPlan, setSuccessPlan] = useState<string | null>(null)
  const [invoiceId, setInvoiceId] = useState<string | null>(null)
  const [receiptNumber, setReceiptNumber] = useState<string | null>(null)
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<"receipt" | "invoice" | null>(null)

  const effectivePlan = (selectedPlan || upgradePlans[0]?.id || "") as PricingPlanId | ""
  const planDef = PRICING_PLANS.find((p) => p.id === effectivePlan)
  const priceDisplay = planDef
    ? formatPlanPriceForMarket(planDef.price, INR_MARKET, { planId: planDef.id }).display
    : ""

  const downloadDoc = async (doc: "receipt" | "invoice") => {
    if (!invoiceId) return
    setDownloading(doc)
    try {
      const blob = await billingService.downloadInvoiceDoc(invoiceId, doc)
      const number = doc === "receipt" ? receiptNumber : invoiceNumber
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `masternode-${doc}-${number || invoiceId}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err)
    } finally {
      setDownloading(null)
    }
  }

  const startCheckout = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!effectivePlan) return
    razorpayCheckout.mutate(
      { plan: effectivePlan as AccountPlan, account_type: accountType },
      {
        onSuccess: (result) => {
          setSuccessPlan(result.plan ?? effectivePlan)
          setInvoiceId(result.invoice_id ?? result.razorpay_payment_id ?? null)
          setReceiptNumber(result.receipt_number ?? null)
          setInvoiceNumber(result.invoice_number ?? null)
        },
        onError: (err) => {
          if (err instanceof Error && err.message === "Payment cancelled") return
          setError(err)
        },
      }
    )
  }

  return (
    <Card accent="cyan">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <IndianRupee className="h-5 w-5 text-cyan-400" />
          Upgrade with Razorpay
        </CardTitle>
        <CardDescription>
          Pay in INR via Razorpay. Current plan: <strong>{planDisplayName(currentPlan)}</strong> ({accountType}).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <ApiErrorCallout error={error} title="Payment error" fallbackMessage="Payment could not be completed." />
        ) : null}
        {successPlan ? (
          <Callout type="success" title="Payment verified">
            <p className="text-sm">
              Upgraded to <strong>{planDisplayName(successPlan as PricingPlanId)}</strong>.
            </p>
            {invoiceId ? (
              <div className="flex flex-wrap gap-2 mt-3">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={downloading === "receipt"}
                  onClick={() => void downloadDoc("receipt")}
                >
                  {downloading === "receipt" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Download receipt"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={downloading === "invoice"}
                  onClick={() => void downloadDoc("invoice")}
                >
                  {downloading === "invoice" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Download invoice"}
                </Button>
              </div>
            ) : null}
          </Callout>
        ) : null}

        {upgradePlans.length === 0 ? (
          <p className="text-sm text-muted-foreground">You are on the highest Razorpay plan available.</p>
        ) : (
          <form onSubmit={startCheckout} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <Label htmlFor="razorpayPlan">Plan</Label>
                <select
                  id="razorpayPlan"
                  className="mt-1 w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm"
                  value={effectivePlan}
                  onChange={(e) => setSelectedPlan(e.target.value as PricingPlanId)}
                  disabled={razorpayCheckout.isPending}
                >
                  {upgradePlans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatPlanPriceForMarket(p.price, INR_MARKET, { planId: p.id }).display}/mo
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" disabled={razorpayCheckout.isPending || !effectivePlan}>
                {razorpayCheckout.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Pay {priceDisplay}
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
