import { afterEach, describe, expect, it, vi } from "vitest"
import {
  COOKIE_CONSENT_ALL,
  COOKIE_CONSENT_CHANGED_EVENT,
  COOKIE_CONSENT_ESSENTIAL,
  COOKIE_CONSENT_KEY,
  COOKIE_CONSENT_VERSION,
  COOKIE_SETTINGS_EVENT,
  hasValidLocalConsent,
  notifyCookieConsentChanged,
  openCookieSettings,
  parseCookieConsent,
} from "@/constants/legal"
import { hasAnalyticsConsent } from "@/lib/analytics/track-event"

describe("parseCookieConsent", () => {
  it("parses legacy all/essential strings", () => {
    expect(parseCookieConsent("all")?.analytics).toBe(true)
    expect(parseCookieConsent("all")?.preferences).toBe(true)
    expect(parseCookieConsent("essential")?.analytics).toBe(false)
  })

  it("parses structured consent with preferences", () => {
    const parsed = parseCookieConsent(JSON.stringify(COOKIE_CONSENT_ALL))
    expect(parsed).toMatchObject({
      analytics: true,
      preferences: true,
      marketing: false,
    })
  })

  it("defaults preferences from analytics for older payloads", () => {
    const parsed = parseCookieConsent(JSON.stringify({ analytics: true, marketing: false }))
    expect(parsed?.preferences).toBe(true)
  })

  it("returns essential consent without analytics", () => {
    const parsed = parseCookieConsent(JSON.stringify(COOKIE_CONSENT_ESSENTIAL))
    expect(parsed?.analytics).toBe(false)
    expect(parsed?.preferences).toBe(false)
  })
})

describe("hasValidLocalConsent", () => {
  afterEach(() => {
    localStorage.removeItem(COOKIE_CONSENT_KEY)
  })

  it("is false when empty", () => {
    expect(hasValidLocalConsent()).toBe(false)
  })

  it("is true for current-version consent in localStorage", () => {
    localStorage.setItem(
      COOKIE_CONSENT_KEY,
      JSON.stringify({ ...COOKIE_CONSENT_ALL, consentVersion: COOKIE_CONSENT_VERSION })
    )
    expect(hasValidLocalConsent()).toBe(true)
  })

  it("accepts a raw string argument", () => {
    expect(hasValidLocalConsent(JSON.stringify(COOKIE_CONSENT_ESSENTIAL))).toBe(true)
    expect(hasValidLocalConsent("essential")).toBe(true)
  })
})

describe("cookie consent events", () => {
  afterEach(() => {
    localStorage.removeItem(COOKIE_CONSENT_KEY)
    vi.restoreAllMocks()
  })

  it("openCookieSettings and notifyCookieConsentChanged use distinct events", () => {
    const open = vi.fn()
    const changed = vi.fn()
    window.addEventListener(COOKIE_SETTINGS_EVENT, open)
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, changed)
    openCookieSettings()
    notifyCookieConsentChanged()
    expect(open).toHaveBeenCalledTimes(1)
    expect(changed).toHaveBeenCalledTimes(1)
    window.removeEventListener(COOKIE_SETTINGS_EVENT, open)
    window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, changed)
  })

  it("hasAnalyticsConsent reads localStorage", () => {
    expect(hasAnalyticsConsent()).toBe(false)
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(COOKIE_CONSENT_ALL))
    expect(hasAnalyticsConsent()).toBe(true)
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(COOKIE_CONSENT_ESSENTIAL))
    expect(hasAnalyticsConsent()).toBe(false)
  })
})
