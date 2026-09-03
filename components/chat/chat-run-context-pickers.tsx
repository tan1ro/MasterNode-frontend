"use client"

import Link from "next/link"
import { useMemo, useState, type ComponentType, type ReactNode } from "react"
import { Bot, Brain, FileText, Lock, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/routes"
import type { ChatContextSelection } from "@/components/chat/chat-context-panel"
import { memorySelectionForTemplate } from "@/lib/assistant-read-capabilities"
import {
  loadChatEnabledMemoryKeys,
  resolveChatEnabledMemoryFiles,
} from "@/lib/chat-enabled-memory"
import { useChatEnabledMemory } from "@/hooks/use-chat-enabled-memory"
import { ragFileSourceKey } from "@/lib/rag-file-utils"
import type { AgentTemplateApi, RagFile } from "@/types/api"
import { useChatAttachedAssistants } from "@/hooks/use-chat-attached-assistants"
import {
  listAttachedTemplateIds,
  resolveChatEnabledTemplates,
} from "@/lib/chat-attached-assistants"
import {
  emptyPipelineTemplateSelection,
  type PipelineTemplateSelection,
} from "@/lib/pipeline-run-context"
import { displayTemplateName, resolveTemplateDisplayName } from "@/components/agent-templates/template-role-utils"

function RowIcon({
  icon: Icon,
  selected,
}: {
  icon: ComponentType<{ className?: string }>
  selected: boolean
}) {
  return (
    <Icon
      className={cn(
        "h-4 w-4 shrink-0",
        selected ? "text-amber" : "text-muted-foreground"
      )}
    />
  )
}

function SelectableRow({
  selected,
  disabled,
  onClick,
  children,
  className,
}: {
  selected: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors border",
        selected
          ? "border-amber/30 bg-amber/10 text-foreground"
          : "text-muted-foreground border-transparent hover:bg-muted/40",
        disabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
        className
      )}
    >
      {children}
    </button>
  )
}

function PickerSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <div className="relative mb-2">
      <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-lg border border-border/60 bg-background/80 py-2 pl-8 pr-2.5 text-sm",
          "text-foreground placeholder:text-muted-foreground outline-none",
          "focus-visible:border-amber/40 focus-visible:ring-1 focus-visible:ring-amber/30"
        )}
      />
    </div>
  )
}

export function getAttachedAssistantId(ctx: ChatContextSelection): string {
  return String(ctx.templateIds?.master?.[0] || "").trim()
}

export interface AttachedAssistantChip {
  templateId: string
  name: string
  role: string
}

export function getAttachedAssistants(
  ctx: ChatContextSelection,
  templates: AgentTemplateApi[] | undefined
): AttachedAssistantChip[] {
  const out: AttachedAssistantChip[] = []
  for (const [role, ids] of Object.entries(ctx.templateIds || {})) {
    for (const rawId of ids || []) {
      const templateId = String(rawId || "").trim()
      if (!templateId) continue
      const match = (templates || []).find(
        (template) => String(template.template_id || "").trim() === templateId
      )
      out.push({
        templateId,
        name: resolveTemplateDisplayName(templateId, match?.name),
        role,
      })
    }
  }
  return out.sort((a, b) => a.name.localeCompare(b.name))
}

export function hasAttachedAssistants(ctx: ChatContextSelection): boolean {
  return getAttachedAssistants(ctx, []).length > 0
}

export function getAttachedAssistantName(
  templates: AgentTemplateApi[] | undefined,
  ctx: ChatContextSelection
): string | null {
  const id = getAttachedAssistantId(ctx)
  if (!id) return null
  const match = (templates || []).find((t) => String(t.template_id || "").trim() === id)
  return resolveTemplateDisplayName(id, match?.name)
}

export function isMemoryActive(ctx: ChatContextSelection): boolean {
  return ctx.useMemory
}

export function getMemoryChipLabel(
  ctx: ChatContextSelection,
  ragFiles: RagFile[] | undefined
): string {
  if (!ctx.useMemory) return ""
  const enabledFiles = resolveChatEnabledMemoryFiles(loadChatEnabledMemoryKeys(), ragFiles)
  if (ctx.memorySources.length === 0) {
    return enabledFiles.length === 1
      ? `Memory · ${enabledFiles[0]?.filename || enabledFiles[0]?.file_id}`
      : `Memory · all enabled (${enabledFiles.length})`
  }
  if (ctx.memorySources.length === 1) {
    const key = ctx.memorySources[0]
    const file = (ragFiles || []).find((f) => ragFileSourceKey(f) === key)
    return `Memory · ${file?.filename || key}`
  }
  return `Memory · ${ctx.memorySources.length} files`
}

interface PickerProps {
  value: ChatContextSelection
  onChange: (next: ChatContextSelection) => void
  disabled?: boolean
}

export function ChatMemoryPicker({
  value,
  onChange,
  ragFiles,
  ragLoading,
  disabled,
  hideHeader = false,
}: PickerProps & {
  ragFiles: RagFile[] | undefined
  ragLoading: boolean
  hideHeader?: boolean
}) {
  const [query, setQuery] = useState("")
  const { enabledKeys } = useChatEnabledMemory()

  const enabledFiles = useMemo(
    () => resolveChatEnabledMemoryFiles(enabledKeys, ragFiles),
    [enabledKeys, ragFiles]
  )

  const files = useMemo(() => {
    const list = [...enabledFiles].sort((a, b) =>
      String(a.filename || a.file_id || "").localeCompare(String(b.filename || b.file_id || ""))
    )
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter((f) => {
      const name = String(f.filename || f.file_id || "").toLowerCase()
      return name.includes(q)
    })
  }, [enabledFiles, query])

  const allFilesSelected = value.useMemory && value.memorySources.length === 0

  const setMemory = (useMemory: boolean, memorySources: string[]) => {
    onChange({ ...value, useMemory, memorySources })
  }

  const toggleFile = (sourceKey: string) => {
    const has = value.memorySources.includes(sourceKey)
    if (has) {
      const next = value.memorySources.filter((s) => s !== sourceKey)
      setMemory(next.length > 0, next)
      return
    }
    setMemory(true, [...value.memorySources, sourceKey])
  }

  return (
    <div className="min-w-0">
      {hideHeader ? (
        <div className="mb-2 flex justify-end">
          <Link href={ROUTES.rag} className="text-[11px] text-muted-foreground underline hover:text-cyan">
            Open Memory
          </Link>
        </div>
      ) : (
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Files</p>
          <Link href={ROUTES.rag} className="text-[11px] text-muted-foreground underline hover:text-cyan">
            Memory
          </Link>
        </div>
      )}
      <PickerSearch value={query} onChange={setQuery} placeholder="Search files…" />
      {ragLoading ? <p className="text-xs text-muted-foreground py-1">Loading files…</p> : null}
      {!ragLoading && enabledFiles.length === 0 ? (
        <p className="text-xs text-muted-foreground py-1">
          No files enabled for chat. Enable files in{" "}
          <Link href={ROUTES.rag} className="text-cyan underline-offset-2 hover:underline">
            Memory
          </Link>
          .
        </p>
      ) : null}
      <div className="max-h-52 overflow-y-auto scrollbar-thin space-y-0.5 pr-0.5">
        {!ragLoading && enabledFiles.length > 0 ? (
          <SelectableRow
            selected={allFilesSelected}
            disabled={disabled}
            onClick={() => {
              if (allFilesSelected) {
                setMemory(false, [])
              } else {
                setMemory(true, [])
              }
            }}
          >
            <RowIcon icon={Brain} selected={allFilesSelected} />
            <span className="truncate">All enabled files</span>
          </SelectableRow>
        ) : null}
        {files.map((f) => {
          const key = ragFileSourceKey(f)
          if (!key) return null
          const selected = value.memorySources.includes(key)
          return (
            <SelectableRow
              key={f.file_id}
              selected={selected}
              disabled={disabled}
              onClick={() => toggleFile(key)}
            >
              <RowIcon icon={FileText} selected={selected} />
              <span className="truncate">{f.filename || f.file_id}</span>
            </SelectableRow>
          )
        })}
        {!ragLoading && files.length === 0 && enabledFiles.length > 0 ? (
          <p className="text-xs text-muted-foreground px-1 py-2">No enabled files match your search.</p>
        ) : null}
      </div>
    </div>
  )
}

export function ChatAssistantsPicker({
  value,
  onChange,
  templates,
  templatesLoading,
  disabled,
  hideHeader = false,
}: PickerProps & {
  templates: AgentTemplateApi[] | undefined
  templatesLoading: boolean
  hideHeader?: boolean
}) {
  const [query, setQuery] = useState("")
  const attachedId = getAttachedAssistantId(value)
  const { attached } = useChatAttachedAssistants()
  const attachedIds = useMemo(() => listAttachedTemplateIds(attached), [attached])

  const enabledTemplates = useMemo(
    () => resolveChatEnabledTemplates(attachedIds, templates),
    [attachedIds, templates]
  )

  const sortedTemplates = useMemo(
    () =>
      [...enabledTemplates].sort((a, b) =>
        String(a.name || a.template_id || "").localeCompare(String(b.name || b.template_id || ""))
      ),
    [enabledTemplates]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sortedTemplates
    return sortedTemplates.filter((t) => {
      const name = String(t.name || t.template_id || "").toLowerCase()
      const desc = String(t.description || "").toLowerCase()
      return name.includes(q) || desc.includes(q)
    })
  }, [sortedTemplates, query])

  const setAttachedTemplate = (templateId: string) => {
    const id = templateId.trim()
    const nextIds: PipelineTemplateSelection = {
      ...emptyPipelineTemplateSelection(),
      ...value.templateIds,
    }
    nextIds.master = id ? [id] : []
    onChange({ ...value, templateIds: nextIds })
  }

  const toggleTemplate = (templateId: string) => {
    if (attachedId === templateId) {
      setAttachedTemplate("")
      return
    }
    const match = (templates || []).find(
      (t) => String(t.template_id || "").trim() === templateId
    )
    const nextIds: PipelineTemplateSelection = {
      ...emptyPipelineTemplateSelection(),
      ...value.templateIds,
      master: [templateId],
    }
    const memory = match ? memorySelectionForTemplate(match) : { useMemory: false, memorySources: [] }
    onChange({
      ...value,
      templateIds: nextIds,
      useMemory: memory.useMemory,
      memorySources: memory.memorySources,
    })
  }

  return (
    <div className="min-w-0">
      {hideHeader ? (
        <div className="mb-2 flex justify-end">
          <Link href={ROUTES.agents} className="text-[11px] text-muted-foreground underline hover:text-violet">
            Manage assistants
          </Link>
        </div>
      ) : (
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Assistants
          </p>
          <Link href={ROUTES.agents} className="text-[11px] text-muted-foreground underline hover:text-violet">
            Manage
          </Link>
        </div>
      )}
      <PickerSearch value={query} onChange={setQuery} placeholder="Search assistants…" />
      {templatesLoading ? (
        <p className="text-xs text-muted-foreground py-1">Loading assistants…</p>
      ) : null}
      <div className="max-h-52 overflow-y-auto scrollbar-thin space-y-0.5 pr-0.5">
        {!templatesLoading
          ? filtered.map((t) => {
              const id = String(t.template_id || "").trim()
              if (!id) return null
              const locked = t.unlocked === false
              const selected = attachedId === id
              return (
                <SelectableRow
                  key={id}
                  selected={selected}
                  disabled={disabled || locked}
                  onClick={() => toggleTemplate(id)}
                >
                  <RowIcon icon={Bot} selected={selected} />
                  <span className="min-w-0 flex-1 truncate normal-case">
                    {displayTemplateName(t.name || id)}
                  </span>
                  {locked ? <Lock className="h-3.5 w-3.5 shrink-0 opacity-60" /> : null}
                </SelectableRow>
              )
            })
          : null}
        {!templatesLoading && filtered.length === 0 ? (
          <p className="text-xs text-muted-foreground px-1 py-2">
            {enabledTemplates.length === 0
              ? "No assistants enabled. Turn them on in Assistants → Customize."
              : "No assistants match your search."}
          </p>
        ) : null}
      </div>
    </div>
  )
}
