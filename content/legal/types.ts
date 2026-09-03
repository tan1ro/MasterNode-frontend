import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

export const LEGAL_SLUGS = ["privacy", "terms", "trust", "accessibility"] as const
export type LegalSlug = (typeof LEGAL_SLUGS)[number]

/** One entry in a document's table of contents / on-page navigation. */
export interface LegalTocItem {
  id: string
  title: string
  icon: LucideIcon
}

export interface LegalDocumentDef {
  slug: LegalSlug
  title: string
  description: string
  /** Header + hub-card icon. */
  icon: LucideIcon
  /** Sticky table-of-contents entries (map 1:1 to LegalDocSection ids). */
  sections: LegalTocItem[]
  Content: () => ReactNode
}
