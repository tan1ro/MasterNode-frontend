"use client"

import { useCallback, useEffect, useState } from "react"
import { DEFAULT_PRICING_MARKET_ID, getPricingMarket, type PricingMarketId } from "@/constants/pricing-markets"
import {
  PRICING_MARKET_CHANGE_EVENT,
  readPricingMarketId,
  writePricingMarketId,
} from "@/lib/pricing-market"

export function usePricingMarket() {
  const [marketId, setMarketIdState] = useState<PricingMarketId>(DEFAULT_PRICING_MARKET_ID)

  useEffect(() => {
    setMarketIdState(readPricingMarketId())
    const sync = () => setMarketIdState(readPricingMarketId())
    window.addEventListener(PRICING_MARKET_CHANGE_EVENT, sync)
    return () => window.removeEventListener(PRICING_MARKET_CHANGE_EVENT, sync)
  }, [])

  const setMarket = useCallback((id: PricingMarketId) => {
    writePricingMarketId(id)
    setMarketIdState(id)
  }, [])

  return {
    marketId,
    market: getPricingMarket(marketId),
    setMarket,
  }
}
