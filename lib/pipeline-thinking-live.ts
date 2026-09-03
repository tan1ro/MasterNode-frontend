"use client"

import { useEffect, useRef, useState } from "react"
import {
  PIPELINE_THINKING_STEPS,
  PIPELINE_THINKING_STAGE,
} from "@/lib/pipeline-stage-activity"
import type { PlanTodoStatus } from "@/lib/pipeline-plan-parse"

export type LiveTimelineStep = {
  id: string
  title: string
  detail?: string
  status: PlanTodoStatus
  durationLabel: string
}

export function formatStepElapsed(ms: number): string {
  const seconds = Math.max(0, Math.floor(ms / 1000))
  return `${seconds}s`
}

/**
 * Advances through Master/Decompose thinking steps with a live per-step timer.
 * Active step counts up; completed steps keep their frozen duration.
 */
export function useLiveThinkingSteps(options?: {
  /** How long each step stays active before advancing (ms). */
  stepDurationMs?: number
  /** Tick resolution for the live counter (ms). */
  tickMs?: number
  enabled?: boolean
}): {
  steps: LiveTimelineStep[]
  activeIndex: number
  completedCount: number
  totalElapsedLabel: string
  remainingEtaLabel: string
  avgCompletedLabel: string
} {
  const stepCount = PIPELINE_THINKING_STEPS.length
  const stepDurationMs = options?.stepDurationMs ?? 2200
  const tickMs = options?.tickMs ?? 250
  const enabled = options?.enabled !== false

  const [activeIndex, setActiveIndex] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const mountAtRef = useRef(Date.now())
  const startedAtRef = useRef<number[]>([])
  const completedMsRef = useRef<(number | null)[]>([])

  useEffect(() => {
    if (!enabled) return
    const t0 = Date.now()
    mountAtRef.current = t0
    startedAtRef.current = Array.from({ length: stepCount }, (_, i) => (i === 0 ? t0 : 0))
    completedMsRef.current = Array.from({ length: stepCount }, () => null)
    setActiveIndex(0)
    setNow(t0)
  }, [enabled, stepCount])

  useEffect(() => {
    if (!enabled) return
    const id = window.setInterval(() => setNow(Date.now()), tickMs)
    return () => window.clearInterval(id)
  }, [enabled, tickMs])

  useEffect(() => {
    if (!enabled) return
    const id = window.setInterval(() => {
      setActiveIndex((prev) => {
        if (prev >= stepCount - 1) return prev
        const started = startedAtRef.current[prev] || Date.now()
        completedMsRef.current[prev] = Math.max(0, Date.now() - started)
        const next = prev + 1
        startedAtRef.current[next] = Date.now()
        return next
      })
      setNow(Date.now())
    }, stepDurationMs)
    return () => window.clearInterval(id)
  }, [enabled, stepCount, stepDurationMs])

  const steps: LiveTimelineStep[] = PIPELINE_THINKING_STEPS.map((step, index) => {
    let status: PlanTodoStatus
    let durationLabel: string
    if (index < activeIndex) {
      status = "completed"
      durationLabel = formatStepElapsed(completedMsRef.current[index] ?? stepDurationMs)
    } else if (index === activeIndex) {
      status = "in_progress"
      const started = startedAtRef.current[index] || mountAtRef.current
      durationLabel = formatStepElapsed(now - started)
    } else {
      status = "pending"
      durationLabel = "—"
    }
    return {
      id: step.id,
      title: step.title,
      detail: step.detail,
      status,
      durationLabel,
    }
  })

  const totalElapsedMs = Math.max(0, now - mountAtRef.current)
  const remainingMs = Math.max(0, stepCount * stepDurationMs - totalElapsedMs)
  const completedDurations = completedMsRef.current.filter(
    (ms): ms is number => typeof ms === "number"
  )
  const avgMs =
    completedDurations.length > 0
      ? completedDurations.reduce((sum, ms) => sum + ms, 0) / completedDurations.length
      : stepDurationMs

  return {
    steps,
    activeIndex,
    completedCount: activeIndex,
    totalElapsedLabel: formatStepElapsed(totalElapsedMs),
    remainingEtaLabel: `~ ${Math.max(1, Math.ceil(remainingMs / 1000))}s`,
    avgCompletedLabel:
      completedDurations.length > 0
        ? formatStepElapsed(avgMs)
        : PIPELINE_THINKING_STAGE.avgDurationLabel,
  }
}
