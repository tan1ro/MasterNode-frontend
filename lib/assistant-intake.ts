import type { AgentTemplateApi } from "@/types/api"
import { isSubstantiveIntakeValue } from "@/lib/assistant-intake-quality"
import { resolveIntakeFieldNames } from "@/lib/assistant-intake-profiles"

export type AssistantIntakeFieldKind = "short" | "long" | "file"

export interface AssistantIntakeField {
  /** Variable name as it appears in the prompt template (e.g. ``course``). */
  name: string
  /** Human-readable label shown above the input. */
  label: string
  /** Placeholder / example shown inside the input. */
  placeholder: string
  /** Single-line input vs multi-line textarea. */
  kind: AssistantIntakeFieldKind
}

interface KnownFieldMeta {
  label: string
  placeholder: string
  kind?: AssistantIntakeFieldKind
}

/**
 * Friendly labels + examples for common template variables so the chat intake
 * reads like a purpose-built form (Course Builder, Course Evaluator, etc.).
 */
const KNOWN_FIELDS: Record<string, KnownFieldMeta> = {
  course: { label: "Course Title", placeholder: "e.g. Introduction to Machine Learning" },
  credits: { label: "Credits", placeholder: "e.g. 3" },
  ltp: { label: "L:T:P Ratio", placeholder: "e.g. 2:0:2" },
  ratio: { label: "L:T:P Ratio", placeholder: "e.g. 2:0:2" },
  audience: { label: "Target Audience", placeholder: "e.g. B.Tech CSE, M.Tech AI" },
  subject: { label: "Subject", placeholder: "e.g. Data Science, Machine Learning" },
  outcome: {
    label: "Course Outcome",
    placeholder:
      "Paste a course outcome here to analyze its quality, Bloom's taxonomy alignment, and get improvement suggestions...",
    kind: "long",
  },
  outcomes: {
    label: "Course Outcomes",
    placeholder: "Paste the intended course outcomes (COs)",
    kind: "long",
  },
  constraints: {
    label: "Constraints",
    placeholder: "e.g. 14 weeks, lab availability, prerequisites",
    kind: "long",
  },
  syllabus: {
    label: "Upload Syllabus",
    placeholder: "DOCX, PDF (per your plan)",
    kind: "file",
  },
  document: { label: "Upload Document", placeholder: "DOCX, PDF (per your plan)", kind: "file" },
  file: { label: "Upload File", placeholder: "DOCX, PDF (per your plan)", kind: "file" },
  mapping: {
    label: "CO/PO Mapping",
    placeholder: "Paste the CO/PO mapping matrix",
    kind: "long",
  },
  topic: { label: "Topic", placeholder: "e.g. Photosynthesis for grade 8" },
  content: { label: "Content", placeholder: "Paste the content to work with", kind: "long" },
  code: { label: "Code", placeholder: "Paste the code to review", kind: "long" },
  context: {
    label: "Context",
    placeholder: "Any extra context (optional)",
    kind: "short",
  },
  text: { label: "Text", placeholder: "Paste the text", kind: "long" },
  draft: { label: "Draft", placeholder: "Paste your current draft", kind: "long" },
  tone: { label: "Tone", placeholder: "e.g. formal, friendly, concise" },
  product: { label: "Product", placeholder: "Product or service name" },
  market: { label: "Market", placeholder: "Target market or segment" },
  goal: { label: "Goal", placeholder: "What outcome are you after?" },
  requirements: {
    label: "Requirements",
    placeholder: "List the key requirements",
    kind: "long",
  },
  rfp: {
    label: "RFP / Tender",
    placeholder: "Paste or summarize the RFP / tender requirements",
    kind: "long",
  },
  solution: {
    label: "Proposed Solution",
    placeholder: "Describe your proposed solution",
    kind: "long",
  },
  deadline: { label: "Deadline", placeholder: "e.g. March 15, 2026 or next Friday" },
  contract: {
    label: "Contract",
    placeholder: "Paste or summarize the contract",
    kind: "long",
  },
  deal: { label: "Deal", placeholder: "e.g. Acme Corp ERP migration" },
  customer: { label: "Customer", placeholder: "Customer or account name" },
  account: { label: "Account", placeholder: "Account name" },
  prospect: { label: "Prospect", placeholder: "Prospect or account name" },
  lead: { label: "Lead", placeholder: "Lead name or company" },
  use_case: { label: "Use Case", placeholder: "Primary use case or scenario" },
  scope: { label: "Scope", placeholder: "Deal or project scope" },
  pricing: { label: "Pricing", placeholder: "Pricing structure or amount" },
  terms: { label: "Terms", placeholder: "Key deal or contract terms" },
  processing: {
    label: "Processing Activity",
    placeholder: "Describe the data processing activity",
    kind: "long",
  },
  jurisdiction: { label: "Jurisdiction", placeholder: "e.g. EU GDPR, India DPDP" },
  role: { label: "Your Role", placeholder: "e.g. vendor, customer, legal counsel" },
  commercial: {
    label: "Commercial Terms",
    placeholder: "Pricing, liability, payment terms, etc.",
    kind: "long",
  },
  org: { label: "Organization", placeholder: "Company or organization name" },
  program: { label: "Program", placeholder: "e.g. RV University, B.Tech CSE" },
  cohort: { label: "Cohort", placeholder: "e.g. 2027" },
  season: { label: "Placement season", placeholder: "e.g. Summer 2026" },
  matter: { label: "Matter", placeholder: "Legal matter or case name" },
  custodians: { label: "Custodians", placeholder: "List custodians", kind: "long" },
  sources: { label: "Data Sources", placeholder: "Email, chat, files, backups, etc.", kind: "long" },
  manuscript: { label: "Manuscript", placeholder: "Paste the manuscript draft", kind: "long" },
  comments: { label: "Reviewer Comments", placeholder: "Paste reviewer comments", kind: "long" },
  opening_cash: { label: "Opening Cash", placeholder: "e.g. 250000" },
  inflows: { label: "Cash Inflows", placeholder: "Expected inflows", kind: "long" },
  outflows: { label: "Cash Outflows", placeholder: "Expected outflows", kind: "long" },
  current_state: {
    label: "Current State",
    placeholder: "Describe the current state or baseline",
    kind: "long",
  },
  tsc_scope: { label: "TSC Scope", placeholder: "Trust service criteria in scope" },
}

/** Conversational question shown one at a time (pipeline plan-mode style). */
const FIELD_QUESTIONS: Record<string, string> = {
  course: "What is the course title?",
  credits: "How many credits is this course?",
  ltp: "What is the L:T:P ratio?",
  ratio: "What is the L:T:P ratio?",
  audience: "Who is the target audience?",
  subject: "Which subject is this for?",
  outcome: "Paste a course outcome to analyze for Bloom alignment and improvements.",
  outcomes: "What are the intended course outcomes (COs)?",
  constraints: "Any constraints we should plan around (weeks, labs, prerequisites)?",
  syllabus: "Upload the syllabus document to analyze.",
  document: "Upload the document to work from.",
  file: "Upload the file to work from.",
  mapping: "Paste the CO/PO mapping matrix.",
  topic: "What topic should we focus on?",
  content: "Paste the content to work with.",
  code: "Paste the code to review.",
  context: "Any extra context we should know (optional)?",
  text: "Paste the text to work with.",
  draft: "Paste your current draft.",
  tone: "What tone should the output use?",
  product: "What product or service is this for?",
  market: "Which market or segment are you targeting?",
  goal: "What outcome are you trying to achieve?",
  requirements: "What are the key requirements?",
  geo: "Which geography or region should we focus on?",
  competitors: "Who are the main competitors?",
  our_product: "What is your product or offering?",
  segments: "Which customer segments or personas matter most?",
  launch_date: "When is the launch or go-live date?",
  channels: "Which channels should we plan for?",
  prospect: "Who is the prospect or account?",
  use_case: "What is the primary use case?",
  stage: "What stage is this deal or conversation at?",
  rfp: "Paste or summarize the RFP / tender requirements.",
  solution: "Describe your proposed solution.",
  exam: "Which exam or assessment is this for?",
  rooms: "Which rooms or venues are available?",
  candidates: "How many candidates or students?",
  assignment: "Describe the assignment or task.",
  scale: "What grading scale or rubric structure should we use?",
  lab: "Which lab or practical is this for?",
  equipment: "What equipment or resources are available?",
  bloom_level: "Which Bloom taxonomy level should questions target?",
  count: "How many items should we generate?",
  weeks: "How many weeks is the course?",
  platform: "Which platform or delivery mode (LMS, hybrid, in-person)?",
  brief: "Paste a brief summary of the program or unit.",
  data: "What attainment or performance data do you have?",
  thresholds: "What attainment thresholds or targets apply?",
  subjects: "Which subjects should the plan cover?",
  exam_date: "When is the exam or deadline?",
  level: "What level or grade is this for?",
  thesis: "What is the thesis or dissertation topic?",
  committee: "Who is on the committee or supervisory team?",
  format: "Which format or style guide should we follow?",
  question: "What is the research question?",
  databases: "Which databases or sources should we search?",
  inclusion: "What inclusion or scope criteria apply?",
  field: "Which field or discipline is this for?",
  processing: "Describe the data processing activity.",
  jurisdiction: "Which jurisdiction or regulation applies?",
  contract: "Paste or summarize the contract.",
  role: "What is your role in this review?",
  commercial: "What commercial terms matter (pricing, liability, etc.)?",
  deadline: "What is the deadline?",
  duration: "How long should this run (minutes, hours, weeks)?",
}

/** Variable name fragments that should render as a file dropzone. */
const FILE_FIELD_HINTS = ["syllabus", "document", "upload", "attachment", "resume"]

/** Variable name fragments that should render as a multi-line textarea. */
const LONG_FIELD_HINTS = [
  "syllabus",
  "content",
  "code",
  "text",
  "description",
  "mapping",
  "notes",
  "details",
  "body",
  "transcript",
  "document",
  "requirements",
  "spec",
  "outcomes",
  "draft",
  "data",
  "scenarios",
  "rfp",
  "contract",
  "solution",
  "processing",
  "manuscript",
  "comments",
  "commercial",
  "custodians",
  "sources",
  "inflows",
  "outflows",
  "current_state",
]

function toStringVariables(variables: unknown[] | undefined): string[] {
  if (!Array.isArray(variables)) return []
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of variables) {
    const name = String(raw ?? "").trim()
    if (!name || seen.has(name)) continue
    seen.add(name)
    out.push(name)
  }
  return out
}

function humanizeVariable(name: string): string {
  return name
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function fieldNameMatchesHint(fieldName: string, hint: string): boolean {
  if (fieldName === hint) return true
  return new RegExp(`(^|_)${hint}(_|$)`).test(fieldName)
}

function inferKind(name: string): AssistantIntakeFieldKind {
  const lower = name.toLowerCase()
  if (FILE_FIELD_HINTS.some((hint) => fieldNameMatchesHint(lower, hint))) return "file"
  if (LONG_FIELD_HINTS.some((hint) => fieldNameMatchesHint(lower, hint))) return "long"
  return "short"
}

/** Build a friendly intake field spec for each variable in a template. */
export function buildAssistantIntakeFields(
  template: AgentTemplateApi | null | undefined
): AssistantIntakeField[] {
  const names = resolveIntakeFieldNames(template)
  return names.map((name) => {
    const known = KNOWN_FIELDS[name.toLowerCase()]
    if (known) {
      return {
        name,
        label: known.label,
        placeholder: known.placeholder,
        kind: known.kind ?? inferKind(name),
      }
    }
    return {
      name,
      label: humanizeVariable(name),
      placeholder: `Enter ${humanizeVariable(name).toLowerCase()}`,
      kind: inferKind(name),
    }
  })
}

/**
 * Decide whether an intake form is worth showing. A form should only appear when
 * it genuinely helps structure the request — not for trivial one-liners the user
 * would just type in chat (e.g. a single "Topic" field).
 *
 * Rules:
 * - Any file-upload field → yes (upload tools need it).
 * - Two or more fields → yes (structured, multi-input).
 * - Exactly one field → only if it's a long paste (textarea); skip single short fields.
 */
export function templateHasIntake(template: AgentTemplateApi | null | undefined): boolean {
  const fields = buildAssistantIntakeFields(template)
  if (fields.length === 0) return false
  if (hasFileField(fields)) return true
  if (fields.length >= 2) return true
  return fields[0].kind === "long"
}

/** True when any field expects a file upload. */
export function hasFileField(fields: AssistantIntakeField[]): boolean {
  return fields.some((field) => field.kind === "file")
}

/** Primary action label, tuned to the assistant's inputs so it reads like a
 * purpose-built tool (e.g. "Upload & Analyze" for file intake).
 */
export function intakeSubmitLabel(fields: AssistantIntakeField[]): string {
  return hasFileField(fields) ? "Upload & Analyze" : "Generate"
}

/** Plan-mode style question for a single intake step. */
export function intakeFieldQuestion(field: AssistantIntakeField): string {
  const known = FIELD_QUESTIONS[field.name.toLowerCase()]
  if (known) return known
  if (field.kind === "file") {
    return `Please upload ${field.label.toLowerCase()}.`
  }
  return `What is the ${field.label.toLowerCase()}?`
}

const OPTIONAL_FIELD_NAMES = new Set(["context", "tone"])

function isOptionalIntakeField(field: AssistantIntakeField): boolean {
  const name = field.name.toLowerCase()
  if (OPTIONAL_FIELD_NAMES.has(name)) return true
  return field.placeholder.toLowerCase().includes("(optional)")
}

/** Whether the current step has enough input to advance. */
export function isIntakeFieldAnswered(
  field: AssistantIntakeField,
  values: Record<string, string>,
  attachmentCount: number
): boolean {
  if (isOptionalIntakeField(field)) return true
  if (field.kind === "file") {
    return attachmentCount > 0 || Boolean((values[field.name] ?? "").trim())
  }
  const raw = (values[field.name] ?? "").trim()
  if (!raw) return false
  return isSubstantiveIntakeValue(raw, field)
}

/** Drop "Label:" lines whose value ended up empty after substitution. */
function dropEmptyLabelLines(text: string): string {
  return text
    .split("\n")
    .filter((line) => !/^\s*[^:\n]{1,48}:\s*$/.test(line))
    .join("\n")
}

/**
 * Fill a template's ``prompt_template`` with user-provided values, producing the
 * message that gets sent to chat. Falls back to a labeled list when the template
 * has no prompt body.
 */
export function fillAssistantPromptTemplate(
  template: AgentTemplateApi | null | undefined,
  values: Record<string, string>
): string {
  const fields = buildAssistantIntakeFields(template)
  const promptTemplate = String(template?.prompt_template ?? "").trim()

  if (promptTemplate) {
    let filled = promptTemplate
    for (const field of fields) {
      const value = (values[field.name] ?? "").trim()
      filled = filled.replace(new RegExp(`\\{\\s*${field.name}\\s*\\}`, "g"), value)
    }
    // Remove any leftover tokens for variables without a matching field.
    filled = filled.replace(/\{\s*[a-zA-Z0-9_]+\s*\}/g, "")
    return dropEmptyLabelLines(filled).replace(/\n{3,}/g, "\n\n").trim()
  }

  const name = String(template?.name ?? "Assistant").trim()
  const lines = fields
    .map((field) => {
      const value = (values[field.name] ?? "").trim()
      return value ? `- ${field.label}: ${value}` : null
    })
    .filter((line): line is string => Boolean(line))
  return [`${name} request:`, ...lines].join("\n").trim()
}

/** True when at least one intake field has a non-empty value. */
export function hasAnyIntakeValue(values: Record<string, string>): boolean {
  return Object.values(values).some((value) => value.trim().length > 0)
}
