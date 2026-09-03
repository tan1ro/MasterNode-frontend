"use client"

import { ChevronDown } from "lucide-react"
import { PRICING_MARKETS } from "@/constants/pricing-markets"
import { usePricingMarket } from "@/hooks/use-pricing-market"
import { cn } from "@/lib/utils"

export function FooterRegionSelector({ className }: { className?: string }) {
  const { marketId, setMarket } = usePricingMarket()

  return (
    <label className={cn("inline-flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
      <span className="sr-only">Choose your country or region</span>
      <select
        value={marketId}
        onChange={(e) => setMarket(e.target.value as typeof marketId)}
        className={cn(
          "max-w-[11rem] cursor-pointer appearance-none truncate rounded-sm border-0 bg-transparent",
          "py-0.5 pl-0 pr-5 text-xs text-muted-foreground outline-none",
          "hover:text-foreground focus-visible:ring-2 focus-visible:ring-[#2DCFCF]/40"
        )}
        aria-label="Country or region"
      >
        {PRICING_MARKETS.map((market) => (
          <option key={market.id} value={market.id} className="bg-background text-foreground">
            {market.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none -ml-4 size-3.5 shrink-0 opacity-70" aria-hidden />
    </label>
  )
}
