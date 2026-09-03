import type { LucideIcon } from "lucide-react"
import {
  AlertTriangle,
  BookOpen,
  Briefcase,
  Bug,
  Code2,
  FileSearch,
  GraduationCap,
  Headphones,
  Layers,
  Megaphone,
  Rocket,
  Scale,
  UserPlus,
} from "lucide-react"

export type PipelineDomainId = string

export type PipelineTaskChip = {
  label: string
  dependency?: string
}

export type PipelineParallelItem = {
  label: string
  doneAt: string
}

export type PipelineDomainExample = {
  id: PipelineDomainId
  label: string
  icon: LucideIcon
  master: {
    prompt: string
    goals: string[]
    uploads: string[]
    agents: number
    scenario: string
  }
  decomposer: {
    rootLabel: string
    tasks: PipelineTaskChip[]
    scenario: string
  }
  parallel: {
    items: PipelineParallelItem[]
    waiting: string
    scenario: string
  }
  aggregator: {
    drafts: string[]
    packTitle: string
    packDescription: string
    readyLabel: string
    scenario: string
  }
  supervisor: {
    promptEcho: string
    goals: string[]
    uploads: string[]
    agents: number
    ctaLabel: string
    scenario: string
  }
}

function ex(
  id: string,
  label: string,
  icon: LucideIcon,
  data: Omit<PipelineDomainExample, "id" | "label" | "icon">
): PipelineDomainExample {
  return { id, label, icon, ...data }
}

export const PIPELINE_DOMAIN_EXAMPLES: PipelineDomainExample[] = [
  ex("education", "School fundraiser", GraduationCap, {
    master: {
      prompt: "plan our school fundraiser",
      goals: ["Raise $5,000", "Boost parent turnout"],
      uploads: ["Budget.pdf", "Letter.docx", "Poster.jpg"],
      agents: 4,
      scenario:
        "Drop “plan our school fundraiser” — goals, uploads, and agent count are set first.",
    },
    decomposer: {
      rootLabel: "plan our school fundraiser",
      tasks: [
        { label: "Venue research" },
        { label: "Budget", dependency: "after venues" },
        { label: "Parent email" },
        { label: "Poster" },
      ],
      scenario:
        "One task splits into venues, budget, email, and poster — budget waits on venues.",
    },
    parallel: {
      items: [
        { label: "Parent email", doneAt: "10:42 AM" },
        { label: "Venue research", doneAt: "10:43 AM" },
        { label: "Poster copy", doneAt: "10:44 AM" },
      ],
      waiting: "Budget… Waiting…",
      scenario:
        "Email, venues, and poster run together while you watch the board.",
    },
    aggregator: {
      drafts: ["Intro", "Parent email", "Budget table", "Poster lines"],
      packTitle: "Parent-ready pack",
      packDescription: "Intro, email, budget table, poster lines. Same tone, no repeats.",
      readyLabel: "Ready for parents",
      scenario:
        "Drafts merge into one parent-ready pack — same tone, no repeats.",
    },
    supervisor: {
      promptEcho: "plan our school fundraiser",
      goals: ["Raise $5,000", "Community involvement"],
      uploads: ["Budget.pdf", "Letter.docx", "Expenses.xlsx", "Poster.jpg"],
      agents: 4,
      ctaLabel: "Set up & continue",
      scenario:
        "Get “Approved to send” or one clear fix before parents see it.",
    },
  }),
  ex("product", "API v2 launch", Rocket, {
    master: {
      prompt: "ship billing API v2 this sprint",
      goals: ["Zero-downtime cutover", "Update all client SDKs"],
      uploads: ["OpenAPI.yaml", "Migration.md", "Runbook.pdf"],
      agents: 5,
      scenario:
        "Drop “ship billing API v2” — scope, specs, and agents lock first.",
    },
    decomposer: {
      rootLabel: "ship billing API v2",
      tasks: [
        { label: "Endpoint spec" },
        { label: "Migration script", dependency: "after spec" },
        { label: "SDK updates" },
        { label: "QA checklist" },
      ],
      scenario:
        "One launch splits into spec, migration, SDKs, and QA — migration waits on spec.",
    },
    parallel: {
      items: [
        { label: "OpenAPI diff", doneAt: "2:14 PM" },
        { label: "SDK codegen", doneAt: "2:16 PM" },
        { label: "Integration tests", doneAt: "2:18 PM" },
      ],
      waiting: "Migration… Waiting…",
      scenario:
        "Spec, SDKs, and tests run in parallel on your board.",
    },
    aggregator: {
      drafts: ["Changelog", "Migration guide", "SDK notes", "Runbook"],
      packTitle: "Release-ready bundle",
      packDescription: "Changelog, migration steps, SDK notes, and runbook — one voice, no contradictions.",
      readyLabel: "Ready for deploy",
      scenario:
        "Drafts merge into one release bundle for eng and support.",
    },
    supervisor: {
      promptEcho: "ship billing API v2 this sprint",
      goals: ["Zero-downtime cutover", "Backward-compatible SDKs"],
      uploads: ["OpenAPI.yaml", "Migration.md", "Runbook.pdf", "Load-test.csv"],
      agents: 5,
      ctaLabel: "Approve release",
      scenario:
        "Get “Approved to deploy” or one fix before production.",
    },
  }),
  ex("marketing", "Product launch", Megaphone, {
    master: {
      prompt: "plan our Q3 product launch campaign",
      goals: ["10k sign-ups", "Consistent brand voice"],
      uploads: ["Brand-kit.zip", "Feature-brief.pdf", "Competitors.csv"],
      agents: 4,
      scenario:
        "Drop “plan Q3 product launch” — targets, assets, and agents lock first.",
    },
    decomposer: {
      rootLabel: "Q3 product launch",
      tasks: [
        { label: "Landing page" },
        { label: "Email sequence", dependency: "after landing" },
        { label: "Social posts" },
        { label: "Press brief" },
      ],
      scenario:
        "One campaign splits into landing, email, social, and press.",
    },
    parallel: {
      items: [
        { label: "Hero copy", doneAt: "9:05 AM" },
        { label: "Email #1", doneAt: "9:07 AM" },
        { label: "LinkedIn posts", doneAt: "9:09 AM" },
      ],
      waiting: "Press brief… Waiting…",
      scenario:
        "Hero, email, and social run together on your board.",
    },
    aggregator: {
      drafts: ["Landing", "Email #1–3", "Social set", "Press brief"],
      packTitle: "Launch campaign kit",
      packDescription: "Landing, emails, social set, and press brief — matched tone and messaging.",
      readyLabel: "Ready to publish",
      scenario:
        "Drafts combine into one launch kit with the same story.",
    },
    supervisor: {
      promptEcho: "plan our Q3 product launch campaign",
      goals: ["10k sign-ups", "On-brand messaging"],
      uploads: ["Brand-kit.zip", "Feature-brief.pdf", "Competitors.csv"],
      agents: 4,
      ctaLabel: "Approve campaign",
      scenario:
        "Get “Approved to publish” or one note before go-live.",
    },
  }),
  ex("sales", "Enterprise RFP", Briefcase, {
    master: {
      prompt: "respond to Acme Corp RFP by Friday",
      goals: ["Win technical score", "Match their security asks"],
      uploads: ["RFP-Acme.pdf", "Pricing-sheet.xlsx", "SOC2-summary.pdf"],
      agents: 6,
      scenario:
        "Drop “respond to Acme Corp RFP” — criteria, files, and agents lock first.",
    },
    decomposer: {
      rootLabel: "Acme Corp RFP",
      tasks: [
        { label: "Security answers" },
        { label: "Pricing table", dependency: "after security" },
        { label: "Case studies" },
        { label: "Exec summary" },
      ],
      scenario:
        "One RFP splits into security, pricing, proofs, and exec summary.",
    },
    parallel: {
      items: [
        { label: "Security Q&A", doneAt: "4:20 PM" },
        { label: "Case studies", doneAt: "4:22 PM" },
        { label: "Architecture diagram", doneAt: "4:24 PM" },
      ],
      waiting: "Pricing… Waiting…",
      scenario:
        "Security, case studies, and architecture run in parallel.",
    },
    aggregator: {
      drafts: ["Security", "Pricing", "Case studies", "Exec summary"],
      packTitle: "RFP submission pack",
      packDescription: "Security, pricing, proof, and exec summary — aligned claims, no conflicting numbers.",
      readyLabel: "Ready to submit",
      scenario:
        "Sections merge into one submission pack with consistent claims.",
    },
    supervisor: {
      promptEcho: "respond to Acme Corp RFP by Friday",
      goals: ["Win technical score", "Match security requirements"],
      uploads: ["RFP-Acme.pdf", "Pricing-sheet.xlsx", "SOC2-summary.pdf", "Logo.svg"],
      agents: 6,
      ctaLabel: "Approve submission",
      scenario:
        "Get “Approved to submit” or one fix before it goes out.",
    },
  }),
  ex("compliance", "Compliance audit", Scale, {
    master: {
      prompt: "prepare our SOC 2 audit evidence pack",
      goals: ["Close 12 control gaps", "Audit-ready by month end"],
      uploads: ["Control-matrix.xlsx", "Policy-folder.zip", "Last-audit.pdf"],
      agents: 4,
      scenario:
        "Drop “prepare SOC 2 evidence pack” — gaps, uploads, and agents lock first.",
    },
    decomposer: {
      rootLabel: "SOC 2 evidence pack",
      tasks: [
        { label: "Access logs" },
        { label: "Policy mapping", dependency: "after logs" },
        { label: "Vendor review" },
        { label: "Gap summary" },
      ],
      scenario:
        "Audit prep splits into logs, mapping, vendors, and gaps.",
    },
    parallel: {
      items: [
        { label: "Access evidence", doneAt: "11:10 AM" },
        { label: "Change tickets", doneAt: "11:12 AM" },
        { label: "Vendor attestations", doneAt: "11:14 AM" },
      ],
      waiting: "Gap summary… Waiting…",
      scenario:
        "Evidence lanes run together on your dashboard.",
    },
    aggregator: {
      drafts: ["Control map", "Evidence index", "Vendor list", "Gap report"],
      packTitle: "Audit-ready pack",
      packDescription: "Control map, evidence index, vendor list, and gap report — one narrative for auditors.",
      readyLabel: "Ready for auditor",
      scenario:
        "Evidence rolls into one audit-ready pack.",
    },
    supervisor: {
      promptEcho: "prepare our SOC 2 audit evidence pack",
      goals: ["Close 12 control gaps", "Audit-ready documentation"],
      uploads: ["Control-matrix.xlsx", "Policy-folder.zip", "Last-audit.pdf"],
      agents: 4,
      ctaLabel: "Approve evidence pack",
      scenario:
        "Get “Approved for auditor” or one note before sharing.",
    },
  }),
  ex("support", "Support playbook", Headphones, {
    master: {
      prompt: "build macros for our top 20 support tickets",
      goals: ["Cut handle time 30%", "Match brand tone"],
      uploads: ["Ticket-export.csv", "Help-center.md", "Tone-guide.pdf"],
      agents: 4,
      scenario:
        "Drop “build support macros” — goals, exports, and agents lock first.",
    },
    decomposer: {
      rootLabel: "support macro pack",
      tasks: [
        { label: "Billing replies" },
        { label: "Refund flow", dependency: "after billing" },
        { label: "Onboarding tips" },
        { label: "Escalation scripts" },
      ],
      scenario:
        "One playbook splits into billing, refunds, onboarding, and escalation.",
    },
    parallel: {
      items: [
        { label: "Billing macros", doneAt: "3:02 PM" },
        { label: "Onboarding tips", doneAt: "3:04 PM" },
        { label: "Escalation scripts", doneAt: "3:05 PM" },
      ],
      waiting: "Refund flow… Waiting…",
      scenario:
        "Billing, onboarding, and escalation draft in parallel.",
    },
    aggregator: {
      drafts: ["Billing", "Refunds", "Onboarding", "Escalation"],
      packTitle: "Agent-ready playbook",
      packDescription: "Macros for billing, refunds, onboarding, and escalation — same voice, no conflicting policy.",
      readyLabel: "Ready for agents",
      scenario:
        "Drafts merge into one shared-tone playbook.",
    },
    supervisor: {
      promptEcho: "build macros for our top 20 support tickets",
      goals: ["Cut handle time 30%", "Match brand tone"],
      uploads: ["Ticket-export.csv", "Help-center.md", "Tone-guide.pdf"],
      agents: 4,
      ctaLabel: "Approve playbook",
      scenario:
        "Get “Approved for Zendesk” or one fix before go-live.",
    },
  }),
  ex("research", "Research brief", BookOpen, {
    master: {
      prompt: "summarize these 8 papers into an exec brief",
      goals: ["Decision-ready in 1 hour", "Cite every claim"],
      uploads: ["Paper-1.pdf", "Paper-2.pdf", "Notes.md"],
      agents: 5,
      scenario:
        "Drop “summarize these papers” — uploads, citations, and readers lock first.",
    },
    decomposer: {
      rootLabel: "research exec brief",
      tasks: [
        { label: "Paper summaries" },
        { label: "Theme map", dependency: "after summaries" },
        { label: "Risk section" },
        { label: "Recommendations" },
      ],
      scenario:
        "One brief splits into summaries, themes, risks, and recommendations.",
    },
    parallel: {
      items: [
        { label: "Papers 1–3", doneAt: "1:08 PM" },
        { label: "Papers 4–6", doneAt: "1:10 PM" },
        { label: "Papers 7–8", doneAt: "1:11 PM" },
      ],
      waiting: "Theme map… Waiting…",
      scenario:
        "Paper batches run in parallel with citations streaming in.",
    },
    aggregator: {
      drafts: ["Summaries", "Themes", "Risks", "Recommendations"],
      packTitle: "Exec research brief",
      packDescription: "Summaries, themes, risks, and recommendations — cited, no duplicate claims.",
      readyLabel: "Ready for leadership",
      scenario:
        "Outputs merge into one exec brief with shared citations.",
    },
    supervisor: {
      promptEcho: "summarize these 8 papers into an exec brief",
      goals: ["Decision-ready in 1 hour", "Cite every claim"],
      uploads: ["Paper-1.pdf", "Paper-2.pdf", "Notes.md", "Biblio.bib"],
      agents: 5,
      ctaLabel: "Approve brief",
      scenario:
        "Get “Approved to share” or one fix before it leaves.",
    },
  }),
  ex("hiring", "Hiring sprint", UserPlus, {
    master: {
      prompt: "run hiring loop for senior backend engineer",
      goals: ["Fill role in 6 weeks", "Structured rubric"],
      uploads: ["Job-desc.md", "Rubric.xlsx", "Team-values.pdf"],
      agents: 4,
      scenario:
        "Drop “run hiring loop” — bar, rubrics, and agents lock first.",
    },
    decomposer: {
      rootLabel: "senior backend hire",
      tasks: [
        { label: "Outreach emails" },
        { label: "Screening rubric", dependency: "after outreach" },
        { label: "Take-home spec" },
        { label: "Debrief template" },
      ],
      scenario:
        "One hire splits into outreach, screening, take-home, and debrief.",
    },
    parallel: {
      items: [
        { label: "Outreach drafts", doneAt: "11:20 AM" },
        { label: "Take-home spec", doneAt: "11:22 AM" },
        { label: "Debrief template", doneAt: "11:23 AM" },
      ],
      waiting: "Screening rubric… Waiting…",
      scenario:
        "Outreach, take-home, and debrief run in parallel.",
    },
    aggregator: {
      drafts: ["Outreach", "Rubric", "Take-home", "Debrief"],
      packTitle: "Hiring loop kit",
      packDescription: "Outreach, rubric, take-home, and debrief — aligned bar, no mixed signals.",
      readyLabel: "Ready for recruiters",
      scenario:
        "Drafts combine into one hiring kit with the same bar.",
    },
    supervisor: {
      promptEcho: "run hiring loop for senior backend engineer",
      goals: ["Fill role in 6 weeks", "Structured rubric"],
      uploads: ["Job-desc.md", "Rubric.xlsx", "Team-values.pdf"],
      agents: 4,
      ctaLabel: "Approve hiring kit",
      scenario:
        "Get “Approved to send” or one fix before outreach.",
    },
  }),
  ex("incident", "Incident postmortem", AlertTriangle, {
    master: {
      prompt: "write postmortem for last night's outage",
      goals: ["Blameless narrative", "Action items by owner"],
      uploads: ["PagerDuty.csv", "Logs.txt", "Timeline.md"],
      agents: 4,
      scenario:
        "Drop “write outage postmortem” — timeline, owners, and agents lock first.",
    },
    decomposer: {
      rootLabel: "outage postmortem",
      tasks: [
        { label: "Timeline" },
        { label: "Root cause", dependency: "after timeline" },
        { label: "Customer impact" },
        { label: "Action items" },
      ],
      scenario:
        "One postmortem splits into timeline, root cause, impact, and actions.",
    },
    parallel: {
      items: [
        { label: "Timeline draft", doneAt: "8:40 AM" },
        { label: "Impact summary", doneAt: "8:42 AM" },
        { label: "Action items", doneAt: "8:43 AM" },
      ],
      waiting: "Root cause… Waiting…",
      scenario:
        "Timeline, impact, and actions draft in parallel.",
    },
    aggregator: {
      drafts: ["Timeline", "Root cause", "Impact", "Actions"],
      packTitle: "Postmortem doc",
      packDescription: "Timeline, root cause, impact, and actions — blameless, no contradictions.",
      readyLabel: "Ready for review",
      scenario:
        "Sections merge into one shared postmortem.",
    },
    supervisor: {
      promptEcho: "write postmortem for last night's outage",
      goals: ["Blameless narrative", "Action items by owner"],
      uploads: ["PagerDuty.csv", "Logs.txt", "Timeline.md"],
      agents: 4,
      ctaLabel: "Approve postmortem",
      scenario:
        "Get “Approved to publish” or one fix before it goes out.",
    },
  }),
  ex("repurpose", "Content repurposing", Layers, {
    master: {
      prompt: "turn our webinar into blog, email, and social",
      goals: ["Publish in 48 hours", "Keep speaker quotes accurate"],
      uploads: ["Webinar-transcript.vtt", "Slides.pdf", "Brand-voice.md"],
      agents: 4,
      scenario:
        "Drop “repurpose this webinar” — uploads, channels, and agents lock first.",
    },
    decomposer: {
      rootLabel: "webinar repurposing",
      tasks: [
        { label: "Blog draft" },
        { label: "Email recap", dependency: "after blog" },
        { label: "Social clips" },
        { label: "Quote sheet" },
      ],
      scenario:
        "One webinar splits into blog, email, social, and quotes.",
    },
    parallel: {
      items: [
        { label: "Blog outline", doneAt: "5:15 PM" },
        { label: "Social clips", doneAt: "5:17 PM" },
        { label: "Quote sheet", doneAt: "5:18 PM" },
      ],
      waiting: "Email recap… Waiting…",
      scenario:
        "Blog, social, and quotes run in parallel.",
    },
    aggregator: {
      drafts: ["Blog", "Email", "Social set", "Quotes"],
      packTitle: "Repurpose pack",
      packDescription: "Blog, email, social, and quotes — same story, accurate speaker lines.",
      readyLabel: "Ready to schedule",
      scenario:
        "Drafts merge into one matching repurpose pack.",
    },
    supervisor: {
      promptEcho: "turn our webinar into blog, email, and social",
      goals: ["Publish in 48 hours", "Keep speaker quotes accurate"],
      uploads: ["Webinar-transcript.vtt", "Slides.pdf", "Brand-voice.md"],
      agents: 4,
      ctaLabel: "Approve content pack",
      scenario:
        "Get “Approved to schedule” or one fix before posts go out.",
    },
  }),
  ex("bug_triage", "Bug triage sprint", Bug, {
    master: {
      prompt: "triage 47 open bugs for this sprint",
      goals: ["Prioritize P0/P1", "Assign owners today"],
      uploads: ["Jira-export.csv", "Sprint-goals.md", "On-call-roster.pdf"],
      agents: 5,
      scenario:
        "Drop “triage open bugs” — goals, export, and agents lock first.",
    },
    decomposer: {
      rootLabel: "sprint bug triage",
      tasks: [
        { label: "Severity pass" },
        { label: "Owner mapping", dependency: "after severity" },
        { label: "Duplicate scan" },
        { label: "Sprint cut list" },
      ],
      scenario:
        "One triage splits into severity, owners, dedupe, and cut list.",
    },
    parallel: {
      items: [
        { label: "P0/P1 scan", doneAt: "10:05 AM" },
        { label: "Duplicate scan", doneAt: "10:07 AM" },
        { label: "Component tags", doneAt: "10:08 AM" },
      ],
      waiting: "Owner mapping… Waiting…",
      scenario:
        "Severity, dedupe, and tagging run in parallel.",
    },
    aggregator: {
      drafts: ["Severity", "Owners", "Deduped list", "Sprint cut"],
      packTitle: "Sprint-ready backlog",
      packDescription: "Severity, owners, deduped list, and sprint cut — one prioritized board.",
      readyLabel: "Ready for standup",
      scenario:
        "Outputs merge into one sprint backlog with clear owners.",
    },
    supervisor: {
      promptEcho: "triage 47 open bugs for this sprint",
      goals: ["Prioritize P0/P1", "Assign owners today"],
      uploads: ["Jira-export.csv", "Sprint-goals.md", "On-call-roster.pdf"],
      agents: 5,
      ctaLabel: "Approve sprint board",
      scenario:
        "Get “Approved for standup” or one fix before tickets move.",
    },
  }),
  ex("code_review", "PR review pack", Code2, {
    master: {
      prompt: "review this 1,200-line PR before merge",
      goals: ["Catch regressions", "Suggest tests"],
      uploads: ["diff.patch", "API-spec.yaml", "Test-plan.md"],
      agents: 4,
      scenario:
        "Drop “review this PR” — diff, criteria, and reviewers lock first.",
    },
    decomposer: {
      rootLabel: "PR review pack",
      tasks: [
        { label: "Security review" },
        { label: "Perf notes", dependency: "after security" },
        { label: "Test gaps" },
        { label: "Docs impact" },
      ],
      scenario:
        "One PR splits into security, perf, tests, and docs.",
    },
    parallel: {
      items: [
        { label: "Security scan", doneAt: "6:12 PM" },
        { label: "Test gaps", doneAt: "6:14 PM" },
        { label: "Docs impact", doneAt: "6:15 PM" },
      ],
      waiting: "Perf notes… Waiting…",
      scenario:
        "Security, tests, and docs review in parallel.",
    },
    aggregator: {
      drafts: ["Security", "Perf", "Tests", "Docs"],
      packTitle: "Merge-ready review",
      packDescription: "Security, perf, test, and docs notes — actionable, no duplicate asks.",
      readyLabel: "Ready for author",
      scenario:
        "Threads merge into one comment pack with a single gate.",
    },
    supervisor: {
      promptEcho: "review this 1,200-line PR before merge",
      goals: ["Catch regressions", "Suggest tests"],
      uploads: ["diff.patch", "API-spec.yaml", "Test-plan.md"],
      agents: 4,
      ctaLabel: "Approve review",
      scenario:
        "Get “Approved to merge” or one fix before merge.",
    },
  }),
  ex("discovery", "Customer discovery", FileSearch, {
    master: {
      prompt: "synthesize 12 customer interviews into insights",
      goals: ["Find top 3 pains", "Quote-backed themes"],
      uploads: ["Interview-1.txt", "Interview-2.txt", "Survey.csv"],
      agents: 5,
      scenario:
        "Drop “synthesize customer interviews” — data and analysts lock first.",
    },
    decomposer: {
      rootLabel: "customer discovery",
      tasks: [
        { label: "Transcript tags" },
        { label: "Theme clusters", dependency: "after tags" },
        { label: "Pain ranking" },
        { label: "Opportunity map" },
      ],
      scenario:
        "One discovery splits into tags, themes, pain, and opportunities.",
    },
    parallel: {
      items: [
        { label: "Interviews 1–4", doneAt: "2:30 PM" },
        { label: "Interviews 5–8", doneAt: "2:32 PM" },
        { label: "Survey stats", doneAt: "2:33 PM" },
      ],
      waiting: "Theme clusters… Waiting…",
      scenario:
        "Interview and survey analysts run in parallel.",
    },
    aggregator: {
      drafts: ["Tags", "Themes", "Pain rank", "Opportunities"],
      packTitle: "Discovery insights deck",
      packDescription: "Tags, themes, pain rank, and opportunities — quote-backed, no fluff.",
      readyLabel: "Ready for product",
      scenario:
        "Outputs merge into one insights deck with shared quotes.",
    },
    supervisor: {
      promptEcho: "synthesize 12 customer interviews into insights",
      goals: ["Find top 3 pains", "Quote-backed themes"],
      uploads: ["Interview-1.txt", "Interview-2.txt", "Survey.csv"],
      agents: 5,
      ctaLabel: "Approve insights",
      scenario:
        "Get “Approved for roadmap” or one fix before it ships.",
    },
  }),
]

export function pickRandomPipelineExample(excludeId?: string): PipelineDomainExample {
  const pool = excludeId
    ? PIPELINE_DOMAIN_EXAMPLES.filter((example) => example.id !== excludeId)
    : PIPELINE_DOMAIN_EXAMPLES
  return pool[Math.floor(Math.random() * pool.length)] ?? PIPELINE_DOMAIN_EXAMPLES[0]
}

export function pipelineDomainById(id: PipelineDomainId): PipelineDomainExample {
  return PIPELINE_DOMAIN_EXAMPLES.find((d) => d.id === id) ?? PIPELINE_DOMAIN_EXAMPLES[0]
}

export function pipelineStageScenario(
  domain: PipelineDomainExample,
  stageKey: string
): string {
  switch (stageKey) {
    case "master":
      return domain.master.scenario
    case "decomposer":
      return domain.decomposer.scenario
    case "parallel":
      return domain.parallel.scenario
    case "aggregator":
      return domain.aggregator.scenario
    case "supervisor":
      return domain.supervisor.scenario
    default:
      return domain.master.scenario
  }
}
