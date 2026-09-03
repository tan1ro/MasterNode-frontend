import type { SampleAgentCategory } from "@/constants/sample-agent-templates"
import type { AssistantOutputFormat } from "@/constants/assistant-output-formats"
import { normalizeOutputFormats } from "@/constants/assistant-output-formats"

/** Baseline deep capabilities for every ready-made sample assistant. */
const BASE_SAMPLE_CAPABILITIES: Record<string, unknown> = {
  super_think: true,
  super_read: true,
  citation_mode: "required",
  web_search_default: true,
}

const CATEGORY_CAPABILITIES: Record<
  SampleAgentCategory,
  {
    domain_focus: string
    domain_pack: string
    export_formats: AssistantOutputFormat[]
  }
> = {
  sales_marketing: {
    domain_focus: "Marketing",
    domain_pack: "market_research",
    export_formats: ["pptx", "pdf", "docx", "html", "research"],
  },
  finance: {
    domain_focus: "Finance",
    domain_pack: "finance",
    export_formats: ["pdf", "docx", "pptx", "research"],
  },
  academics: {
    domain_focus: "Academics",
    domain_pack: "academics",
    export_formats: ["pdf", "docx", "html", "research"],
  },
  legal: {
    domain_focus: "Legal",
    domain_pack: "legal",
    export_formats: ["pdf", "docx", "research"],
  },
  compliance: {
    domain_focus: "Compliance",
    domain_pack: "legal",
    export_formats: ["pdf", "docx", "research"],
  },
  legal_compliance: {
    domain_focus: "Legal",
    domain_pack: "legal",
    export_formats: ["pdf", "docx", "research"],
  },
  custom: {
    domain_focus: "General",
    domain_pack: "market_research",
    export_formats: ["pdf", "docx", "html", "research"],
  },
  codebase: {
    domain_focus: "Code",
    domain_pack: "codebase_copilot",
    export_formats: ["html", "docx", "pdf"],
  },
  sdlc: {
    domain_focus: "Engineering",
    domain_pack: "sdlc_automation",
    export_formats: ["docx", "pdf", "html"],
  },
  general: {
    domain_focus: "General",
    domain_pack: "market_research",
    export_formats: ["pdf", "docx", "html", "research"],
  },
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
}

function inferCategoryFromTemplateId(templateId: string): SampleAgentCategory | null {
  if (!templateId.startsWith("sample-")) return null
  const segment = templateId.split("-")[1]
  const map: Record<string, SampleAgentCategory> = {
    marketing: "sales_marketing",
    market: "sales_marketing",
    sales: "sales_marketing",
    presales: "sales_marketing",
    finance: "finance",
    academics: "academics",
    legal: "legal",
    general: "general",
    codebase: "codebase",
    sdlc: "sdlc",
    dev: "sdlc",
    custom: "general",
  }
  return map[segment] ?? null
}

function inferDomainPackFromFocus(domainFocus: string): string | null {
  const focus = domainFocus.trim().toLowerCase()
  if (!focus) return null
  const map: Record<string, string> = {
    education: "academics",
    academics: "academics",
    teaching: "academics",
    legal: "legal",
    marketing: "market_research",
    sales: "market_research",
    research: "market_research",
    finance: "finance",
    code: "codebase_copilot",
    "code review": "codebase_copilot",
    security: "codebase_copilot",
    debugging: "codebase_copilot",
    documentation: "codebase_copilot",
    dependencies: "codebase_copilot",
    database: "codebase_copilot",
    performance: "codebase_copilot",
    architecture: "codebase_copilot",
    testing: "codebase_copilot",
    "api design": "codebase_copilot",
    refactors: "codebase_copilot",
    engineering: "sdlc_automation",
    "release readiness": "sdlc_automation",
    postmortems: "sdlc_automation",
    "sprint planning": "sdlc_automation",
    "tech specs": "sdlc_automation",
    "user stories": "sdlc_automation",
    retrospectives: "sdlc_automation",
    runbooks: "sdlc_automation",
    "ci/cd": "sdlc_automation",
    "tech debt": "sdlc_automation",
    "capacity planning": "sdlc_automation",
    "change management": "sdlc_automation",
    "rfc review": "sdlc_automation",
    observability: "sdlc_automation",
    writing: "market_research",
    summaries: "market_research",
    meetings: "market_research",
  }
  if (map[focus]) return map[focus]
  for (const [key, pack] of Object.entries(map)) {
    if (focus.includes(key)) return pack
  }
  return null
}

function mergeExportFormats(
  base: AssistantOutputFormat[],
  existing?: unknown
): AssistantOutputFormat[] {
  const fromExisting = normalizeOutputFormats(existing as AssistantOutputFormat[] | undefined)
  if (fromExisting.length === 0) return base
  const seen = new Set<string>()
  const out: AssistantOutputFormat[] = []
  for (const fmt of [...fromExisting, ...base]) {
    if (seen.has(fmt)) continue
    seen.add(fmt)
    out.push(fmt)
  }
  return out
}

/** LangGraph pipeline role starters — not gallery assistants. */
const PIPELINE_ROLE_TEMPLATE_IDS = new Set([
  "sample-master-orchestrator",
  "sample-decomposer-planner",
  "sample-parallel-executor",
  "sample-aggregator-synth",
  "sample-supervisor-validator",
])

export function isGallerySampleTemplateId(templateId?: string | null): boolean {
  const id = String(templateId ?? "").trim()
  return id.startsWith("sample-") && !PIPELINE_ROLE_TEMPLATE_IDS.has(id)
}

/** Workspace templates created by the user (stored in API), not built-in gallery seeds. */
export function isUserCustomAgentTemplateId(templateId?: string | null): boolean {
  const id = String(templateId ?? "").trim()
  if (!id) return false
  return !isGallerySampleTemplateId(id)
}

/**
 * Fill super thinking / deep read / exports for gallery samples and API templates.
 * Explicit values in ``config`` win; missing keys get category defaults.
 */
export function enrichSampleAgentConfig(
  category: SampleAgentCategory,
  templateId: string,
  config: Record<string, unknown> = {}
): Record<string, unknown> {
  const catDefaults = CATEGORY_CAPABILITIES[category]
  const domainFocus =
    String(config.domain_focus ?? "").trim() ||
    TEMPLATE_DOMAIN_FOCUS[templateId] ||
    catDefaults.domain_focus

  const domainPack =
    String(config.domain_pack ?? "").trim() ||
    inferDomainPackFromFocus(domainFocus) ||
    catDefaults.domain_pack

  const merged: Record<string, unknown> = {
    preferred_model: "auto",
    ...BASE_SAMPLE_CAPABILITIES,
    domain_focus: domainFocus,
    domain_pack: domainPack,
    export_formats: mergeExportFormats(catDefaults.export_formats, config.export_formats),
    ...config,
  }

  if (config.super_think === false) merged.super_think = false
  if (config.super_read === false) merged.super_read = false
  if (config.citation_mode === "off" || config.citation_mode === "optional") {
    merged.citation_mode = config.citation_mode
  }
  if (config.web_search_default === false) merged.web_search_default = false

  return merged
}

/** Enrich API template config when loading sample assistants from Mongo. */
export function enrichApiTemplateConfig(
  templateId: string | undefined | null,
  config: Record<string, unknown> | undefined | null,
  meta?: { name?: string; description?: string }
): Record<string, unknown> {
  if (!isGallerySampleTemplateId(templateId)) {
    return { ...(config ?? {}) }
  }
  const category = inferCategoryFromTemplateId(templateId!) ?? "general"
  return enrichSampleAgentConfig(category, templateId!, { ...(config ?? {}), ...meta })
}
