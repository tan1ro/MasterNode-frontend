"use client"

import React, { useId, useState } from "react"
import {
  Check,
  ChevronDown,
  FileCode2,
  FileText,
  Image as ImageIcon,
  Loader2,
  Presentation,
  Terminal,
} from "lucide-react"
import {
  fileGenerationActivitySummary,
  type FileGenerationActivity,
  type FileGenerationStep,
} from "@/lib/chat-file-generation-activity"
import { cn } from "@/lib/utils"

function StepIcon({ step }: { step: FileGenerationStep }) {
  const className = "h-3.5 w-3.5 shrink-0"
  switch (step.kind) {
    case "read":
      return <FileText className={className} aria-hidden />
    case "command":
    case "plan":
      return <Terminal className={className} aria-hidden />
    case "script":
      return <FileCode2 className={className} aria-hidden />
    case "file":
      return <Presentation className={className} aria-hidden />
    case "qa":
      return <ImageIcon className={className} aria-hidden />
    default:
      return <Terminal className={className} aria-hidden />
  }
}

function StepRow({ step }: { step: FileGenerationStep }) {
  const running = step.status === "running"
  return (
    <div className="flex min-w-0 items-start gap-2.5 py-1.5">
      <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground">
        {running ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        ) : (
          <StepIcon step={step} />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-foreground/90">{step.label}</p>
        {step.detail ? (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{step.detail}</p>
        ) : null}
        {step.filename ? (
          <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
            {step.filename}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export function MessageFileGenerationActivity({
  activity,
  defaultOpen,
  className,
}: {
  activity: FileGenerationActivity
  defaultOpen?: boolean
  className?: string
}) {
  const panelId = useId()
  const [open, setOpen] = useState(
    defaultOpen ?? (activity.status === "running" || activity.steps.length > 0)
  )
  const summary = fileGenerationActivitySummary(activity)
  const running = activity.status === "running"

  const panel = open ? (
    <div id={panelId} className="relative mt-1 ml-1 border-l border-border/50 pl-4">
      <div className="space-y-0.5 py-1">
        {activity.steps.map((step) => (
          <StepRow key={step.id} step={step} />
        ))}
      </div>
      {!running ? (
        <div className="flex items-center gap-2 py-1.5 text-xs text-muted-foreground">
          <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>Done</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 py-1.5 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
          <span>Working…</span>
        </div>
      )}
    </div>
  ) : null

  return (
    <div className={cn("mb-3 min-w-0", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          "inline-flex max-w-full items-center gap-1.5 rounded-md px-1 py-1",
          "text-sm text-muted-foreground transition-colors hover:text-foreground"
        )}
      >
        <span className="truncate">{summary}</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 shrink-0 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {panel}
    </div>
  )
}
