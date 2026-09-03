import { ROUTES } from "@/lib/routes"

export interface HelpCourseCard {
  title: string
  description: string
  href: string
  level?: string
}

export const HELP_COURSES: HelpCourseCard[] = [
  {
    title: "Bloom taxonomy course planner",
    description: "Design outcomes-aligned modules, assessments, and rubrics for academic programs.",
    href: ROUTES.agents,
    level: "Creator",
  },
  {
    title: "Agent templates for academics",
    description: "Timetables, exam blueprints, research workflows, and paper drafting assistants.",
    href: `${ROUTES.docs}#agent-templates`,
    level: "Creator",
  },
  {
    title: "RAG for course materials",
    description: "Upload syllabi and readings so agents cite your knowledge base in chat and tasks.",
    href: `${ROUTES.docs}#rag-system`,
    level: "Intermediate",
  },
  {
    title: "Pipeline tasks for research",
    description: "Run multi-stage research and writing pipelines with human-in-the-loop validation.",
    href: ROUTES.chat,
    level: "Advanced",
  },
]
