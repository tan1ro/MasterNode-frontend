import type { SampleAgentTemplate } from "@/constants/sample-agent-templates"
import type { AssistantOutputFormat } from "@/constants/assistant-output-formats"
import { displayTemplateName, shortTemplateDescription } from "@/components/agent-templates/template-role-utils"
import {
  domainFocusForSample,
  outputFormatsForSample,
} from "@/lib/assistant-creator-meta"
import { readCapabilitiesForTemplate, type AssistantReadCapabilities } from "@/lib/assistant-read-capabilities"
import type { AgentTemplateApi } from "@/types/api"

export interface AssistantGalleryMeta {
  templateId: string
  title: string
  /** Domain specialty label (not a pipeline stage). */
  role: string
  domainFocus: string
  outputFormats: AssistantOutputFormat[]
  summary: string
  detail: string
  bestFor: string
  variables: string[]
  promptPreview: string
  chatUsage: string
  pipelineUsage: string
  exportUsage: string
  readCapabilities: AssistantReadCapabilities
}

const CHAT_USAGE =
  "Attach in chat to run deep domain reads from Memory, live web research (when enabled), and your custom instructions before each reply."

const EXPORT_USAGE =
  "When you ask for a deliverable, the assistant steers exports toward its configured formats — PPTX slide decks, PDF reports, editable DOCX, or styled HTML pages."

const PIPELINE_OPTIONAL_USAGE =
  "Optional: on Tasks, assign this assistant to any pipeline stage (master, decompose, parallel, " +
  "aggregate, supervise). The same template works whether the task runs in parallel or sequential " +
  "mode — that setting only changes how subtasks are orchestrated, not which assistants you can use. " +
  "In chat it is always a direct attachment with no stage required."

/** Richer copy for gallery cards — keyed by ``template_id``. */
const GALLERY_COPY: Record<
  string,
  Pick<AssistantGalleryMeta, "summary" | "detail" | "bestFor">
> = {
  "sample-custom-research": {
    summary:
      "Guides open-ended research: synthesize sources, note uncertainty, and propose next steps.",
    bestFor: "Topic briefs, competitive scans, literature reviews, stakeholder memos",
    detail:
      "Research helper specializes in exploratory questions where the answer is not a single fact. It weighs evidence, separates knowns from unknowns, and ends with concrete follow-ups—ideal when you need a structured brief rather than a quick answer.",
  },
  "sample-custom-summarizer": {
    summary: "Compresses long or dense material into bullets, a takeaway, and open questions.",
    bestFor: "Meeting notes, reports, email threads, documentation TL;DRs",
    detail:
      "Summarizer is tuned for busy readers. It preserves the original intent while cutting noise, surfaces ambiguity explicitly, and highlights what still needs a decision.",
  },
  "sample-custom-code-review": {
    summary: "Reviews code for bugs, edge cases, security issues, and readability improvements.",
    bestFor: "PR reviews, snippet audits, pre-merge sanity checks",
    detail:
      "Code review focuses on correctness and maintainability. Expect line-level suggestions when possible, plus risk callouts—not a full rewrite unless you ask for one.",
  },
  "sample-custom-data-extractor": {
    summary: "Pulls structured fields from messy text and returns clean JSON.",
    bestFor: "Invoices, forms, logs, scraped pages, semi-structured notes",
    detail:
      "Data extractor maps unstructured input to your schema. Missing fields are returned as null instead of guessed—useful when you need reliable fields for downstream automation.",
  },
  "sample-custom-writer": {
    summary: "Polishes drafts for clarity, tone, and structure without changing the facts.",
    bestFor: "Emails, docs, announcements, UX copy revisions",
    detail:
      "Writer / editor reworks phrasing and flow while keeping your meaning intact. Specify a target tone when you invoke it in chat or pipeline variables.",
  },
  "sample-custom-tutor": {
    summary: "Teaches with hints and small steps—avoids giving away full solutions too early.",
    bestFor: "Homework help, concept checks, interview prep, skill practice",
    detail:
      "Tutor mode is Socratic: it checks what you already understand, offers the next nudge, and only reveals more when you've shown substantial work.",
  },
  "sample-general-meeting-brief": {
    summary: "Turns scattered notes into a tight pre-read with decisions and action items.",
    bestFor: "Stand-ups, steering committees, client syncs, leadership reviews",
    detail:
      "Meeting brief generator produces an objective, context, agenda, decisions needed, and owners—so attendees arrive aligned.",
  },
  "sample-general-risk-register": {
    summary: "Builds a practical risk register with scores, owners, and mitigations.",
    bestFor: "Program reviews, launch planning, compliance prep, ops retros",
    detail:
      "Risk register builder adds probability/impact framing, early-warning triggers, and review cadence—not just a flat list of worries.",
  },
  "sample-general-decision-memo": {
    summary: "Drafts decision memos with options, tradeoffs, and a clear recommendation.",
    bestFor: "Build vs buy, vendor selection, policy choices, roadmap bets",
    detail:
      "Decision memo drafter structures the question, constraints, and options matrix so approvers can decide quickly with documented rationale.",
  },
}

function fullDescription(description?: string): string | null {
  if (!description?.trim()) return null
  return description.replace(/^Optional specialty prompt(?: for)?:?\s*/i, "").trim()
}

function promptPreview(prompt?: string, max = 220): string {
  const text = (prompt || "").trim()
  if (!text) return "No prompt template configured."
  if (text.length <= max) return text
  return `${text.slice(0, max).trim()}…`
}

function fallbackBestFor(sample: SampleAgentTemplate): string {
  const focus = domainFocusForSample(sample)
  const formats = outputFormatsForSample(sample)
  const vars = sample.variables?.length
    ? `Inputs: ${sample.variables.join(", ")}`
    : "No template variables"
  const fmt = formats.length ? ` · Exports: ${formats.join(", ")}` : ""
  return `${focus} · ${vars}${fmt}`
}

export function getAssistantGalleryMeta(sample: SampleAgentTemplate): AssistantGalleryMeta {
  const title = displayTemplateName(sample.name)
  const role = domainFocusForSample(sample)
  const override = GALLERY_COPY[sample.template_id]
  const desc = fullDescription(sample.description)
  const short = shortTemplateDescription(sample.description)

  const summary =
    override?.summary ??
    desc ??
    short ??
    `${role} specialist for chat and optional pipeline tasks.`

  const detail =
    override?.detail ??
    ([desc, sample.prompt_template?.split("\n")[0]?.trim()].filter(Boolean).join(" ") || summary)

  const bestFor = override?.bestFor ?? fallbackBestFor(sample)
  const pipelineUsage = PIPELINE_OPTIONAL_USAGE

  const asTemplate: AgentTemplateApi = {
    template_id: sample.template_id,
    name: sample.name,
    description: sample.description,
    prompt_template: sample.prompt_template,
    config: sample.config,
    variables: sample.variables,
  }

  return {
    templateId: sample.template_id,
    title,
    role,
    domainFocus: domainFocusForSample(sample),
    outputFormats: outputFormatsForSample(sample),
    summary,
    detail,
    bestFor,
    variables: (sample.variables ?? []).map((v) => String(v)),
    promptPreview: promptPreview(sample.prompt_template),
    chatUsage: CHAT_USAGE,
    pipelineUsage,
    exportUsage: EXPORT_USAGE,
    readCapabilities: readCapabilitiesForTemplate(asTemplate),
  }
}
