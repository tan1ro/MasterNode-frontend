"use client"

import { TrendingDown, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FinanceArtifact {
  kind: "forex" | "crypto" | "stock"
  symbol: string
  name: string
  price: number
  currency: string
  change_pct?: number | null
  as_of?: string
  extra?: {
    rate_label?: string
    inr?: number
    amount?: number
    unit_rate?: number
  }
}

function formatPrice(price: number, currency: string): string {
  const digits = price >= 100 ? 2 : price >= 1 ? 4 : 6
  return `${price.toLocaleString(undefined, { maximumFractionDigits: digits })} ${currency}`
}

export function ChatFinanceArtifact({
  artifact,
  className,
}: {
  artifact: FinanceArtifact
  className?: string
}) {
  const change = artifact.change_pct
  const up = change != null && change >= 0

  return (
    <div
      className={cn(
        "mb-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-3 shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {artifact.kind === "forex"
              ? "Exchange rate"
              : artifact.kind === "crypto"
                ? "Crypto"
                : "Stock"}
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold text-foreground">{artifact.name}</p>
          {artifact.symbol ? (
            <p className="text-xs text-muted-foreground">{artifact.symbol}</p>
          ) : null}
        </div>
        {change != null ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
              up ? "bg-emerald-500/15 text-emerald-600" : "bg-rose-500/15 text-rose-600"
            )}
          >
            {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {up ? "+" : ""}
            {change.toFixed(2)}%
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
        {formatPrice(artifact.price, artifact.currency)}
      </p>
      {artifact.extra?.rate_label ? (
        <p className="mt-2 text-sm text-muted-foreground">{artifact.extra.rate_label}</p>
      ) : null}
      {artifact.extra?.inr != null && artifact.currency === "USD" ? (
        <p className="mt-1 text-sm text-muted-foreground">
          ≈ ₹{Number(artifact.extra.inr).toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </p>
      ) : null}
      {artifact.as_of ? (
        <p className="mt-2 text-[10px] text-muted-foreground">As of {artifact.as_of}</p>
      ) : null}
    </div>
  )
}
