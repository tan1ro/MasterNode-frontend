"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Loader2, Zap } from "lucide-react"
import { ApiErrorCallout } from "@/components/shared/api-error-callout"
import { PricingPixelDecor } from "@/components/pricing/pricing-pixel-decor"
import { PricingFeatureComparison } from "@/components/pricing/pricing-feature-comparison"
import { HomeScrollReveal } from "@/components/home/home-scroll-reveal"
import { HomeSectionHeader } from "@/components/home/home-section-header"
import { PRICING_SHELL } from "@/components/home/home-accent-styles"
import {
  billingPricingPlans,
  canUpgradeTo,
  isCurrentPlan,
  landingPricingPlans,
  planActionHref,
  planFeaturesForAudience,
  PRICING_ANNUAL_DISCOUNT,
  PRICING_BOARD_FOOTNOTE,
  PRICING_BOARD_HEADING,
  PRICING_BOARD_SUBCOPY,
  PRICING_CARD_ACCENT,
  type PricingAudience,
  type PricingPlanDefinition,
  type PricingPlanId,
} from "@/constants/pricing-plans"
import { useBillingSubscription } from "@/hooks/use-billing"
import { useRazorpayPlanCheckout } from "@/hooks/use-razorpay-plan-checkout"
import { useAppAuth } from "@/hooks/use-app-auth"
import { useEntitlements } from "@/hooks/use-entitlements"
import { usePricingMarket } from "@/hooks/use-pricing-market"
import { formatPlanPriceForMarket } from "@/lib/pricing-market"
import { isRazorpayCheckoutAvailable } from "@/lib/billing-checkout"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"

interface PricingUpgradeBoardProps {
  className?: string
  embedded?: boolean
  title?: string
  description?: string
  defaultAudience?: PricingAudience
  tierHref?: string
  signUpHref?: string
  /** When false, CTAs always link out (marketing home). */
  allowCheckout?: boolean
  /** Landing = 3 tiers (Free/Pro/Premium). Billing adds Infinity. */
  planSet?: "landing" | "billing"
  /** Full feature comparison table (dedicated pricing page only). */
  showFeatureComparison?: boolean
  /** Plan cards section title block (off when page has its own hero). */
  showBoardHeader?: boolean
}

const PRICING_GRID_LANDING =
  "pricing-pixel-grid mx-auto grid w-full max-w-[20.5rem] grid-cols-1 gap-4 sm:max-w-7xl sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-5"

const PRICING_GRID_BILLING =
  "pricing-pixel-grid mx-auto grid w-full max-w-[20.5rem] grid-cols-1 gap-4 sm:max-w-7xl sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-5"

const PRICING_GRID_CELL = "pricing-pixel-grid__cell min-w-0"
const PRICING_GRID_REVEAL = "h-full min-h-full w-full"

const PRICING_SHELL_UNIFORM = PRICING_SHELL

function displayPrice(
  plan: PricingPlanDefinition,
  annual: boolean,
  market: ReturnType<typeof usePricingMarket>["market"]
): {
  price: string
  billingNote: string
} {
  const formatted = formatPlanPriceForMarket(
    plan.price,
    market,
    plan.id === "free" ? { planId: plan.id } : { annual, planId: plan.id }
  )

  return {
    price: formatted.display,
    billingNote:
      plan.id === "free"
        ? "No credit card required"
        : annual
          ? "billed annually"
          : "per month",
  }
}

function BillingCycleToggle({
  annual,
  onChange,
}: {
  annual: boolean
  onChange: (annual: boolean) => void
}) {
  const savePct = Math.round(PRICING_ANNUAL_DISCOUNT * 100)

  return (
    <div className="pricing-cycle-toggle inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 p-1 dark:border-white/12 dark:bg-white/[0.04]">
      <button
        type="button"
        onClick={() => onChange(false)}
        className={cn(
          "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
          !annual
            ? "bg-background text-foreground shadow-sm dark:bg-white/10"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Monthly
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
          annual
            ? "bg-background text-foreground shadow-sm dark:bg-white/10"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Yearly
        <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-300">
          Save {savePct}%
        </span>
      </button>
    </div>
  )
}

function PricingPlanCard({
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
  const features = planFeaturesForAudience(plan, "creator")
  const { price, billingNote } = displayPrice(plan, annual, market)
  const isCurrent = isCurrentPlan(currentPlan, plan.id)
  const canUpgrade = canUpgradeTo(currentPlan, plan.id)
  const href = planActionHref(plan, {
    signedIn,
    billingHref: tierHref,
    signUpHref,
  })

  const isFeatured = Boolean(plan.highlighted) && !isCurrent
  const PlanIcon = plan.landingIcon
  const accent = PRICING_CARD_ACCENT[plan.id]

  const buttonLabel = !signedIn
    ? plan.ctaLabel
    : canUpgrade
      ? plan.ctaLabel
      : "Included in your plan"

  const ctaClass = (solid: boolean) =>
    cn(
      "flex min-h-10 w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-12 sm:rounded-xl sm:py-3",
      solid ? "pricing-pixel-cta--featured" : "pricing-pixel-cta--outline"
    )

  const renderCta = () => {
    if (signedIn && isCurrent) {
      return (
        <button type="button" disabled className={ctaClass(false)}>
          Your current plan
        </button>
      )
    }

    if (signedIn && razorpayEnabled && canUpgrade) {
      return (
        <button
          type="button"
          disabled={razorpayPending}
          onClick={() => onRazorpayCheckout(plan.id)}
          className={ctaClass(isFeatured)}
        >
          {razorpayPending ? <Loader2 className="h-4 w-4 animate-spin" /> : plan.ctaLabel}
        </button>
      )
    }

    return (
      <Link
        href={signedIn && canUpgrade ? ROUTES.billing : href}
        className={ctaClass(isFeatured)}
      >
        {buttonLabel}
      </Link>
    )
  }

  return (
    <article
      className={cn(
        "pricing-pixel-card group relative flex h-full flex-col",
        isFeatured && "pricing-pixel-card--featured"
      )}
    >
      <div className="pricing-pixel-card__inner relative flex h-full min-h-0 flex-1 flex-col rounded-[1.25rem] border px-4 pb-5 pt-3 sm:rounded-[1.75rem] sm:px-8 sm:pb-9 sm:pt-5">
        <PricingPixelDecor planId={plan.id} />

        <div className="pricing-pixel-card__badge-slot relative z-[1] mb-2 flex min-h-[1.25rem] justify-center sm:mb-4 sm:min-h-[1.5rem]">
          {isFeatured ? (
            <span className="pricing-pixel-badge inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white sm:px-5 sm:py-2 sm:text-[11px]">
              <Zap className="size-3 fill-current sm:size-3.5" aria-hidden />
              Most popular
            </span>
          ) : null}
        </div>

        <div className="pricing-pixel-card__head relative z-[1]">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <PlanIcon
              className="size-5 shrink-0 sm:size-[1.375rem]"
              style={{ color: accent }}
              strokeWidth={1.75}
              aria-hidden
            />
            <p className="text-lg font-bold leading-none tracking-tight text-foreground sm:text-[1.375rem]">
              {plan.name}
            </p>
          </div>
          <div className="mt-1.5 flex flex-wrap items-end gap-x-1 gap-y-0 sm:mt-2">
            <span className="text-[1.4rem] font-bold leading-none tracking-tight text-foreground sm:text-[1.85rem]">
              {price}
            </span>
            {plan.id !== "free" ? (
              <span className="mb-0.5 text-xs font-normal text-muted-foreground">/mo</span>
            ) : null}
          </div>
          <p className="mt-1 min-h-0 text-xs text-muted-foreground sm:min-h-[1rem] sm:text-sm">{billingNote}</p>
        </div>

        <div className="pricing-pixel-card__cta relative z-[1] mt-3 sm:mt-4">{renderCta()}</div>

        <div className="relative z-[1] my-4 h-px shrink-0 bg-border/80 dark:bg-white/[0.08] sm:my-6" />

        <ul className="pricing-pixel-card__features relative z-[1] mt-auto">
          {features.map((feature) => {
            const FeatureIcon = feature.icon
            return (
              <li
                key={feature.text}
                className="pricing-pixel-card__feature flex items-start gap-2 text-xs leading-snug text-muted-foreground sm:gap-3 sm:text-[0.9375rem] dark:text-white/62"
              >
                <span
                  className="pricing-pixel-feature-icon mt-0.5 flex size-[1.375rem] shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 dark:border-white/14 dark:bg-white/[0.03] sm:size-6"
                  style={{ color: `${accent}cc` }}
                >
                  <FeatureIcon className="size-3.5 sm:size-4" strokeWidth={2.1} aria-hidden />
                </span>
                <span className="line-clamp-2 min-h-0 flex-1 text-left sm:min-h-[2.65rem]">
                  {feature.text}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </article>
  )
}

export function PricingUpgradeBoard({
  className,
  embedded = false,
  title,
  description,
  tierHref = ROUTES.chatPricing,
  signUpHref = ROUTES.signUp,
  allowCheckout = true,
  planSet = "landing",
  showFeatureComparison = false,
  showBoardHeader = true,
}: PricingUpgradeBoardProps) {
  const entitlements = useEntitlements()
  const { isSignedIn } = useAppAuth()
  const { data: billing } = useBillingSubscription()
  const razorpayCheckout = useRazorpayPlanCheckout()
  const [annual, setAnnual] = useState(false)
  const [checkoutError, setCheckoutError] = useState<unknown>(null)
  const { market } = usePricingMarket()

  const currentPlan = (entitlements.plan ?? "free") as PricingPlanId
  const razorpayEnabled = isRazorpayCheckoutAvailable(billing) && allowCheckout && isSignedIn

  const visiblePlans = useMemo(
    () => (planSet === "billing" ? billingPricingPlans() : landingPricingPlans()),
    [planSet]
  )

  const heading = title ?? (embedded ? PRICING_BOARD_HEADING : "Pricing that scales")
  const subcopy = description ?? PRICING_BOARD_SUBCOPY

  const handleRazorpayCheckout = (planId: PricingPlanId) => {
    setCheckoutError(null)
    razorpayCheckout.mutate(
      { account_type: "creator", plan: planId },
      {
        onSuccess: () => setCheckoutError(null),
        onError: (err) => {
          if (err instanceof Error && err.message === "Payment cancelled") return
          setCheckoutError(err)
        },
      }
    )
  }

  const headerBlock = (showTitle: boolean) => (
    <div className="mx-auto mb-6 flex max-w-3xl flex-col items-center text-center sm:mb-12">
      {showTitle ? (
        <>
          <span className="home-section-badge--lime inline-flex items-center gap-2 rounded-full px-4 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] sm:px-5 sm:py-1.5 sm:text-xs">
            <span className="size-1.5 rounded-full bg-[#B0F900] shadow-[0_0_10px_#B0F900]" aria-hidden />
            Pricing
          </span>
          <h2 className="mt-4 text-2xl font-bold leading-tight text-foreground sm:mt-6 sm:text-4xl">{heading}</h2>
          {subcopy ? (
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-lg">{subcopy}</p>
          ) : null}
        </>
      ) : null}
      <p className={cn("text-sm text-muted-foreground/80", showTitle ? "mt-2" : "mt-0")}>
        Prices in {market.currency} for {market.label}. Beta rates vs typical AI subscriptions.
      </p>
      <div className="mt-5 sm:mt-8">
        <BillingCycleToggle annual={annual} onChange={setAnnual} />
      </div>
    </div>
  )

  return (
    <section
      id="pricing"
      className={cn(
        "px-6 sm:px-6 lg:px-10",
        embedded ? "py-4 sm:py-8" : "py-8 sm:py-14",
        className
      )}
    >
      <div className={embedded ? "mx-auto w-full max-w-7xl" : PRICING_SHELL_UNIFORM}>
        {embedded ? (
          <HomeScrollReveal>{headerBlock(showBoardHeader)}</HomeScrollReveal>
        ) : (
          <>
            <HomeScrollReveal>
              <HomeSectionHeader
                sectionNum="04"
                sectionTag="plans"
                title="Pricing that"
                titleAccent="scales"
                accentClass="text-amber"
                description={subcopy}
              />
            </HomeScrollReveal>
            <HomeScrollReveal delayMs={60}>{headerBlock(false)}</HomeScrollReveal>
          </>
        )}

        {checkoutError ? (
          <div className="mx-auto mb-6 max-w-lg">
            <ApiErrorCallout
              error={checkoutError}
              title="Checkout failed"
              fallbackMessage="Could not open payment. Try again or use Billing."
            />
          </div>
        ) : null}

        <div className={planSet === "billing" ? PRICING_GRID_BILLING : PRICING_GRID_LANDING}>
          {visiblePlans.map((plan, index) => (
            <div key={plan.id} className={PRICING_GRID_CELL}>
              {embedded ? (
                <HomeScrollReveal className={PRICING_GRID_REVEAL} delayMs={index * 70}>
                  <PricingPlanCard
                    plan={plan}
                    annual={annual}
                    currentPlan={currentPlan}
                    signedIn={isSignedIn}
                    razorpayEnabled={razorpayEnabled}
                    razorpayPending={razorpayCheckout.isPending}
                    tierHref={tierHref}
                    signUpHref={signUpHref}
                    onRazorpayCheckout={handleRazorpayCheckout}
                    market={market}
                  />
                </HomeScrollReveal>
              ) : (
                <HomeScrollReveal className={PRICING_GRID_REVEAL}>
                  <PricingPlanCard
                    plan={plan}
                    annual={annual}
                    currentPlan={currentPlan}
                    signedIn={isSignedIn}
                    razorpayEnabled={razorpayEnabled}
                    razorpayPending={razorpayCheckout.isPending}
                    tierHref={tierHref}
                    signUpHref={signUpHref}
                    onRazorpayCheckout={handleRazorpayCheckout}
                    market={market}
                  />
                </HomeScrollReveal>
              )}
            </div>
          ))}
        </div>

        {showFeatureComparison ? (
          <PricingFeatureComparison
            annual={annual}
            currentPlan={currentPlan}
            signedIn={isSignedIn}
            razorpayEnabled={razorpayEnabled}
            razorpayPending={razorpayCheckout.isPending}
            tierHref={tierHref}
            signUpHref={signUpHref}
            onRazorpayCheckout={handleRazorpayCheckout}
          />
        ) : null}

        <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted-foreground">
          *Usage limits apply. Beta prices shown in {market.currency}; plans may change at launch.{" "}
          {PRICING_BOARD_FOOTNOTE}
        </p>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          {isSignedIn ? (
            <>
              Manage payment methods and invoices on{" "}
              <Link href={ROUTES.billing} className="text-amber hover:underline">
                Billing
              </Link>
              .
            </>
          ) : (
            <>
              Have an account?{" "}
              <Link href={ROUTES.signIn} className="text-amber hover:underline">
                Sign in
              </Link>{" "}
              to see your current plan.
            </>
          )}
        </p>
      </div>
    </section>
  )
}
