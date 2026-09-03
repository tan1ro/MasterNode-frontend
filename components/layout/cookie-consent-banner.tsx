"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Cookie, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  COOKIE_CONSENT_ALL,
  COOKIE_CONSENT_CHANGED_EVENT,
  COOKIE_CONSENT_ESSENTIAL,
  COOKIE_CONSENT_KEY,
  COOKIE_CONSENT_VERSION,
  COOKIE_POLICY_HREF,
  COOKIE_SETTINGS_EVENT,
  LEGAL_ENTITY,
  buildEssentialConsentRecord,
  hasValidLocalConsent,
  notifyCookieConsentChanged,
  parseCookieConsent,
  type CookieConsent,
} from "@/constants/legal"
import { clearAnalyticsSession } from "@/lib/analytics/client-context"
import { isMasterNodeDesktop } from "@/lib/desktop-runtime"
import { useAppAuth } from "@/hooks/use-app-auth"
import { useAuthSession } from "@/providers/auth-session-provider"
import { consentService } from "@/services/consent"
import { cn } from "@/lib/utils"

interface CookieCategory {
  key: "necessary" | "analytics" | "preferences" | "marketing"
  label: string
  description: string
  locked?: boolean
}

const CATEGORIES: CookieCategory[] = [
  {
    key: "necessary",
    label: "Required",
    description: "Authentication, security, and session management.",
    locked: true,
  },
  {
    key: "analytics",
    label: "Analytics",
    description: "Anonymous usage metrics and product analytics.",
  },
  {
    key: "preferences",
    label: "Preferences",
    description: "Theme, language, and UI preferences.",
  },
  {
    key: "marketing",
    label: "Marketing",
    description: "Disabled by default. Only enabled after explicit consent.",
  },
]

/** Wait for ConsentSync before first-paint prompt for signed-in users. */
const SIGNED_IN_CONSENT_DEFER_MS = 800

function ConsentToggle({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean
  disabled?: boolean
  onChange: (next: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full transition-colors",
        checked ? "bg-amber" : "bg-muted-foreground/30",
        disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform",
          checked ? "left-[1.125rem]" : "left-0.5"
        )}
      />
    </button>
  )
}

function writeLocalConsent(value: CookieConsent): CookieConsent {
  const enriched: CookieConsent = {
    ...value,
    necessary: true,
    consentVersion: value.consentVersion || COOKIE_CONSENT_VERSION,
    consentDate: value.consentDate || new Date().toISOString(),
    consentSource: value.consentSource || "banner",
  }
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(enriched))
  } catch {
    /* ignore */
  }
  if (!enriched.analytics) {
    clearAnalyticsSession()
  }
  return enriched
}

function saveConsentToApi(enriched: CookieConsent, source: CookieConsent["consentSource"]) {
  const payload = {
    consent_version: enriched.consentVersion || COOKIE_CONSENT_VERSION,
    consent_source: enriched.consentSource || source || "banner",
    analytics_consent: enriched.analytics,
    preference_consent: enriched.preferences,
    marketing_consent: enriched.marketing,
  }
  return consentService
    .save(payload)
    .catch(() => undefined)
    .finally(() => {
      notifyCookieConsentChanged()
    })
}

export function CookieConsentBanner() {
  const { isSignedIn, hydrated } = useAppAuth()
  const { authReady } = useAuthSession()
  const [visible, setVisible] = useState(false)
  const [customizing, setCustomizing] = useState(false)
  const [decided, setDecided] = useState(false)
  const [draft, setDraft] = useState<CookieConsent>(COOKIE_CONSENT_ESSENTIAL)
  const [desktopSilent, setDesktopSilent] = useState(false)
  /** User explicitly opened settings — do not auto-hide on sync. */
  const settingsOpenRef = useRef(false)
  const deferTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const applyStoredConsent = (stored: CookieConsent) => {
    setDraft(stored)
    setDecided(true)
    if (!settingsOpenRef.current) {
      setVisible(false)
      setCustomizing(false)
    }
  }

  // Desktop: never show the card; silently ensure essential consent exists.
  useEffect(() => {
    if (!isMasterNodeDesktop()) return
    setDesktopSilent(true)
    try {
      if (hasValidLocalConsent()) {
        const stored = parseCookieConsent(localStorage.getItem(COOKIE_CONSENT_KEY))
        if (stored) setDraft(stored)
        setDecided(true)
        return
      }
      const essential = writeLocalConsent(buildEssentialConsentRecord("banner"))
      setDraft(essential)
      setDecided(true)
      void saveConsentToApi(essential, "banner")
    } catch {
      /* ignore */
    }
  }, [])

  // Web: initial visibility + settings / consent-changed listeners.
  useEffect(() => {
    if (desktopSilent || isMasterNodeDesktop()) return

    const readAndApply = (): boolean => {
      try {
        const stored = parseCookieConsent(localStorage.getItem(COOKIE_CONSENT_KEY))
        if (stored && stored.consentVersion === COOKIE_CONSENT_VERSION) {
          applyStoredConsent(stored)
          return true
        }
        if (stored) setDraft(stored)
      } catch {
        /* ignore */
      }
      return false
    }

    if (readAndApply()) {
      // Valid local consent — stay hidden unless settings opens.
    }

    const openSettings = () => {
      settingsOpenRef.current = true
      try {
        const stored = parseCookieConsent(localStorage.getItem(COOKIE_CONSENT_KEY))
        if (stored) setDraft(stored)
      } catch {
        /* ignore */
      }
      setCustomizing(true)
      setVisible(true)
    }

    const onConsentChanged = () => {
      if (readAndApply()) return
    }

    window.addEventListener(COOKIE_SETTINGS_EVENT, openSettings)
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, onConsentChanged)
    return () => {
      window.removeEventListener(COOKIE_SETTINGS_EVENT, openSettings)
      window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, onConsentChanged)
      if (deferTimerRef.current) {
        clearTimeout(deferTimerRef.current)
        deferTimerRef.current = null
      }
    }
  }, [desktopSilent])

  // Web: decide when to show for first-time / version-bump users.
  useEffect(() => {
    if (desktopSilent || isMasterNodeDesktop()) return
    if (settingsOpenRef.current) return
    if (hasValidLocalConsent()) {
      setDecided(true)
      setVisible(false)
      return
    }
    if (!hydrated) return

    const showBanner = () => {
      if (hasValidLocalConsent() || settingsOpenRef.current) return
      try {
        const stored = parseCookieConsent(localStorage.getItem(COOKIE_CONSENT_KEY))
        if (stored) setDraft(stored)
      } catch {
        /* ignore */
      }
      setVisible(true)
    }

    // Signed-in: wait for ConsentSync (authReady + short defer) before prompting.
    if (isSignedIn) {
      if (!authReady) return
      if (deferTimerRef.current) clearTimeout(deferTimerRef.current)
      deferTimerRef.current = setTimeout(() => {
        deferTimerRef.current = null
        showBanner()
      }, SIGNED_IN_CONSENT_DEFER_MS)
      return () => {
        if (deferTimerRef.current) {
          clearTimeout(deferTimerRef.current)
          deferTimerRef.current = null
        }
      }
    }

    showBanner()
  }, [desktopSilent, hydrated, isSignedIn, authReady])

  const persist = (value: CookieConsent, source: CookieConsent["consentSource"] = "banner") => {
    const enriched = writeLocalConsent({
      ...value,
      consentVersion: COOKIE_CONSENT_VERSION,
      consentDate: new Date().toISOString(),
      consentSource: source,
    })
    settingsOpenRef.current = false
    setDraft(enriched)
    setDecided(true)
    setVisible(false)
    setCustomizing(false)
    void saveConsentToApi(enriched, source)
  }

  if (desktopSilent || isMasterNodeDesktop()) return null
  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie settings"
      data-mn-cookie-consent=""
      className="fixed bottom-5 left-5 z-[60] w-[calc(100%-2.5rem)] max-w-sm rounded-2xl border border-border bg-background/95 p-5 shadow-2xl backdrop-blur-md"
    >
      <div className="flex items-start gap-2">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-amber/25 bg-amber/10 text-amber">
          <Cookie className="size-[18px]" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-foreground">Cookie settings</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {LEGAL_ENTITY.name} uses necessary cookies to run the app. Optional cookies stay off
            until you allow them. See our{" "}
            <Link href={COOKIE_POLICY_HREF} className="text-amber hover:underline">
              Cookie Policy
            </Link>
            .
          </p>
        </div>
        {decided ? (
          <button
            type="button"
            onClick={() => {
              settingsOpenRef.current = false
              setVisible(false)
            }}
            aria-label="Close"
            className="-mr-1 -mt-1 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>

      {customizing ? (
        <ul className="mt-4 space-y-2.5">
          {CATEGORIES.map((cat) => (
            <li key={cat.key} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">
                  {cat.label}
                  {cat.locked ? (
                    <span className="ml-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Required
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                  {cat.description}
                </p>
              </div>
              <ConsentToggle
                label={cat.label}
                checked={cat.key === "necessary" ? true : draft[cat.key]}
                disabled={cat.locked}
                onChange={(next) =>
                  setDraft((prev) => ({ ...prev, [cat.key]: next }))
                }
              />
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {customizing ? (
          <>
            <Button
              size="sm"
              className="flex-1 bg-amber text-amber-foreground hover:bg-amber/90"
              onClick={() => persist(draft, "customize")}
            >
              Save preferences
            </Button>
            <Button size="sm" variant="outline" onClick={() => persist(COOKIE_CONSENT_ALL, "banner")}>
              Accept all
            </Button>
          </>
        ) : (
          <>
            <Button
              size="sm"
              className="flex-1 bg-amber text-amber-foreground hover:bg-amber/90"
              onClick={() => persist(COOKIE_CONSENT_ALL, "banner")}
            >
              Accept all
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => persist(COOKIE_CONSENT_ESSENTIAL, "banner")}
            >
              Reject non-essential
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="w-full text-muted-foreground hover:text-foreground"
              onClick={() => setCustomizing(true)}
            >
              Customize
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
