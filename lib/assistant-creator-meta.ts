import type { SampleAgentTemplate } from "@/constants/sample-agent-templates"
import type { AssistantOutputFormat } from "@/constants/assistant-output-formats"
import { normalizeOutputFormats } from "@/constants/assistant-output-formats"
import { enrichApiTemplateConfig } from "@/lib/sample-agent-capability-defaults"

const CATEGORY_DOMAIN_FOCUS: Record<string, string> = {
  general: "General",
  codebase: "Code",
  sales_marketing: "Marketing",
  academics: "Academics",
  legal: "Legal",
  compliance: "Compliance",
  legal_compliance: "Legal",
  sdlc: "Engineering",
  finance: "Finance",
}

const TEMPLATE_DOMAIN_FOCUS: Record<string, string> = {
  "sample-custom-research": "Research",
  "sample-custom-summarizer": "Summaries",
  "sample-custom-code-review": "Code review",
  "sample-custom-data-extractor": "Data extraction",
  "sample-custom-writer": "Writing",
  "sample-custom-tutor": "Teaching",
  "sample-general-meeting-brief": "Meetings",
  "sample-general-risk-register": "Risk management",
  "sample-general-decision-memo": "Decision support",
  "sample-codebase-copilot": "Code",
  "sample-codebase-refactor-planner": "Refactors",
  "sample-codebase-test-gap-hunter": "Testing",
  "sample-codebase-api-contract-auditor": "API design",
  "sample-codebase-security-reviewer": "Security",
  "sample-codebase-debug-tracer": "Debugging",
  "sample-codebase-doc-generator": "Documentation",
  "sample-codebase-dependency-upgrade": "Dependencies",
  "sample-codebase-db-migration": "Database",
  "sample-codebase-performance-audit": "Performance",
  "sample-codebase-architecture-sketch": "Architecture",
  "sample-sdlc-release-readiness": "Release readiness",
  "sample-sdlc-incident-postmortem": "Postmortems",
  "sample-sdlc-sprint-planner": "Sprint planning",
  "sample-sdlc-tech-spec-writer": "Tech specs",
  "sample-sdlc-story-writer": "User stories",
  "sample-sdlc-retrospective": "Retrospectives",
  "sample-sdlc-oncall-runbook": "Runbooks",
  "sample-sdlc-cicd-reviewer": "CI/CD",
  "sample-sdlc-tech-debt": "Tech debt",
  "sample-sdlc-capacity-planner": "Capacity planning",
  "sample-sdlc-change-advisory": "Change management",
  "sample-sdlc-rfc-reviewer": "RFC review",
  "sample-sdlc-observability": "Observability",
  "sample-legal-compliance-orchestrator": "Governance & policy",
  "sample-legal-policy-drafter": "Governance & policy",
  "sample-legal-compliance-training-plan": "Governance & policy",
  "sample-legal-records-retention": "Governance & policy",
  "sample-legal-ip-oss-compliance": "Governance & policy",
  "sample-legal-incident-triage": "Governance & policy",
  "sample-legal-contract-risk-lens": "Contracts",
  "sample-legal-nda-reviewer": "Contracts",
  "sample-legal-saas-msa-review": "Contracts",
  "sample-legal-sla-credits": "Contracts",
  "sample-legal-dpia-privacy-risk": "Privacy & data",
  "sample-legal-gdpr-dsar": "Privacy & data",
  "sample-legal-breach-response": "Privacy & data",
  "sample-legal-cookie-consent": "Privacy & data",
  "sample-legal-obligation-mapper": "Regulatory",
  "sample-legal-anti-bribery": "Regulatory",
  "sample-legal-employment-compliance": "Regulatory",
  "sample-legal-esg-disclosure": "Regulatory",
  "sample-legal-audit-readiness": "Audit & controls",
  "sample-legal-vendor-compliance-screen": "Audit & controls",
  "sample-legal-control-testing": "Audit & controls",
  "sample-legal-sox-controls": "Audit & controls",
  "sample-legal-litigation-hold": "Audit & controls",
  "sample-legal-dpa-baa-reviewer": "Privacy & data",
  "sample-legal-ccpa-cpra-mapper": "Privacy & data",
  "sample-legal-cross-border-transfer": "Privacy & data",
  "sample-legal-ropa-data-map": "Privacy & data",
  "sample-legal-hipaa-security-gap": "Privacy & data",
  "sample-legal-pci-dss-scoper": "Privacy & data",
  "sample-legal-coppa-children-privacy": "Privacy & data",
  "sample-legal-sow-scope-reviewer": "Contracts",
  "sample-legal-indemnity-liability": "Contracts",
  "sample-legal-software-license-review": "Contracts",
  "sample-legal-subcontract-flowdown": "Contracts",
  "sample-legal-amendment-change-order": "Contracts",
  "sample-legal-soc2-readiness": "Audit & controls",
  "sample-legal-iso27001-gap": "Audit & controls",
  "sample-legal-nist-csf-assessment": "Audit & controls",
  "sample-legal-tprm-assessment": "Audit & controls",
  "sample-legal-subpoena-response": "Audit & controls",
  "sample-legal-regulatory-exam-prep": "Audit & controls",
  "sample-legal-aml-kyc-review": "Regulatory",
  "sample-legal-sanctions-export": "Regulatory",
  "sample-legal-sec-disclosure": "Regulatory",
  "sample-legal-environmental-compliance": "Regulatory",
  "sample-legal-workplace-investigation": "Regulatory",
  "sample-legal-worker-classification": "Regulatory",
  "sample-legal-ada-accommodation": "Regulatory",
  "sample-legal-i9-compliance": "Regulatory",
  "sample-legal-ai-governance": "Governance & policy",
  "sample-legal-trademark-clearance": "Governance & policy",
  "sample-legal-trade-secret-program": "Governance & policy",
  "sample-legal-patent-landscape": "Governance & policy",
  "sample-legal-dmca-takedown": "Governance & policy",
  "sample-legal-whistleblower-program": "Governance & policy",
  "sample-legal-board-governance": "Governance & policy",
}

const CATEGORY_DEFAULT_FORMATS: Record<string, AssistantOutputFormat[]> = {
  general: ["pdf", "docx", "html", "research"],
  codebase: ["html", "docx", "pdf"],
  sales_marketing: ["pptx", "pdf", "docx", "html"],
  academics: ["pdf", "docx", "html", "research"],
  legal: ["pdf", "docx", "research"],
  compliance: ["pdf", "docx", "research"],
  legal_compliance: ["pdf", "docx", "research"],
  sdlc: ["docx", "pdf", "html"],
  finance: ["pdf", "docx", "pptx"],
}

const TEMPLATE_FORMATS: Record<string, AssistantOutputFormat[]> = {
  "sample-custom-research": ["pdf", "docx", "html", "research"],
  "sample-custom-summarizer": ["pdf", "docx", "html"],
  "sample-custom-code-review": ["docx", "pdf", "html"],
  "sample-custom-data-extractor": ["docx", "pdf"],
  "sample-custom-writer": ["docx", "pdf", "html"],
  "sample-custom-tutor": ["docx", "html"],
  "sample-general-meeting-brief": ["pdf", "docx", "pptx"],
  "sample-general-risk-register": ["pdf", "docx", "pptx"],
  "sample-general-decision-memo": ["pdf", "docx"],
  "sample-codebase-copilot": ["html", "docx", "pdf"],
}

const DOMAIN_FOCUS_BADGE: Record<string, string> = {
  Research: "bg-violet/10 text-violet border-violet/25",
  Summaries: "bg-sky/10 text-sky border-sky/25",
  "Code review": "bg-cyan/10 text-cyan border-cyan/25",
  "Data extraction": "bg-emerald/10 text-emerald border-emerald/25",
  Writing: "bg-amber/10 text-amber border-amber/25",
  Teaching: "bg-oc/10 text-oc border-oc/25",
  Meetings: "bg-violet/10 text-violet border-violet/25",
  "Risk management": "bg-rose/10 text-rose border-rose/25",
  "Decision support": "bg-indigo/10 text-indigo border-indigo/25",
  Code: "bg-cyan/10 text-cyan border-cyan/25",
  "API design": "bg-sky/10 text-sky border-sky/25",
  Refactors: "bg-violet/10 text-violet border-violet/25",
  Testing: "bg-emerald/10 text-emerald border-emerald/25",
  Security: "bg-rose/10 text-rose border-rose/25",
  Debugging: "bg-amber/10 text-amber border-amber/25",
  Documentation: "bg-indigo/10 text-indigo border-indigo/25",
  Dependencies: "bg-teal/10 text-teal border-teal/25",
  Database: "bg-oc/10 text-oc border-oc/25",
  Performance: "bg-fuchsia/10 text-fuchsia border-fuchsia/25",
  Architecture: "bg-slate/10 text-slate border-slate/25",
  "Release readiness": "bg-emerald/10 text-emerald border-emerald/25",
  Postmortems: "bg-rose/10 text-rose border-rose/25",
  "Sprint planning": "bg-cyan/10 text-cyan border-cyan/25",
  "Tech specs": "bg-indigo/10 text-indigo border-indigo/25",
  "User stories": "bg-sky/10 text-sky border-sky/25",
  Retrospectives: "bg-violet/10 text-violet border-violet/25",
  Runbooks: "bg-amber/10 text-amber border-amber/25",
  "CI/CD": "bg-cyan/10 text-cyan border-cyan/25",
  "Tech debt": "bg-oc/10 text-oc border-oc/25",
  "Capacity planning": "bg-teal/10 text-teal border-teal/25",
  "Change management": "bg-sky/10 text-sky border-sky/25",
  "RFC review": "bg-indigo/10 text-indigo border-indigo/25",
  Observability: "bg-emerald/10 text-emerald border-emerald/25",
  Marketing: "bg-violet/10 text-violet border-violet/25",
  "Market research": "bg-violet/10 text-violet border-violet/25",
  Branding: "bg-fuchsia/10 text-fuchsia border-fuchsia/25",
  Content: "bg-sky/10 text-sky border-sky/25",
  Digital: "bg-cyan/10 text-cyan border-cyan/25",
  Social: "bg-indigo/10 text-indigo border-indigo/25",
  "Demand gen": "bg-amber/10 text-amber border-amber/25",
  Events: "bg-oc/10 text-oc border-oc/25",
  CRO: "bg-rose/10 text-rose border-rose/25",
  "Marketing ops": "bg-slate/10 text-slate border-slate/25",
  Analytics: "bg-emerald/10 text-emerald border-emerald/25",
  Lifecycle: "bg-teal/10 text-teal border-teal/25",
  PR: "bg-violet/10 text-violet border-violet/25",
  Sales: "bg-emerald/10 text-emerald border-emerald/25",
  Prospecting: "bg-sky/10 text-sky border-sky/25",
  Qualification: "bg-teal/10 text-teal border-teal/25",
  Discovery: "bg-indigo/10 text-indigo border-indigo/25",
  "Value selling": "bg-violet/10 text-violet border-violet/25",
  Proposals: "bg-amber/10 text-amber border-amber/25",
  Negotiation: "bg-rose/10 text-rose border-rose/25",
  Closing: "bg-emerald/10 text-emerald border-emerald/25",
  Expansion: "bg-oc/10 text-oc border-oc/25",
  "Sales ops": "bg-cyan/10 text-cyan border-cyan/25",
  Presales: "bg-cyan/10 text-cyan border-cyan/25",
  Academics: "bg-amber/10 text-amber border-amber/25",
  "Student success": "bg-sky/10 text-sky border-sky/25",
  Accreditation: "bg-indigo/10 text-indigo border-indigo/25",
  Legal: "bg-sky/10 text-sky border-sky/25",
  Contracts: "bg-sky/10 text-sky border-sky/25",
  "Privacy & data": "bg-violet/10 text-violet border-violet/25",
  Regulatory: "bg-rose/10 text-rose border-rose/25",
  "Audit & controls": "bg-emerald/10 text-emerald border-emerald/25",
  "Governance & policy": "bg-indigo/10 text-indigo border-indigo/25",
  Engineering: "bg-cyan/10 text-cyan border-cyan/25",
  Finance: "bg-emerald/10 text-emerald border-emerald/25",
  General: "bg-amber/10 text-amber border-amber/25",
}

export function domainFocusBadgeClass(focus: string): string {
  return DOMAIN_FOCUS_BADGE[focus] ?? "bg-muted text-muted-foreground border-border"
}

/** Tailwind accent token for a domain focus label — matches gallery badges and icon tiles. */
export type DomainFocusAccentToken =
  | "amber"
  | "cyan"
  | "violet"
  | "emerald"
  | "sky"
  | "oc"
  | "rose"
  | "indigo"
  | "fuchsia"
  | "teal"
  | "slate"

export function domainFocusAccentToken(focus: string): DomainFocusAccentToken {
  const badge = DOMAIN_FOCUS_BADGE[focus] ?? ""
  if (badge.includes("text-violet")) return "violet"
  if (badge.includes("text-sky")) return "sky"
  if (badge.includes("text-cyan")) return "cyan"
  if (badge.includes("text-emerald")) return "emerald"
  if (badge.includes("text-amber")) return "amber"
  if (badge.includes("text-oc")) return "oc"
  if (badge.includes("text-rose")) return "rose"
  if (badge.includes("text-indigo")) return "indigo"
  if (badge.includes("text-fuchsia")) return "fuchsia"
  if (badge.includes("text-teal")) return "teal"
  if (badge.includes("text-slate")) return "slate"
  return "amber"
}

/** Per-format tag colors for deliverable pills (PDF, DOCX, HTML, …). */
const OUTPUT_FORMAT_BADGE: Record<string, string> = {
  pdf: "bg-red-500/10 text-red-500 border-red-500/25",
  docx: "bg-sky/10 text-sky border-sky/25",
  html: "bg-amber/10 text-amber border-amber/25",
  pptx: "bg-fuchsia/10 text-fuchsia border-fuchsia/25",
  research: "bg-violet/10 text-violet border-violet/25",
  image: "bg-emerald/10 text-emerald border-emerald/25",
  video: "bg-indigo/10 text-indigo border-indigo/25",
}

export function outputFormatBadgeClass(fmt: string): string {
  return (
    OUTPUT_FORMAT_BADGE[String(fmt).toLowerCase()] ??
    "bg-muted text-muted-foreground border-border"
  )
}

/** Stable, varied colors for input-variable tags (context, risks, …). */
const VARIABLE_TAG_PALETTE = [
  "bg-cyan/10 text-cyan border-cyan/25",
  "bg-teal/10 text-teal border-teal/25",
  "bg-indigo/10 text-indigo border-indigo/25",
  "bg-violet/10 text-violet border-violet/25",
  "bg-amber/10 text-amber border-amber/25",
  "bg-emerald/10 text-emerald border-emerald/25",
  "bg-sky/10 text-sky border-sky/25",
  "bg-fuchsia/10 text-fuchsia border-fuchsia/25",
]

export function variableTagClass(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  }
  return VARIABLE_TAG_PALETTE[hash % VARIABLE_TAG_PALETTE.length]
}

/** Top-level revenue lane for marketing / sales / presales assistants. */
export function revenueLaneForTemplateId(
  templateId?: string | null
): "Marketing" | "Sales" | "Presales" | null {
  const id = String(templateId ?? "").trim()
  if (id.startsWith("sample-presales-")) return "Presales"
  if (id.startsWith("sample-sales-")) return "Sales"
  if (id.startsWith("sample-marketing-") || id.startsWith("sample-market-")) return "Marketing"
  return null
}

const ACCREDITATION_SLUG =
  /naac|nba|obe|aqar|iqac|criteria-evidence|self-study|outcome-framework/
const RESEARCH_SLUG =
  /research-architect|paper-journal|literature|thesis|grant-proposal|ethics-irb|citation|conference|peer-review|systematic-review|methodology|journal-matcher|abstract-writer|data-plan|hypothesis|replication|collaboration|bibliography|research-timeline/
const STUDENT_SUCCESS_SLUG =
  /project-mentor|study-coach|defense-coach|placement|academic-advisor|capstone|study-skills|scholarship|peer-tutoring|career-portfolio|wellness|academic-integrity|presentation-coach/

/** Top-level academics lane — Teaching, Research, Student success, or Accreditation. */
export function academicsLaneForTemplateId(
  templateId?: string | null
): "Teaching" | "Research" | "Student success" | "Accreditation" | null {
  const id = String(templateId ?? "").trim()
  if (!id.startsWith("sample-academics-")) return null
  const slug = id.replace("sample-academics-", "")
  if (ACCREDITATION_SLUG.test(slug)) return "Accreditation"
  if (RESEARCH_SLUG.test(slug)) return "Research"
  if (STUDENT_SUCCESS_SLUG.test(slug)) return "Student success"
  return "Teaching"
}

export function domainFocusForSample(sample: SampleAgentTemplate): string {
  const academicsLane = academicsLaneForTemplateId(sample.template_id)
  if (academicsLane) return academicsLane
  const lane = revenueLaneForTemplateId(sample.template_id)
  if (lane) return lane
  const fromConfig = String(sample.config?.domain_focus ?? "").trim()
  if (fromConfig) return fromConfig
  const fromId = TEMPLATE_DOMAIN_FOCUS[sample.template_id]
  if (fromId) return fromId
  return CATEGORY_DOMAIN_FOCUS[sample.category] ?? "General"
}

export function outputFormatsForSample(sample: SampleAgentTemplate): AssistantOutputFormat[] {
  const fromConfig = normalizeOutputFormats(sample.config?.export_formats)
  if (fromConfig.length > 0) return fromConfig
  const fromId = TEMPLATE_FORMATS[sample.template_id]
  if (fromId?.length) return fromId
  return CATEGORY_DEFAULT_FORMATS[sample.category] ?? ["pdf", "docx", "html"]
}

/** Infer sample category from ``sample-{segment}-…`` template ids. */
function categoryFromTemplateId(templateId: string): string | null {
  if (!templateId.startsWith("sample-")) return null
  const segment = templateId.split("-")[1]
  const segmentToCategory: Record<string, string> = {
    marketing: "sales_marketing",
    market: "sales_marketing",
    sales: "sales_marketing",
    presales: "sales_marketing",
    academics: "academics",
    legal: "legal",
    general: "general",
    codebase: "codebase",
    sdlc: "sdlc",
    finance: "finance",
    custom: "general",
  }
  return segmentToCategory[segment] ?? null
}

/** Domain label for workspace cards — matches gallery inference for sample templates. */
export function domainFocusForTemplate(
  templateId?: string | null,
  config?: Record<string, unknown> | null
): string {
  const id = String(templateId ?? "").trim()
  const academicsLane = academicsLaneForTemplateId(id)
  if (academicsLane) return academicsLane
  const lane = revenueLaneForTemplateId(id)
  if (lane) return lane
  const fromConfig = String(config?.domain_focus ?? "").trim()
  if (fromConfig) return fromConfig
  if (id && TEMPLATE_DOMAIN_FOCUS[id]) return TEMPLATE_DOMAIN_FOCUS[id]
  const category = id ? categoryFromTemplateId(id) : null
  if (category && CATEGORY_DOMAIN_FOCUS[category]) return CATEGORY_DOMAIN_FOCUS[category]
  return "Custom"
}

export function domainFocusFromConfig(config?: Record<string, unknown> | null): string {
  return domainFocusForTemplate(undefined, config)
}

/** Export formats for workspace cards — falls back to sample/category defaults. */
export function outputFormatsForTemplate(
  templateId?: string | null,
  config?: Record<string, unknown> | null
): AssistantOutputFormat[] {
  const enriched = enrichApiTemplateConfig(templateId, config ?? undefined)
  const fromConfig = normalizeOutputFormats(enriched.export_formats)
  if (fromConfig.length > 0) return fromConfig
  const id = String(templateId ?? "").trim()
  if (id && TEMPLATE_FORMATS[id]?.length) return TEMPLATE_FORMATS[id]
  const category = id ? categoryFromTemplateId(id) : null
  if (category && CATEGORY_DEFAULT_FORMATS[category]) return CATEGORY_DEFAULT_FORMATS[category]
  return ["pdf", "docx", "html"]
}

export function outputFormatsFromConfig(config?: Record<string, unknown> | null): AssistantOutputFormat[] {
  return outputFormatsForTemplate(undefined, config)
}
