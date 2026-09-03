"use client"

import { useEffect, useState } from "react"
import { Check, Loader2, Sparkles } from "lucide-react"
import type { SolutionAccent, SolutionDemo } from "@/constants/solutions"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const ACCENT: Record<SolutionAccent, { text: string; dot: string; ring: string; bar: string }> = {
  amber: { text: "text-amber", dot: "bg-amber", ring: "ring-amber/40", bar: "bg-amber" },
  cyan: { text: "text-cyan", dot: "bg-cyan", ring: "ring-cyan/40", bar: "bg-cyan" },
  violet: { text: "text-violet", dot: "bg-violet", ring: "ring-violet/40", bar: "bg-violet" },
  emerald: { text: "text-emerald", dot: "bg-emerald", ring: "ring-emerald/40", bar: "bg-emerald" },
  sky: { text: "text-sky", dot: "bg-sky", ring: "ring-sky/40", bar: "bg-sky" },
  oc: { text: "text-oc", dot: "bg-oc", ring: "ring-oc/40", bar: "bg-oc" },
}

const STEP_MS = 1100
const RESULT_HOLD_MS = 2600
const REDUCED_MOTION_ACTIVE = 2

/**
 * Looping visualization of a pipeline live run — stage chips, progress, agent steps, merged result.
 */
export function PipelineLiveRunDemo({
  demo,
  accent,
  className,
}: {
  demo: SolutionDemo
  accent: SolutionAccent
  className?: string
}) {
  const reducedMotion = usePrefersReducedMotion()
  const colors = ACCENT[accent]
  const total = demo.steps.length
  const [active, setActive] = useState(reducedMotion ? REDUCED_MOTION_ACTIVE : 0)

  useEffect(() => {
    if (reducedMotion) {
      setActive(REDUCED_MOTION_ACTIVE)
      return
    }

    const done = active >= total
    const delay = done ? RESULT_HOLD_MS : STEP_MS
    const timer = setTimeout(() => {
      setActive((prev) => (prev >= total ? 0 : prev + 1))
    }, delay)
    return () => clearTimeout(timer)
  }, [active, reducedMotion, total])

  const showResult = active >= total
  const progress = Math.min(active, total) / total

  return (
    <div
      className={cn(
        "pipeline-live-run-demo relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b12]/80 p-4 shadow-2xl backdrop-blur-sm sm:p-5 dark:border-white/10",
        "max-sm:rounded-xl max-sm:p-3.5",
        className
      )}
      aria-label="Pipeline mode live run preview"
    >
      <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(120%_80%_at_100%_0%,rgba(255,255,255,0.06),transparent_60%)]" />

      <div className="relative flex items-center gap-2 pb-3">
        <span className="size-2.5 rounded-full bg-red-400/70" aria-hidden />
        <span className="size-2.5 rounded-full bg-amber-400/70" aria-hidden />
        <span className="size-2.5 rounded-full bg-emerald-400/70" aria-hidden />
        <span className="ml-2 inline-flex items-center gap-1.5 text-xs font-medium text-white/60">
          <Sparkles className={cn("size-3.5", colors.text)} aria-hidden />
          MasterNode · live run
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-white/45">
          <span className={cn("size-1.5 rounded-full", colors.dot, !reducedMotion && "animate-pulse")} />
          {showResult ? "complete" : "running"}
        </span>
      </div>

      <div className="relative mb-3 flex flex-wrap gap-1.5">
        {demo.chips.map((chip, i) => {
          const reached = showResult || i <= active
          return (
            <span
              key={chip}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                reached
                  ? cn("border-white/20 bg-white/10", colors.text)
                  : "border-white/10 text-white/40"
              )}
            >
              {chip}
            </span>
          )
        })}
      </div>

      <p className="relative text-xs font-semibold text-white/80">{demo.taskTitle}</p>
      <p className="relative mt-1 line-clamp-3 rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-[11px] leading-relaxed text-white/55">
        {demo.prompt}
      </p>

      <div className="relative mt-3 h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn("h-full rounded-full transition-[width] duration-700 ease-out", colors.bar)}
          style={{ width: `${(showResult ? 1 : progress) * 100}%` }}
        />
      </div>

      <ul className="relative mt-3 space-y-1.5">
        {demo.steps.map((step, i) => {
          const isDone = showResult || i < active
          const isActive = !showResult && i === active
          return (
            <li
              key={step.agent}
              className={cn(
                "flex items-center gap-2.5 rounded-lg border px-2.5 py-2 transition-all",
                isActive
                  ? cn("border-white/20 bg-white/[0.06] ring-1", colors.ring)
                  : isDone
                    ? "border-white/10 bg-white/[0.03]"
                    : "border-white/5 opacity-45"
              )}
            >
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full",
                  isDone ? cn(colors.dot, "text-black") : "bg-white/10 text-white/60"
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
                <span className="block text-[11px] font-semibold text-white/85">{step.agent}</span>
                <span className="block truncate text-[11px] text-white/50">{step.detail}</span>
              </span>
            </li>
          )
        })}
      </ul>

      <div
        className={cn(
          "relative mt-3 overflow-hidden rounded-lg border p-3 transition-all duration-500",
          showResult
            ? cn("max-h-40 border-white/15 bg-white/[0.05] opacity-100")
            : "max-h-0 border-transparent p-0 opacity-0"
        )}
      >
        <p className={cn("flex items-center gap-1.5 text-[11px] font-semibold", colors.text)}>
          <Check className="size-3.5" aria-hidden />
          {demo.result.title}
        </p>
        <ul className="mt-1.5 space-y-1">
          {demo.result.lines.map((line) => (
            <li key={line} className="flex items-start gap-1.5 text-[11px] text-white/60">
              <span className={cn("mt-1 size-1 shrink-0 rounded-full", colors.dot)} />
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
