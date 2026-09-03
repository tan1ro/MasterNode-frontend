"use client"

import { CHAT_PRICING_PATH } from "@/lib/chat-path"
import { HomeLandingPricing } from "@/components/home/home-landing-pricing"
import { ROUTES } from "@/lib/routes"
import type { PricingAudience } from "@/constants/pricing-plans"

/** @deprecated Legacy export — plans live in `@/constants/pricing-plans`. */
export interface PricingTier {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  cta: string
  href: string
  highlighted?: boolean
}

export function HomePricing({
  className,
  tierHref,
  signUpHref,
  showBothRoles = false,
  embedded = false,
  defaultRole = "creator",
}: {
  className?: string
  tierHref?: string
  signUpHref?: string
  /** Ignored — Creator/Business toggle replaces stacked sections. */
  showBothRoles?: boolean
  embedded?: boolean
  defaultRole?: PricingAudience
}) {
  void showBothRoles
  void defaultRole

  const cta = signUpHref ?? ROUTES.signUp

  return (
    <HomeLandingPricing
      className={className}
      ctaHref={cta}
      isSignedIn={embedded}
      allowCheckout={embedded}
      tierHref={tierHref ?? (embedded ? ROUTES.billing : cta)}
    />
  )
}

/** @deprecated Use `plansPricingHref()` from `@/lib/chat-path` or `ROUTES.chatPricing`. */
export const PLANS_PRICING_HREF = CHAT_PRICING_PATH

export { PricingUpgradeBoard } from "@/components/pricing/pricing-upgrade-board"
