import type { SampleAgentCategory } from "@/constants/sample-agent-templates"
import { SAMPLE_AGENT_TEMPLATES } from "@/constants/sample-agent-templates"
import { displayTemplateName } from "@/components/agent-templates/template-role-utils"
import {
  isGalleryCategoryComingSoon,
  resolveGalleryCategory,
} from "@/constants/gallery-visibility"
import { domainFocusForSample } from "@/lib/assistant-creator-meta"

/** Category tab labels — shared with the assistants gallery. */
export const ASSISTANT_GALLERY_CATEGORY_LABELS: Record<SampleAgentCategory, string> = {
  general: "General",
  sales_marketing: "Sales & Marketing",
  codebase: "Codebase",
  sdlc: "Engineering & SDLC",
  academics: "Academics",
  legal: "Legal",
  compliance: "Compliance",
  legal_compliance: "Legal & Compliance",
  finance: "Finance",
  custom: "Custom",
}

/** Domains shown on the home network (matches gallery categories). */
export const HOME_NETWORK_CATEGORIES = [
  "general",
  "codebase",
  "sales_marketing",
  "academics",
  "legal",
  "compliance",
  "sdlc",
] as const satisfies readonly SampleAgentCategory[]

export type HomeNetworkCategory = (typeof HOME_NETWORK_CATEGORIES)[number]

const NETWORK_LEAF_LIMIT = 4

/** Badge text shortcuts (gallery ``domain_focus`` pills). */
const FOCUS_SHORT_LABELS: Record<string, string> = {
  "Governance & policy": "Governance",
}

/**
 * Leaf labels per category — same specialties users see on assistant cards
 * (domain focus badges + flagship template themes in that tab).
 */
const CATEGORY_LEAF_PRIORITY: Record<HomeNetworkCategory, readonly string[]> = {
  general: ["Research", "Summaries", "Writing", "Meetings"],
  codebase: ["Code review", "Copilot", "Security", "API design", "Refactors", "Testing", "Documentation"],
  sales_marketing: ["Marketing", "Sales", "GTM", "Positioning"],
  academics: ["Teaching", "Research", "Accreditation", "Lesson plans"],
  legal: ["Contracts", "Governance"],
  compliance: ["Privacy & data", "Regulatory", "Audit & controls"],
  sdlc: ["Sprint planning", "Release readiness", "Postmortems", "Tech specs", "Runbooks", "CI/CD", "User stories"],
}

function templatesInCategory(category: SampleAgentCategory) {
  return SAMPLE_AGENT_TEMPLATES.filter(
    (sample) =>
      resolveGalleryCategory(sample.category, domainFocusForSample(sample)) === category
  )
}

function themeFromTemplateName(category: SampleAgentCategory, name: string): string | null {
  const n = displayTemplateName(name).toLowerCase()

  if (category === "codebase") {
    if (n.includes("copilot")) return "Copilot"
    if (n.includes("refactor")) return "Refactors"
    if (n.includes("api")) return "API design"
    if (n.includes("test")) return "Testing"
    if (n.includes("security")) return "Security"
    if (n.includes("debug")) return "Debugging"
    if (n.includes("doc")) return "Documentation"
    if (n.includes("depend")) return "Dependencies"
    if (n.includes("database") || n.includes("migration")) return "Database"
    if (n.includes("performance") || n.includes("profiler")) return "Performance"
    if (n.includes("architecture")) return "Architecture"
    if (n.includes("code review") || n.includes("review")) return "Code review"
  }

  if (category === "sdlc") {
    if (n.includes("sprint")) return "Sprint planning"
    if (n.includes("release")) return "Release readiness"
    if (n.includes("postmortem") || n.includes("incident")) return "Postmortems"
    if (n.includes("tech spec") || n.includes("design spec")) return "Tech specs"
    if (n.includes("story")) return "User stories"
    if (n.includes("retro")) return "Retrospectives"
    if (n.includes("runbook") || n.includes("on-call") || n.includes("oncall")) return "Runbooks"
    if (n.includes("ci/cd") || n.includes("pipeline")) return "CI/CD"
    if (n.includes("debt")) return "Tech debt"
    if (n.includes("capacity") || n.includes("velocity")) return "Capacity planning"
    if (n.includes("change")) return "Change management"
    if (n.includes("rfc") || n.includes("adr")) return "RFC review"
    if (n.includes("observability")) return "Observability"
  }

  if (category === "sales_marketing") {
    if (n.includes("gtm") || n.includes("go-to-market")) return "GTM"
    if (n.includes("positioning")) return "Positioning"
  }

  if (category === "academics") {
    if (n.includes("lesson")) return "Lesson plans"
  }

  return null
}

/** Collect domain-focus badges + template themes available in a gallery tab. */
export function galleryLeafCandidates(category: SampleAgentCategory): string[] {
  // Coming-soon domains keep curated leaf labels even when install is disabled.
  if (isGalleryCategoryComingSoon(category)) {
    return [...(CATEGORY_LEAF_PRIORITY[category as HomeNetworkCategory] ?? [])]
  }

  const candidates = new Set<string>()

  for (const sample of templatesInCategory(category)) {
    const focus = domainFocusForSample(sample)
    candidates.add(FOCUS_SHORT_LABELS[focus] ?? focus)
    const theme = themeFromTemplateName(category, sample.name)
    if (theme) candidates.add(theme)
  }

  // Code review is a first-class Codebase specialty.
  if (category === "codebase") {
    const hasCodeReview = SAMPLE_AGENT_TEMPLATES.some(
      (s) => s.template_id === "sample-custom-code-review"
    )
    if (hasCodeReview) candidates.add("Code review")
  }

  return [...candidates].sort((a, b) => a.localeCompare(b))
}

/** Network leaf row for a category — priority order from gallery specialties. */
export function galleryNetworkLeaves(
  category: HomeNetworkCategory
): { label: string }[] {
  const priority = CATEGORY_LEAF_PRIORITY[category]
  const available = new Set(galleryLeafCandidates(category))
  const leaves: string[] = []

  for (const label of priority) {
    if (leaves.length >= NETWORK_LEAF_LIMIT) break
    if (available.has(label)) leaves.push(label)
  }

  for (const label of [...available].sort((a, b) => a.localeCompare(b))) {
    if (leaves.length >= NETWORK_LEAF_LIMIT) break
    if (!leaves.includes(label)) leaves.push(label)
  }

  return leaves.map((label) => ({ label }))
}
