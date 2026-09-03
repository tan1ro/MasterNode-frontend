"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import {
  BookOpen,
  Braces,
  Brain,
  Globe,
  MessageSquare,
  Package,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { AssistantGalleryMeta } from "@/lib/assistant-gallery-meta"
import {
  domainFocusBadgeClass,
  outputFormatBadgeClass,
  variableTagClass,
} from "@/lib/assistant-creator-meta"
import { outputFormatLabel } from "@/constants/assistant-output-formats"
import type { AssistantOutputFormat } from "@/constants/assistant-output-formats"
import {
  assistantIconBg,
  iconForAssistant,
  iconForOutputFormat,
} from "@/lib/assistant-gallery-icons"
import { templateCardBadge } from "@/components/agent-templates/template-role-utils"

interface AssistantDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  meta: AssistantGalleryMeta | null
  creatorMode?: boolean
}

function FormatChip({ fmt }: { fmt: AssistantOutputFormat }) {
  const Icon = iconForOutputFormat(fmt)
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium",
        outputFormatBadgeClass(fmt)
      )}
    >
      <Icon className="h-3 w-3 shrink-0 opacity-80" aria-hidden />
      {outputFormatLabel(fmt)}
    </span>
  )
}

function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon
  title: string
  children: ReactNode
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/15 p-4">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground/90">
        <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
        {title}
      </div>
      <p className="text-[0.8125rem] leading-relaxed text-muted-foreground">{children}</p>
    </div>
  )
}

function isMechanicalBestFor(text: string): boolean {
  return /Inputs:\s*.+Exports:/i.test(text)
}

export function AssistantDetailDialog({
  open,
  onOpenChange,
  meta,
  creatorMode = false,
}: AssistantDetailDialogProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onOpenChange])

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  const HeaderIcon = useMemo(() => {
    if (!meta) return Sparkles
    return iconForAssistant(meta.templateId, meta.domainFocus)
  }, [meta])

  const headerIconBg = useMemo(() => {
    if (!meta) return "bg-muted text-muted-foreground"
    return assistantIconBg(meta.templateId, meta.domainFocus)
  }, [meta])

  const showBestFor = meta && (!creatorMode || !isMechanicalBestFor(meta.bestFor))

  if (!mounted || !open || !meta) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center p-3 sm:items-center sm:p-6"
      role="presentation"
      onClick={() => onOpenChange(false)}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="assistant-detail-title"
        className="relative z-10 flex max-h-[min(92vh,52rem)] w-full max-w-[min(96vw,72rem)] flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border/60 px-5 py-4 sm:px-8 sm:py-5">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                headerIconBg
              )}
            >
              <HeaderIcon className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h2
                  id="assistant-detail-title"
                  className="text-base font-semibold leading-snug text-foreground sm:text-lg"
                >
                  {meta.title}
                </h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="-mr-1 h-8 w-8 shrink-0 p-0"
                  aria-label="Close"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className={cn(
                    templateCardBadge,
                    "h-5 px-2 text-[10px]",
                    domainFocusBadgeClass(meta.domainFocus)
                  )}
                >
                  {meta.domainFocus}
                </span>
                {meta.outputFormats.map((fmt) => (
                  <FormatChip key={fmt} fmt={fmt} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 text-sm sm:px-8 sm:py-6">
          <div
            className={cn(
              "grid gap-4",
              showBestFor ? "lg:grid-cols-2 lg:gap-6" : "grid-cols-1"
            )}
          >
            <section className="space-y-1.5">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                What it does
              </h3>
              <p className="text-[0.9375rem] leading-relaxed text-foreground/90">{meta.detail}</p>
            </section>

            {showBestFor ? (
              <section className="space-y-1.5">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {creatorMode ? "Ideal for" : "Best for"}
                </h3>
                <p className="text-[0.9375rem] leading-relaxed text-foreground/85">{meta.bestFor}</p>
              </section>
            ) : null}
          </div>

          {meta.variables.length > 0 ? (
            <section className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Inputs
              </h3>
              <div className="flex flex-wrap gap-2">
                {meta.variables.map((variable) => (
                  <span
                    key={variable}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-xs",
                      variableTagClass(variable)
                    )}
                  >
                    <Braces className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
                    {variable}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {meta.readCapabilities.superThink || meta.readCapabilities.superRead ? (
            <div className="grid gap-4 lg:grid-cols-2 lg:items-start lg:gap-5">
              {meta.readCapabilities.superThink ? (
                <section className="h-full space-y-2 rounded-lg border border-violet/20 bg-violet/[0.06] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-violet">
                    <Brain className="h-4 w-4 shrink-0" aria-hidden />
                    Super thinking · {meta.readCapabilities.superThinkProfile.label}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {meta.readCapabilities.superThinkProfile.framework} — auto deep analysis with
                    field-specific rigor, assumptions, and tradeoffs.
                  </p>
                  {meta.readCapabilities.thinkBullets.length > 0 ? (
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {meta.readCapabilities.thinkBullets.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="text-violet">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ) : null}

              {meta.readCapabilities.superRead ? (
                <section className="h-full space-y-2 rounded-lg border border-cyan/20 bg-cyan/[0.06] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-cyan">
                    <BookOpen className="h-4 w-4 shrink-0" aria-hidden />
                    Deep read capabilities
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {meta.readCapabilities.summary}
                  </p>
                  {meta.readCapabilities.bullets.length > 0 ? (
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {meta.readCapabilities.bullets.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="text-cyan">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {meta.readCapabilities.webSearchDefault ? (
                    <p className="inline-flex items-center gap-1.5 text-[11px] text-sky">
                      <Globe className="h-3 w-3" aria-hidden />
                      Live web research enabled for fresh domain facts
                    </p>
                  ) : null}
                </section>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <InfoCard icon={MessageSquare} title="In chat">
              {meta.chatUsage}
            </InfoCard>
            <InfoCard icon={Package} title="Exports">
              {meta.exportUsage}
            </InfoCard>
            <InfoCard icon={Sparkles} title="In pipelines (optional)">
              {meta.pipelineUsage}
            </InfoCard>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
