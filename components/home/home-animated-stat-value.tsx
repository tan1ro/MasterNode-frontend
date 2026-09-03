"use client"

import { useEffect, useMemo, useState } from "react"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const COUNT_DURATION_MS = 2800
const COUNT_START_RATIO = 0.68

type ParsedStat = {
  prefix: string
  suffix: string
  target: number
  decimals: number
}

function parseStatValue(value: string): ParsedStat {
  const match = value.match(/^([^0-9]*)([\d.]+)(.*)$/)
  if (!match) {
    return { prefix: "", suffix: "", target: 0, decimals: 0 }
  }

  const [, prefix, numStr, suffix] = match
  const decimals = numStr.includes(".") ? (numStr.split(".")[1]?.length ?? 0) : 0

  return {
    prefix,
    suffix,
    target: Number.parseFloat(numStr),
    decimals,
  }
}

function formatStatValue(current: number, parsed: ParsedStat): string {
  const { prefix, suffix, decimals } = parsed
  const formatted =
    decimals > 0 ? current.toFixed(decimals) : String(Math.round(current))
  return `${prefix}${formatted}${suffix}`
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

export function HomeAnimatedStatValue({
  value,
  accent,
  active,
  delayMs = 0,
  className,
}: {
  value: string
  accent: string
  active: boolean
  delayMs?: number
  className?: string
}) {
  const reducedMotion = usePrefersReducedMotion()
  const parsed = useMemo(() => parseStatValue(value), [value])
  const startDisplay = useMemo(
    () => formatStatValue(parsed.target * COUNT_START_RATIO, parsed),
    [parsed]
  )
  const [displayed, setDisplayed] = useState(reducedMotion ? value : startDisplay)
  const [progress, setProgress] = useState(reducedMotion ? 1 : 0)
  const [done, setDone] = useState(reducedMotion)

  useEffect(() => {
    if (!active) return

    if (reducedMotion) {
      setDisplayed(value)
      setProgress(1)
      setDone(true)
      return
    }

    setDisplayed(startDisplay)
    setProgress(0)
    setDone(false)

    let frameId = 0
    let delayTimer: number | undefined
    let startTime: number | null = null
    const from = parsed.target * COUNT_START_RATIO
    const to = parsed.target

    const tick = (now: number) => {
      if (startTime === null) startTime = now
      const elapsed = now - startTime
      const t = Math.min(elapsed / COUNT_DURATION_MS, 1)
      const eased = easeOutCubic(t)
      const current = from + (to - from) * eased

      setDisplayed(formatStatValue(current, parsed))
      setProgress(eased)

      if (t < 1) {
        frameId = window.requestAnimationFrame(tick)
      } else {
        setDisplayed(value)
        setProgress(1)
        setDone(true)
      }
    }

    delayTimer = window.setTimeout(() => {
      frameId = window.requestAnimationFrame(tick)
    }, delayMs)

    return () => {
      window.clearTimeout(delayTimer)
      window.cancelAnimationFrame(frameId)
    }
  }, [active, delayMs, parsed, reducedMotion, startDisplay, value])

  const scale = reducedMotion ? 1 : 0.9 + progress * 0.1

  return (
    <span
      className={cn(
        "home-stat-value inline-block origin-center leading-none tabular-nums",
        done && "home-stat-value--done",
        className
      )}
      style={{
        color: accent,
        transform: done ? undefined : `scale(${scale})`,
        ["--home-stat-glow" as string]: accent,
      }}
      aria-label={value}
    >
      {displayed}
    </span>
  )
}
