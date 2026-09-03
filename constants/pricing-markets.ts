export const PRICING_MARKET_STORAGE_KEY = "mn_pricing_market"

export type PricingMarketId = "us" | "in" | "gb" | "eu"

export interface PricingMarket {
  id: PricingMarketId
  label: string
  currency: string
  locale: string
  /** Approximate FX multiplier from USD list prices. */
  fxFromUsd: number
}

export const PRICING_MARKETS: PricingMarket[] = [
  { id: "in", label: "India", currency: "INR", locale: "en-IN", fxFromUsd: 83 },
  { id: "us", label: "United States", currency: "USD", locale: "en-US", fxFromUsd: 1 },
  { id: "gb", label: "United Kingdom", currency: "GBP", locale: "en-GB", fxFromUsd: 0.79 },
  { id: "eu", label: "European Union", currency: "EUR", locale: "en-DE", fxFromUsd: 0.92 },
]

export const DEFAULT_PRICING_MARKET_ID: PricingMarketId = "in"

export function getPricingMarket(id: PricingMarketId): PricingMarket {
  return (
    PRICING_MARKETS.find((m) => m.id === id) ??
    PRICING_MARKETS.find((m) => m.id === DEFAULT_PRICING_MARKET_ID) ??
    PRICING_MARKETS[0]
  )
}
