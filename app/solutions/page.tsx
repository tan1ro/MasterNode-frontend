import type { Metadata } from "next"
import { SolutionsIndex } from "@/components/solutions/solutions-index"

export const metadata: Metadata = {
  title: "Solutions · MasterNode.ai",
  description:
    "Parallel agent orchestration for AI agents, engineering, research, support, and industries like healthcare and government.",
}

export default function SolutionsPage() {
  return <SolutionsIndex />
}
