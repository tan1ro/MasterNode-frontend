"use client"

import Link from "next/link"
import { useBillingSubscription } from "@/hooks/use-billing"
import { ROUTES } from "@/lib/routes"
import { promptQuotaFromApi, usageBarColor } from "@/lib/plan-usage"
import { cn } from "@/lib/utils"

export function ChatPromptQuotaPill() {
  const { data, isLoading } = useBillingSubscription()
  const usage = promptQuotaFromApi(data?.prompt_quota)

  if (isLoading || !usage || usage.isUnlimited) return null

  const percent = usage.percent ?? 0

  return (
    <Link
      href={ROUTES.billing}
      className={cn(
        "hidden sm:inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1.5",
        "text-xs font-medium text-foreground hover:bg-muted/50 transition-colors"
      )}
      title={`${percent}% of credits used`}
    >
      <span className="relative flex h-2 w-12 overflow-hidden rounded-full bg-muted">
        <span
          className={cn("absolute inset-y-0 left-0 rounded-full", usageBarColor(percent))}
          style={{ width: `${Math.max(percent, 4)}%` }}
        />
      </span>
      <span className="tabular-nums">{percent}% used</span>
    </Link>
  )
}
