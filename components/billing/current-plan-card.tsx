"use client"

import { useState } from "react"
import Link from "next/link"
import { CreditCard, IndianRupee, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Callout } from "@/components/ui/callout"
import { ApiErrorCallout } from "@/components/shared/api-error-callout"
import { useBillingSubscription } from "@/hooks/use-billing"
import { useRazorpayPlanCheckout } from "@/hooks/use-razorpay-plan-checkout"
import { useEntitlements } from "@/hooks/use-entitlements"
import {
  canUpgradeTo,
  planDisplayName,
  PRICING_PLANS,
  type PricingPlanId,
} from "@/constants/pricing-plans"
import { getPricingMarket } from "@/constants/pricing-markets"
import { formatPlanPriceForMarket } from "@/lib/pricing-market"
import { ROUTES } from "@/lib/routes"
import { isRazorpayCheckoutAvailable } from "@/lib/billing-checkout"
import type { AccountPlan, AccountType } from "@/services/auth"

const INR_MARKET = getPricingMarket("in")

export function CurrentPlanCard() {
  const { data, isLoading } = useBillingSubscription()
  const { accountType, plan } = useEntitlements()
  const razorpayCheckout = useRazorpayPlanCheckout()

  const [checkoutError, setCheckoutError] = useState<unknown>(null)
  const [successPlan, setSuccessPlan] = useState<string | null>(null)
  const [invoiceId, setInvoiceId] = useState<string | null>(null)

  const razorpayOn = isRazorpayCheckoutAvailable(data)
  const currentPlan = (data?.plan ?? plan ?? "free") as PricingPlanId
  const resolvedAccountType: AccountType = accountType === "business" ? "business" : "creator"
  const subStatus = data?.subscription?.status ?? (currentPlan === "free" ? "none" : "active")

  const upgradeOptions = PRICING_PLANS.filter((p) => {
    if (!canUpgradeTo(currentPlan, p.id)) return false
    if (p.contactSales) return false
    if (p.id === "enterprise" && resolvedAccountType !== "business") return false
    return true
  })

  const onRazorpayUpgrade = (targetPlan: AccountPlan) => {
    setCheckoutError(null)
    setSuccessPlan(null)
    razorpayCheckout.mutate(
      { plan: targetPlan, account_type: resolvedAccountType },
      {
        onSuccess: (result) => {
          setSuccessPlan(result.plan ?? targetPlan)
          setInvoiceId(result.invoice_id ?? result.razorpay_payment_id ?? null)
        },
        onError: (err) => {
          if (err instanceof Error && err.message === "Payment cancelled") return
          setCheckoutError(err)
        },
      }
    )
  }

  const billingDescription = () => {
    if (razorpayOn) {
      return "Upgrade your subscription plan via Razorpay (INR). Receipts appear in invoice history."
    }
    return "Configure Razorpay on the API server to enable live plan upgrades."
  }

  return (
    <Card accent="amber" interactive={false}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-amber" />
          Subscription plan
        </CardTitle>
        <CardDescription>{billingDescription()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {checkoutError ? (
          <ApiErrorCallout
            error={checkoutError}
            title="Upgrade failed"
            fallbackMessage="Could not complete checkout."
          />
        ) : null}

        {successPlan ? (
          <Callout type="success" title="Plan upgraded">
            <p className="text-sm">
              You are now on the <strong>{planDisplayName(successPlan as PricingPlanId)}</strong> plan.{" "}
              {invoiceId ? (
                <>
                  Receipt and invoice are in{" "}
                  <Link href={ROUTES.billing} className="underline font-medium">
                    invoice history
                  </Link>{" "}
                  below.
                </>
              ) : null}
            </p>
          </Callout>
        ) : null}

        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <div className="rounded-md border border-border/60 bg-muted/10 p-3 text-sm space-y-1">
            <p>
              <span className="text-muted-foreground">Account:</span>{" "}
              <span className="font-medium capitalize">{resolvedAccountType}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Plan:</span>{" "}
              <span className="font-medium">{planDisplayName(currentPlan)}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Status:</span>{" "}
              <span className="font-medium capitalize">{subStatus}</span>
            </p>
            {data?.subscription?.current_period_end ? (
              <p className="text-xs text-muted-foreground">
                Renews: {new Date(data.subscription.current_period_end).toLocaleString()}
              </p>
            ) : null}
          </div>
        )}

        {razorpayOn && upgradeOptions.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Upgrade</p>
            <div className="flex flex-wrap gap-2">
              {upgradeOptions.map((opt) => {
                const inrPrice = formatPlanPriceForMarket(opt.price, INR_MARKET, {
                  planId: opt.id,
                }).display
                return (
                  <Button
                    key={opt.id}
                    size="sm"
                    className="bg-cyan-600 hover:bg-cyan-600/90 text-white"
                    disabled={razorpayCheckout.isPending}
                    onClick={() => onRazorpayUpgrade(opt.id)}
                  >
                    {razorpayCheckout.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <IndianRupee className="h-4 w-4 mr-1" />
                        {opt.name} · {inrPrice}
                      </>
                    )}
                  </Button>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Test mode: use card 4111 1111 1111 1111. Compare all tiers on{" "}
              <Link href={ROUTES.chatPricing} className="text-primary underline">
                Plans & pricing
              </Link>
              .
            </p>
          </div>
        ) : razorpayOn && upgradeOptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You are on the highest available plan
            {currentPlan === "enterprise" ? "" : " for your account type"}.
          </p>
        ) : !razorpayOn ? (
          <p className="text-sm text-muted-foreground">
            View plan tiers on{" "}
            <Link href={ROUTES.chatPricing} className="text-primary underline font-medium">
              Plans & pricing
            </Link>
            .
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
