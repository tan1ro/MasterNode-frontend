"use client"

import Link from "next/link"
import { ArrowUpRight, Crown, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { CardAccent } from "@/components/ui/card"
import { useBillingSubscription } from "@/hooks/use-billing"
import { useEntitlements } from "@/hooks/use-entitlements"
import { canUpgradeTo, planDisplayName, type PricingPlanId } from "@/constants/pricing-plans"
import { planAccent } from "@/lib/plan-display"
import { computeCreditQuotaUsage, promptQuotaFromApi } from "@/lib/plan-usage"
import { PlanUsageMeter } from "@/components/billing/plan-usage-meter"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"
import type { AppPlan } from "@/lib/app-auth"

function planCardAccent(plan: PricingPlanId): CardAccent | undefined {
  switch (plan) {
    case "pro":
      return "sky"
    case "pro_plus":
      return "violet"
    case "premium":
      return "amber"
    case "enterprise":
      return "emerald"
    default:
      return undefined
  }
}

export function CreatorPlanSummary() {
  const { data, isLoading } = useBillingSubscription()
  const { plan } = useEntitlements()

  const currentPlan = (data?.plan ?? plan ?? "free") as PricingPlanId
  const subStatus = data?.subscription?.status ?? (currentPlan === "free" ? "none" : "active")
  const accent = planAccent(currentPlan)
  const isPaid = currentPlan !== "free"
  const canUpgrade = canUpgradeTo(currentPlan, "enterprise")

  const usage =
    promptQuotaFromApi(data?.prompt_quota) ??
    computeCreditQuotaUsage(0, currentPlan as AppPlan)

  const windowHours = usage.windowHours ?? 5

  return (
    <Card accent={planCardAccent(currentPlan)} interactive={false} className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ring-1",
              accent.avatar,
              accent.ring
            )}
            aria-hidden
          >
            <Crown className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <CardDescription className="text-xs font-medium uppercase tracking-wide">
              Current plan
            </CardDescription>
            <CardTitle className="text-2xl sm:text-[1.65rem]">
              {planDisplayName(currentPlan)}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground capitalize">
              {subStatus === "none" ? "Free tier — upgrade anytime below" : `Status: ${subStatus}`}
              {data?.subscription?.current_period_end && isPaid ? (
                <>
                  {" "}
                  · Renews{" "}
                  {new Date(data.subscription.current_period_end).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </>
              ) : null}
            </p>
          </div>
          <Link
            href={ROUTES.chatPricing}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium",
              "bg-primary text-primary-foreground transition-opacity hover:opacity-90"
            )}
          >
            {canUpgrade ? "Upgrade" : "View plans"}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <>
            <PlanUsageMeter usage={usage} />
            <p className="mt-3 text-xs text-muted-foreground">
              Credits refresh on a rolling {windowHours}-hour window.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
