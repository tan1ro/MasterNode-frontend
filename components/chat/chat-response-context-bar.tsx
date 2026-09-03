"use client"

import React, { useMemo, useState } from "react"
import { ChevronDown } from "lucide-react"
import {
  buildResponseContextItems,
  responseContextChipStyle,
  responseContextDisplayLabel,
  splitResponseContextItems,
} from "@/lib/chat-response-context"
import type { AgentTemplateApi, ChatToolEvent } from "@/types/api"
import { cn } from "@/lib/utils"

function ResponseContextChip({
  item,
  templates,
}: {
  item: ReturnType<typeof buildResponseContextItems>[number]
  templates: AgentTemplateApi[] | undefined
}) {
  const style = responseContextChipStyle(item, templates)
  const Icon = style.Icon

  return (
    <span className={cn("inline-flex max-w-full shrink-0", style.chipClass)}>
      <span className={style.iconClass}>
        <Icon className="h-3 w-3" aria-hidden />
      </span>
      <span className="truncate">{responseContextDisplayLabel(item, templates)}</span>
    </span>
  )
}

/** Attached assistants used for this reply — same chip look as the composer. */
export function ChatResponseContextBar({
  metadata,
  toolEvents,
  templates,
  streamingTemplateId,
  className,
}: {
  metadata?: Record<string, unknown>
  toolEvents?: ChatToolEvent[]
  templates?: AgentTemplateApi[]
  streamingTemplateId?: string | null
  className?: string
}) {
  const [open, setOpen] = useState(false)

  const items = useMemo(() => {
    const base = buildResponseContextItems(metadata, toolEvents, templates)
    if (base.length || !streamingTemplateId) return base

    return [
      {
        kind: "agent" as const,
        templateId: streamingTemplateId.trim(),
        label: streamingTemplateId.trim(),
      },
    ]
  }, [metadata, toolEvents, templates, streamingTemplateId])

  const { inline, overflow } = useMemo(() => splitResponseContextItems(items), [items])

  if (!items.length) return null

  return (
    <div className={cn("mb-2 min-w-0", className)} aria-label="Used for this reply">
      <div className="flex flex-wrap items-center gap-1.5">
        {inline.map((item) => (
          <ResponseContextChip
            key={`${item.kind}:${item.templateId || ""}:${item.source || ""}:${item.label}`}
            item={item}
            templates={templates}
          />
        ))}
        {overflow.length > 0 ? (
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border border-border/50 bg-background/45",
              "px-2 py-0.5 text-[11px] font-medium text-muted-foreground shadow-sm hover:text-foreground"
            )}
          >
            <span>+{overflow.length} more</span>
            <ChevronDown
              className={cn("h-3 w-3 transition-transform", open && "rotate-180")}
              aria-hidden
            />
          </button>
        ) : null}
      </div>
      {open && overflow.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {overflow.map((item) => (
            <ResponseContextChip
              key={`overflow:${item.kind}:${item.templateId || ""}:${item.source || ""}:${item.label}`}
              item={item}
              templates={templates}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
