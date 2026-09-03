import {
  Accessibility,
  Activity,
  Building2,
  Clock,
  Cookie,
  FileSignature,
  Mail,
  MapPin,
  Network,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react"
import { AccessibilityLegalContent } from "./accessibility"
import { PrivacyLegalContent } from "./privacy"
import { TermsLegalContent } from "./terms"
import { TrustLegalContent } from "./trust"
import { LEGAL_SLUGS, type LegalDocumentDef, type LegalSlug } from "./types"

export { LEGAL_SLUGS, type LegalSlug, type LegalTocItem } from "./types"

export const LEGAL_DOCUMENTS_BY_SLUG: Record<LegalSlug, LegalDocumentDef> = {
  privacy: {
    slug: "privacy",
    title: "Privacy & Data",
    description:
      "How MasterNode.ai collects, uses, and protects your data — plus cookies, your California privacy rights, and retention schedules.",
    icon: ShieldCheck,
    sections: [
      { id: "privacy-policy", title: "Privacy Policy", icon: ShieldCheck },
      { id: "cookies", title: "Cookie Policy", icon: Cookie },
      { id: "ccpa", title: "California Notice", icon: MapPin },
      { id: "data-retention", title: "Data Retention", icon: Clock },
      { id: "contact", title: "Contact", icon: Mail },
    ],
    Content: PrivacyLegalContent,
  },
  terms: {
    slug: "terms",
    title: "Terms of Service",
    description:
      "The agreement that governs your use of MasterNode.ai, our acceptable-use rules, and the service levels we commit to.",
    icon: ScrollText,
    sections: [
      { id: "terms-of-service", title: "Terms of Service", icon: ScrollText },
      { id: "acceptable-use", title: "Acceptable Use", icon: ShieldAlert },
      { id: "sla", title: "Service Level Agreement", icon: Activity },
    ],
    Content: TermsLegalContent,
  },
  trust: {
    slug: "trust",
    title: "Trust & Security",
    description:
      "Our security practices, the subprocessors and vendors we rely on, and how enterprise customers can execute a DPA.",
    icon: ShieldCheck,
    sections: [
      { id: "security", title: "Security & Trust", icon: ShieldCheck },
      { id: "subprocessors", title: "Subprocessors", icon: Network },
      { id: "vendors", title: "Third-Party Vendors", icon: Building2 },
      { id: "dpa", title: "Data Processing (DPA)", icon: FileSignature },
      { id: "contact", title: "Contact", icon: Mail },
    ],
    Content: TrustLegalContent,
  },
  accessibility: {
    slug: "accessibility",
    title: "Accessibility",
    description:
      "Our commitment to WCAG 2.1 AA, the limitations we're actively working on, and how to send accessibility feedback.",
    icon: Accessibility,
    sections: [{ id: "accessibility", title: "Accessibility Statement", icon: Accessibility }],
    Content: AccessibilityLegalContent,
  },
}

export function isLegalSlug(slug: string): slug is LegalSlug {
  return (LEGAL_SLUGS as readonly string[]).includes(slug)
}

export function legalDocHref(slug: LegalSlug, hash?: string): string {
  const base = `/legal/${slug}`
  return hash ? `${base}#${hash}` : base
}
