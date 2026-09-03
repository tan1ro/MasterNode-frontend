"use client"

import { useState } from "react"
import { Check, ChevronDown, Loader2, Sparkles } from "lucide-react"
import { displayTemplateName } from "@/components/agent-templates/template-role-utils"
import type { AgentTemplateApi } from "@/types/api"
import { cn } from "@/lib/utils"

export type AssistantIntakeChecklistStatus = "done" | "current" | "pending"

function statusForIndex(index: number, currentIndex: number): AssistantIntakeChecklistStatus {
  if (index < currentIndex) return "done"
  if (index === currentIndex) return "current"
  return "pending"
}

function detailForTemplate(
  template: AgentTemplateApi,
  status: AssistantIntakeChecklistStatus,
  values?: Record<string, string>
): string {
  if (status === "current") return "Collecting inputs…"
  if (status === "pending") return "Waiting to start"
  const filled = Object.values(values || {})
    .map((v) => v.trim())
    .filter(Boolean)
  if (filled.length > 0) {
    const preview = filled.slice(0, 2).join(" · ")
    return preview.length > 64 ? `${preview.slice(0, 61)}…` : preview
  }
  return template.description?.trim() || "Ready"
}

/** Live-run style progress while multiple assistants collect inputs / prepare to run. */
export function ChatAssistantIntakeChecklist({
  templates,
  currentIndex,
  valuesCache = {},
  className,
}: {
  templates: AgentTemplateApi[]
  currentIndex: number
  valuesCache?: Record<string, Record<string, string>>
  className?: string
}) {
  const [expanded, setExpanded] = useState(true)
  if (templates.length === 0) return null

  const total = templates.length
  const doneCount = Math.min(Math.max(currentIndex, 0), total)
  const allDone = doneCount >= total
  const progress = allDone ? 1 : Math.max(doneCount / total, 0.06)
  const statusLabel = allDone ? "complete" : "running"
  const currentName = displayTemplateName(
    templates[currentIndex]?.name ||
      templates[currentIndex]?.template_id ||
      "Assistant"
  )

  const resultLines = templates
    .slice(0, Math.max(doneCount, allDone ? total : 0))
    .map((template) => {
      const id = template.template_id || ""
      const name = displayTemplateName(template.name || id)
      const values = valuesCache[id] || {}
      const filled = Object.values(values)
        .map((v) => v.trim())
        .filter(Boolean)
      if (filled.length > 0) return `${name} — configured`
      return `${name} — ready`
    })

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b12]/90 p-4 shadow-2xl backdrop-blur-sm dark:border-white/10",
        "max-sm:rounded-xl max-sm:p-3.5",
        className
      )}
      aria-label={`Assistants live run ${doneCount} of ${total}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(120%_80%_at_100%_0%,rgba(155,114,232,0.18),transparent_60%)]" />

      <div className="relative flex items-center gap-2 pb-3">
        <span className="size-2.5 rounded-full bg-red-400/70" aria-hidden />
        <span className="size-2.5 rounded-full bg-amber-400/70" aria-hidden />
        <span className="size-2.5 rounded-full bg-emerald-400/70" aria-hidden />
        <span className="ml-2 inline-flex min-w-0 items-center gap-1.5 text-xs font-medium text-white/60">
          <Sparkles className="size-3.5 shrink-0 text-violet" aria-hidden />
          <span className="truncate">Assistants · live run</span>
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-white/45">
          <span
            className={cn("size-1.5 rounded-full bg-violet", !allDone && "animate-pulse")}
            aria-hidden
          />
          {statusLabel}
        </span>
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white/50 hover:bg-white/10 hover:text-white/80"
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse assistant run" : "Expand assistant run"}
        >
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")}
            aria-hidden
          />
        </button>
      </div>

      {!expanded ? (
        <p className="relative text-[11px] text-white/50">
          Now: <span className="font-medium text-white/80">{currentName}</span>
        </p>
      ) : null}

      {expanded ? (
        <>
          <div className="relative mb-3 flex flex-wrap gap-1.5">
            {templates.map((template, index) => {
              const status = statusForIndex(index, currentIndex)
              const name = displayTemplateName(template.name || template.template_id || "Assistant")
              const short = name.length > 18 ? `${name.slice(0, 16)}…` : name
              const reached = status !== "pending"
              return (
                <span
                  key={template.template_id || `assistant-${index}`}
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                    reached
                      ? "border-white/20 bg-white/10 text-violet"
                      : "border-white/10 text-white/40"
                  )}
                >
                  {short}
                </span>
              )
            })}
          </div>

          <p className="relative text-xs font-semibold text-white/80">
            {allDone ? "Assistants ready to generate" : "Configure each assistant"}
          </p>
          <p className="relative mt-1 line-clamp-2 rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-[11px] leading-relaxed text-white/55">
            {allDone
              ? "Inputs collected. Generate to run these assistants on your request."
              : `Working through ${total} assistant${total === 1 ? "" : "s"} — answer what’s missing, then generate.`}
          </p>

          <div className="relative mt-3 h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-violet transition-[width] duration-700 ease-out"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <ul className="relative mt-3 max-h-[40vh] space-y-1.5 overflow-y-auto scrollbar-thin">
            {templates.map((template, index) => {
              const id = template.template_id || `assistant-${index}`
              const status = statusForIndex(index, currentIndex)
              const name = displayTemplateName(template.name || id)
              const detail = detailForTemplate(template, status, valuesCache[id])
              const isDone = status === "done"
              const isActive = status === "current"
              return (
                <li
                  key={id}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg border px-2.5 py-2 transition-all",
                    isActive
                      ? "border-white/20 bg-white/[0.06] ring-1 ring-violet/40"
                      : isDone
                        ? "border-white/10 bg-white/[0.03]"
                        : "border-white/5 opacity-45"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full",
                      isDone ? "bg-violet text-black" : "bg-white/10 text-white/60"
                    )}
                  >
                    {isDone ? (
                      <Check className="size-3" aria-hidden />
                    ) : isActive ? (
                      <Loader2 className="size-3 animate-spin" aria-hidden />
                    ) : (
                      <span className="size-1.5 rounded-full bg-white/40" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-semibold text-white/85">{name}</span>
                    <span className="block truncate text-[11px] text-white/50">{detail}</span>
                  </span>
                </li>
              )
            })}
          </ul>

          <div
            className={cn(
              "relative mt-3 overflow-hidden rounded-lg border transition-all duration-500",
              allDone && resultLines.length > 0
                ? "max-h-40 border-white/15 bg-white/[0.05] p-3 opacity-100"
                : "max-h-0 border-transparent p-0 opacity-0"
            )}
          >
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-violet">
              <Check className="size-3.5" aria-hidden />
              Assistant kit — ready to generate
            </p>
            <ul className="mt-1.5 space-y-1">
              {resultLines.map((line) => (
                <li key={line} className="flex items-start gap-1.5 text-[11px] text-white/60">
                  <span className="mt-1 size-1 shrink-0 rounded-full bg-violet" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}
    </div>
  )
}
