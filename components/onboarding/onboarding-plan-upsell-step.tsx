"use client"

import Link from "next/link"
import { Check, Sparkles } from "lucide-react"
import {
  planFeaturesForAudience,
  PRICING_PLANS,
  type PricingAudience,
  type PricingPlanId,
} from "@/constants/pricing-plans"
import { useAppAuth } from "@/hooks/use-app-auth"
import { useEntitlements } from "@/hooks/use-entitlements"
import { normalizeAccountType } from "@/lib/account-types"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"

const ONBOARDING_PLAN_IDS: PricingPlanId[] = ["free", "pro", "pro_plus"]

interface Props {
  uploadedFileName?: string
  onContinueFree: () => void
}

export function OnboardingPlanUpsellStep({ uploadedFileName, onContinueFree }: Props) {
  const { accountType } = useAppAuth()
  const { plan: currentPlan } = useEntitlements()
  const audience: PricingAudience =
    normalizeAccountType(accountType, "creator") === "business" ? "business" : "creator"

  const plans = PRICING_PLANS.filter((item) => ONBOARDING_PLAN_IDS.includes(item.id))

  return (
    <div className="mt-8 space-y-5">
      <div className="onboarding-plan-hero rounded-2xl border border-white/10 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
            <Check className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 text-left">
            <p className="text-sm font-medium text-white">Document saved to your knowledge base</p>
            {uploadedFileName ? (
              <p className="mt-1 truncate text-sm text-white/55">{uploadedFileName}</p>
            ) : null}
            <p className="mt-2 text-sm leading-relaxed text-white/55">
              Free includes one onboarding upload. Upgrade for unlimited knowledge documents, more
              tasks, and parallel agents.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {plans.map((planDef) => {
          const isCurrent = planDef.id === currentPlan
          const isHighlighted = planDef.id === "pro"
          const features = planFeaturesForAudience(planDef, audience).slice(0, 4)

          return (
            <div
              key={planDef.id}
              className={cn(
                "onboarding-plan-card flex h-full flex-col rounded-2xl border p-4",
                isHighlighted && "onboarding-plan-card--highlight",
                isCurrent && "onboarding-plan-card--current"
              )}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-white">{planDef.name}</p>
                  <p className="mt-0.5 text-xs text-white/50">{planDef.tagline}</p>
                </div>
                {isCurrent ? (
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/70">
                    Current
                  </span>
                ) : null}
              </div>
              <p className="text-2xl font-semibold text-white">
                {planDef.price}
                <span className="ml-1 text-xs font-normal text-white/45">{planDef.priceNote}</span>
              </p>
              <ul className="mt-4 flex-1 space-y-2">
                {features.map((feature) => (
                  <li key={feature.text} className="flex items-start gap-2 text-xs text-white/65">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber" aria-hidden />
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                {planDef.id === "free" ? (
                  <button
                    type="button"
                    onClick={onContinueFree}
                    className="auth-nav-btn auth-nav-btn--outline w-full rounded-md px-4 py-2.5 text-sm"
                  >
                    Continue with Free
                  </button>
                ) : (
                  <Link
                    href={`${ROUTES.billing}?from=onboarding`}
                    className={cn(
                      "inline-flex w-full items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold",
                      isHighlighted
                        ? "auth-submit"
                        : "auth-nav-btn auth-nav-btn--outline"
                    )}
                  >
                    Upgrade to {planDef.name}
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-center pt-1">
        <button
          type="button"
          onClick={onContinueFree}
          className="auth-nav-btn auth-nav-btn--outline rounded-md px-4 py-2 text-sm"
        >
          Skip for now — stay on Free
        </button>
      </div>
    </div>
  )
}
