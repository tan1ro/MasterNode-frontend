import type { AgentTemplateApi } from "@/types/api"
import type { AssistantOutputFormat } from "@/constants/assistant-output-formats"
import { normalizeOutputFormats } from "@/constants/assistant-output-formats"
import { enrichApiTemplateConfig } from "@/lib/sample-agent-capability-defaults"

export interface AssistantSuperThinkProfile {
  label: string
  framework: string
}

const SUPER_THINK_PROFILES: Record<string, AssistantSuperThinkProfile> = {
  education: { label: "Education", framework: "pedagogical depth analysis" },
  academics: { label: "Academics", framework: "academic depth analysis" },
  teaching: { label: "Teaching", framework: "instructional design analysis" },
  legal: { label: "Legal", framework: "legal issue analysis" },
  marketing: { label: "Marketing", framework: "go-to-market depth analysis" },
  sales: { label: "Sales", framework: "sales cycle depth analysis" },
  finance: { label: "Finance", framework: "financial depth analysis" },
  code: { label: "Engineering", framework: "engineering depth analysis" },
  "code review": { label: "Code review", framework: "code review depth analysis" },
  research: { label: "Research", framework: "research depth analysis" },
  writing: { label: "Writing", framework: "editorial depth analysis" },
  meetings: { label: "Meetings", framework: "meeting operations analysis" },
  risk: { label: "Risk", framework: "risk depth analysis" },
  general: { label: "General", framework: "structured depth analysis" },
}

const PACK_TO_SUPER_THINK: Record<string, keyof typeof SUPER_THINK_PROFILES> = {
  academics: "academics",
  legal: "legal",
  market_research: "research",
  finance: "finance",
  codebase_copilot: "code",
  sdlc_automation: "code",
}

export interface AssistantReadCapabilities {
  superRead: boolean
  superThink: boolean
  superThinkProfile: AssistantSuperThinkProfile
  domainFocus: string
  domainPack: string | null
  knowledgeFileCount: number
  webSearchDefault: boolean
  citationMode: "required" | "optional" | "off"
  researchExports: boolean
  summary: string
  bullets: string[]
  thinkBullets: string[]
}

function superThinkProfileFor(domainFocus: string, domainPack: string | null): AssistantSuperThinkProfile {
  const focus = domainFocus.trim().toLowerCase()
  if (focus) {
    if (SUPER_THINK_PROFILES[focus]) return SUPER_THINK_PROFILES[focus]
    for (const [key, profile] of Object.entries(SUPER_THINK_PROFILES)) {
      if (focus.includes(key) || key.includes(focus)) return profile
    }
  }
  if (domainPack && PACK_TO_SUPER_THINK[domainPack]) {
    return SUPER_THINK_PROFILES[PACK_TO_SUPER_THINK[domainPack]]
  }
  if (focus) return { label: domainFocus, framework: "domain depth analysis" }
  return SUPER_THINK_PROFILES.general
}

function inferDomainPack(domainFocus: string): string | null {
  const focus = domainFocus.trim().toLowerCase()
  if (!focus) return null
  const map: Record<string, string> = {
    education: "academics",
    academics: "academics",
    teaching: "academics",
    legal: "legal",
    marketing: "market_research",
    research: "market_research",
    finance: "finance",
    code: "codebase_copilot",
    engineering: "sdlc_automation",
  }
  if (map[focus]) return map[focus]
  for (const [key, pack] of Object.entries(map)) {
    if (focus.includes(key)) return pack
  }
  return null
}

export function readCapabilitiesForTemplate(
  template: AgentTemplateApi | null | undefined
): AssistantReadCapabilities {
  const cfg = enrichApiTemplateConfig(
    template?.template_id,
    (template?.config ?? {}) as Record<string, unknown>
  )
  const domainFocus = String(cfg.domain_focus ?? "").trim()
  const domainPack = String(cfg.domain_pack ?? "").trim() || inferDomainPack(domainFocus)
  const ragIds = Array.isArray(cfg.rag_file_ids)
    ? cfg.rag_file_ids.map((v) => String(v).trim()).filter(Boolean)
    : []
  const exportFormats = normalizeOutputFormats(cfg.export_formats as AssistantOutputFormat[] | undefined)
  const researchExports = exportFormats.includes("research")
  const webSearchDefault = Boolean(cfg.web_search_default) || researchExports
  const citationRaw = String(cfg.citation_mode ?? "optional").toLowerCase()
  const citationMode =
    citationRaw === "required" || citationRaw === "off" ? citationRaw : "optional"
  const superReadExplicit = cfg.super_read
  const superRead =
    superReadExplicit === false
      ? false
      : superReadExplicit === true ||
        Boolean(domainFocus || domainPack || ragIds.length || webSearchDefault || researchExports)

  const superThinkExplicit = cfg.super_think
  const superThink =
    superThinkExplicit === false
      ? false
      : superThinkExplicit === true || Boolean(domainFocus || domainPack)

  const superThinkProfile = superThinkProfileFor(domainFocus, domainPack)

  const bullets: string[] = []
  const thinkBullets: string[] = []
  if (superRead) {
    bullets.push("Deep-reads your Memory library before each reply")
  }
  if (domainPack) {
    bullets.push(`Domain-scoped retrieval (${domainPack})`)
  }
  if (ragIds.length) {
    bullets.push(`${ragIds.length} linked knowledge file(s)`)
  }
  if (webSearchDefault) {
    bullets.push("Live web research for fresh domain facts")
  }
  if (citationMode === "required") {
    bullets.push("Citations required on factual claims")
  } else if (researchExports) {
    bullets.push("Research-style answers with source bias")
  }

  if (superThink) {
    thinkBullets.push(`Super thinking: ${superThinkProfile.framework}`)
    thinkBullets.push(`Field lens: ${superThinkProfile.label}`)
    thinkBullets.push("Auto deep analysis — assumptions, tradeoffs, structured sections")
    if (superRead) thinkBullets.push("Combines with deep-read from Memory + web")
  }

  const summary = superRead
    ? bullets.length > 0
      ? bullets.join(" · ")
      : "Reads uploaded knowledge and steers answers through your assistant prompt."
    : "Uses your assistant prompt only — link knowledge files or enable research exports for deep reads."

  const combinedSummary = superThink
    ? `${superThinkProfile.framework} (${superThinkProfile.label})${superRead ? ` · ${summary}` : ""}`
    : summary

  return {
    superRead,
    superThink,
    superThinkProfile,
    domainFocus,
    domainPack,
    knowledgeFileCount: ragIds.length,
    webSearchDefault,
    citationMode,
    researchExports,
    summary: combinedSummary,
    bullets,
    thinkBullets,
  }
}

export function memorySelectionForTemplate(
  template: AgentTemplateApi
): { useMemory: boolean; memorySources: string[] } {
  const caps = readCapabilitiesForTemplate(template)
  if (!caps.superRead) {
    return { useMemory: false, memorySources: [] }
  }
  const ragIds = Array.isArray(template.config?.rag_file_ids)
    ? (template.config.rag_file_ids as string[]).map((v) => String(v).trim()).filter(Boolean)
    : []
  if (ragIds.length) {
    return { useMemory: true, memorySources: ragIds }
  }
  return { useMemory: true, memorySources: [] }
}
