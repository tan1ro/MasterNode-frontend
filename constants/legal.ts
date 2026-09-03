import { legalDocHref } from "@/content/legal"
import { LEGAL_SLUGS, type LegalSlug } from "@/content/legal/types"
import { ROUTES } from "@/lib/routes"

export const LEGAL_ENTITY = {
  name: "MasterNode.ai",
  legalName: "MasterNode AI",
  address: "123 Innovation Way, San Francisco, CA 94105, United States",
  emailLegal: "legal@masternode.ai",
  emailPrivacy: "privacy@masternode.ai",
  emailSecurity: "security@masternode.ai",
  emailDpa: "dpa@masternode.ai",
} as const

/** Last-updated dates keyed by consolidated document id. */
export const LEGAL_LAST_UPDATED: Record<LegalSlug | "hub", string> = {
  hub: "May 1, 2026",
  privacy: "May 1, 2026",
  terms: "May 1, 2026",
  trust: "May 1, 2026",
  accessibility: "May 1, 2026",
}

export interface LegalDocMeta {
  slug: LegalSlug
  title: string
  href: string
  description: string
}

/** Four consolidated legal documents (content lives under `frontend/content/legal/`). */
export const LEGAL_DOCUMENTS: LegalDocMeta[] = LEGAL_SLUGS.map((slug) => {
  const href = legalDocHref(slug)
  const meta: Record<LegalSlug, Omit<LegalDocMeta, "slug" | "href">> = {
    privacy: {
      title: "Privacy & Data",
      description: "Privacy policy, cookies, California notice, and retention.",
    },
    terms: {
      title: "Terms of Service",
      description: "Platform agreement, acceptable use, and SLA.",
    },
    trust: {
      title: "Trust & Security",
      description: "Security, subprocessors, vendors, and DPA.",
    },
    accessibility: {
      title: "Accessibility",
      description: "WCAG commitment and feedback channels.",
    },
  }
  return { slug, href, ...meta[slug] }
})

export const COOKIE_CONSENT_KEY = "mn_cookie_consent"

/** Dispatch on `window` to (re)open the cookie settings card from anywhere. */
export const COOKIE_SETTINGS_EVENT = "mn-open-cookie-settings"

/** Dispatch after consent is written to localStorage so hooks can refresh without reopening the banner. */
export const COOKIE_CONSENT_CHANGED_EVENT = "mn-cookie-consent-changed"

/** Cookie policy anchor within the privacy document. */
export const COOKIE_POLICY_HREF = `${ROUTES.privacy}#cookies`

export interface CookieConsent {
  necessary: true
  analytics: boolean
  preferences: boolean
  marketing: boolean
  consentVersion?: string
  consentDate?: string
  consentSource?: "banner" | "settings" | "customize"
}

export interface CookieConsentRecord {
  consent_version: string
  consent_date: string
  consent_source: string
  analytics_consent: boolean
  preference_consent: boolean
  marketing_consent: boolean
}

export const COOKIE_CONSENT_VERSION = "1"

export const COOKIE_CONSENT_ALL: CookieConsent = {
  necessary: true,
  analytics: true,
  preferences: true,
  marketing: false,
}
export const COOKIE_CONSENT_ESSENTIAL: CookieConsent = {
  necessary: true,
  analytics: false,
  preferences: false,
  marketing: false,
}

/** Parse stored consent, tolerating the legacy "all" / "essential" string format. */
export function parseCookieConsent(raw: string | null | undefined): CookieConsent | null {
  if (!raw) return null
  if (raw === "all") return { ...COOKIE_CONSENT_ALL, consentVersion: COOKIE_CONSENT_VERSION }
  if (raw === "essential") return { ...COOKIE_CONSENT_ESSENTIAL, consentVersion: COOKIE_CONSENT_VERSION }
  try {
    const parsed = JSON.parse(raw) as Partial<CookieConsent>
    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      preferences: Boolean(parsed.preferences ?? parsed.analytics),
      marketing: Boolean(parsed.marketing),
      consentVersion: parsed.consentVersion || COOKIE_CONSENT_VERSION,
      consentDate: parsed.consentDate,
      consentSource: parsed.consentSource,
    }
  } catch {
    return null
  }
}

/** True when localStorage has consent matching the current policy version. */
export function hasValidLocalConsent(raw?: string | null): boolean {
  const value =
    raw !== undefined
      ? raw
      : typeof window === "undefined"
        ? null
        : localStorage.getItem(COOKIE_CONSENT_KEY)
  const stored = parseCookieConsent(value)
  return Boolean(stored && stored.consentVersion === COOKIE_CONSENT_VERSION)
}

/** Build a dated essential-only consent record for silent desktop / sync defaults. */
export function buildEssentialConsentRecord(
  source: CookieConsent["consentSource"] = "banner"
): CookieConsent {
  return {
    ...COOKIE_CONSENT_ESSENTIAL,
    necessary: true,
    consentVersion: COOKIE_CONSENT_VERSION,
    consentDate: new Date().toISOString(),
    consentSource: source,
  }
}

/** Fire the global event that reopens the cookie settings card. */
export function openCookieSettings(): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(COOKIE_SETTINGS_EVENT))
}

/** Notify listeners that local cookie consent changed (does not open the banner). */
export function notifyCookieConsentChanged(): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT))
}
