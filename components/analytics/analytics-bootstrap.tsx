"use client"

import { useEffect } from "react"
import { trackProductEvent } from "@/lib/analytics/track-event"
import { useCookieConsent } from "@/hooks/use-cookie-consent"

/** Tracks app_open once per browser session when analytics consent is granted. */
export function AnalyticsBootstrap() {
  const { hasAnalyticsConsent } = useCookieConsent()

  useEffect(() => {
    if (!hasAnalyticsConsent) return
    const key = "mn_app_open_tracked"
    try {
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, "1")
    } catch {
      /* ignore */
    }
    void trackProductEvent("app_open", {})
  }, [hasAnalyticsConsent])

  return null
}
