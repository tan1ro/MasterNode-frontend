import type { AssistantIntakeField } from "@/lib/assistant-intake"
import { isIntakeFieldAnswered } from "@/lib/assistant-intake"
import {
  filterSubstantiveIntakeValues,
  isSubstantiveIntakeValue,
  isVagueUserPrompt,
} from "@/lib/assistant-intake-quality"
import { enrichIntakeFromEntities, tryResolveEntityFromText } from "@/lib/assistant-intake-entities"

/** Label / alias → canonical field name. */
const FIELD_ALIASES: Record<string, string[]> = {
  course: ["course", "course title", "class", "subject title", "module", "class name"],
  outcomes: ["outcomes", "course outcomes", "course outcome", "program outcomes", "cos", "co"],
  outcome: ["outcome", "course outcome"],
  audience: ["audience", "target audience", "learners", "students", "cohort", "class level"],
  credits: ["credits", "credit", "credit hours"],
  ltp: ["ltp", "l:t:p", "l t p", "lecture tutorial practical", "lecture:tutorial:practical"],
  constraints: ["constraints", "assessment constraints", "limitations", "requirements"],
  topic: ["topic", "unit", "theme"],
  product: ["product", "offering", "solution"],
  market: ["market", "segment", "industry", "vertical"],
  geo: ["geo", "geography", "region", "country", "location"],
  goal: ["goal", "objective", "aim", "target outcome"],
  competitors: ["competitors", "competition", "rivals"],
  our_product: ["our product", "our offering", "our solution"],
  prospect: ["prospect", "customer", "client", "account"],
  use_case: ["use case", "use-case", "scenario"],
  deadline: ["deadline", "due date", "timeline"],
  duration: ["duration", "length", "time"],
  exam: ["exam", "examination", "test"],
  syllabus: ["syllabus", "curriculum document"],
  mapping: ["mapping", "co/po mapping", "co-po mapping", "co po mapping"],
  assignment: ["assignment", "task", "homework"],
  scale: ["scale", "rubric scale", "grading scale"],
  lab: ["lab", "laboratory", "practical"],
  equipment: ["equipment", "tools", "apparatus"],
  bloom_level: ["bloom level", "bloom's level", "taxonomy level"],
  count: ["count", "number", "how many"],
  weeks: ["weeks", "duration weeks", "term length"],
  platform: ["platform", "lms", "delivery mode"],
  brief: ["brief", "summary", "overview"],
  data: ["data", "metrics", "scores", "results"],
  content: ["content", "material", "text", "body", "passage", "article", "source text"],
  code: ["code", "snippet", "source code", "source"],
  thresholds: ["thresholds", "targets", "cutoff"],
  subjects: ["subjects", "courses", "topics"],
  exam_date: ["exam date", "test date", "date"],
  level: ["level", "grade level", "year"],
  segments: ["segments", "icp", "personas"],
  launch_date: ["launch date", "go-live", "release date"],
  channels: ["channels", "mediums", "touchpoints"],
  stage: ["stage", "deal stage", "pipeline stage"],
  rfp: ["rfp", "rfi", "request for proposal", "request for information", "tender"],
  solution: ["solution", "proposal", "our solution", "proposed solution", "response"],
  contract: ["contract", "agreement", "msa", "sow", "agreement text"],
  deal: ["deal", "opportunity", "sales opportunity"],
  customer: ["customer", "client", "account name"],
  account: ["account", "customer account", "client account"],
  lead: ["lead", "prospect lead", "inbound lead"],
  requirements: ["requirements", "reqs", "scope requirements", "customer requirements"],
  timeline: ["timeline", "schedule", "milestones"],
  scope: ["scope", "project scope", "statement of work"],
  pricing: ["pricing", "price", "commercial terms", "quote"],
  terms: ["terms", "deal terms", "contract terms"],
  objections: ["objections", "concerns", "pushback"],
  stakeholders: ["stakeholders", "buying committee", "decision makers"],
  pipeline: ["pipeline", "sales pipeline", "forecast pipeline"],
  quota: ["quota", "sales quota", "target quota"],
  territory: ["territory", "sales territory", "region"],
  vendor: ["vendor", "supplier", "third party"],
  org: ["org", "organization", "organisation", "company"],
  matter: ["matter", "legal matter", "case"],
  custodians: ["custodians", "custodian list"],
  sources: ["sources", "data sources", "evidence sources"],
  manuscript: ["manuscript", "paper draft", "article draft"],
  comments: ["comments", "reviewer comments", "feedback"],
  opening_cash: ["opening cash", "starting cash", "cash on hand"],
  inflows: ["inflows", "cash inflows", "receipts"],
  outflows: ["outflows", "cash outflows", "payments"],
  current_state: ["current state", "as-is state", "baseline"],
  tsc_scope: ["tsc scope", "trust service criteria", "soc scope"],
  role: ["role", "party role", "your role"],
  commercial: ["commercial", "pricing", "terms"],
  processing: ["processing", "processing activity", "activity"],
  jurisdiction: ["jurisdiction", "country", "region", "law"],
  question: ["question", "research question", "rq"],
  databases: ["databases", "sources", "literature sources"],
  inclusion: ["inclusion", "inclusion criteria", "scope"],
  field: ["field", "discipline", "domain"],
  thesis: ["thesis", "dissertation"],
  committee: ["committee", "supervisor", "guide"],
  format: ["format", "style guide", "template"],
}

const TITLE_FIELD_NAMES = new Set(["course", "topic", "subject", "product", "market", "thesis", "lab"])

/** Long-text variables that accept a pasted body when the user already provided it. */
const PASTE_BODY_FIELD_NAMES = new Set([
  "content",
  "code",
  "text",
  "draft",
  "body",
  "transcript",
  "requirements",
  "rfp",
  "contract",
  "mapping",
  "outcomes",
  "outcome",
  "brief",
  "data",
  "syllabus",
  "solution",
])

const GENERIC_COMMAND_RE =
  /^(?:yes|ok|okay|sure|go|start|generate|continue|proceed|plan|help|create|build|draft|run|please|thanks|thank you|do it|go ahead|bloom|taxonomy)\b/i

const PASTE_ONLY_COMMAND_RE =
  /^(?:please\s+)?(?:summarize|summary|summarise|tl;?dr|condense|recap|digest|review|analyze|analyse)(?:\s+(?:this|it|the following|below|that))?\s*[.!?]?$/i

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ")
}

function aliasesForField(field: AssistantIntakeField): string[] {
  const canonical = field.name.toLowerCase()
  const fromMap = FIELD_ALIASES[canonical] ?? []
  const label = normalizeKey(field.label)
  const spacedName = normalizeKey(canonical.replace(/_/g, " "))
  return Array.from(new Set([canonical, spacedName, label, ...fromMap]))
}

function setIfEmpty(
  values: Record<string, string>,
  fieldName: string,
  value: string | null | undefined
) {
  const next = (value ?? "").trim()
  if (!next || values[fieldName]?.trim()) return
  values[fieldName] = next
}

function extractLabeledPairs(text: string): Map<string, string> {
  const pairs = new Map<string, string>()
  const lines = text.split(/\n+/)

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const colonMatch = trimmed.match(/^([^:]{2,48}):\s*(.+)$/)
    if (colonMatch) {
      pairs.set(normalizeKey(colonMatch[1]), colonMatch[2].trim())
      continue
    }

    const dashMatch = trimmed.match(/^([^–-]{2,48})\s*[–-]\s*(.+)$/)
    if (dashMatch) {
      pairs.set(normalizeKey(dashMatch[1]), dashMatch[2].trim())
    }
  }

  return pairs
}

function matchAliasToField(
  aliasKey: string,
  fields: AssistantIntakeField[]
): AssistantIntakeField | null {
  for (const field of fields) {
    for (const alias of aliasesForField(field)) {
      if (normalizeKey(alias) === aliasKey) return field
    }
  }
  for (const field of fields) {
    const name = field.name.toLowerCase()
    if (normalizeKey(name) === aliasKey) return field
    if (normalizeKey(name.replace(/_/g, " ")) === aliasKey) return field
  }
  return null
}

function extractInlinePatterns(text: string): Map<string, string> {
  const found = new Map<string, string>()
  const credits = text.match(/\b(\d+(?:\.\d+)?)\s*credits?\b/i)
  if (credits) found.set("credits", credits[1])

  const ltp =
    text.match(/\b(?:l:t:p|ltp|lecture[:\s]+tutorial[:\s]+practical)\s*[:=]?\s*(\d+\s*:\s*\d+\s*:\s*\d+)/i) ??
    text.match(/\b(\d+\s*:\s*\d+\s*:\s*\d+)\s*(?:l:t:p|ltp)?\b/i)
  if (ltp) found.set("ltp", ltp[1].replace(/\s+/g, ""))

  const audienceFor = text.match(/\bfor\s+(.+?)\s+(?:students|learners|audience)\b/i)
  if (audienceFor) found.set("audience", audienceFor[1].trim())

  return found
}

function extractSemanticValues(text: string, fields: AssistantIntakeField[]): Record<string, string> {
  const out: Record<string, string> = {}
  const fieldNames = new Set(fields.map((f) => f.name.toLowerCase()))
  const hasCourse = fieldNames.has("course")

  if (hasCourse) {
    const coursePatterns = [
      /\bcourse\s*(?:title|name)?\s*(?:is|as|=|:)\s*["']?([^"'\n.!?]+?)["']?(?:[.!?]|$|\n)/i,
      /\b(?:titled|called|named)\s+["']([^"']{2,120})["']/i,
      /\b(?:titled|called|named)\s+([A-Z][^.\n!?]{2,120})/,
      /\bfor\s+(?:the\s+)?(?:course\s+)?["']?([A-Z][^"'\n.,!?]{2,120})/i,
      /\bfor\s+(?:a\s+)?["']?((?:introduction|fundamentals|advanced|principles)\s+to\s+[^"'\n.,!?]{2,120})/i,
      /["']([^"']{3,120})["']/,
      /\b((?:introduction|fundamentals|advanced|principles)\s+to\s+[A-Za-z0-9][^.\n!?]{1,100})/i,
    ]
    for (const pattern of coursePatterns) {
      const match = text.match(pattern)
      const candidate = match?.[1]?.trim()
      if (candidate && !GENERIC_COMMAND_RE.test(candidate)) {
        out.course = candidate.replace(/\s+/g, " ").trim()
        break
      }
    }
  }

  const quoted = text.match(/["']([^"']{3,120})["']/)
  if (quoted) {
    const q = quoted[1].trim()
    if (hasCourse && !out.course) out.course = q
    if (fieldNames.has("topic") && !out.topic) out.topic = q
    if (fieldNames.has("product") && !out.product) out.product = q
  }

  const outcomesBlock = text.match(
    /\b(?:outcomes?|cos?)\s*(?:are|is|:)\s*([\s\S]{12,1200}?)(?=\n\s*\n|\n[A-Z][a-z]+:|\ncredits?\b|\bltp\b|$)/i
  )
  if (outcomesBlock && (fieldNames.has("outcomes") || fieldNames.has("outcome"))) {
    const key = fieldNames.has("outcomes") ? "outcomes" : "outcome"
    out[key] = outcomesBlock[1].trim()
  }

  const audienceMatch = text.match(
    /\b(?:audience|target audience|for)\s*(?:is|:)?\s*([A-Za-z0-9][^.\n!?]{2,120})/i
  )
  if (audienceMatch && fieldNames.has("audience") && !out.audience) {
    const candidate = audienceMatch[1].trim()
    if (!/^(the|a|an)\s+course\b/i.test(candidate)) {
      out.audience = candidate
    }
  }

  if (fieldNames.has("product") && !out.product) {
    const productPatterns = [
      /\b(?:product|service|offering|solution)\s*(?:is|name|for)?\s*[:=]?\s*["']?([^"'\n.!?]{2,120})/i,
      /\bfor\s+([A-Z][A-Za-z0-9&.'\s-]{2,80}?)(?:\s+in\b|\s+market\b|[.!?]|$)/,
      /\b(?:intel|research|analysis|positioning|gtm)\s+(?:for|on)\s+([A-Z][A-Za-z0-9&.'\s-]{2,80})/i,
    ]
    for (const pattern of productPatterns) {
      const match = text.match(pattern)
      const candidate = match?.[1]?.trim()
      if (candidate && !GENERIC_COMMAND_RE.test(candidate)) {
        out.product = candidate.replace(/\s+/g, " ").trim()
        break
      }
    }
  }

  if (fieldNames.has("market") && !out.market) {
    const marketMatch = text.match(
      /\b(?:market|industry|vertical|segment)\s*(?:is|for)?\s*[:=]?\s*["']?([^"'\n.!?]{2,120})/i
    )
    if (marketMatch) out.market = marketMatch[1].trim()
  }

  if (fieldNames.has("geo") && !out.geo) {
    const geoLabel = text.match(/\b(?:geo|geography|region|country)\s*[:=]\s*([^"'\n.!?]{2,80})/i)
    if (geoLabel) {
      out.geo = geoLabel[1].trim()
    } else {
      const geoToken = text.match(
        /\b(?:in|across)\s+(India|USA|US|United States|UK|United Kingdom|Europe|APAC|EMEA|Middle East|LATAM|North America|Asia(?:\s+Pacific)?|Global)\b/i
      )
      if (geoToken) out.geo = geoToken[1].trim()
    }
  }

  if (fieldNames.has("goal") && !out.goal) {
    const goalMatch = text.match(/\b(?:goal|objective|aim|outcome)\s*(?:is|:)\s*([^"'\n.!?]{4,200})/i)
    if (goalMatch) out.goal = goalMatch[1].trim()
  }

  if (fieldNames.has("our_product") && !out.our_product) {
    const ourProduct = text.match(/\bour\s+(?:product|offering|solution)\s*(?:is|:)\s*([^"'\n.!?]{2,120})/i)
    if (ourProduct) out.our_product = ourProduct[1].trim()
  }

  if (fieldNames.has("deadline") && !out.deadline) {
    const deadline = text.match(
      /\b(?:deadline|due(?:\s+date)?|submit(?:\s+by)?|by)\s*(?:is|:)?\s*([^"'\n.!?]{2,80})/i
    )
    if (deadline) out.deadline = deadline[1].trim()
  }

  if (fieldNames.has("solution") && !out.solution) {
    const solution = text.match(
      /\b(?:solution|proposal|our\s+(?:approach|response))\s*(?:is|:)\s*([^"'\n.!?]{4,200})/i
    )
    if (solution) out.solution = solution[1].trim()
  }

  if (fieldNames.has("rfp") && !out.rfp) {
    const rfp = text.match(/\b(?:rfp|rfi|tender)\s*(?:for|about|regarding)\s+([^.\n!?]{4,200})/i)
    if (rfp) out.rfp = rfp[1].trim()
  }

  if (fieldNames.has("contract") && !out.contract) {
    const contract = text.match(/\bcontract\s*(?:for|is|:)\s*([^"'\n]{4,300})/i)
    if (contract) out.contract = contract[1].trim()
  }

  if (fieldNames.has("prospect") && !out.prospect) {
    const prospect = text.match(
      /\b(?:prospect|account|customer|client)\s*(?:is|:)\s*([^"'\n.!?]{2,120})/i
    )
    if (prospect) out.prospect = prospect[1].trim()
  }

  if (fieldNames.has("deal") && !out.deal) {
    const deal = text.match(/\bdeal\s*(?:is|for|:)\s*([^"'\n.!?]{2,120})/i)
    if (deal) out.deal = deal[1].trim()
  }

  if (fieldNames.has("use_case") && !out.use_case) {
    const useCase = text.match(/\buse[\s-]?case\s*(?:is|:)\s*([^"'\n.!?]{4,200})/i)
    if (useCase) out.use_case = useCase[1].trim()
  }

  if (fieldNames.has("processing") && !out.processing) {
    const processing = text.match(
      /\bprocessing(?:\s+activity)?\s*(?:is|:)\s*([^"'\n.!?]{4,200})/i
    )
    if (processing) out.processing = processing[1].trim()
  }

  if (fieldNames.has("jurisdiction") && !out.jurisdiction) {
    const jurisdiction = text.match(
      /\bjurisdiction\s*(?:is|:)\s*([^"'\n.!?]{2,80})/i
    )
    if (jurisdiction) out.jurisdiction = jurisdiction[1].trim()
  }

  return out
}

function stripCommandPrefix(text: string): string {
  return text
    .replace(
      /^(please\s+)?(create|plan|build|draft|generate|design|help (?:me )?with|make|run)\s+(a\s+)?([\w\s'-]+?\s+)?(for\s+)?/i,
      ""
    )
    .replace(/^(a\s+)?bloom\s+(taxonomy\s+)?(course\s+)?(plan(ner)?\s+)?(for\s+)?/i, "")
    .replace(/^(course\s+)?plan(ner)?\s+(for\s+)?/i, "")
    .trim()
}

function looksLikeGenericCommand(text: string): boolean {
  const t = text.trim()
  if (!t) return true
  if (PASTE_ONLY_COMMAND_RE.test(t)) return true
  if (GENERIC_COMMAND_RE.test(t) && t.split(/\s+/).length <= 5) return true
  if (/^(create|plan|build|generate|make|run|draft)\s+(a\s+)?(bloom\s+)?(course\s+)?plan\b/i.test(t)) {
    return true
  }
  return false
}

function isPasteBodyField(field: AssistantIntakeField): boolean {
  if (field.kind === "file") return false
  if (field.kind === "long") return true
  return PASTE_BODY_FIELD_NAMES.has(field.name.toLowerCase())
}

function extractFencedCode(text: string): string | null {
  const match = text.match(/```[\w-]*\n([\s\S]*?)```/)
  return match?.[1]?.trim() || null
}

function stripLeadingPasteCommand(text: string, fieldName: string): string {
  let result = text.trim()
  const patterns = [
    /^(?:please\s+)?(?:summarize|summarise|summary of|tl;?dr|condense|recap|digest)\s*(?:the\s+)?(?:following|this|below|that)?\s*[:.\-]?\s*/i,
    /^(?:please\s+)?(?:review|analyze|analyse|evaluate)\s*(?:the\s+)?(?:following|this|code|text)?\s*[:.\-]?\s*/i,
    /^(?:here(?:'s| is)\s+(?:the\s+)?(?:content|text|article|passage|code))\s*[:.\-]?\s*/i,
  ]
  if (fieldName.toLowerCase() === "code") {
    patterns.push(
      /^(?:please\s+)?(?:review|check|audit)\s+(?:this\s+)?(?:code|snippet)\s*[:.\-]?\s*/i
    )
  }
  for (const pattern of patterns) {
    result = result.replace(pattern, "").trim()
  }
  return result
}

function isSubstantivePaste(text: string, field: AssistantIntakeField): boolean {
  const body = text.trim()
  if (!body || looksLikeGenericCommand(body) || PASTE_ONLY_COMMAND_RE.test(body)) {
    return false
  }
  const lines = body.split(/\n+/).map((line) => line.trim()).filter(Boolean)
  if (lines.length >= 2) return true
  if (field.name.toLowerCase() === "code") {
    if (/```/.test(body)) return true
    if (/\b(function|def|class|import|const|let|var|public|private)\b/.test(body)) return true
  }
  if (body.length >= 80) return true
  if (body.split(/\s+/).filter(Boolean).length >= 12) return true
  return false
}

function tryAssignPasteField(
  fields: AssistantIntakeField[],
  text: string,
  values: Record<string, string>
) {
  const trimmed = text.trim()
  if (!trimmed) return

  const fencedCode = extractFencedCode(trimmed)
  if (fencedCode) {
    const codeField = fields.find(
      (field) => field.name.toLowerCase() === "code" && !values[field.name]?.trim()
    )
    if (codeField) setIfEmpty(values, codeField.name, fencedCode)
  }

  const unanswered = fields.filter((field) => !values[field.name]?.trim())
  const pasteFields = unanswered.filter(isPasteBodyField)
  if (pasteFields.length !== 1 || unanswered.length !== 1) return

  const field = pasteFields[0]
  const body = stripLeadingPasteCommand(trimmed, field.name)
  if (isSubstantivePaste(body, field)) {
    setIfEmpty(values, field.name, body)
  }
}

function isLikelyBareTitle(text: string): boolean {
  const t = text.trim()
  if (t.length < 4 || t.length > 200) return false
  if (isVagueUserPrompt(t)) return false
  if (looksLikeGenericCommand(t)) return false
  if (/[?]$/.test(t)) return false
  if (/^(bloom|taxonomy|course plan|syllabus|outline|planner)$/i.test(t)) return false
  const words = t.split(/\s+/).filter(Boolean)
  if (words.length === 1 && words[0].length < 4) return false
  return true
}

function tryBareTitleOnLine(
  fields: AssistantIntakeField[],
  line: string,
  values: Record<string, string>
): boolean {
  const trimmed = line.trim()
  if (!trimmed || !isLikelyBareTitle(trimmed)) return false

  if (tryResolveEntityFromText(fields, trimmed, values)) return true

  const unanswered = fields.filter((f) => !values[f.name]?.trim())
  if (unanswered.length === 0) return false

  const first = unanswered[0]
  if (TITLE_FIELD_NAMES.has(first.name)) {
    setIfEmpty(values, first.name, trimmed)
    return true
  }
  if (Object.keys(values).length === 0 && first.kind === "short") {
    setIfEmpty(values, first.name, trimmed)
    return true
  }
  return false
}

function applyTextToValues(
  fields: AssistantIntakeField[],
  text: string,
  values: Record<string, string>
) {
  const trimmed = text.trim()
  if (!trimmed) return

  const labeled = extractLabeledPairs(trimmed)
  const inline = extractInlinePatterns(trimmed)
  const semantic = extractSemanticValues(trimmed, fields)

  for (const [aliasKey, value] of labeled.entries()) {
    const field = matchAliasToField(aliasKey, fields)
    if (field) setIfEmpty(values, field.name, value)
  }

  for (const [canonical, value] of inline.entries()) {
    const field = fields.find((f) => f.name.toLowerCase() === canonical)
    if (field) setIfEmpty(values, field.name, value)
  }

  for (const [key, value] of Object.entries(semantic)) {
    if (fields.some((f) => f.name === key)) setIfEmpty(values, key, value)
  }

  const lines = trimmed.split(/\n+/).map((l) => l.trim()).filter(Boolean)
  const singleLine = lines.length <= 1

  if (!singleLine) {
    for (const line of lines) {
      if (looksLikeGenericCommand(line)) continue
      if (tryBareTitleOnLine(fields, line, values)) break
    }
  }

  const unanswered = fields.filter((f) => !values[f.name]?.trim())
  if (unanswered.length > 0) {
    const first = unanswered[0]
    if (singleLine && first.kind !== "file" && trimmed.length <= 280 && !looksLikeGenericCommand(trimmed)) {
      const freeform = stripCommandPrefix(trimmed)
      const candidate = freeform || trimmed
      tryBareTitleOnLine(fields, candidate, values)
    }
  }

  tryAssignPasteField(fields, trimmed, values)
}

/** Recent user messages to mine for answers (oldest → newest). */
export function buildIntakeContextMessages(
  messages: Array<{ role: string; content: string }>,
  limit = 8
): string[] {
  return messages
    .filter((m) => m.role === "user")
    .map((m) => m.content.trim())
    .filter(Boolean)
    .slice(-limit)
}

/**
 * Pull intake answers from the triggering message and recent chat history.
 * Later sources do not overwrite values already captured.
 */
export function prefillIntakeValues(
  fields: AssistantIntakeField[],
  pendingMessage: string,
  contextMessages: string[] = []
): Record<string, string> {
  if (fields.length === 0) return {}

  const values: Record<string, string> = {}
  const history = contextMessages.map((m) => m.trim()).filter(Boolean)
  const pending = pendingMessage.trim()

  for (const text of history) {
    applyTextToValues(fields, text, values)
  }

  if (pending) {
    applyTextToValues(fields, pending, values)
  }

  const enriched = enrichIntakeFromEntities(fields, values)
  return filterSubstantiveIntakeValues(enriched, fields)
}

export function unansweredIntakeFields(
  fields: AssistantIntakeField[],
  values: Record<string, string>,
  attachmentCount: number
): AssistantIntakeField[] {
  return fields.filter((field) => !isIntakeFieldAnswered(field, values, attachmentCount))
}

export function allIntakeFieldsAnswered(
  fields: AssistantIntakeField[],
  values: Record<string, string>,
  attachmentCount: number
): boolean {
  return unansweredIntakeFields(fields, values, attachmentCount).length === 0
}

export function summarizePrefilledFields(
  fields: AssistantIntakeField[],
  values: Record<string, string>
): string[] {
  return fields
    .filter((field) => Boolean(values[field.name]?.trim()))
    .map((field) => {
      const raw = values[field.name].trim()
      const short = raw.length > 48 ? `${raw.slice(0, 45)}…` : raw
      return `${field.label}: ${short}`
    })
}

export function summarizePrefilledFieldsBySource(
  fields: AssistantIntakeField[],
  values: Record<string, string>,
  sources: Record<string, string> = {}
): { fromMemory: string[]; fromMessage: string[] } {
  const fromMemory: string[] = []
  const fromMessage: string[] = []
  for (const field of fields) {
    const raw = values[field.name]?.trim()
    if (!raw) continue
    const short = raw.length > 48 ? `${raw.slice(0, 45)}…` : raw
    const line = `${field.label}: ${short}`
    if (sources[field.name] === "memory") fromMemory.push(line)
    else fromMessage.push(line)
  }
  return { fromMemory, fromMessage }
}
