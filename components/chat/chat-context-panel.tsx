"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Brain, Bot, ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ROUTES } from "@/lib/routes"
import {
  countSelectedTemplates,
  decodeTemplateSelection,
  emptyPipelineTemplateSelection,
  encodeTemplateSelection,
  type PipelineRunContext,
  type PipelineTemplateSelection,
} from "@/lib/pipeline-run-context"
import type { AgentTemplateApi, CreateTaskRequest, RagFile } from "@/types/api"
import { ChatAssistantsPicker, ChatMemoryPicker } from "@/components/chat/chat-run-context-pickers"
import { useChatAttachedAssistants } from "@/hooks/use-chat-attached-assistants"
import { useChatEnabledMemory } from "@/hooks/use-chat-enabled-memory"
import {
  listAttachedTemplateIds,
  resolveChatEnabledTemplates,
} from "@/lib/chat-attached-assistants"
import { loadChatEnabledMemoryKeys, resolveChatEnabledMemoryFiles } from "@/lib/chat-enabled-memory"
import { ragFileSourceKey } from "@/lib/rag-file-utils"
import { displayTemplateName } from "@/components/agent-templates/template-role-utils"

export interface ChatContextSelection {
  useMemory: boolean
  memorySources: string[]
  templateIds: PipelineTemplateSelection
}

export const defaultChatContextSelection = (): ChatContextSelection => ({
  useMemory: false,
  memorySources: [],
  templateIds: {},
})

export function chatContextToTaskOptions(
  ctx: ChatContextSelection
): Pick<CreateTaskRequest, "use_rag" | "rag_sources" | "template_ids"> {
  const out: Pick<CreateTaskRequest, "use_rag" | "rag_sources" | "template_ids"> = {}

  if (ctx.useMemory) {
    out.use_rag = true
    const enabledKeys = loadChatEnabledMemoryKeys()
    const sources =
      ctx.memorySources.length > 0
        ? ctx.memorySources.filter((key) => enabledKeys.includes(key))
        : enabledKeys
    if (sources.length > 0) {
      out.rag_sources = [...sources]
    }
  }

  const encoded = encodeTemplateSelection(ctx.templateIds)
  if (Object.keys(encoded).length > 0) {
    out.template_ids = encoded
  }

  return out
}

export function chatContextFromLegacyTemplateIds(raw: Record<string, string>): PipelineTemplateSelection {
  return decodeTemplateSelection(raw)
}

interface ChatContextPanelProps {
  value: ChatContextSelection
  onChange: (next: ChatContextSelection) => void
  ragFiles: RagFile[] | undefined
  ragLoading: boolean
  templates: AgentTemplateApi[] | undefined
  templatesLoading: boolean
  disabled?: boolean
  defaultOpen?: boolean
  /** Full-width strip on create-task (spans below task + pipeline columns). */
  variant?: "default" | "task-form"
  className?: string
}

export function ChatRunContextBody({
  value,
  onChange,
  ragFiles,
  ragLoading,
  templates,
  templatesLoading,
  disabled,
  idPrefix,
  wide,
  compact,
  section = "both",
}: ChatContextPanelProps & {
  idPrefix: string
  wide?: boolean
  compact?: boolean
  section?: "both" | "memory" | "assistants"
}) {
  const runContext: PipelineRunContext = useMemo(
    () => ({
      useMemory: value.useMemory,
      memorySources: value.memorySources,
      templateIds: value.templateIds,
    }),
    [value]
  )

  const emit = (next: PipelineRunContext) => {
    onChange({
      useMemory: next.useMemory,
      memorySources: next.memorySources,
      templateIds: next.templateIds,
    })
  }

  const setField = <K extends keyof PipelineRunContext>(key: K, fieldValue: PipelineRunContext[K]) => {
    emit({ ...runContext, [key]: fieldValue })
  }

  const toggleMemoryFile = (sourceKey: string) => {
    const cur = runContext.memorySources
    const has = cur.includes(sourceKey)
    setField("memorySources", has ? cur.filter((s) => s !== sourceKey) : [...cur, sourceKey])
  }
  const attachedTemplateId = String(runContext.templateIds?.master?.[0] || "").trim()
  const { attached } = useChatAttachedAssistants()
  const { enabledKeys } = useChatEnabledMemory()
  const attachedIds = useMemo(() => listAttachedTemplateIds(attached), [attached])
  const enabledTemplates = useMemo(
    () => resolveChatEnabledTemplates(attachedIds, templates),
    [attachedIds, templates]
  )
  const enabledMemoryFiles = useMemo(
    () => resolveChatEnabledMemoryFiles(enabledKeys, ragFiles),
    [enabledKeys, ragFiles]
  )
  const sortedTemplates = useMemo(
    () =>
      [...enabledTemplates].sort((a, b) =>
        String(a.name || a.template_id || "").localeCompare(String(b.name || b.template_id || ""))
      ),
    [enabledTemplates]
  )
  const setAttachedTemplate = (templateId: string) => {
    const id = templateId.trim()
    const nextIds: PipelineTemplateSelection = {
      ...emptyPipelineTemplateSelection(),
      ...runContext.templateIds,
    }
    nextIds.master = id ? [id] : []
    setField("templateIds", nextIds)
  }

  const showMemory = section === "both" || section === "memory"
  const showAssistants = section === "both" || section === "assistants"

  return (
    <div
      className={cn(
        section === "both" &&
          (compact
            ? "space-y-4"
            : wide
              ? "grid gap-4 lg:grid-cols-[minmax(0,280px)_1fr] lg:items-start"
              : "space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 lg:items-start"),
        disabled && "opacity-60 pointer-events-none"
      )}
    >
      {showMemory && section === "memory" ? (
        <ChatMemoryPicker
          value={value}
          onChange={onChange}
          ragFiles={ragFiles}
          ragLoading={ragLoading}
          disabled={disabled}
        />
      ) : null}

      {showMemory && section !== "memory" ? (
      <div
        className={cn(
          "rounded-lg border border-border/50 bg-background/60",
          wide ? "p-4 space-y-3" : "space-y-2 p-4"
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Memory</p>
          {runContext.useMemory ? (
            <span className="text-[10px] px-1.5 py-0.5 rounded border border-amber/30 bg-amber/10 text-amber">
              Enabled
            </span>
          ) : null}
        </div>
        <div className="flex items-start gap-2">
          <Checkbox
            id={`${idPrefix}-use-memory`}
            checked={runContext.useMemory}
            onChange={(e) => {
              const checked = e.target.checked
              emit({
                ...runContext,
                useMemory: checked,
                memorySources: checked ? runContext.memorySources : [],
              })
            }}
            disabled={disabled}
            className="mt-0.5"
          />
          <Label
            htmlFor={`${idPrefix}-use-memory`}
            className="text-sm font-normal cursor-pointer leading-snug flex items-center gap-2"
          >
            <Brain className="h-4 w-4 text-amber shrink-0" />
            Use Memory (RAG from uploaded docs)
          </Label>
        </div>
        {runContext.useMemory && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Leave all unchecked to search all enabled files, or pick specific ones.{" "}
              <Link href={ROUTES.rag} className="text-primary underline">
                Memory
              </Link>
            </p>
            {ragLoading && <p className="text-xs text-muted-foreground">Loading files…</p>}
            {!ragLoading && enabledMemoryFiles.length === 0 && (
              <p className="text-xs text-amber/90">No files enabled for chat yet.</p>
            )}
            <div
              className={cn(
                "overflow-y-auto scrollbar-thin border border-border/40 rounded-lg p-2 space-y-1",
                wide ? "max-h-40" : "max-h-32"
              )}
            >
              {enabledMemoryFiles.map((f) => {
                const key = ragFileSourceKey(f)
                if (!key) return null
                return (
                  <label
                    key={f.file_id}
                    className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-border"
                      checked={runContext.memorySources.includes(key)}
                      onChange={() => toggleMemoryFile(key)}
                      disabled={disabled}
                    />
                    <span className="truncate">{f.filename || f.file_id}</span>
                  </label>
                )
              })}
            </div>
          </div>
        )}
      </div>
      ) : null}

      {showAssistants && section === "assistants" ? (
        <ChatAssistantsPicker
          value={value}
          onChange={onChange}
          templates={templates}
          templatesLoading={templatesLoading}
          disabled={disabled}
        />
      ) : null}

      {showAssistants && section !== "assistants" ? (
      <div className={cn("rounded-lg border border-border/50 bg-background/60 p-4 min-w-0")}>
        <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
          <Bot className="h-4 w-4 text-amber shrink-0" />
          <span>Assistants</span>
          <Link href={ROUTES.agents} className="text-xs text-muted-foreground font-normal underline ml-auto">
            Manage assistants
          </Link>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Optional per run: attach one assistant to guide this chat reply.
        </p>
        {templatesLoading ? <p className="text-xs text-muted-foreground">Loading assistants…</p> : null}
        {!templatesLoading ? (
          <div className="space-y-2">
            <select
              className="w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm"
              value={attachedTemplateId}
              onChange={(e) => setAttachedTemplate(e.target.value)}
              disabled={disabled}
            >
              <option value="">Default assistant behavior</option>
              {sortedTemplates.map((t) => {
                const id = String(t.template_id || "").trim()
                if (!id) return null
                const locked = t.unlocked === false
                return (
                  <option key={id} value={id} disabled={locked}>
                    {displayTemplateName(t.name || id)}
                    {locked ? " (locked)" : ""}
                  </option>
                )
              })}
            </select>
            <p className="text-[11px] text-muted-foreground">
              This applies only to chat. Pipeline stages are used only in pipeline mode.
            </p>
          </div>
        ) : null}
      </div>
      ) : null}
    </div>
  )
}

export function ChatContextPanel({
  value,
  onChange,
  ragFiles,
  ragLoading,
  templates,
  templatesLoading,
  disabled,
  defaultOpen = false,
  variant = "default",
  className,
}: ChatContextPanelProps) {
  const [open, setOpen] = useState(defaultOpen)
  const wide = variant === "task-form"

  const templateCount = countSelectedTemplates(value.templateIds)
  const activeCount = (value.useMemory ? 1 : 0) + (templateCount > 0 ? 1 : 0)

  const summary = useMemo(() => {
    const parts: string[] = []
    if (value.useMemory) {
      const enabledCount = loadChatEnabledMemoryKeys().length
      parts.push(
        value.memorySources.length > 0
          ? `${value.memorySources.length} file(s)`
          : enabledCount > 0
            ? `all enabled (${enabledCount})`
            : "no files enabled"
      )
    }
    if (templateCount > 0) parts.push(`${templateCount} stage template(s)`)
    return parts.join(" · ")
  }, [value.useMemory, value.memorySources.length, templateCount])

  return (
    <div
      className={cn(
        wide
          ? "rounded-lg border border-border/50 bg-card shadow-sm text-left"
          : "rounded-xl border border-border/60 bg-card/70 text-left",
        disabled && "opacity-60 pointer-events-none",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center gap-2 px-4 py-3 text-base font-semibold text-foreground hover:bg-muted/40 transition-colors",
          open ? "rounded-t-lg" : "rounded-lg"
        )}
      >
        <span>Run context</span>
        {activeCount > 0 ? (
          <span className="text-[10px] font-medium text-amber bg-amber/10 border border-amber/30 rounded px-1.5 py-0.5 truncate max-w-[50%] sm:max-w-none">
            {summary || "configured"}
          </span>
        ) : (
          <span className="text-[10px] text-muted-foreground shrink-0">optional</span>
        )}
        {open ? (
          <ChevronDown className="h-4 w-4 ml-auto shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 ml-auto shrink-0 text-muted-foreground" />
        )}
      </button>

      {open ? (
        <div className="px-4 pb-4 pt-0 border-t border-border/50">
          {wide ? (
            <p className="text-sm text-muted-foreground leading-relaxed py-4">
              Attach files from Memory and assistants for this run. Pick different instructions per
              workflow step.
            </p>
          ) : null}
          {!wide ? (
            <p className="text-xs text-muted-foreground leading-relaxed mb-3 mt-3">
              Attach files from{" "}
              <Link href={ROUTES.rag} className="underline underline-offset-2 text-foreground hover:text-amber">
                Memory
              </Link>{" "}
              and assistants from{" "}
              <Link href={ROUTES.agents} className="underline underline-offset-2 text-foreground hover:text-amber">
                Assistants
              </Link>{" "}
              for this run.
            </p>
          ) : null}
          <ChatRunContextBody
            value={value}
            onChange={onChange}
            ragFiles={ragFiles}
            ragLoading={ragLoading}
            templates={templates}
            templatesLoading={templatesLoading}
            disabled={disabled}
            idPrefix="chat-ctx"
            wide={wide}
          />
        </div>
      ) : null}
    </div>
  )
}
