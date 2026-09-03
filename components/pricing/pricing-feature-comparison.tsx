"use client"

import { Fragment, useMemo, useState } from "react"
import Link from "next/link"
import { Check, Loader2, Minus, Search } from "lucide-react"
import {
  canUpgradeTo,
  isCurrentPlan,
  planActionHref,
  PRICING_PLANS,
  type PricingPlanDefinition,
  type PricingPlanId,
} from "@/constants/pricing-plans"
import {
  filterPricingFeatureCategories,
  pricingMatrixPlanLabels,
  type PlanFeatureCell,
  type PricingFeatureRow,
} from "@/constants/pricing-feature-matrix"
import { usePricingMarket } from "@/hooks/use-pricing-market"
import { formatPlanPriceForMarket } from "@/lib/pricing-market"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"

interface PricingFeatureComparisonProps {
  className?: string
  annual: boolean
  currentPlan: PricingPlanId
  signedIn: boolean
  razorpayEnabled?: boolean
  razorpayPending?: boolean
  tierHref?: string
  signUpHref?: string
  onRazorpayCheckout?: (planId: PricingPlanId) => void
}

function FeatureCell({ value }: { value: PlanFeatureCell }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center justify-center" aria-label="Included">
        <Check className="size-4 text-emerald-500 dark:text-emerald-400" strokeWidth={2.5} aria-hidden />
      </span>
    )
  }
  if (value === false) {
    return (
      <span
        className="inline-flex items-center justify-center text-muted-foreground/50 dark:text-white/25"
        aria-label="Not included"
      >
        <Minus className="size-4" strokeWidth={2} aria-hidden />
      </span>
    )
  }
  return <span className="text-sm font-medium text-foreground/80 dark:text-white/75">{value}</span>
}

function PlanHeaderCta({
  plan,
  annual,
  currentPlan,
  signedIn,
  razorpayEnabled,
  razorpayPending,
  tierHref,
  signUpHref,
  onRazorpayCheckout,
  market,
}: {
  plan: PricingPlanDefinition
  annual: boolean
  currentPlan: PricingPlanId
  signedIn: boolean
  razorpayEnabled: boolean
  razorpayPending: boolean
  tierHref: string
  signUpHref: string
  onRazorpayCheckout: (planId: PricingPlanId) => void
  market: ReturnType<typeof usePricingMarket>["market"]
}) {
  const isCurrent = isCurrentPlan(currentPlan, plan.id)
  const canUpgrade = canUpgradeTo(currentPlan, plan.id)
  const href = planActionHref(plan, {
    signedIn,
    billingHref: tierHref,
    signUpHref,
  })
  const { price } = formatPlanPriceForMarket(
    plan.price,
    market,
    plan.id === "free" ? { planId: plan.id } : { annual, planId: plan.id }
  )

  const label = !signedIn
    ? plan.id === "free"
      ? "Start free"
      : "Upgrade"
    : isCurrent
      ? "Current"
      : canUpgrade
        ? "Upgrade"
        : "Included"

  const buttonClass = cn(
    "mt-2 inline-flex min-h-9 w-full max-w-[9.5rem] items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
    plan.highlighted && !isCurrent
      ? "pricing-pixel-cta--featured"
      : "pricing-pixel-cta--outline"
  )

  const renderButton = () => {
    if (signedIn && isCurrent) {
      return (
        <button type="button" disabled className={buttonClass}>
          Your plan
        </button>
      )
    }
    if (signedIn && razorpayEnabled && canUpgrade) {
      return (
        <button
          type="button"
          disabled={razorpayPending}
          onClick={() => onRazorpayCheckout(plan.id)}
          className={buttonClass}
        >
          {razorpayPending ? <Loader2 className="size-3.5 animate-spin" /> : label}
        </button>
      )
    }
    return (
      <Link href={signedIn && canUpgrade ? ROUTES.billing : href} className={buttonClass}>
        {label}
      </Link>
    )
  }

  return (
    <div className="flex min-w-[7.5rem] flex-col items-center px-2 text-center sm:min-w-[8.5rem]">
      <p className="text-sm font-semibold text-foreground dark:text-white/90">{plan.name}</p>
      <p className="mt-1 text-lg font-bold leading-none text-foreground dark:text-white">
        {price}
        {plan.id !== "free" ? (
          <span className="text-xs font-normal text-muted-foreground dark:text-white/45">/mo</span>
        ) : null}
      </p>
      {renderButton()}
    </div>
  )
}

function FeatureRow({
  row,
  plans,
  zebra,
}: {
  row: PricingFeatureRow
  plans: PricingPlanId[]
  zebra: boolean
}) {
  return (
    <tr
      className={cn(
        "border-b border-border dark:border-white/[0.06]",
        zebra && "bg-muted/30 dark:bg-white/[0.02]"
      )}
    >
      <th
        scope="row"
        className="sticky left-0 z-[2] min-w-[12rem] max-w-[16rem] border-r border-border px-4 py-3.5 text-left align-middle backdrop-blur-sm dark:border-white/[0.06] sm:min-w-[14rem] sm:px-5"
      >
        <div className="text-sm font-medium text-foreground dark:text-white/88">{row.label}</div>
        {row.hint ? (
          <div className="mt-0.5 text-xs leading-snug text-muted-foreground dark:text-white/42">
            {row.hint}
          </div>
        ) : null}
      </th>
      {plans.map((planId) => (
        <td key={planId} className="px-3 py-3.5 text-center align-middle sm:px-4">
          <FeatureCell value={row.values[planId]} />
        </td>
      ))}
    </tr>
  )
}

export function PricingFeatureComparison({
  className,
  annual,
  currentPlan,
  signedIn,
  razorpayEnabled = false,
  razorpayPending = false,
  tierHref = ROUTES.chatPricing,
  signUpHref = ROUTES.signUp,
  onRazorpayCheckout,
}: PricingFeatureComparisonProps) {
  const [query, setQuery] = useState("")
  const { market } = usePricingMarket()
  const planLabels = pricingMatrixPlanLabels()
  const planIds = planLabels.map((p) => p.id)
  const visiblePlans = useMemo(
    () => planIds.map((id) => PRICING_PLANS.find((p) => p.id === id)!),
    [planIds]
  )
  const categories = useMemo(() => filterPricingFeatureCategories(query), [query])

  const handleCheckout = onRazorpayCheckout ?? (() => {})

  return (
    <section className={cn("mt-16 sm:mt-20", className)} aria-labelledby="pricing-compare-heading">
      <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
        <h2
          id="pricing-compare-heading"
          className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
        >
          Compare features across plans
        </h2>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Every limit and capability in one place — search to jump to what matters.
        </p>
      </div>

      <div className="pricing-compare-shell relative overflow-hidden rounded-2xl border backdrop-blur-md">
        <div className="border-b border-border px-4 py-4 dark:border-white/[0.08] sm:px-6">
          <label className="relative mx-auto block max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground dark:text-white/35"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search features"
              className="pricing-compare-search w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-foreground/20 focus:outline-none focus:ring-1 focus:ring-foreground/10 dark:placeholder:text-white/35 dark:focus:border-white/20 dark:focus:ring-white/15"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="pricing-compare-table w-full min-w-[44rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border dark:border-white/[0.08]">
                <th
                  scope="col"
                  className="sticky left-0 z-[3] min-w-[12rem] border-r border-border px-4 py-5 text-left dark:border-white/[0.08] sm:min-w-[14rem] sm:px-5"
                >
                  <span className="sr-only">Feature</span>
                </th>
                {visiblePlans.map((plan) => (
                  <th
                    key={plan.id}
                    scope="col"
                    className="px-2 py-4 align-top sm:px-3"
                  >
                    <PlanHeaderCta
                      plan={plan}
                      annual={annual}
                      currentPlan={currentPlan}
                      signedIn={signedIn}
                      razorpayEnabled={razorpayEnabled}
                      razorpayPending={razorpayPending}
                      tierHref={tierHref}
                      signUpHref={signUpHref}
                      onRazorpayCheckout={handleCheckout}
                      market={market}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={planIds.length + 1}
                    className="px-6 py-10 text-center text-sm text-muted-foreground dark:text-white/45"
                  >
                    No features match &ldquo;{query}&rdquo;. Try another search.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <Fragment key={category.id}>
                    <tr className="border-b border-border dark:border-white/[0.08]">
                      <th
                        colSpan={planIds.length + 1}
                        scope="colgroup"
                        className="bg-muted/40 px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground dark:bg-white/[0.03] dark:text-white/55 sm:px-5"
                      >
                        {category.title}
                      </th>
                    </tr>
                    {category.rows.map((row, idx) => (
                      <FeatureRow
                        key={row.id}
                        row={row}
                        plans={planIds}
                        zebra={idx % 2 === 1}
                      />
                    ))}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
