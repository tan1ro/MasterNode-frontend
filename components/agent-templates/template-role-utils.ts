import {
  Target,
  GitFork,
  Bot,
  Merge,
  ShieldCheck,
  Search,
  Sparkles,
  Code2,
  Megaphone,
  GraduationCap,
  Scale,
  Workflow,
  Landmark,
  type LucideIcon,
} from "lucide-react"
import type { CardAccent } from "@/components/ui/card"
import { pipelineStageLabel } from "@/constants/pipeline-template-roles"
import { SAMPLE_AGENT_TEMPLATES } from "@/constants/sample-agent-templates"

export function iconForAgentType(agentType?: string): LucideIcon {
  switch ((agentType || "").toLowerCase()) {
    case "master":
      return Target
    case "decomposer":
      return GitFork
    case "parallel":
      return Bot
    case "aggregator":
      return Merge
    case "supervisor":
      return ShieldCheck
    case "custom":
      return Search
    default:
      return Bot
  }
}

export function pipelineRoleLabel(agentType?: string): string {
  return pipelineStageLabel(agentType)
}

export const pipelineRoleColors: Record<string, string> = {
  Master: "bg-amber/10 text-amber border-amber/25",
  Decompose: "bg-cyan/10 text-cyan border-cyan/25",
  "Parallel Work": "bg-oc/10 text-oc border-oc/25",
  Aggregate: "bg-violet/10 text-violet border-violet/25",
  Supervise: "bg-emerald/10 text-emerald border-emerald/25",
  Custom: "bg-muted text-muted-foreground border-border",
}

/** Icon tile background — matches pipeline role accents. */
export const pipelineRoleIconBg: Record<string, string> = {
  Master: "bg-amber/15 text-amber",
  Decompose: "bg-cyan/15 text-cyan",
  "Parallel Work": "bg-oc/15 text-oc",
  Aggregate: "bg-violet/15 text-violet",
  Supervise: "bg-emerald/15 text-emerald",
  Custom: "bg-muted text-muted-foreground",
}

export type CategoryAccentToken = "amber" | "cyan" | "violet" | "emerald" | "sky" | "oc"

export interface AssistantCategoryTheme {
  token: CategoryAccentToken
  icon: LucideIcon
  tabActive: string
  badgeIcon: string
  actionBtn: string
  cardEnabled: string
  cardIcon: string
  cardFooter: string
}

const CATEGORY_ACCENT_TOKEN: Record<string, CategoryAccentToken> = {
  general: "amber",
  custom: "amber",
  codebase: "cyan",
  sales_marketing: "violet",
  academics: "oc",
  legal_compliance: "sky",
  legal: "sky",
  compliance: "sky",
  sdlc: "emerald",
  finance: "emerald",
}

const CATEGORY_ICON: Record<string, LucideIcon> = {
  general: Sparkles,
  custom: Sparkles,
  codebase: Code2,
  sales_marketing: Megaphone,
  academics: GraduationCap,
  legal_compliance: Scale,
  legal: Scale,
  compliance: ShieldCheck,
  sdlc: Workflow,
  finance: Landmark,
}

const ACCENT_THEME_CLASSES: Record<
  CategoryAccentToken,
  Omit<AssistantCategoryTheme, "token" | "icon">
> = {
  amber: {
    tabActive: "border-amber/40 bg-amber/10 text-amber",
    badgeIcon: "text-amber",
    actionBtn: "border-amber/35 text-amber hover:bg-amber/10",
    cardEnabled: "border-amber/30 bg-amber/[0.04]",
    cardIcon: "bg-amber/10 text-amber",
    cardFooter: "border-amber/20 bg-amber/[0.04]",
  },
  cyan: {
    tabActive: "border-cyan/40 bg-cyan/10 text-cyan",
    badgeIcon: "text-cyan",
    actionBtn: "border-cyan/35 text-cyan hover:bg-cyan/10",
    cardEnabled: "border-cyan/30 bg-cyan/[0.04]",
    cardIcon: "bg-cyan/10 text-cyan",
    cardFooter: "border-cyan/20 bg-cyan/[0.04]",
  },
  violet: {
    tabActive: "border-violet/40 bg-violet/10 text-violet",
    badgeIcon: "text-violet",
    actionBtn: "border-violet/35 text-violet hover:bg-violet/10",
    cardEnabled: "border-violet/30 bg-violet/[0.04]",
    cardIcon: "bg-violet/10 text-violet",
    cardFooter: "border-violet/20 bg-violet/[0.04]",
  },
  emerald: {
    tabActive: "border-emerald/40 bg-emerald/10 text-emerald",
    badgeIcon: "text-emerald",
    actionBtn: "border-emerald/35 text-emerald hover:bg-emerald/10",
    cardEnabled: "border-emerald/30 bg-emerald/[0.04]",
    cardIcon: "bg-emerald/10 text-emerald",
    cardFooter: "border-emerald/20 bg-emerald/[0.04]",
  },
  sky: {
    tabActive: "border-sky/40 bg-sky/10 text-sky",
    badgeIcon: "text-sky",
    actionBtn: "border-sky/35 text-sky hover:bg-sky/10",
    cardEnabled: "border-sky/30 bg-sky/[0.04]",
    cardIcon: "bg-sky/10 text-sky",
    cardFooter: "border-sky/20 bg-sky/[0.04]",
  },
  oc: {
    tabActive: "border-oc/40 bg-oc/10 text-oc",
    badgeIcon: "text-oc",
    actionBtn: "border-oc/35 text-oc hover:bg-oc/10",
    cardEnabled: "border-oc/30 bg-oc/[0.04]",
    cardIcon: "bg-oc/10 text-oc",
    cardFooter: "border-oc/20 bg-oc/[0.04]",
  },
}

export function assistantCategoryTheme(category: string): AssistantCategoryTheme {
  const token = CATEGORY_ACCENT_TOKEN[category] ?? "amber"
  const icon = CATEGORY_ICON[category] ?? Sparkles
  return { token, icon, ...ACCENT_THEME_CLASSES[token] }
}

/** Active category tab pill — derived from ``assistantCategoryTheme``. */
export const categoryAccentActive: Record<string, string> = Object.fromEntries(
  Object.keys(CATEGORY_ACCENT_TOKEN).map((key) => [
    key,
    assistantCategoryTheme(key).tabActive,
  ])
)

export const packCardAccent: Record<string, CardAccent> = {
  engineering: "cyan",
  product: "violet",
  academics: "amber",
  sales_marketing: "violet",
  legal: "emerald",
}

function shouldPreserveWordCasing(word: string): boolean {
  if (!word) return true
  // Acronyms: SWOT, GTM, HTML, …
  if (word.length >= 2 && word === word.toUpperCase() && /[A-Z]/.test(word)) return true
  // Intentional mixed case: Go, P&L, iOS, …
  if (word !== word.toLowerCase() && word !== word.toUpperCase()) return true
  return false
}

function capitalizeDisplayWord(word: string): string {
  if (shouldPreserveWordCasing(word)) return word
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

const SAMPLE_NAME_BY_ID = new Map(
  SAMPLE_AGENT_TEMPLATES.map((sample) => [sample.template_id, sample.name])
)

function humanizeTemplateId(templateId: string): string {
  return String(templateId || "")
    .trim()
    .replace(/^sample-/, "")
    .replace(/-/g, " ")
}

/** Gallery-quality label — API name, sample catalog, then humanized id. */
export function resolveTemplateDisplayName(
  templateId: string,
  apiName?: string | null
): string {
  const fromApi = String(apiName ?? "").trim()
  if (fromApi) return displayTemplateName(fromApi)
  const fromCatalog = SAMPLE_NAME_BY_ID.get(String(templateId || "").trim())
  if (fromCatalog) return displayTemplateName(fromCatalog)
  return displayTemplateName(humanizeTemplateId(templateId))
}

/** Strip “(custom)” suffix and title-case words while preserving acronyms and mixed-case tokens. */
export function displayTemplateName(name: string): string {
  const trimmed = name.replace(/\s*\(custom\)\s*$/i, "").trim()
  if (!trimmed) return trimmed
  return trimmed.replace(/[A-Za-z0-9&'][A-Za-z0-9&']*/g, capitalizeDisplayWord)
}

/** One-line summary for gallery cards. */
export function shortTemplateDescription(description?: string): string | null {
  if (!description?.trim()) return null
  return description
    .replace(/^Optional specialty prompt( for)?:?\s*/i, "")
    .replace(/\.$/, "")
    .trim()
}

/** Shared layout + typography for assistant template cards. */
export const templateCardGrid =
  "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch"

export const templateCardShell =
  "flex h-full flex-col p-5"

export const templateCardHeader = "shrink-0 flex items-start gap-3"

export const templateCardIcon =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"

export const templateCardIconSize = "h-5 w-5"

export const templateCardTitle =
  "text-sm font-medium text-foreground leading-snug normal-case"

/** Fixed-height body so descriptions breathe and buttons align across the row. */
export const templateCardBody =
  "flex min-h-[4.75rem] flex-1 flex-col justify-center py-3"

export const templateCardDesc =
  "text-sm text-muted-foreground leading-relaxed line-clamp-2"

export const templateCardBadge =
  "inline-flex h-6 items-center rounded-full border px-2.5 text-xs font-medium"

export const templateCardAction =
  "mt-auto shrink-0 w-full pt-2"

export const templateCardActionBtn =
  "h-9 w-full"

export const templateCardFooter =
  "mt-auto shrink-0 flex w-full items-center justify-end gap-1 border-t border-border/40 pt-3"
