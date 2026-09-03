"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { PricingUpgradeBoard } from "@/components/pricing/pricing-upgrade-board"
import { MarketingHero } from "@/components/marketing/marketing-page"
import {
  PRICING_BOARD_FOOTNOTE,
  PRICING_BOARD_HEADING,
  PRICING_BOARD_SUBCOPY,
} from "@/constants/pricing-plans"
import { useAppAuth } from "@/hooks/use-app-auth"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"

export function PricingMarketingPage({ className }: { className?: string }) {
  const { isSignedIn } = useAppAuth()
  const ctaHref = isSignedIn ? ROUTES.billing : ROUTES.signUp

  return (
    <main className={cn("pb-20", className)}>
      <MarketingHero
        eyebrow="Plans & pricing"
        title={PRICING_BOARD_HEADING}
        description={PRICING_BOARD_SUBCOPY}
        actions={
          !isSignedIn ? (
            <Link
              href={ROUTES.signUp}
              className="inline-flex items-center gap-2 rounded-xl bg-amber px-5 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90"
            >
              Start free
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          ) : (
            <Link
              href={ROUTES.billing}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50 dark:border-white/12"
            >
              Manage billing
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          )
        }
      />

      <PricingUpgradeBoard
        embedded
        allowCheckout={isSignedIn}
        showFeatureComparison
        showBoardHeader={false}
        planSet="landing"
        tierHref={ctaHref}
        signUpHref={ROUTES.signUp}
        className="!py-0"
      />

      <p className="mx-auto mt-4 max-w-2xl px-4 text-center text-xs text-muted-foreground">
        {PRICING_BOARD_FOOTNOTE}
      </p>
    </main>
  )
}
