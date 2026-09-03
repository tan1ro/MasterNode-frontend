"use client"

import React, { useEffect, useMemo, useState } from "react"
import { ChevronDown, Loader2 } from "lucide-react"
import { PiThinkingMark } from "@/components/chat/chat-streaming-status"
import {
  buildLiveThoughtModel,
  thoughtDurationLabel,
  thoughtElapsedFromEvents,
  type ThoughtStep,
} from "@/lib/chat-live-thought"
import type { ChatToolEvent } from "@/types/api"
import { cn } from "@/lib/utils"

function ThoughtActionRow({ step }: { step: ThoughtStep }) {
  const running = step.status === "running"

  return (
    <div className="flex min-w-0 items-start gap-1.5 py-0.5 text-sm leading-relaxed">
      {running ? (
        <Loader2 className="mt-0.5 h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground" aria-hidden />
      ) : null}
      <span className="shrink-0 text-foreground/88">{step.verb}</span>
      {step.detail ? (
        <span className="min-w-0 truncate text-muted-foreground">{step.detail}</span>
      ) : null}
    </div>
  )
}

function ThoughtCollapsibleSection({
  title,
  open,
  onToggle,
  children,
  className,
}: {
  title: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="inline-flex max-w-full items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <span className="truncate">{title}</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 shrink-0 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {open ? <div className="mt-2 space-y-2">{children}</div> : null}
    </div>
  )
}

export function ChatLiveThought({
  userQuery,
  toolEvents,
  hasResponseText = false,
  isStreaming = false,
  streamStartedAt = null,
  thoughtElapsedSeconds = null,
  defaultExploringOpen,
  defaultThinkingOpen,
  showElapsed = true,
  className,
}: {
  userQuery: string
  toolEvents: ChatToolEvent[]
  hasResponseText?: boolean
  isStreaming?: boolean
  streamStartedAt?: number | null
  thoughtElapsedSeconds?: number | null
  defaultExploringOpen?: boolean
  defaultThinkingOpen?: boolean
  showElapsed?: boolean
  className?: string
}) {
  const [elapsed, setElapsed] = useState(thoughtElapsedSeconds ?? 0)
  // Keep Exploring/Thinking collapsed on small viewports so streaming doesn't
  // shove the thread around every tool/event update.
  const [exploringOpen, setExploringOpen] = useState(defaultExploringOpen ?? false)
  const [thinkingOpen, setThinkingOpen] = useState(defaultThinkingOpen ?? false)

  const model = useMemo(
    () =>
      buildLiveThoughtModel({
        userQuery,
        toolEvents,
        hasResponseText,
        isStreaming,
      }),
    [userQuery, toolEvents, hasResponseText, isStreaming]
  )

  useEffect(() => {
    if (!isStreaming || !streamStartedAt) {
      if (!isStreaming) {
        const fromEvents = thoughtElapsedFromEvents(toolEvents)
        if (fromEvents != null) setElapsed(fromEvents)
        else if (streamStartedAt) {
          setElapsed(Math.max(1, Math.floor((Date.now() - streamStartedAt) / 1000)))
        } else if (thoughtElapsedSeconds != null) {
          setElapsed(thoughtElapsedSeconds)
        }
      }
      return
    }
    const tick = () => setElapsed(Math.max(1, Math.floor((Date.now() - streamStartedAt) / 1000)))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [isStreaming, streamStartedAt, toolEvents, thoughtElapsedSeconds])

  useEffect(() => {
    if (!isStreaming) return
    if (defaultExploringOpen != null) {
      setExploringOpen(defaultExploringOpen)
      return
    }
    // Desktop only: auto-expand Exploring while waiting for tokens.
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setExploringOpen(true)
    }
  }, [isStreaming, defaultExploringOpen])

  useEffect(() => {
    if (!isStreaming || !hasResponseText) return
    if (defaultThinkingOpen != null) {
      setThinkingOpen(defaultThinkingOpen)
      return
    }
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setThinkingOpen(true)
    }
  }, [isStreaming, hasResponseText, defaultThinkingOpen])

  const showExploring =
    model.steps.length > 0 || model.webSearchActivity || isStreaming

  if (
    !isStreaming &&
    !userQuery.trim() &&
    model.steps.length === 0 &&
    !model.webSearchActivity
  ) {
    return null
  }

  const durationLabel = showElapsed
    ? thoughtDurationLabel(elapsed, isStreaming)
    : thoughtDurationLabel(thoughtElapsedSeconds ?? elapsed, false)

  return (
    <div className={cn("mb-3 min-w-0 max-lg:mb-2", className)}>
      <div className="flex min-w-0 items-center gap-2">
        {isStreaming ? <PiThinkingMark className="shrink-0" /> : null}
        <p className="min-w-0 truncate text-sm text-muted-foreground">{durationLabel}</p>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-foreground/90 max-lg:line-clamp-2">
        {model.summary}
      </p>

      {showExploring ? (
        <div className="mt-3 border-l border-border/50 pl-3 max-lg:mt-2 sm:pl-4">
          <ThoughtCollapsibleSection
            title={model.exploringSummary}
            open={exploringOpen}
            onToggle={() => setExploringOpen((open) => !open)}
          >
            <p className="text-sm leading-relaxed text-muted-foreground/75">
              {model.exploringNarrative}
            </p>

            <div className="space-y-0.5">
              {model.steps.map((step) => (
                <ThoughtActionRow key={step.id} step={step} />
              ))}
            </div>

            {isStreaming || model.footer ? (
              <div className="flex items-center gap-2 py-1 text-sm text-muted-foreground">
                {isStreaming && !hasResponseText ? (
                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
                ) : null}
                <span className="min-w-0 truncate">{model.footer}</span>
              </div>
            ) : null}
          </ThoughtCollapsibleSection>
        </div>
      ) : null}

      {model.showThinkingSection ? (
        <div className="mt-3 border-l border-border/50 pl-3 max-lg:mt-2 sm:pl-4">
          <ThoughtCollapsibleSection
            title="Thinking"
            open={thinkingOpen}
            onToggle={() => setThinkingOpen((open) => !open)}
          >
            <p className="text-sm leading-relaxed text-muted-foreground/75">
              {model.thinkingNarrative}
            </p>
            {hasResponseText && isStreaming ? (
              <div className="flex items-center gap-2 py-1 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
                <span>Drafting response</span>
              </div>
            ) : null}
          </ThoughtCollapsibleSection>
        </div>
      ) : null}
    </div>
  )
}
