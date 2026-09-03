"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  FileText,
  Fingerprint,
  Globe,
  MessageSquare,
  Package,
  Search,
  Shield,
  Sparkles,
  Wand2,
  X,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { accentMap } from "@/components/home/home-accent-styles"
import { APP_MINIMAL_PANEL_CLASS } from "@/constants/panel-styles"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/routes"
import { useAppAuth } from "@/hooks/use-app-auth"
import { generateAssistantAiDraft } from "@/lib/assistant-ai-draft"
import { iconForOutputFormat } from "@/lib/assistant-gallery-icons"
import { LLM_PROVIDERS } from "@/constants/settings"
import type {
  AgentTemplateApi,
  AgentTemplateMinPlan,
  AgentTemplateRequiredRole,
  RagFile,
  UpsertAgentTemplateBody,
} from "@/types/api"
import {
  ASSISTANT_OUTPUT_FORMATS,
  outputFormatLabel,
  type AssistantOutputFormat,
} from "@/constants/assistant-output-formats"
import { useRagFiles } from "@/hooks"
import { ApiErrorCallout } from "@/components/shared/api-error-callout"
import { isGallerySampleTemplateId } from "@/lib/sample-agent-capability-defaults"

const REQUIRED_ROLE_OPTIONS: { value: AgentTemplateRequiredRole; label: string }[] = [
  { value: "any", label: "Any role" },
  { value: "creator", label: "Creator only" },
  { value: "business", label: "Business only" },
]

const MIN_PLAN_OPTIONS: { value: AgentTemplateMinPlan; label: string }[] = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "pro_plus", label: "Premium" },
  { value: "premium", label: "Infinity" },
  { value: "enterprise", label: "Enterprise" },
]

type ShellAccent = "amber" | "violet"
type SectionAccent = keyof typeof accentMap

const SHELL_ACCENT: Record<
  ShellAccent,
  { iconTile: string; shellBorder: string; primaryBtn: string; headerGlow: string }
> = {
  amber: {
    iconTile: accentMap.amber.icon,
    shellBorder: "border-amber/20",
    primaryBtn: "bg-amber text-amber-foreground hover:bg-amber/90",
    headerGlow: "via-amber/50",
  },
  violet: {
    iconTile: accentMap.violet.icon,
    shellBorder: "border-violet/20",
    primaryBtn: "bg-violet text-white hover:bg-violet/90",
    headerGlow: "via-violet/50",
  },
}

const SECTION_BORDER: Record<SectionAccent, string> = {
  amber: "border-amber/20 hover:border-amber/30",
  cyan: "border-cyan/20 hover:border-cyan/30",
  violet: "border-violet/20 hover:border-violet/30",
  emerald: "border-emerald/20 hover:border-emerald/30",
  sky: "border-sky/20 hover:border-sky/30",
  oc: "border-oc/20 hover:border-oc/30",
}

const TAB_ACTIVE: Record<SectionAccent, string> = {
  amber: "bg-amber/12 text-amber border-amber/35 shadow-sm",
  cyan: "bg-cyan/12 text-cyan border-cyan/35 shadow-sm",
  violet: "bg-violet/12 text-violet border-violet/35 shadow-sm",
  emerald: "bg-emerald/12 text-emerald border-emerald/35 shadow-sm",
  sky: "bg-sky/12 text-sky border-sky/35 shadow-sm",
  oc: "bg-oc/12 text-oc border-oc/35 shadow-sm",
}

type CreatorFormTab = "identity" | "instructions" | "outputs"
type BusinessFormTab = "identity" | "instructions" | "access"
type FormTab = CreatorFormTab | BusinessFormTab

const TAB_ACCENT: Record<FormTab, SectionAccent> = {
  identity: "violet",
  instructions: "amber",
  outputs: "emerald",
  access: "sky",
}

const innerFieldPanel =
  "rounded-lg border border-border/60 bg-background/40 p-4 sm:p-5"
const fieldClass =
  "mt-1.5 h-10 w-full border-border/70 bg-background/60 focus-visible:border-amber/40"
const readOnlyFieldClass =
  "mt-1.5 h-10 w-full cursor-not-allowed border-border/50 bg-muted/25 font-mono text-xs text-muted-foreground"
const selectClass = cn(fieldClass, "min-w-0")
const textareaClass =
  "mt-1.5 w-full resize-y rounded-md border border-border/70 bg-background/60 px-3 py-2 text-sm focus-visible:border-amber/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber/30"
const hintClass = "mt-1.5 text-xs leading-relaxed text-muted-foreground"

function slugifyTemplateId(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
  return base ? `custom-${base}` : ""
}

function gallerySummaryFromDescription(text: string, max = 200): string {
  const trimmed = text.trim()
  if (!trimmed) return ""
  const firstLine = trimmed.split(/\n/)[0]?.trim() ?? trimmed
  if (firstLine.length <= max) return firstLine
  return `${firstLine.slice(0, max - 1).trim()}…`
}

function FormField({
  id,
  label,
  hint,
  className,
  children,
}: {
  id?: string
  label: string
  hint?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      {children}
      {hint ? <p className={hintClass}>{hint}</p> : null}
    </div>
  )
}

function FormSection({
  icon: Icon,
  title,
  description,
  accent = "amber",
  children,
}: {
  icon: LucideIcon
  title: string
  description?: string
  accent?: SectionAccent
  children: React.ReactNode
}) {
  const palette = accentMap[accent]
  return (
    <Card
      variant="minimal"
      interactive={false}
      className={cn(
        "overflow-hidden bg-background/40 p-4 transition-colors sm:p-5",
        SECTION_BORDER[accent]
      )}
    >
      <div className="mb-4 flex items-start gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            palette.icon
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </div>
        <div className="min-w-0 space-y-0.5">
          <h3 className={cn("text-sm font-semibold tracking-tight", palette.title)}>{title}</h3>
          {description ? (
            <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </Card>
  )
}

function FormTabBar({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: FormTab; label: string }[]
  active: FormTab
  onChange: (tab: FormTab) => void
}) {
  return (
    <div className="shrink-0 border-b border-border/60 bg-muted/10 px-4 py-3 sm:px-6">
      <div
        className="inline-flex max-w-full gap-1 overflow-x-auto rounded-lg border border-border/60 bg-background/50 p-1 scrollbar-thin"
        role="tablist"
        aria-label="Assistant form sections"
      >
        {tabs.map((tab) => {
          const selected = active === tab.id
          const tabAccent = TAB_ACCENT[tab.id]
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(tab.id)}
              className={cn(
                "shrink-0 rounded-md border border-transparent px-3 py-2 text-sm font-medium transition-colors",
                selected
                  ? TAB_ACTIVE[tabAccent]
                  : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function KnowledgeFilePicker({
  files,
  selectedIds,
  onChange,
  disabled,
}: {
  files: RagFile[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  disabled?: boolean
}) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const list = [...files].sort((a, b) =>
      String(a.filename || a.file_id).localeCompare(String(b.filename || b.file_id))
    )
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter((f) =>
      String(f.filename || f.file_id).toLowerCase().includes(q)
    )
  }, [files, query])

  const toggle = (fileId: string) => {
    onChange(
      selectedIds.includes(fileId)
        ? selectedIds.filter((id) => id !== fileId)
        : [...selectedIds, fileId]
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Optional files from{" "}
          <Link href={ROUTES.rag} className="text-cyan underline-offset-2 hover:underline">
            Memory
          </Link>{" "}
          this assistant can cite in answers.
        </p>
        <span className="rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[11px] tabular-nums text-muted-foreground">
          {selectedIds.length} selected
        </span>
      </div>
      {files.length > 0 ? (
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search knowledge files…"
            className="h-9 border-border/60 bg-background/80 pl-9 text-sm"
            disabled={disabled}
          />
        </div>
      ) : null}
      <div
        className={cn(
          "max-h-44 space-y-1 overflow-y-auto p-1.5 scrollbar-thin",
          APP_MINIMAL_PANEL_CLASS
        )}
      >
        {files.length === 0 ? (
          <p className="px-2 py-3 text-center text-xs text-muted-foreground">
            No files in Memory yet.{" "}
            <Link href={ROUTES.rag} className="text-cyan underline-offset-2 hover:underline">
              Upload files
            </Link>
          </p>
        ) : filtered.length === 0 ? (
          <p className="px-2 py-3 text-center text-xs text-muted-foreground">
            No files match your search.
          </p>
        ) : (
          filtered.map((file) => {
            const id = file.file_id
            const selected = selectedIds.includes(id)
            const label = file.filename || id
            return (
              <button
                key={id}
                type="button"
                disabled={disabled}
                onClick={() => toggle(id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md border px-2.5 py-2 text-left text-sm transition-colors",
                  selected
                    ? "border-cyan/30 bg-cyan/10 text-foreground"
                    : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                  disabled && "cursor-not-allowed opacity-50"
                )}
              >
                <FileText
                  className={cn("h-4 w-4 shrink-0", selected ? "text-cyan" : "text-muted-foreground")}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate" title={label}>
                  {label}
                </span>
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px]",
                    selected
                      ? "border-cyan/50 bg-cyan text-cyan-foreground"
                      : "border-border/70 bg-background"
                  )}
                  aria-hidden
                >
                  {selected ? "✓" : ""}
                </span>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

const FORMAT_TOGGLE_ACTIVE: Record<SectionAccent, string> = {
  amber: "border-amber/40 bg-amber/10 text-amber shadow-[0_0_12px_hsl(var(--amber)/0.12)]",
  cyan: "border-cyan/40 bg-cyan/10 text-cyan shadow-[0_0_12px_hsl(var(--cyan)/0.12)]",
  violet: "border-violet/40 bg-violet/10 text-violet shadow-[0_0_12px_hsl(var(--violet)/0.12)]",
  emerald: "border-emerald/40 bg-emerald/10 text-emerald shadow-[0_0_12px_hsl(var(--emerald)/0.12)]",
  sky: "border-sky/40 bg-sky/10 text-sky shadow-[0_0_12px_hsl(var(--sky)/0.12)]",
  oc: "border-oc/40 bg-oc/10 text-oc shadow-[0_0_12px_hsl(var(--oc)/0.12)]",
}

function ExportFormatToggle({
  fmt,
  active,
  disabled,
  onToggle,
  accent = "emerald",
}: {
  fmt: AssistantOutputFormat
  active: boolean
  disabled?: boolean
  onToggle: () => void
  accent?: SectionAccent
}) {
  const Icon = iconForOutputFormat(fmt)
  const activeClass = FORMAT_TOGGLE_ACTIVE[accent]
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all",
        active
          ? activeClass
          : "border-border/70 bg-background/40 text-muted-foreground hover:border-border hover:bg-muted/20 hover:text-foreground",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
      {outputFormatLabel(fmt)}
    </button>
  )
}

export interface AgentTemplateFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  initial: AgentTemplateApi | null
  isPending: boolean
  errorMessage?: string | null
  /** Raw mutation error — renders upgrade callout when entitlement-gated */
  submitError?: unknown
  creatorMode?: boolean
  onSubmit: (body: UpsertAgentTemplateBody) => void
}

export function AgentTemplateFormDialog({
  open,
  onOpenChange,
  mode,
  initial,
  isPending,
  errorMessage,
  submitError,
  creatorMode = false,
  onSubmit,
}: AgentTemplateFormDialogProps) {
  const MODEL_AUTO = "__auto__"
  const TEMPLATE_ID_PATTERN = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/
  const TEMPLATE_ID_HINT = "Use lowercase letters, numbers, dashes, or underscores."
  const MODEL_OPTIONS = Array.from(new Set(LLM_PROVIDERS.flatMap((provider) => provider.models)))
  const [templateId, setTemplateId] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [promptTemplate, setPromptTemplate] = useState("")
  const [selectedModel, setSelectedModel] = useState(MODEL_AUTO)
  const [requiredRole, setRequiredRole] = useState<AgentTemplateRequiredRole>("any")
  const [minPlan, setMinPlan] = useState<AgentTemplateMinPlan>("free")
  const [validationError, setValidationError] = useState<string | null>(null)
  const [domainFocus, setDomainFocus] = useState("")
  const [exportFormats, setExportFormats] = useState<AssistantOutputFormat[]>([])
  const [ragFileIds, setRagFileIds] = useState<string[]>([])
  const [webSearchDefault, setWebSearchDefault] = useState(false)
  const [citationMode, setCitationMode] = useState<"required" | "optional" | "off">("optional")
  const [draftBusy, setDraftBusy] = useState(false)
  const [showPromptEditor, setShowPromptEditor] = useState(false)
  const [lastGeneratedFrom, setLastGeneratedFrom] = useState("")
  const [activeTab, setActiveTab] = useState<FormTab>("identity")
  const { accountType } = useAppAuth()
  const showLicensingControls = accountType === "business"
  const { data: ragFiles } = useRagFiles()

  useEffect(() => {
    if (!open) return
    const cfg = initial?.config && typeof initial.config === "object" ? initial.config : {}
    setTemplateId(String(initial?.template_id ?? "").trim())
    setName(String(initial?.name ?? "").trim())
    setDescription(
      String(
        (cfg.creator_description as string | undefined) ??
          initial?.description ??
          ""
      ).trim()
    )
    setPromptTemplate(String(initial?.prompt_template ?? ""))
    const initialModel = String(
      (cfg.preferred_model as string) ?? (cfg.model as string) ?? (cfg.llm as string) ?? ""
    ).trim()
    setSelectedModel(initialModel || MODEL_AUTO)
    setDomainFocus(String(cfg.domain_focus ?? "").trim())
    const fmts = Array.isArray(cfg.export_formats)
      ? cfg.export_formats.map((v) => String(v).trim().toLowerCase())
      : []
    setExportFormats(
      fmts.filter((v): v is AssistantOutputFormat =>
        ASSISTANT_OUTPUT_FORMATS.includes(v as AssistantOutputFormat)
      )
    )
    const ragIds = Array.isArray(cfg.rag_file_ids)
      ? cfg.rag_file_ids.map((v) => String(v).trim()).filter(Boolean)
      : []
    setRagFileIds(ragIds)
    setWebSearchDefault(Boolean(cfg.web_search_default))
    const cite = String(cfg.citation_mode ?? "optional").toLowerCase()
    setCitationMode(
      cite === "required" || cite === "off" ? cite : "optional"
    )
    setRequiredRole((initial?.required_role as AgentTemplateRequiredRole | undefined) ?? "any")
    setMinPlan((initial?.min_plan as AgentTemplateMinPlan | undefined) ?? "free")
    setValidationError(null)
    setDraftBusy(false)
    setShowPromptEditor(false)
    setLastGeneratedFrom(
      creatorMode && mode === "create" && initial?.prompt_template
        ? String(initial?.description ?? "")
        : ""
    )
    setActiveTab("identity")
  }, [open, initial, creatorMode, mode])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) onOpenChange(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, isPending, onOpenChange])

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!open) return null

  const creatorCreate = creatorMode && mode === "create"
  const resolvedTemplateId = templateId.trim() || String(initial?.template_id ?? "").trim()
  const showDomainSpecialty =
    mode === "edit" && isGallerySampleTemplateId(resolvedTemplateId)

  type DraftConfigSnapshot = {
    domainFocus: string
    exportFormats: AssistantOutputFormat[]
    citationMode: "required" | "optional" | "off"
    webSearchDefault: boolean
  }

  const mergeDraftConfig = (
    draft?: {
      domain_focus?: string
      export_formats?: AssistantOutputFormat[]
      citation_mode?: "required" | "optional" | "off"
      web_search_default?: boolean
    }
  ): DraftConfigSnapshot => ({
    domainFocus: showDomainSpecialty
      ? domainFocus.trim() || draft?.domain_focus?.trim() || ""
      : "",
    exportFormats:
      exportFormats.length > 0
        ? exportFormats
        : (draft?.export_formats ?? []).filter((v): v is AssistantOutputFormat =>
            ASSISTANT_OUTPUT_FORMATS.includes(v)
          ),
    citationMode: draft?.citation_mode ?? citationMode,
    webSearchDefault:
      draft?.web_search_default !== undefined ? draft.web_search_default : webSearchDefault,
  })

  const applyDraftConfigToForm = (snapshot: DraftConfigSnapshot) => {
    if (showDomainSpecialty) setDomainFocus(snapshot.domainFocus)
    setExportFormats(snapshot.exportFormats)
    setCitationMode(snapshot.citationMode)
    setWebSearchDefault(snapshot.webSearchDefault)
  }

  const ensurePromptGenerated = async (): Promise<{
    prompt: string
    config: DraftConfigSnapshot
  } | null> => {
    const desc = description.trim()
    if (!desc) return null
    const existing = promptTemplate.trim()
    if (existing && lastGeneratedFrom === desc) {
      return {
        prompt: existing,
        config: mergeDraftConfig(),
      }
    }

    setDraftBusy(true)
    setValidationError(null)
    try {
      const result = await generateAssistantAiDraft({
        description: desc,
        domain_hint: showDomainSpecialty
          ? domainFocus.trim() || name.trim() || undefined
          : undefined,
      })
      const prompt = result.draft.prompt_template.trim()
      if (!prompt) throw new Error("No prompt returned")
      const config = mergeDraftConfig(result.draft.config)
      setPromptTemplate(prompt)
      setLastGeneratedFrom(desc)
      applyDraftConfigToForm(config)
      if (!name.trim() && result.draft.name) {
        setName(result.draft.name)
      }
      if (mode === "create" && !templateId.trim() && result.body.template_id) {
        setTemplateId(result.body.template_id)
      }
      return { prompt, config }
    } catch {
      setValidationError("Could not generate prompt. Check your description and try again.")
      return null
    } finally {
      setDraftBusy(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const tid = templateId.trim()
    if (!tid) {
      setValidationError("Template id is required.")
      setActiveTab("identity")
      return
    }
    if (!TEMPLATE_ID_PATTERN.test(tid)) {
      setValidationError("Invalid template id format. " + TEMPLATE_ID_HINT)
      setActiveTab("identity")
      return
    }

    let trimmedPrompt = promptTemplate.trim()
    let draftConfig: DraftConfigSnapshot | null = null
    if (creatorCreate) {
      const desc = description.trim()
      if (!desc) {
        setValidationError("Describe what this assistant should do.")
        setActiveTab("instructions")
        return
      }
      if (!trimmedPrompt || lastGeneratedFrom !== desc) {
        const generated = await ensurePromptGenerated()
        if (!generated) return
        trimmedPrompt = generated.prompt
        draftConfig = generated.config
      } else {
        draftConfig = mergeDraftConfig()
      }
    } else if (!trimmedPrompt) {
      setValidationError("Prompt template is required.")
      setActiveTab("instructions")
      return
    }

    setValidationError(null)
    const body: UpsertAgentTemplateBody = {
      template_id: tid,
      name: name.trim() || tid,
      prompt_template: trimmedPrompt,
    }
    const d = description.trim()
    const baseConfig =
      initial?.config && typeof initial.config === "object" ? { ...initial.config } : {}
    const config: Record<string, unknown> = { ...baseConfig }
    if (selectedModel !== MODEL_AUTO) {
      config.preferred_model = selectedModel
    } else {
      delete config.preferred_model
    }
    const effectiveDomainFocus = showDomainSpecialty
      ? (draftConfig?.domainFocus ?? domainFocus.trim())
      : ""
    const effectiveExportFormats = draftConfig?.exportFormats ?? exportFormats
    const effectiveCitationMode = draftConfig?.citationMode ?? citationMode
    const effectiveWebSearch = draftConfig?.webSearchDefault ?? webSearchDefault

    if (creatorMode) {
      if (d) {
        config.creator_description = d
        body.description = gallerySummaryFromDescription(d)
      } else {
        delete config.creator_description
        if (initial?.description) body.description = ""
      }
      if (showDomainSpecialty && effectiveDomainFocus) {
        config.domain_focus = effectiveDomainFocus
      } else {
        delete config.domain_focus
      }
      if (effectiveExportFormats.length) {
        config.export_formats = effectiveExportFormats
      } else {
        delete config.export_formats
      }
      if (ragFileIds.length) {
        config.rag_file_ids = ragFileIds
      } else {
        delete config.rag_file_ids
      }
      config.web_search_default = effectiveWebSearch
      config.citation_mode = effectiveCitationMode
      config.super_read = true
      config.super_think = true
    } else if (d) {
      body.description = d
      if (effectiveDomainFocus) config.domain_focus = effectiveDomainFocus
      if (effectiveExportFormats.length) config.export_formats = effectiveExportFormats
      if (ragFileIds.length) config.rag_file_ids = ragFileIds
      config.web_search_default = effectiveWebSearch
      config.citation_mode = effectiveCitationMode
    } else if (
      effectiveDomainFocus ||
      effectiveExportFormats.length ||
      ragFileIds.length
    ) {
      if (effectiveDomainFocus) config.domain_focus = effectiveDomainFocus
      if (effectiveExportFormats.length) config.export_formats = effectiveExportFormats
      if (ragFileIds.length) config.rag_file_ids = ragFileIds
      config.web_search_default = effectiveWebSearch
      config.citation_mode = effectiveCitationMode
    }
    if (Object.keys(config).length > 0) body.config = config
    if (showLicensingControls) {
      body.required_role = requiredRole
      body.min_plan = minPlan
    }
    onSubmit(body)
  }

  const creatorTabs: { id: CreatorFormTab; label: string }[] = [
    { id: "identity", label: "Identity" },
    { id: "instructions", label: "Instructions" },
    { id: "outputs", label: "Outputs & knowledge" },
  ]
  const businessTabs: { id: BusinessFormTab; label: string }[] = [
    { id: "identity", label: "Setup" },
    { id: "instructions", label: "Prompt" },
    ...(showLicensingControls ? [{ id: "access" as const, label: "Access" }] : []),
  ]
  const tabs = creatorMode ? creatorTabs : businessTabs
  const ragFileList = ragFiles ?? []

  const dialogTitle = creatorMode
    ? mode === "create"
      ? "Create assistant"
      : "Edit assistant"
    : mode === "create"
      ? "Create custom agent"
      : "Edit custom agent"

  const shellAccent: ShellAccent = creatorMode ? "amber" : "violet"
  const shellTheme = SHELL_ACCENT[shellAccent]

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4 lg:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => !isPending && onOpenChange(false)}
        aria-label="Dismiss"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="agent-template-form-title"
        className={cn(
          "relative z-10 flex w-full flex-col overflow-hidden",
          "max-h-[92dvh] sm:max-h-[min(92dvh,820px)]",
          "rounded-t-2xl border bg-card shadow-2xl sm:rounded-2xl",
          "max-w-[min(100%,52rem)] sm:max-w-[min(calc(100vw-2rem),52rem)]",
          shellTheme.shellBorder,
          shellAccent === "amber" ? "shadow-amber/10" : "shadow-violet/10"
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent",
            shellTheme.headerGlow
          )}
          aria-hidden
        />

        <div className="shrink-0 border-b border-border/60 bg-background/40 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
                shellTheme.iconTile
              )}
            >
              {creatorMode ? (
                <Wand2 className="h-5 w-5" aria-hidden />
              ) : (
                <Sparkles className="h-5 w-5" aria-hidden />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2
                id="agent-template-form-title"
                className="text-lg font-semibold font-heading tracking-tight sm:text-xl"
              >
                {dialogTitle}
              </h2>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
                {creatorMode
                  ? creatorCreate
                    ? "Three steps — identity, instructions, then outputs and knowledge."
                    : "Update how this assistant answers in chat and what it can export."
                  : "Saved for your workspace. Attach by pipeline role in tasks or chat."}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 shrink-0 p-0 text-muted-foreground hover:text-foreground"
              aria-label="Close"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <FormTabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-muted/[0.04] px-4 py-4 sm:px-6 sm:py-5">
            {activeTab === "identity" ? (
              <FormSection
                icon={Fingerprint}
                title="Identity"
                description={
                  showDomainSpecialty
                    ? "How this assistant appears in pickers and on gallery cards."
                    : "How this assistant appears in chat and assistant pickers."
                }
                accent="violet"
              >
                <div className={cn(innerFieldPanel, "grid grid-cols-1 gap-4 sm:grid-cols-2")}>
                  <FormField
                    id="at-template-id"
                    label="Template id"
                    hint={mode === "edit" ? "Cannot be changed after creation." : TEMPLATE_ID_HINT}
                  >
                    <Input
                      id="at-template-id"
                      value={templateId}
                      onChange={(e) => {
                        setTemplateId(e.target.value)
                        if (validationError) setValidationError(null)
                      }}
                      placeholder="my-assistant-id"
                      required
                      disabled={isPending || mode === "edit"}
                      className={mode === "edit" ? readOnlyFieldClass : fieldClass}
                    />
                  </FormField>
                  <FormField id="at-name" label="Display name" hint="Shown in chat and assistant pickers.">
                    <Input
                      id="at-name"
                      value={name}
                      onChange={(e) => {
                        const next = e.target.value
                        setName(next)
                        if (mode === "create" && !templateId.trim()) {
                          const suggested = slugifyTemplateId(next)
                          if (suggested) setTemplateId(suggested)
                        }
                      }}
                      placeholder="Assistant name"
                      className={fieldClass}
                    />
                  </FormField>
                  {showDomainSpecialty ? (
                    <FormField
                      id="at-domain-focus"
                      label="Domain specialty"
                      hint="Gallery tag — Marketing/Sales/Presales or Teaching/Research/Student success/Accreditation."
                    >
                      <Input
                        id="at-domain-focus"
                        value={domainFocus}
                        onChange={(e) => setDomainFocus(e.target.value)}
                        placeholder="e.g. Marketing or Teaching"
                        className={fieldClass}
                      />
                    </FormField>
                  ) : null}
                  <FormField
                    id="at-llm-model"
                    label="Preferred model"
                    hint="Leave on Auto to use your workspace default."
                  >
                    <Select
                      id="at-llm-model"
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      disabled={isPending}
                      className={selectClass}
                    >
                      <option value={MODEL_AUTO}>Auto (workspace default)</option>
                      {MODEL_OPTIONS.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                </div>
              </FormSection>
            ) : null}

            {activeTab === "instructions" ? (
              <FormSection
                icon={MessageSquare}
                title={creatorMode ? "What should it do?" : "Instructions"}
                description={
                  creatorMode
                    ? creatorCreate
                      ? "Write a plain-language description. The system prompt is generated automatically when you save."
                      : "Your original description and the system prompt that steers chat replies."
                    : "Description and prompt used when this agent runs in pipelines or chat."
                }
                accent="amber"
              >
                {creatorMode ? (
                  <div className={cn(innerFieldPanel, "space-y-4")}>
                    <FormField
                      id="at-describe"
                      label="Describe your assistant"
                      hint="Include audience, tasks, tone, and preferred export types."
                    >
                      <Textarea
                        id="at-describe"
                        value={description}
                        onChange={(e) => {
                          setDescription(e.target.value)
                          if (validationError) setValidationError(null)
                        }}
                        placeholder="What should this assistant do? Who is it for?"
                        disabled={isPending || draftBusy}
                        className={cn(textareaClass, "min-h-[6.5rem]")}
                        required={creatorCreate}
                      />
                    </FormField>
                    {!creatorCreate ? (
                      <p className="text-xs text-muted-foreground">
                        Card preview uses the first line of this description.
                      </p>
                    ) : null}
                    <button
                      type="button"
                      className={cn(
                        "text-xs font-medium underline-offset-2 hover:underline",
                        "text-amber/80 hover:text-amber"
                      )}
                      onClick={() => setShowPromptEditor((v) => !v)}
                    >
                      {showPromptEditor ? "Hide advanced editor" : "Advanced: edit system prompt"}
                    </button>
                    {showPromptEditor || !creatorCreate ? (
                      <FormField
                        id="at-prompt"
                        label="System prompt"
                        hint={
                          creatorCreate
                            ? "Leave blank to auto-generate from your description."
                            : `${promptTemplate.trim().length} characters`
                        }
                      >
                        <Textarea
                          id="at-prompt"
                          value={promptTemplate}
                          onChange={(e) => {
                            setPromptTemplate(e.target.value)
                            if (validationError) setValidationError(null)
                          }}
                          placeholder={
                            creatorCreate
                              ? "Optional — leave blank to auto-generate"
                              : "System instructions for this assistant"
                          }
                          disabled={isPending || draftBusy}
                          className={cn(textareaClass, "min-h-[8rem] font-mono")}
                        />
                      </FormField>
                    ) : null}
                  </div>
                ) : (
                  <div className={cn(innerFieldPanel, "space-y-4")}>
                    <FormField
                      id="at-desc"
                      label="Description"
                      hint="Optional summary."
                    >
                      <Input
                        id="at-desc"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="One-line summary"
                        className={fieldClass}
                      />
                    </FormField>
                    <FormField
                      id="at-prompt"
                      label="Prompt template"
                      hint={`${promptTemplate.trim().length} characters`}
                    >
                      <Textarea
                        id="at-prompt"
                        value={promptTemplate}
                        onChange={(e) => {
                          setPromptTemplate(e.target.value)
                          if (validationError) setValidationError(null)
                        }}
                        placeholder="System instructions for this assistant"
                        className={cn(textareaClass, "min-h-[8rem] font-mono")}
                      />
                    </FormField>
                  </div>
                )}
              </FormSection>
            ) : null}

            {activeTab === "outputs" && creatorMode ? (
              <div className="space-y-4">
                <FormSection
                  icon={Package}
                  title="Export formats"
                  description="When users ask for a deliverable, the assistant steers toward these formats."
                  accent="emerald"
                >
                  <div className={cn(innerFieldPanel, "flex flex-wrap gap-2")}>
                    {ASSISTANT_OUTPUT_FORMATS.map((fmt) => (
                      <ExportFormatToggle
                        key={fmt}
                        fmt={fmt}
                        active={exportFormats.includes(fmt)}
                        disabled={isPending}
                        accent="emerald"
                        onToggle={() =>
                          setExportFormats((prev) =>
                            exportFormats.includes(fmt)
                              ? prev.filter((f) => f !== fmt)
                              : [...prev, fmt]
                          )
                        }
                      />
                    ))}
                  </div>
                </FormSection>

                <FormSection
                  icon={FileText}
                  title="Knowledge files"
                  description="Scope Memory documents this assistant can retrieve and cite."
                  accent="cyan"
                >
                  <div className={innerFieldPanel}>
                    <KnowledgeFilePicker
                      files={ragFileList}
                      selectedIds={ragFileIds}
                      onChange={setRagFileIds}
                      disabled={isPending}
                    />
                  </div>
                </FormSection>

                <FormSection
                  icon={Globe}
                  title="Research settings"
                  description="How the assistant handles citations and live web lookup."
                  accent="sky"
                >
                  <div className={cn(innerFieldPanel, "grid grid-cols-1 gap-4 sm:grid-cols-2")}>
                    <FormField
                      id="at-citation"
                      label="Citation mode"
                      hint="Whether answers must include source citations."
                    >
                      <Select
                        id="at-citation"
                        value={citationMode}
                        onChange={(e) =>
                          setCitationMode(e.target.value as "required" | "optional" | "off")
                        }
                        disabled={isPending}
                        className={selectClass}
                      >
                        <option value="required">Required — always cite sources</option>
                        <option value="optional">Optional — cite when helpful</option>
                        <option value="off">Off — no citation requirement</option>
                      </Select>
                    </FormField>
                    <div
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-lg border px-3 py-3 transition-colors sm:mt-6",
                        webSearchDefault
                          ? "border-sky/30 bg-sky/[0.06]"
                          : "border-border/60 bg-background/50"
                      )}
                    >
                      <div className="min-w-0 space-y-0.5">
                        <Label htmlFor="at-web-search" className="text-sm font-medium">
                          Web research
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Search the web by default for fresh information.
                        </p>
                      </div>
                      <Switch
                        id="at-web-search"
                        checked={webSearchDefault}
                        onCheckedChange={setWebSearchDefault}
                        disabled={isPending}
                        size="sm"
                        aria-label="Search the web by default"
                      />
                    </div>
                  </div>
                </FormSection>
              </div>
            ) : null}

            {activeTab === "access" && showLicensingControls ? (
              <FormSection
                icon={Shield}
                title="Access controls"
                description="Restrict who can use this template by account role and plan."
                accent="oc"
              >
                <div className={cn(innerFieldPanel, "grid grid-cols-1 gap-4 sm:grid-cols-2")}>
                  <FormField id="at-required-role" label="Required role">
                    <Select
                      id="at-required-role"
                      value={requiredRole}
                      onChange={(e) => setRequiredRole(e.target.value as AgentTemplateRequiredRole)}
                      disabled={isPending}
                      className={selectClass}
                    >
                      {REQUIRED_ROLE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                  <FormField id="at-min-plan" label="Minimum plan">
                    <Select
                      id="at-min-plan"
                      value={minPlan}
                      onChange={(e) => setMinPlan(e.target.value as AgentTemplateMinPlan)}
                      disabled={isPending}
                      className={selectClass}
                    >
                      {MIN_PLAN_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                </div>
              </FormSection>
            ) : null}

            {validationError ? (
              <p className="mt-4 text-sm text-destructive" role="alert">
                {validationError}
              </p>
            ) : null}
            {submitError ? (
              <div className="mt-4">
                <ApiErrorCallout
                  error={submitError}
                  title="Could not save template"
                  fallbackMessage="Could not save template"
                />
              </div>
            ) : null}
            {errorMessage ? (
              <p className="mt-4 text-sm text-destructive" role="alert">
                {errorMessage}
              </p>
            ) : null}
          </div>

          <div className="shrink-0 border-t border-border/60 bg-background/50 px-4 py-4 backdrop-blur-md sm:px-6">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="hidden text-xs text-muted-foreground sm:block">
                {creatorMode
                  ? "Changes apply to chat replies and gallery cards."
                  : "Template is available in pipeline and chat pickers."}
              </p>
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                className="border-border/70 bg-background/40 sm:min-w-[7rem]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isPending ||
                  draftBusy ||
                  !templateId.trim() ||
                  (creatorCreate && !description.trim())
                }
                className={cn("sm:min-w-[7rem]", shellTheme.primaryBtn)}
              >
                {isPending
                  ? "Saving…"
                  : draftBusy
                    ? "Generating prompt…"
                    : mode === "create"
                      ? "Create"
                      : "Save changes"}
              </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
