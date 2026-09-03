import type { AppAccountType } from "@/lib/account-types"
import type { SampleAgentCategory } from "@/constants/sample-agent-templates"
import { SAMPLE_AGENT_TEMPLATES } from "@/constants/sample-agent-templates"
import {
  galleryCategoryForTemplate,
  isBusinessPackVisible,
} from "@/constants/gallery-visibility"

export type BusinessPackId = "engineering" | "product" | "academics" | "sales_marketing" | "legal"

export interface BusinessPack {
  id: BusinessPackId
  label: string
  description: string
  categories: SampleAgentCategory[]
}

/** Full business-workflow assistant packs (not tied to a single pipeline). */
export const BUSINESS_PACKS: BusinessPack[] = [
  {
    id: "engineering",
    label: "Engineering & SDLC",
    description: "Build, review, ship, and operate software across the stack.",
    categories: ["sdlc", "codebase"],
  },
  {
    id: "product",
    label: "Product management",
    description: "Roadmaps, specs, discovery, and delivery coordination.",
    categories: ["sales_marketing", "general"],
  },
  {
    id: "academics",
    label: "Academics",
    description: "Timetable planning, research workflows, paper drafting, and Bloom taxonomy course design.",
    categories: ["academics", "general"],
  },
  {
    id: "sales_marketing",
    label: "Sales & marketing",
    description:
      "End-to-end revenue: market research, demand gen, prospecting, discovery, presales, proposals, and closing.",
    categories: ["sales_marketing"],
  },
  {
    id: "legal",
    label: "Legal & compliance",
    description: "Policies, contracts, and risk review starters.",
    categories: ["legal", "compliance"],
  },
]

export function visibleBusinessPacks(): BusinessPack[] {
  return BUSINESS_PACKS.filter((pack) => isBusinessPackVisible(pack.id))
}

export function defaultSampleCategoryForRole(
  _accountType: AppAccountType | null | undefined
): SampleAgentCategory {
  return "general"
}

export function samplesForPack(packId: BusinessPackId) {
  const pack = BUSINESS_PACKS.find((p) => p.id === packId)
  if (!pack) return []
  const cats = new Set(pack.categories)
  return SAMPLE_AGENT_TEMPLATES.filter((s) => {
    if (cats.has(s.category)) return true
    return cats.has(galleryCategoryForTemplate(s))
  })
}
