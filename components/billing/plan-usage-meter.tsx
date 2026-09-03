"use client"

import { cn } from "@/lib/utils"
import { formatQuotaResetLabel, usageBarColor, type PlanUsageSnapshot } from "@/lib/plan-usage"

interface PlanUsageMeterProps {
  usage: PlanUsageSnapshot
  className?: string
  size?: "sm" | "md"
}

export function PlanUsageMeter({ usage, className, size = "md" }: PlanUsageMeterProps) {
  const percent = usage.percent ?? 0
  const windowHours = usage.windowHours ?? 5
  const resetLabel = formatQuotaResetLabel(usage.resetsAt)

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Usage this period
          </p>
          {usage.isUnlimited ? (
            <p className="text-lg font-semibold text-foreground">Unlimited credits</p>
          ) : (
            <p className="text-2xl font-bold tabular-nums text-foreground sm:text-3xl">{percent}%</p>
          )}
        </div>
        {!usage.isUnlimited ? (
          <p className="text-sm text-muted-foreground text-right max-w-[10rem]">
            {percent >= 100 ? "Limit reached" : `${100 - percent}% remaining`}
          </p>
        ) : null}
      </div>

      {!usage.isUnlimited ? (
        <>
          <div
            className={cn(
              "w-full overflow-hidden rounded-full bg-muted",
              size === "sm" ? "h-2" : "h-3"
            )}
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${percent}% of credits used`}
          >
            <div
              className={cn("h-full rounded-full transition-all", usageBarColor(percent))}
              style={{ width: `${Math.max(percent, percent > 0 ? 4 : 0)}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {percent}% of your credits used
            </span>
            {resetLabel ? (
              <>
                {" "}
                · <span>{resetLabel}</span>
              </>
            ) : (
              <> · Rolling {windowHours}-hour window</>
            )}
          </p>
          {percent >= 100 ? (
            <p className="text-xs text-rose-500">
              Upgrade your plan or wait for credits to reset.
            </p>
          ) : null}
        </>
      ) : (
        <p className="text-xs text-muted-foreground">
          Enterprise plans include unlimited fair-use credits.
        </p>
      )}
    </div>
  )
}
