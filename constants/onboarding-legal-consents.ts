import { ROUTES } from "@/lib/routes"

export type OnboardingLegalConsentAccent = "cyan" | "amber" | "orange" | "violet"

export interface OnboardingLegalConsent {
  id: string
  required: boolean
  /** Short title shown on the consent card. */
  title: string
  /** Sentence before the linked document name. */
  lead: string
  linkLabel: string
  href: string
  accent: OnboardingLegalConsentAccent
}

/**
 * Legal consents collected at the end of onboarding.
 * Add or remove entries here as product/legal requirements change.
 */
export const ONBOARDING_LEGAL_CONSENTS: OnboardingLegalConsent[] = [
  {
    id: "terms",
    required: true,
    title: "Terms of service",
    lead: "I have read and agree to the",
    linkLabel: "Terms and Conditions",
    href: ROUTES.terms,
    accent: "amber",
  },
  {
    id: "privacy",
    required: true,
    title: "Privacy",
    lead: "I have read and agree to the",
    linkLabel: "Privacy Policy",
    href: ROUTES.privacy,
    accent: "cyan",
  },
  {
    id: "usage_policy",
    required: true,
    title: "Acceptable use",
    lead: "I have read and agree to the",
    linkLabel: "Usage Policy",
    href: ROUTES.usagePolicy,
    accent: "orange",
  },
  {
    id: "personalization",
    required: true,
    title: "Tailored outputs",
    lead: "I understand MasterNode may use my onboarding answers and optional work context to",
    linkLabel: "personalize my experience",
    href: ROUTES.privacy,
    accent: "violet",
  },
]

export const ONBOARDING_REQUIRED_LEGAL_CONSENT_IDS = ONBOARDING_LEGAL_CONSENTS.filter(
  (consent) => consent.required
).map((consent) => consent.id)
