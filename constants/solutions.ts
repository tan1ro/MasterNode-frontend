import type { LucideIcon } from "lucide-react"
import { HOME_PIPELINE_LIVE_DEMO } from "@/constants/home-pipeline-demo"
import {
  AlertTriangle,
  Award,
  BarChart3,
  BookMarked,
  BookOpen,
  Brain,
  Briefcase,
  Calculator,
  Calendar,
  ClipboardCheck,
  Code2,
  Compass,
  Database,
  DollarSign,
  FileSearch,
  FileSignature,
  FileText,
  FlaskConical,
  GitBranch,
  GraduationCap,
  Landmark,
  Layers,
  LineChart,
  ListChecks,
  Lock,
  Megaphone,
  MessageSquare,
  Microscope,
  Network,
  PenLine,
  Presentation,
  Radar,
  Radio,
  Receipt,
  Scale,
  ScrollText,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TestTube,
  TrendingUp,
  Users,
  Workflow,
  Zap,
} from "lucide-react"
import { ROUTES } from "@/lib/routes"

export type SolutionCategory = "By workflow" | "By team"
export type SolutionAccent = "amber" | "cyan" | "violet" | "emerald" | "sky" | "oc"

export interface SolutionStat {
  value: string
  label: string
}

export interface SolutionValueProp {
  icon: LucideIcon
  title: string
  description: string
}

export interface SolutionCapabilityItem {
  icon: LucideIcon
  label: string
}

/** A real assistant from the /assistants gallery, surfaced on the solution page. */
export interface SolutionAssistant {
  name: string
  icon: LucideIcon
  blurb: string
}

export interface SolutionDemoStep {
  agent: string
  detail: string
}

export interface SolutionDemo {
  chips: string[]
  taskTitle: string
  prompt: string
  steps: SolutionDemoStep[]
  result: {
    title: string
    lines: string[]
  }
}

export interface SolutionResource {
  type: string
  title: string
  icon: LucideIcon
  href: string
}

export interface SolutionTestimonial {
  quote: string
  author: string
  role: string
}

export interface SolutionDef {
  slug: string
  category: SolutionCategory
  name: string
  icon: LucideIcon
  accent: SolutionAccent
  eyebrow: string
  title: string
  subtitle: string
  /** Domain focus label as shown in the assistants gallery. */
  galleryFocus: string
  stats: SolutionStat[]
  demo: SolutionDemo
  /** Real assistants from the gallery that power this solution. */
  assistants: SolutionAssistant[]
  valueProps: SolutionValueProp[]
  capabilities: {
    title: string
    description: string
    items: SolutionCapabilityItem[]
  }
  testimonial: SolutionTestimonial
  resources: SolutionResource[]
}

const COMMON_RESOURCES = (): SolutionResource[] => [
  { type: "Gallery", title: "Browse all assistants", icon: Sparkles, href: ROUTES.agents },
  { type: "Docs", title: "How parallel orchestration works", icon: BookOpen, href: ROUTES.docs },
  { type: "Trust", title: "Security & data handling", icon: ShieldCheck, href: ROUTES.trust },
]

export const SOLUTIONS: SolutionDef[] = [
  // ── By workflow ────────────────────────────────────────────
  {
    slug: "everyday-work",
    category: "By workflow",
    name: "Everyday work",
    icon: Sparkles,
    accent: "amber",
    eyebrow: "Workflow",
    galleryFocus: "General",
    title: "Your general-purpose assistants, running in parallel",
    subtitle:
      "Research, summarize, take meeting notes, build risk registers, and draft decision memos — the General assistants in your gallery, orchestrated so a whole task finishes at once.",
    stats: [
      { value: "8+", label: "ready-made general assistants" },
      { value: "4", label: "export formats — PDF, DOCX, HTML, research" },
      { value: "Seconds", label: "for work that took an afternoon" },
    ],
    demo: {
      chips: ["Decompose", "Fan-out", "Merge", "Validate"],
      taskTitle: "Research + decision memo",
      prompt:
        "Research our top 3 competitors, summarize their pricing, and draft a decision memo with a recommendation.",
      steps: [
        { agent: "Research helper", detail: "Gathered + cited sources" },
        { agent: "Summarizer", detail: "Condensed to key points" },
        { agent: "Risk register", detail: "Flagged 3 risks" },
        { agent: "Decision memo", detail: "Drafted recommendation" },
      ],
      result: {
        title: "Merged brief — ready for review",
        lines: [
          "Competitor pricing compared",
          "Risks flagged with mitigations",
          "Decision memo with a clear call",
        ],
      },
    },
    assistants: [
      { name: "Research helper", icon: Search, blurb: "Summarizes sources, cites uncertainty, suggests next steps." },
      { name: "Summarizer", icon: ListChecks, blurb: "Tight TL;DRs of long or dense material." },
      { name: "Meeting brief generator", icon: Calendar, blurb: "Agendas, notes, and action items from meetings." },
      { name: "Risk register builder", icon: AlertTriangle, blurb: "Structured risks with likelihood and mitigations." },
      { name: "Decision memo drafter", icon: Scale, blurb: "Options, trade-offs, and a clear recommendation." },
      { name: "Data extractor", icon: Database, blurb: "Pulls structured fields as JSON from messy text." },
    ],
    valueProps: [
      {
        icon: Workflow,
        title: "One task, many assistants",
        description:
          "Chain research, summarize, and drafting assistants into a single run that fans out in parallel.",
      },
      {
        icon: FileText,
        title: "Export anywhere",
        description:
          "Every result exports to PDF, DOCX, HTML, or a research format — ready to share.",
      },
      {
        icon: Brain,
        title: "Memory that carries over",
        description:
          "Working and long-term memory keep context so follow-ups build on prior runs.",
      },
      {
        icon: Radio,
        title: "Watch it work",
        description: "Live telemetry streams each assistant and stage as the task runs.",
      },
    ],
    capabilities: {
      title: "Grounded in your context",
      description: "Give assistants your documents and let them cite their work.",
      items: [
        { icon: Database, label: "RAG over your files" },
        { icon: Search, label: "Optional web search" },
        { icon: Layers, label: "Reusable assistant presets" },
        { icon: FileText, label: "Multi-format export" },
      ],
    },
    testimonial: {
      quote:
        "I stopped juggling five chats. One task runs the research, summary, and memo assistants together and hands me a finished brief.",
      author: "Priya Nair",
      role: "Chief of Staff, a scale-up",
    },
    resources: COMMON_RESOURCES(),
  },
  {
    slug: "engineering",
    category: "By workflow",
    name: "Engineering",
    icon: Code2,
    accent: "cyan",
    eyebrow: "Workflow",
    galleryFocus: "Code",
    title: "Turn a ticket into a reviewed, shippable change",
    subtitle:
      "The Codebase and SDLC assistants — copilot, refactor planner, test gap hunter, release commander — orchestrated across plan, build, test, and review stages with your gates in place.",
    stats: [
      { value: "10+", label: "engineering & SDLC assistants" },
      { value: "5", label: "SDLC phases modeled end-to-end" },
      { value: "70%", label: "less time on boilerplate" },
    ],
    demo: {
      chips: ["Plan", "Implement", "Test", "Review"],
      taskTitle: "Feature request → pull request",
      prompt:
        "Add rate limiting to the public API. Include config, middleware, tests, and update the docs.",
      steps: [
        { agent: "Sprint planner", detail: "Mapped files + test plan" },
        { agent: "Codebase copilot", detail: "Implemented middleware" },
        { agent: "Test gap hunter", detail: "Wrote unit + integration tests" },
        { agent: "Release commander", detail: "Flagged 1 edge case" },
      ],
      result: {
        title: "Change set ready for review",
        lines: [
          "4 files changed · 128 additions",
          "Tests: 12 passing, 1 needs input",
          "Docs updated with new limits",
        ],
      },
    },
    assistants: [
      { name: "Codebase copilot", icon: Code2, blurb: "Understands your repo and drafts changes to match conventions." },
      { name: "Refactor planner", icon: GitBranch, blurb: "Plans safe, incremental refactors with rollback points." },
      { name: "Test gap hunter", icon: TestTube, blurb: "Finds untested paths and writes the missing tests." },
      { name: "API contract auditor", icon: FileSearch, blurb: "Checks endpoints against the contract and flags drift." },
      { name: "Release readiness commander", icon: ShieldCheck, blurb: "Gates releases on tests, docs, and risk checks." },
      { name: "Incident postmortem copilot", icon: AlertTriangle, blurb: "Builds blameless postmortems with timelines and actions." },
    ],
    valueProps: [
      {
        icon: Workflow,
        title: "SDLC-aware stages",
        description:
          "Model plan → build → test → review → ship, each with its own assistants and validation gates.",
      },
      {
        icon: Code2,
        title: "Context from your repo",
        description:
          "Upload code and specs so assistants write changes that fit your codebase.",
      },
      {
        icon: ClipboardCheck,
        title: "Diffs you can trust",
        description:
          "Every generated change is traceable to the prompt and sources that produced it.",
      },
      {
        icon: Zap,
        title: "Parallel test authoring",
        description: "One assistant implements while another writes tests — no waiting.",
      },
    ],
    capabilities: {
      title: "Fits your engineering workflow",
      description: "Wire MasterNode into the tools your team already uses.",
      items: [
        { icon: Layers, label: "Product & task workspaces" },
        { icon: Network, label: "Webhook + n8n triggers" },
        { icon: Database, label: "Repo-aware RAG context" },
        { icon: Lock, label: "Scoped API keys" },
      ],
    },
    testimonial: {
      quote:
        "The plan-build-test loop runs in parallel, so our engineers review instead of type. It's like a tireless junior team that shows its work.",
      author: "Marcus Feld",
      role: "Staff Engineer, a devtools company",
    },
    resources: COMMON_RESOURCES(),
  },
  // ── By team ────────────────────────────────────────────────
  {
    slug: "sales-marketing",
    category: "By team",
    name: "Sales & Marketing",
    icon: Megaphone,
    accent: "violet",
    eyebrow: "Team",
    galleryFocus: "Marketing",
    title: "From market intel to a closed deal",
    subtitle:
      "The largest lane in your gallery — market research, ICP mapping, GTM, campaigns, prospecting, proposals, and forecasting — orchestrated across the full revenue motion.",
    stats: [
      { value: "40+", label: "sales, marketing & presales assistants" },
      { value: "PPTX", label: "decks, briefs, and one-pagers on export" },
      { value: "End-to-end", label: "from prospecting to close" },
    ],
    demo: HOME_PIPELINE_LIVE_DEMO,
    assistants: [
      { name: "Market intelligence & research", icon: Radar, blurb: "Sizes markets and scores segments with sources." },
      { name: "ICP & persona mapping", icon: Target, blurb: "Builds ideal-customer profiles and personas." },
      { name: "Go-to-market (GTM) planning", icon: Megaphone, blurb: "Plans the full GTM motion and milestones." },
      { name: "Marketing campaign planning", icon: LineChart, blurb: "End-to-end campaigns with channels and assets." },
      { name: "Sales prospecting plan", icon: Briefcase, blurb: "Targeted outreach plans and sequences." },
      { name: "Proposal & SOW drafting", icon: FileSignature, blurb: "Drafts proposals and statements of work." },
    ],
    valueProps: [
      {
        icon: Radar,
        title: "Full revenue motion",
        description:
          "Marketing, sales, and presales assistants cover the journey from intel to proposal to close.",
      },
      {
        icon: Presentation,
        title: "Deck-ready output",
        description: "Export to PPTX, PDF, DOCX, or HTML — battlecards and briefs ready to present.",
      },
      {
        icon: Database,
        title: "Grounded in your data",
        description: "Feed in your positioning and past decks so output stays on-brand.",
      },
      {
        icon: Workflow,
        title: "Chain the stages",
        description: "Run research → positioning → campaign as one orchestrated task.",
      },
    ],
    capabilities: {
      title: "Built for revenue teams",
      description: "Everything to go from intel to enablement.",
      items: [
        { icon: BarChart3, label: "Attribution & analytics" },
        { icon: MessageSquare, label: "Discovery & demo prep" },
        { icon: FileSignature, label: "Proposals & RFP responses" },
        { icon: TrendingUp, label: "Pipeline forecasting" },
      ],
    },
    testimonial: {
      quote:
        "We spun up a segment launch in a day — research, ICP, positioning, and a campaign plan — all from the assistants we already had.",
      author: "Sofia Almeida",
      role: "Head of Marketing, a SaaS company",
    },
    resources: COMMON_RESOURCES(),
  },
  {
    slug: "finance",
    category: "By team",
    name: "Finance",
    icon: DollarSign,
    accent: "emerald",
    eyebrow: "Team",
    galleryFocus: "Finance",
    title: "Plan, forecast, and report with confidence",
    subtitle:
      "The Finance assistants — budget planner, cash-flow forecaster, unit economics, pricing sensitivity, P&L review, and investor updates — with every number traceable to its inputs.",
    stats: [
      { value: "6", label: "finance assistants ready to run" },
      { value: "PPTX", label: "board-ready decks on export" },
      { value: "Traceable", label: "assumptions on every model" },
    ],
    demo: {
      chips: ["Model", "Forecast", "Review", "Report"],
      taskTitle: "Board prep",
      prompt:
        "Build a cash-flow forecast, review the P&L, and draft an investor update with the key metrics.",
      steps: [
        { agent: "Cash flow forecaster", detail: "Modeled 12-month runway" },
        { agent: "Unit economics", detail: "Computed CAC / LTV" },
        { agent: "P&L reviewer", detail: "Flagged margin changes" },
        { agent: "Investor update", detail: "Drafted the narrative" },
      ],
      result: {
        title: "Board packet — ready for review",
        lines: [
          "12-month cash-flow forecast",
          "Unit economics with assumptions",
          "Investor update draft",
        ],
      },
    },
    assistants: [
      { name: "Budget planner", icon: Calculator, blurb: "Builds and stress-tests operating budgets." },
      { name: "Cash flow forecaster", icon: LineChart, blurb: "Projects runway and scenarios." },
      { name: "Unit economics analyzer", icon: BarChart3, blurb: "Computes CAC, LTV, and contribution margin." },
      { name: "Pricing sensitivity planner", icon: DollarSign, blurb: "Models pricing changes and elasticity." },
      { name: "P&L reviewer", icon: Receipt, blurb: "Reviews the P&L and explains variances." },
      { name: "Investor update drafter", icon: TrendingUp, blurb: "Drafts crisp investor updates with metrics." },
    ],
    valueProps: [
      {
        icon: Calculator,
        title: "Models with assumptions",
        description: "Every forecast shows its inputs so reviewers can trace the numbers.",
      },
      {
        icon: Presentation,
        title: "Board-ready decks",
        description: "Export to PPTX and PDF for board and investor packets.",
      },
      {
        icon: ClipboardCheck,
        title: "Reviewer sign-off",
        description: "Drafts route to a human before anything is finalized.",
      },
      {
        icon: Database,
        title: "Grounded in your actuals",
        description: "Upload statements and let assistants work from real figures.",
      },
    ],
    capabilities: {
      title: "Built for finance teams",
      description: "From budgeting to the board deck.",
      items: [
        { icon: LineChart, label: "Forecasting & scenarios" },
        { icon: BarChart3, label: "Unit economics" },
        { icon: Receipt, label: "P&L variance review" },
        { icon: FileText, label: "Investor-ready reports" },
      ],
    },
    testimonial: {
      quote:
        "Board prep used to eat a week. Now the finance assistants draft the forecast and update, and I just verify the assumptions.",
      author: "Daniel Cho",
      role: "VP Finance, a growth-stage startup",
    },
    resources: COMMON_RESOURCES(),
  },
  {
    slug: "academics",
    category: "By team",
    name: "Academics",
    icon: GraduationCap,
    accent: "sky",
    eyebrow: "Team",
    galleryFocus: "Academics",
    title: "Teaching, research, and accreditation — done faster",
    subtitle:
      "The deepest lane in your gallery: lesson and rubric design, literature synthesis, thesis planning, grant writing, and NAAC/NBA accreditation prep — all grounded in your curriculum.",
    stats: [
      { value: "50+", label: "academic assistants across 4 lanes" },
      { value: "Teaching · Research", label: "Student success · Accreditation" },
      { value: "Grounded", label: "in your syllabus and standards" },
    ],
    demo: {
      chips: ["Plan", "Author", "Align", "Review"],
      taskTitle: "Course build + assessment",
      prompt:
        "Design a lesson and rubric on photosynthesis for grade 8, aligned to our syllabus and Bloom's taxonomy.",
      steps: [
        { agent: "Bloom course planner", detail: "Outlined objectives" },
        { agent: "Lesson & activity designer", detail: "Drafted the lesson" },
        { agent: "Assignment & rubric designer", detail: "Built the rubric" },
        { agent: "Syllabus auditor", detail: "Aligned to coverage" },
      ],
      result: {
        title: "Materials — ready for review",
        lines: [
          "Lesson plan with objectives",
          "Rubric mapped to outcomes",
          "Aligned to your syllabus",
        ],
      },
    },
    assistants: [
      { name: "Research architect", icon: Microscope, blurb: "Maps the literature and finds the gap." },
      { name: "Literature review synthesizer", icon: BookMarked, blurb: "Synthesizes sources into a coherent review." },
      { name: "Thesis & dissertation planner", icon: BookOpen, blurb: "Structures long-form research end-to-end." },
      { name: "Lesson & activity designer", icon: PenLine, blurb: "Designs lessons and classroom activities." },
      { name: "NAAC/NBA documentation assistant", icon: Landmark, blurb: "Prepares accreditation evidence and reports." },
      { name: "Grant & fellowship proposal writer", icon: Award, blurb: "Drafts competitive grant proposals." },
    ],
    valueProps: [
      {
        icon: BookOpen,
        title: "Curriculum-grounded",
        description: "Materials build from your syllabus and standards, with sources shown.",
      },
      {
        icon: Compass,
        title: "Research end-to-end",
        description: "From literature review to thesis planning to journal submission.",
      },
      {
        icon: Landmark,
        title: "Accreditation ready",
        description: "NAAC, NBA, OBE, and AQAR evidence prepared and organized.",
      },
      {
        icon: ClipboardCheck,
        title: "Educator in control",
        description: "Every item waits for review before it reaches students.",
      },
    ],
    capabilities: {
      title: "Fits how you teach & research",
      description: "Four lanes, one workspace.",
      items: [
        { icon: GraduationCap, label: "Teaching & assessment" },
        { icon: FlaskConical, label: "Research & publication" },
        { icon: Users, label: "Student success" },
        { icon: Landmark, label: "Accreditation prep" },
      ],
    },
    testimonial: {
      quote:
        "From lesson plans to our NBA self-study report, the academic assistants draft it aligned to our standards and I just review.",
      author: "Dr. Rebecca Lin",
      role: "Associate Professor & IQAC coordinator",
    },
    resources: COMMON_RESOURCES(),
  },
  {
    slug: "legal-compliance",
    category: "By team",
    name: "Legal & compliance",
    icon: Scale,
    accent: "oc",
    eyebrow: "Team",
    galleryFocus: "Legal",
    title: "Contracts, privacy, and audits — with a paper trail",
    subtitle:
      "The Legal & Compliance assistants review contracts, run privacy assessments, map obligations, and prep audits (SOC 2, ISO 27001, GDPR) — every finding traceable to its source.",
    stats: [
      { value: "50+", label: "legal & compliance assistants" },
      { value: "Full", label: "audit trail on every run" },
      { value: "Grounded", label: "in your policies and contracts" },
    ],
    demo: {
      chips: ["Ingest", "Review", "Map", "Draft"],
      taskTitle: "Contract risk review",
      prompt:
        "Review this MSA for risk, flag non-standard clauses, map obligations, and draft a negotiation position.",
      steps: [
        { agent: "Contract risk lens", detail: "Scored clauses by risk" },
        { agent: "Obligation mapper", detail: "Mapped the obligations" },
        { agent: "NDA reviewer", detail: "Checked confidentiality terms" },
        { agent: "Compliance orchestrator", detail: "Drafted the position" },
      ],
      result: {
        title: "Review packet — sign-off required",
        lines: [
          "Non-standard clauses flagged",
          "Obligations mapped to owners",
          "Negotiation position drafted",
        ],
      },
    },
    assistants: [
      { name: "Legal & compliance orchestrator", icon: Landmark, blurb: "Coordinates multi-step compliance workflows." },
      { name: "Contract risk + negotiation lens", icon: FileSignature, blurb: "Scores clauses and drafts negotiation positions." },
      { name: "Audit readiness + controls planner", icon: ClipboardCheck, blurb: "Preps SOC 2 / ISO 27001 evidence and controls." },
      { name: "DPIA & privacy risk assessor", icon: Lock, blurb: "Runs privacy impact assessments." },
      { name: "Vendor compliance screener", icon: ShieldCheck, blurb: "Due-diligence screening for third parties." },
      { name: "Policy drafter", icon: ScrollText, blurb: "Drafts and updates internal policies." },
    ],
    valueProps: [
      {
        icon: FileSearch,
        title: "Contract & policy review",
        description: "Assistants read contracts and policies and show where each finding came from.",
      },
      {
        icon: ScrollText,
        title: "Audit-ready trails",
        description: "Every output is cited and logged for auditors and regulators.",
      },
      {
        icon: ClipboardCheck,
        title: "Human sign-off",
        description: "Nothing is final without a reviewer approving the draft.",
      },
      {
        icon: Lock,
        title: "Controlled access",
        description: "Scoped API keys, RBAC, and tenant isolation protect sensitive data.",
      },
    ],
    capabilities: {
      title: "Built for legal & compliance",
      description: "From contracts to frameworks.",
      items: [
        { icon: FileSignature, label: "Contracts & clauses" },
        { icon: Lock, label: "Privacy & data (GDPR/CCPA)" },
        { icon: ClipboardCheck, label: "Audit & controls (SOC 2/ISO)" },
        { icon: Landmark, label: "Governance & policy" },
      ],
    },
    testimonial: {
      quote:
        "Contract review that took days now returns a risk-scored draft with the obligations mapped — and the audit trail keeps compliance happy.",
      author: "Karen Whitfield",
      role: "General Counsel, a mid-market firm",
    },
    resources: COMMON_RESOURCES(),
  },
]

export const SOLUTION_CATEGORY_ORDER: SolutionCategory[] = ["By workflow", "By team"]

const SOLUTIONS_BY_SLUG: Record<string, SolutionDef> = Object.fromEntries(
  SOLUTIONS.map((s) => [s.slug, s])
)

export function getSolution(slug: string): SolutionDef | undefined {
  return SOLUTIONS_BY_SLUG[slug]
}

export function solutionsByCategory(category: SolutionCategory): SolutionDef[] {
  return SOLUTIONS.filter((s) => s.category === category)
}

/** Slugs surfaced in the footer Solutions column (all lanes). */
export const FOOTER_SOLUTION_SLUGS = [
  "everyday-work",
  "engineering",
  "sales-marketing",
  "finance",
  "academics",
  "legal-compliance",
] as const

export { Sparkles as SolutionsHubIcon }
