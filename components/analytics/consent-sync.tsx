"use client"

import { useEffect, useRef } from "react"
import {
  COOKIE_CONSENT_KEY,
  COOKIE_CONSENT_VERSION,
  notifyCookieConsentChanged,
  parseCookieConsent,
  type CookieConsent,
} from "@/constants/legal"
import { useAppAuth } from "@/hooks/use-app-auth"
import { clearAnalyticsSession } from "@/lib/analytics/client-context"
import { useAuthSession } from "@/providers/auth-session-provider"
import { consentService } from "@/services/consent"

function serverRecordToLocal(record: {
  consent_version?: string
  consent_date?: string
  consent_source?: string
  analytics_consent?: boolean
  preference_consent?: boolean
  marketing_consent?: boolean
}): CookieConsent {
  const source = record.consent_source
  const consentSource =
    source === "settings" || source === "customize" || source === "banner"
      ? source
      : "banner"
  return {
    necessary: true,
    analytics: Boolean(record.analytics_consent),
    preferences: Boolean(record.preference_consent),
    marketing: Boolean(record.marketing_consent),
    consentVersion: record.consent_version || COOKIE_CONSENT_VERSION,
    consentDate: record.consent_date,
    consentSource,
  }
}

/**
 * When a signed-in user has no local consent (or an older version), apply the
 * server cookie_consent record so preferences travel across devices.
 */
export function ConsentSync() {
  const { isSignedIn, user } = useAppAuth()
  const { authReady } = useAuthSession()
  const syncedFor = useRef<string | null>(null)

  useEffect(() => {
    if (!isSignedIn || !authReady || !user?.id) return
    if (syncedFor.current === user.id) return
    syncedFor.current = user.id

    let cancelled = false
    void consentService
      .get()
      .then((res) => {
        if (cancelled || !res.consent) return
        const local = parseCookieConsent(localStorage.getItem(COOKIE_CONSENT_KEY))
        const server = serverRecordToLocal(res.consent)
        const localDate = local?.consentDate ? Date.parse(local.consentDate) : 0
        const serverDate = server.consentDate ? Date.parse(server.consentDate) : 0
        const shouldApply =
          !local ||
          local.consentVersion !== COOKIE_CONSENT_VERSION ||
          (Number.isFinite(serverDate) &&
            serverDate > (Number.isFinite(localDate) ? localDate : 0))
        if (!shouldApply) return
        localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(server))
        if (!server.analytics) clearAnalyticsSession()
        notifyCookieConsentChanged()
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [isSignedIn, authReady, user?.id])

  return null
}
