"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Callout } from "@/components/ui/callout"
import type { FeatureId } from "@/constants/entitlements"
import { useEntitlements } from "@/hooks/use-entitlements"
import { ROUTES } from "@/lib/routes"

interface FeatureGateProps {
  feature: FeatureId
  children: ReactNode
  /** When blocked, render fallback instead of UpgradeCTA */
  fallback?: ReactNode
  className?: string
}

export function UpgradeCTA({
  feature,
  compact = false,
}: {
  feature: FeatureId
  compact?: boolean
}) {
  const { blockReason, upgradeTarget } = useEntitlements()
  const reason = blockReason(feature)
  const targetPlan = upgradeTarget(feature)

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Lock className="h-3 w-3" aria-hidden />
        <Link href={ROUTES.chatPricing} className="text-amber hover:underline">
          Upgrade to {targetPlan}
        </Link>
      </span>
    )
  }

  return (
    <Callout variant="warning" title="Upgrade required">
      <p className="text-sm">{reason}</p>
      <Button asChild size="sm" className="mt-3 bg-amber text-amber-foreground hover:bg-amber/90">
        <Link href={ROUTES.chatPricing}>View plans — upgrade to {targetPlan}</Link>
      </Button>
    </Callout>
  )
}

export function FeatureGate({ feature, children, fallback, className }: FeatureGateProps) {
  const { can } = useEntitlements()
  if (can(feature)) {
    return <div className={className}>{children}</div>
  }
  if (fallback) {
    return <div className={className}>{fallback}</div>
  }
  return (
    <div className={className}>
      <UpgradeCTA feature={feature} />
    </div>
  )
}

export function UpgradePopup({
  open,
  onOpenChange,
  feature,
  title = "Upgrade required",
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  feature: FeatureId
  title?: string
}) {
  const { blockReason, upgradeTarget } = useEntitlements()
  if (!open) return null
  const reason = blockReason(feature)
  const targetPlan = upgradeTarget(feature)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        aria-label="Close upgrade popup"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10 w-full max-w-md rounded-xl border border-destructive/35 bg-card p-5 shadow-xl">
        <p className="text-base font-semibold text-destructive">{title}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {reason ?? "Your current plan does not allow this action."}
        </p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Not now
          </Button>
          <Button asChild className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            <Link href={ROUTES.chatPricing} onClick={() => onOpenChange(false)}>
              Upgrade to {targetPlan}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
