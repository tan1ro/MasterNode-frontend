"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Cookie, Shield, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LegalPageLayout } from "@/components/legal/legal-page-layout"
import { LegalSection } from "@/components/legal/legal-sections"
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  COOKIE_CONSENT_KEY,
  COOKIE_POLICY_HREF,
  LEGAL_ENTITY,
  openCookieSettings,
  parseCookieConsent,
  type CookieConsent,
} from "@/constants/legal"
import { consentService } from "@/services/consent"
import { ROUTES } from "@/lib/routes"

export default function PrivacyChoicesPage() {
  const [message, setMessage] = useState<string | null>(null)
  const [localConsent, setLocalConsent] = useState<CookieConsent | null>(null)
  const [serverConsent, setServerConsent] = useState<string | null>(null)

  useEffect(() => {
    const refresh = () => {
      try {
        setLocalConsent(parseCookieConsent(localStorage.getItem(COOKIE_CONSENT_KEY)))
      } catch {
        setLocalConsent(null)
      }
      void consentService
        .get()
        .then((res) => setServerConsent(JSON.stringify(res.consent, null, 2)))
        .catch(() => setServerConsent(null))
    }
    refresh()
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, refresh)
    return () => window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, refresh)
  }, [])

  const reopenCookieBanner = () => {
    openCookieSettings()
    setMessage("Opening cookie settings…")
  }

  return (
    <LegalPageLayout
      title="Cookie settings"
      docId="privacy"
      icon={SlidersHorizontal}
      description="View and update your cookie consent at any time."
    >
      <LegalSection title="Current consent">
        <p>
          {LEGAL_ENTITY.name} uses essential cookies for sign-in and security. Analytics and
          preference cookies load only after consent. Marketing cookies remain disabled unless you
          explicitly opt in.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg border border-border bg-muted/20 p-3 text-xs">
          {localConsent ? JSON.stringify(localConsent, null, 2) : "No local consent saved yet."}
        </pre>
        {serverConsent ? (
          <>
            <p className="mt-4 text-sm text-muted-foreground">Saved server record (signed-in users):</p>
            <pre className="mt-2 overflow-x-auto rounded-lg border border-border bg-muted/20 p-3 text-xs">
              {serverConsent}
            </pre>
          </>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="button" size="sm" variant="outline" onClick={reopenCookieBanner}>
            <Cookie className="mr-2 h-4 w-4" aria-hidden />
            Change cookie preferences
          </Button>
        </div>
        {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
      </LegalSection>
      <LegalSection title="Withdraw consent">
        <p>
          You can withdraw non-essential consent anytime using the cookie banner. Withdrawing consent
          stops analytics event collection on future visits.
        </p>
      </LegalSection>
      <LegalSection title="California privacy rights (CCPA/CPRA)">
        <p>
          California residents may request access, deletion, and correction. We do not sell personal
          information as defined under the CPRA.
        </p>
        <p className="mt-2">
          Email{" "}
          <a href={`mailto:${LEGAL_ENTITY.emailPrivacy}`} className="text-primary underline hover:no-underline">
            {LEGAL_ENTITY.emailPrivacy}
          </a>{" "}
          to exercise your rights.
        </p>
      </LegalSection>
      <p className="text-sm">
        <Link
          href={ROUTES.privacy}
          className="inline-flex items-center gap-2 text-primary underline hover:no-underline"
        >
          <Shield className="h-4 w-4" aria-hidden />
          Full Privacy &amp; Data policy
        </Link>
      </p>
    </LegalPageLayout>
  )
}
