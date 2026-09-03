import { Brain, Workflow, type LucideIcon } from "lucide-react"
import type { ChatContextSelection } from "@/components/chat/chat-context-panel"
import {
  domainFocusForTemplate,
  type DomainFocusAccentToken,
} from "@/lib/assistant-creator-meta"
import { assistantIconBg, iconForAssistant } from "@/lib/assistant-gallery-icons"
import {
  loadChatEnabledMemoryKeys,
  resolveChatEnabledMemoryFiles,
} from "@/lib/chat-enabled-memory"
import { ragFileVisual } from "@/lib/rag-file-icons"
import { ragFileDisplayExt, ragFileSourceKey } from "@/lib/rag-file-utils"
import { fileTypeStyleForExt } from "@/constants/rag"
import { cn } from "@/lib/utils"
import type { AgentTemplateApi, RagFile } from "@/types/api"

export interface ContextChipStyle {
  chipClass: string
  iconClass: string
  clearClass: string
  Icon: LucideIcon
}

/** Glass chip fill — transparent enough for glow / replies to show through. */
const CHIP_BASE = cn(
  "chat-context-chip inline-flex max-w-full items-center gap-1.5 rounded-full border",
  "bg-background/45 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur-md"
)

const CHIP_BORDER: Record<DomainFocusAccentToken, string> = {
  amber: "border-amber/40",
  cyan: "border-cyan/40",
  violet: "border-violet/40",
  emerald: "border-emerald/40",
  sky: "border-sky/40",
  oc: "border-oc/40",
  rose: "border-rose/40",
  indigo: "border-indigo/40",
  fuchsia: "border-fuchsia/40",
  teal: "border-teal/40",
  slate: "border-slate/40",
}

const CHIP_CLEAR: Record<DomainFocusAccentToken, string> = {
  amber:
    "text-muted-foreground transition-colors hover:text-amber disabled:opacity-50",
  cyan: "text-muted-foreground transition-colors hover:text-cyan disabled:opacity-50",
  violet:
    "text-muted-foreground transition-colors hover:text-violet disabled:opacity-50",
  emerald:
    "text-muted-foreground transition-colors hover:text-emerald disabled:opacity-50",
  sky: "text-muted-foreground transition-colors hover:text-sky disabled:opacity-50",
  oc: "text-muted-foreground transition-colors hover:text-oc disabled:opacity-50",
  rose: "text-muted-foreground transition-colors hover:text-rose disabled:opacity-50",
  indigo:
    "text-muted-foreground transition-colors hover:text-indigo disabled:opacity-50",
  fuchsia:
    "text-muted-foreground transition-colors hover:text-fuchsia disabled:opacity-50",
  teal: "text-muted-foreground transition-colors hover:text-teal disabled:opacity-50",
  slate:
    "text-muted-foreground transition-colors hover:text-slate disabled:opacity-50",
}

function chipShellForAccent(token: DomainFocusAccentToken): {
  chip: string
  clear: string
} {
  return {
    chip: cn(CHIP_BASE, CHIP_BORDER[token]),
    clear: CHIP_CLEAR[token],
  }
}

function accentTokenFromIconBg(iconBg: string): DomainFocusAccentToken {
  if (iconBg.includes("text-violet")) return "violet"
  if (iconBg.includes("text-sky")) return "sky"
  if (iconBg.includes("text-cyan")) return "cyan"
  if (iconBg.includes("text-emerald")) return "emerald"
  if (iconBg.includes("text-amber")) return "amber"
  if (iconBg.includes("text-oc")) return "oc"
  if (iconBg.includes("text-rose")) return "rose"
  if (iconBg.includes("text-indigo")) return "indigo"
  if (iconBg.includes("text-fuchsia")) return "fuchsia"
  if (iconBg.includes("text-teal")) return "teal"
  if (iconBg.includes("text-slate")) return "slate"
  return "amber"
}

const MEMORY_ALL_FILES_CHIP: ContextChipStyle = {
  chipClass: chipShellForAccent("cyan").chip,
  iconClass:
    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan/15 text-cyan",
  clearClass: cn("ml-0.5 shrink-0 rounded-full p-0.5", CHIP_CLEAR.cyan),
  Icon: Brain,
}

/** Frosted fill inside the animated gradient ring (pipeline mode chip). */
export function pipelineModeChipStyle(): ContextChipStyle {
  const shell = chipShellForAccent("sky")
  return {
    chipClass: cn(shell.chip, "w-full border-transparent bg-background/45"),
    iconClass:
      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky/15 text-sky",
    clearClass: cn("ml-0.5 shrink-0 rounded-full p-0.5", shell.clear),
    Icon: Workflow,
  }
}

/** Border + gallery icon tile — icon and border always share the same accent. */
export function assistantContextChipStyle(
  templateId: string,
  domainFocus?: string | null
): ContextChipStyle {
  const iconBg = assistantIconBg(templateId, domainFocus)
  const accent = accentTokenFromIconBg(iconBg)
  const shell = chipShellForAccent(accent)
  return {
    chipClass: shell.chip,
    iconClass: cn(
      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
      iconBg
    ),
    clearClass: cn("ml-0.5 shrink-0 rounded-full p-0.5", shell.clear),
    Icon: iconForAssistant(templateId, domainFocus),
  }
}

export function assistantContextChipStyleForTemplate(
  templateId: string,
  templates: AgentTemplateApi[] | undefined
): ContextChipStyle {
  const match = (templates || []).find(
    (template) => String(template.template_id || "").trim() === templateId
  )
  const domainFocus = domainFocusForTemplate(templateId, match?.config)
  return assistantContextChipStyle(templateId, domainFocus)
}

/** Primary file extension for memory chip coloring (null = all / multiple files). */
export function resolveMemoryChipExt(
  ctx: ChatContextSelection,
  ragFiles: RagFile[] | undefined
): string | null {
  if (!ctx.useMemory) return null

  const enabledFiles = resolveChatEnabledMemoryFiles(loadChatEnabledMemoryKeys(), ragFiles)

  const findFile = (key: string) =>
    enabledFiles.find((file) => ragFileSourceKey(file) === key) ??
    (ragFiles || []).find((file) => ragFileSourceKey(file) === key)

  if (ctx.memorySources.length === 1) {
    const file = findFile(ctx.memorySources[0])
    return file ? ragFileDisplayExt(file) : null
  }

  if (ctx.memorySources.length > 1) {
    return null
  }

  if (ctx.memorySources.length === 0) {
    return enabledFiles.length === 1 ? ragFileDisplayExt(enabledFiles[0]) : null
  }

  return null
}

/** File-type border + icon from Memory page — frosted fill like the plan dock pill. */
export function memoryContextChipStyle(ext: string | null): ContextChipStyle {
  if (!ext) return MEMORY_ALL_FILES_CHIP

  const visual = ragFileVisual(ext)
  const style = fileTypeStyleForExt(ext)

  return {
    chipClass: cn(CHIP_BASE, style.border),
    iconClass: cn(
      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
      visual.tile
    ),
    clearClass: cn(
      "ml-0.5 shrink-0 rounded-full p-0.5 text-muted-foreground transition-colors disabled:opacity-50",
      "hover:opacity-80",
      style.color
    ),
    Icon: visual.icon,
  }
}
