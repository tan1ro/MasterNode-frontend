import type { BusinessPackId } from "@/constants/business-packs"
import type { SampleAgentCategory } from "@/constants/sample-agent-templates"

/** Gallery categories hidden from browse/install UI (templates remain in seed data). */
export const HIDDEN_GALLERY_CATEGORIES = new Set<SampleAgentCategory>()

/** Categories shown in the gallery with a Coming soon state (not installable yet). */
export const COMING_SOON_GALLERY_CATEGORIES = new Set<SampleAgentCategory>([
  "codebase",
  "sdlc",
])

/** Business packs hidden from pack installer and product SDLC phase pickers. */
export const HIDDEN_BUSINESS_PACK_IDS = new Set<BusinessPackId>(["engineering"])

/** Domain focuses that belong under Legal (not Compliance). */
const LEGAL_DOMAIN_FOCUSES = new Set([
  "Contracts",
  "Governance & policy",
])

/** Domain focuses that belong under Compliance (not Legal). */
const COMPLIANCE_DOMAIN_FOCUSES = new Set([
  "Privacy & data",
  "Regulatory",
  "Audit & controls",
])

export function isGalleryCategoryVisible(category: SampleAgentCategory): boolean {
  if (category === "finance") return false
  if (category === "custom") return true
  // Combined tab is replaced by Legal + Compliance.
  if (category === "legal_compliance") return false
  return !HIDDEN_GALLERY_CATEGORIES.has(category)
}

export function isGalleryCategoryComingSoon(category: SampleAgentCategory): boolean {
  return COMING_SOON_GALLERY_CATEGORIES.has(category)
}

/**
 * Map seed/API categories onto gallery tabs.
 * Splits legacy ``legal_compliance`` (and ``legal``) by domain focus.
 */
export function resolveGalleryCategory(
  category: SampleAgentCategory,
  domainFocus?: string | null
): SampleAgentCategory {
  if (category === "legal" || category === "legal_compliance") {
    const focus = (domainFocus ?? "").trim()
    if (LEGAL_DOMAIN_FOCUSES.has(focus)) return "legal"
    if (COMPLIANCE_DOMAIN_FOCUSES.has(focus)) return "compliance"
    return category === "legal" ? "legal" : "compliance"
  }
  return category
}

/**
 * Normalize without domain focus — keeps ``legal`` as Legal.
 * Prefer ``resolveGalleryCategory`` / ``galleryCategoryForTemplate`` when focus is known.
 */
export function normalizeGalleryCategory(category: SampleAgentCategory): SampleAgentCategory {
  return resolveGalleryCategory(category, null)
}

export function galleryCategoryForTemplate(sample: {
  category: SampleAgentCategory
  config?: { domain_focus?: unknown } | null
}): SampleAgentCategory {
  const focus = String(sample.config?.domain_focus ?? "").trim()
  return resolveGalleryCategory(sample.category, focus || null)
}

export function isBusinessPackVisible(packId: BusinessPackId): boolean {
  return !HIDDEN_BUSINESS_PACK_IDS.has(packId)
}
