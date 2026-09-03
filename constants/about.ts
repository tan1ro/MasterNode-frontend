import type { LucideIcon } from "lucide-react"
import {
  Brain,
  Code2,
  Eye,
  FileText,
  GitBranch,
  Layers,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react"
import { BRANDING } from "@/constants/branding"
import { APP_VERSION_LABEL } from "@/lib/app-version"
import { ROUTES } from "@/lib/routes"

export const ABOUT_HERO = {
  badge: "About",
  title: "Don't stagger. Swarm.",
  subtitle:
    "MasterNode runs specialized agents in parallel — for code, research, documents, and decks — then validates the result before you ship.",
  tagline: BRANDING.tagline,
} as const

export const ABOUT_MISSION = {
  lead: "One generic chatbot cannot cover every kind of work.",
  body:
    "Real projects need specialists: coding, security, research, writing. MasterNode breaks a goal into focused subtasks, runs the right agents together, and merges them into one coherent deliverable you can trust.",
} as const

export type AboutDomainSpecialist = {
  icon: LucideIcon
  title: string
  description: string
  accent: "emerald" | "cyan" | "amber"
}

export const ABOUT_DOMAIN = {
  badge: "01 — specialists",
  title: "Domain agents, ready when you are",
  description:
    "Attach assistants from the gallery or run Pipeline mode. Multiple specialists can work on one prompt at the same time.",
  specialists: [
    {
      icon: Code2,
      title: "Coding & build",
      description: "Apps, scripts, tests, and refactors with a live task graph and exportable deliverables.",
      accent: "emerald",
    },
    {
      icon: ShieldCheck,
      title: "Security & quality",
      description: "Policy-aware generation and validation checks before code or docs leave the workspace.",
      accent: "cyan",
    },
    {
      icon: FileText,
      title: "Research & documents",
      description: "Reports, case studies, and slide decks — with citations and optional Word, PDF, or PPTX export.",
      accent: "amber",
    },
  ] satisfies AboutDomainSpecialist[],
} as const

export type AboutPrinciple = {
  icon: LucideIcon
  title: string
  description: string
  accent: "emerald" | "cyan" | "amber"
}

export const ABOUT_PRINCIPLES: AboutPrinciple[] = [
  {
    icon: GitBranch,
    title: "Parallel by default",
    description: "Decompose the goal, run specialists together, then merge — not one long serial chat.",
    accent: "emerald",
  },
  {
    icon: ShieldCheck,
    title: "Validated before you ship",
    description: "Draft output is not the finish line. Quality gates and checks run before delivery.",
    accent: "cyan",
  },
  {
    icon: Eye,
    title: "Visible and grounded",
    description: "Upload context, watch the live graph, and see which agents ran — not a black box.",
    accent: "amber",
  },
]

export type AboutCapability = {
  icon: LucideIcon
  title: string
  description: string
}

export const ABOUT_CAPABILITIES: AboutCapability[] = [
  {
    icon: MessageSquare,
    title: "Chat workspace",
    description: "Streaming replies, attachments, web search with citations, and pipeline mode.",
  },
  {
    icon: Layers,
    title: "Pipeline plans",
    description: "Review scope, answer clarifying questions, then Approve & Run with confidence.",
  },
  {
    icon: Sparkles,
    title: "Assistant gallery",
    description: "Save and attach specialists with lane-specific instructions for every run.",
  },
  {
    icon: Brain,
    title: "Memory & RAG",
    description: "Upload docs, retrieve grounded context, and keep projects consistent over time.",
  },
  {
    icon: Zap,
    title: "Your models, your keys",
    description: "Route across major providers or bring your own API keys — no forced single vendor.",
  },
  {
    icon: Users,
    title: "Workspaces & plans",
    description: "Team isolation, entitlements, and usage that scale from solo creators to orgs.",
  },
]

export const ABOUT_HOW_IT_WORKS = [
  {
    step: "01",
    title: "Describe the goal",
    description: "Start in chat or Pipeline. Attach files or specialists when you need a lane of expertise.",
  },
  {
    step: "02",
    title: "Agents run in parallel",
    description: "Work splits across specialists and models concurrently — each focused on its part.",
  },
  {
    step: "03",
    title: "One shippable result",
    description: "Outputs merge and validate into markdown, code, slides, or exports you can use.",
  },
] as const

export const ABOUT_AUDIENCE = [
  {
    icon: Users,
    title: "Creators & builders",
    description: "Solo makers and indie teams who outgrew a single chatbot and need real deliverables.",
  },
  {
    icon: Code2,
    title: "Engineering teams",
    description: "Parallel agents for build, review, and docs — with a live graph you can debug.",
  },
  {
    icon: Layers,
    title: "Growing companies",
    description: "The same engine scales from creator workflows toward broader product and ops domains.",
  },
] as const

export const ABOUT_LINKS = [
  { label: "Platform", href: ROUTES.platform },
  { label: "Blog", href: ROUTES.blog },
  { label: "Release notes", href: ROUTES.helpReleaseNotes },
  { label: "Help", href: ROUTES.help },
  { label: "Contact", href: ROUTES.contact },
] as const

export const ABOUT_STATUS = {
  version: APP_VERSION_LABEL,
  phase: "Public beta",
  summary:
    "Creator workspace, pipeline plans, chat deliverables, and multi-provider routing are live. We ship in the open and keep improving with every release.",
} as const
