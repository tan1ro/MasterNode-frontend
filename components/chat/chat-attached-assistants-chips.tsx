"use client"

import { useEffect, useRef, useState } from "react"
import { Bot, ChevronDown, X } from "lucide-react"
import { AssistantChip } from "@/components/chat/chat-composer-menu"
import type { AttachedAssistantChip } from "@/components/chat/chat-run-context-pickers"
import { assistantContextChipStyleForTemplate } from "@/lib/chat-context-chip-styles"
import { cn } from "@/lib/utils"
import type { AgentTemplateApi } from "@/types/api"

/** Show individual chips up to this count; collapse into one group chip above it. */
export const ATTACHED_ASSISTANTS_CHIP_COLLAPSE_AFTER = 3

interface AttachedAssistantsChipsProps {
  assistants: AttachedAssistantChip[]
  templates: AgentTemplateApi[] | undefined
  disabled?: boolean
  onClear: (templateId: string) => void
  onClearAll: () => void
}

export function AttachedAssistantsChips({
  assistants,
  templates,
  disabled,
  onClear,
  onClearAll,
}: AttachedAssistantsChipsProps) {
  if (assistants.length === 0) return null

  if (assistants.length <= ATTACHED_ASSISTANTS_CHIP_COLLAPSE_AFTER) {
    return (
      <>
        {assistants.map((assistant) => (
          <AssistantChip
            key={assistant.templateId}
            templateId={assistant.templateId}
            templates={templates}
            name={assistant.name}
            disabled={disabled}
            onClear={() => onClear(assistant.templateId)}
          />
        ))}
      </>
    )
  }

  return (
    <AssistantsGroupChip
      assistants={assistants}
      templates={templates}
      disabled={disabled}
      onClear={onClear}
      onClearAll={onClearAll}
    />
  )
}

function AssistantsGroupChip({
  assistants,
  templates,
  disabled,
  onClear,
  onClearAll,
}: AttachedAssistantsChipsProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const count = assistants.length

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return
      setOpen(false)
    }
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onEscape)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onEscape)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative inline-flex max-w-full shrink-0">
      <span
        className={cn(
          "chat-context-chip inline-flex max-w-full items-center gap-1.5 rounded-full border shadow-sm",
          "border-violet/40 bg-background/45 py-1 pl-2.5 pr-1 text-xs font-medium text-foreground backdrop-blur-md"
        )}
      >
        <button
          type="button"
          disabled={disabled}
          className="inline-flex min-w-0 items-center gap-1.5 disabled:opacity-50"
          aria-expanded={open}
          aria-haspopup="listbox"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-violet/15 text-violet">
            <Bot className="h-3 w-3" aria-hidden />
          </span>
          <span className="truncate">{count} assistants</span>
          <ChevronDown
            className={cn(
              "h-3 w-3 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
            aria-hidden
          />
        </button>
        <button
          type="button"
          disabled={disabled}
          className="inline-flex shrink-0 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-violet disabled:opacity-50"
          aria-label="Remove all assistants"
          onClick={onClearAll}
        >
          <X className="h-3 w-3" />
        </button>
      </span>

      {open ? (
        <div
          role="listbox"
          aria-label="Attached assistants"
          className={cn(
            "absolute bottom-full left-0 z-50 mb-1.5 w-64 max-w-[min(16rem,calc(100vw-2rem))]",
            "rounded-xl border border-border/60 bg-popover p-1 shadow-lg"
          )}
        >
          <ul className="max-h-52 overflow-y-auto">
            {assistants.map((assistant) => {
              const style = assistantContextChipStyleForTemplate(
                assistant.templateId,
                templates
              )
              const Icon = style.Icon
              return (
                <li key={assistant.templateId} role="option">
                  <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/50">
                    <span className={cn(style.iconClass, "h-5 w-5 shrink-0")}>
                      <Icon className="h-3 w-3" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-xs font-medium">
                      {assistant.name}
                    </span>
                    <button
                      type="button"
                      disabled={disabled}
                      className="shrink-0 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                      aria-label={`Remove ${assistant.name}`}
                      onClick={() => onClear(assistant.templateId)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
