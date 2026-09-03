import type { LucideIcon } from "lucide-react"
import { GitBranch, Layers, Sparkles } from "lucide-react"

export type UseCaseBenefit = {
  id: string
  title: string
  description: string
  icon: LucideIcon
}

/** Static left-column benefits — always visible beside the domain graph. */
export const HOME_USE_CASE_BENEFITS: UseCaseBenefit[] = [
  {
    id: "decompose",
    title: "Break down problems together",
    description:
      "MasterNode splits complex goals into parallel workstreams, assigning each task to the right specialized agent.",
    icon: GitBranch,
  },
  {
    id: "expertise",
    title: "Apply domain expertise",
    description:
      "Agents work with domain-specific knowledge, instructions and workflows to produce relevant, context-aware results.",
    icon: Layers,
  },
  {
    id: "deliver",
    title: "Deliver complete outcomes",
    description:
      "Multiple agents coordinate their outputs into one reviewable, business-ready deliverable.",
    icon: Sparkles,
  },
]
