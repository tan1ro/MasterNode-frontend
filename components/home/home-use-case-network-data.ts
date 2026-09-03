import type { LucideIcon } from "lucide-react"
import {
  ASSISTANT_GALLERY_CATEGORY_LABELS,
  type HomeNetworkCategory,
} from "@/constants/assistant-gallery-network"
import type { CategoryAccentToken } from "@/components/agent-templates/template-role-utils"
import { assistantCategoryTheme } from "@/components/agent-templates/template-role-utils"

export type UseCaseLeaf = {
  label: string
}

export type UseCaseHub = {
  id: HomeNetworkCategory
  label: string
  graphLabel?: string
  icon: LucideIcon
  accent: CategoryAccentToken
  angle: number
  tagline: string
  description: string
  leaves: UseCaseLeaf[]
  examples: string[]
  outputs: string[]
  comingSoon?: boolean
}

/** Active graph stroke — matches assistant gallery accent tokens. */
export const USE_CASE_ACCENT_STROKE: Record<CategoryAccentToken, string> = {
  amber: "rgba(176, 249, 0, 0.72)",
  cyan: "rgba(45, 207, 207, 0.72)",
  violet: "rgba(135, 80, 204, 0.72)",
  emerald: "rgba(0, 210, 126, 0.72)",
  sky: "rgba(56, 189, 248, 0.72)",
  oc: "rgba(255, 166, 0, 0.72)",
}

/** Home graph — same five domains as the assistants gallery tabs. */
const LANDING_HUBS: Array<
  Pick<UseCaseHub, "id" | "angle" | "tagline" | "description" | "examples" | "outputs"> & {
    leaves: string[]
    graphLabel?: string
  }
> = [
  {
    id: "general",
    angle: 0,
    tagline: "Research, writing, and everyday work",
    description:
      "General assistants for research, summaries, writing, meetings and everyday knowledge work.",
    examples: [
      "Summarize this briefing and list the decisions we still need.",
      "Turn these notes into a one-page brief",
      "Prep an agenda and follow-ups from this transcript",
    ],
    outputs: ["Summaries", "Briefs", "Meeting notes", "Drafts"],
    leaves: ["Research", "Summaries", "Writing", "Meetings"],
  },
  {
    id: "sales_marketing",
    angle: 82,
    tagline: "Campaigns, GTM, and pipeline",
    description:
      "Sales and marketing assistants for campaigns, GTM, positioning and pipeline work.",
    examples: [
      "Draft a GTM plan for our enterprise launch.",
      "Write LinkedIn ad variants for our campaign",
      "Build a positioning doc vs our top three competitors",
    ],
    outputs: ["GTM plans", "Ad copy packs", "Positioning docs", "Pitch outlines"],
    leaves: ["Marketing", "Sales", "GTM", "Positioning"],
  },
  {
    id: "academics",
    angle: 148,
    tagline: "Teaching, courses, and research",
    description:
      "Academic assistants for teaching, research, accreditation and course design.",
    examples: [
      "Turn this syllabus into weekly lesson plans with learning outcomes.",
      "Map this course to Bloom's taxonomy",
      "Draft an accreditation evidence pack for this program",
    ],
    outputs: ["Lesson plans", "Course outlines", "Rubrics", "Research memos"],
    leaves: ["Teaching", "Research", "Accreditation", "Lesson plans"],
  },
  {
    id: "legal",
    angle: 212,
    tagline: "Contracts, policy, and governance",
    description:
      "Legal assistants for contracts, governance and policy review.",
    examples: [
      "Flag high-risk clauses in this vendor MSA.",
      "Draft a governance policy for our AI tools",
      "Compare these two contract versions and list material changes",
    ],
    outputs: ["Clause reviews", "Policy drafts", "Redlines"],
    leaves: ["Contracts", "Governance", "Policy", "Review"],
  },
  {
    id: "compliance",
    angle: 278,
    tagline: "Privacy, regulatory, and audit",
    description:
      "Compliance assistants for privacy, regulatory review and audit-ready controls.",
    examples: [
      "Draft a DPIA checklist for our new analytics feature.",
      "Map these controls to SOC 2 evidence",
      "Flag regulatory gaps in this data-retention policy",
    ],
    outputs: ["DPIA checklists", "Control maps", "Audit evidence"],
    leaves: ["Privacy", "Regulatory", "Audit", "Controls"],
  },
]

function buildHub(spec: (typeof LANDING_HUBS)[number]): UseCaseHub {
  const theme = assistantCategoryTheme(spec.id)
  return {
    id: spec.id,
    label: ASSISTANT_GALLERY_CATEGORY_LABELS[spec.id],
    graphLabel: spec.graphLabel,
    icon: theme.icon,
    accent: theme.token,
    angle: spec.angle,
    tagline: spec.tagline,
    description: spec.description,
    leaves: spec.leaves.map((label) => ({ label })),
    examples: spec.examples,
    outputs: spec.outputs,
  }
}

export const HOME_USE_CASE_HUBS: UseCaseHub[] = LANDING_HUBS.map(buildHub)

export const DEFAULT_USE_CASE_HUB_ID: HomeNetworkCategory = "general"

export function getUseCaseHub(id: string): UseCaseHub | undefined {
  return HOME_USE_CASE_HUBS.find((hub) => hub.id === id)
}
