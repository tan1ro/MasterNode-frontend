"use client"

import { PricingUpgradeBoard } from "@/components/pricing/pricing-upgrade-board"
import {
  PRICING_BOARD_HEADING,
  PRICING_BOARD_SUBCOPY,
} from "@/constants/pricing-plans"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"

/** Shared home + billing pricing board (four tiers in one row). */
export function HomeLandingPricing({
  className,
  ctaHref,
  isSignedIn = false,
  allowCheckout = false,
  tierHref,
  showBoardHeader = true,
}: {
  className?: string
  ctaHref: string
  isSignedIn?: boolean
  /** When true (billing), Razorpay checkout is enabled for signed-in users. */
  allowCheckout?: boolean
  tierHref?: string
  /** Hide the large marketing header when the parent page provides its own section title. */
  showBoardHeader?: boolean
}) {
  const resolvedTierHref = tierHref ?? (isSignedIn ? ROUTES.billing : ctaHref)

  return (
    <PricingUpgradeBoard
      className={cn("scroll-mt-28 py-12 sm:py-24 lg:py-28", className)}
      embedded
      allowCheckout={allowCheckout}
      planSet="landing"
      signUpHref={ctaHref}
      tierHref={resolvedTierHref}
      title={PRICING_BOARD_HEADING}
      description={PRICING_BOARD_SUBCOPY}
      showBoardHeader={showBoardHeader}
    />
  )
}
