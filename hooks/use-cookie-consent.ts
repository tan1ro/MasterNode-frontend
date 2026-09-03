"use client"

import { useCallback, useEffect, useState } from "react"
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  COOKIE_CONSENT_KEY,
  parseCookieConsent,
  type CookieConsent,
} from "@/constants/legal"

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent | null>(null)

  const refresh = useCallback(() => {
    try {
      setConsent(parseCookieConsent(localStorage.getItem(COOKIE_CONSENT_KEY)))
    } catch {
      setConsent(null)
    }
  }, [])

  useEffect(() => {
    refresh()
    const onStorage = (event: StorageEvent) => {
      if (event.key === COOKIE_CONSENT_KEY) refresh()
    }
    const onChanged = () => refresh()
    window.addEventListener("storage", onStorage)
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, onChanged)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, onChanged)
    }
  }, [refresh])

  return {
    consent,
    hasAnalyticsConsent: Boolean(consent?.analytics),
    hasPreferenceConsent: Boolean(consent?.preferences),
    hasMarketingConsent: Boolean(consent?.marketing),
    refresh,
  }
}
