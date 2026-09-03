import { PRICING_ANNUAL_MULTIPLIER, type PricingPlanId } from "@/constants/pricing-plans"
import {
  DEFAULT_PRICING_MARKET_ID,
  getPricingMarket,
  PRICING_MARKET_STORAGE_KEY,
  type PricingMarket,
  type PricingMarketId,
} from "@/constants/pricing-markets"

export const PRICING_MARKET_CHANGE_EVENT = "mn-pricing-market-change"

function isPricingMarketId(value: string): value is PricingMarketId {
  return value === "us" || value === "in" || value === "gb" || value === "eu"
}

export function readPricingMarketId(): PricingMarketId {
  if (typeof window === "undefined") return DEFAULT_PRICING_MARKET_ID
  const stored = window.localStorage.getItem(PRICING_MARKET_STORAGE_KEY)
  if (stored && isPricingMarketId(stored)) return stored
  return DEFAULT_PRICING_MARKET_ID
}

export function writePricingMarketId(id: PricingMarketId): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(PRICING_MARKET_STORAGE_KEY, id)
  window.dispatchEvent(new CustomEvent(PRICING_MARKET_CHANGE_EVENT, { detail: { id } }))
}

export function readPricingMarket(): PricingMarket {
  return getPricingMarket(readPricingMarketId())
}

function parseMonthlyUsd(price: string): number | null {
  const match = price.match(/\$([\d.]+)/)
  if (!match) return null
  const value = Number.parseFloat(match[1])
  return Number.isFinite(value) ? value : null
}

export function formatMarketMoney(amount: number, market: PricingMarket): string {
  const whole = Number.isInteger(amount) || Math.abs(amount - Math.round(amount)) < 1e-9
  return new Intl.NumberFormat(market.locale, {
    style: "currency",
    currency: market.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(whole ? Math.round(amount) : amount)
}

const MARKET_PLAN_PRICE_OVERRIDES: Partial<
  Record<PricingMarketId, Partial<Record<PricingPlanId, number>>>
> = {
  us: {
    free: 0,
    pro: 49,
    pro_plus: 99,
    premium: 299,
  },
  in: {
    free: 0,
    pro: 4499,
    pro_plus: 8999,
    premium: 27999,
  },
  gb: {
    free: 0,
    pro: 39,
    pro_plus: 79,
    premium: 239,
  },
  eu: {
    free: 0,
    pro: 49,
    pro_plus: 99,
    premium: 299,
  },
}

export function formatPlanPriceForMarket(
  usdMonthlyPrice: string,
  market: PricingMarket,
  options?: { annual?: boolean; planId?: PricingPlanId }
): { display: string; note: string } {
  if (usdMonthlyPrice === "Custom") {
    return { display: "Custom", note: "Contact sales" }
  }

  const monthlyUsd = parseMonthlyUsd(usdMonthlyPrice)
  if (monthlyUsd === null) {
    return { display: usdMonthlyPrice, note: `${market.currency} / month` }
  }

  if (monthlyUsd === 0) {
    return {
      display: formatMarketMoney(0, market),
      note: `${market.currency} / month`,
    }
  }

  const explicitMarketPrice = options?.planId
    ? MARKET_PLAN_PRICE_OVERRIDES[market.id]?.[options.planId]
    : undefined
  const baseAmount =
    explicitMarketPrice != null ? explicitMarketPrice : monthlyUsd * market.fxFromUsd
  const localAmount = options?.annual
    ? Math.round(baseAmount * PRICING_ANNUAL_MULTIPLIER)
    : baseAmount

  return {
    display: formatMarketMoney(localAmount, market),
    note: options?.annual
      ? `${market.currency} / mo · billed yearly`
      : `${market.currency} / month`,
  }
}
