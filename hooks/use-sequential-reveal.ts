"use client"

import { useEffect, useRef, useState } from "react"

const REVEAL_STEP_MS = 300

/**
 * Steps through 0..maxStep when `enabled`, one index per tick (Claude-style stagger).
 * Returns maxStep immediately when `instant` is true.
 */
export function useSequentialReveal(
  maxStep: number,
  options: { enabled?: boolean; instant?: boolean; stepMs?: number } = {}
) {
  const { enabled = true, instant = false, stepMs = REVEAL_STEP_MS } = options
  const [step, setStep] = useState(instant ? maxStep : -1)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (instant) {
      setStep(maxStep)
      return
    }
    if (!enabled) {
      setStep(-1)
      return
    }

    setStep(0)
    timerRef.current = setInterval(() => {
      setStep((current) => {
        if (current >= maxStep) {
          if (timerRef.current) clearInterval(timerRef.current)
          return current
        }
        return current + 1
      })
    }, stepMs)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [enabled, instant, maxStep, stepMs])

  const isRevealed = (index: number) => step >= index

  return { step, isRevealed, done: step >= maxStep }
}
