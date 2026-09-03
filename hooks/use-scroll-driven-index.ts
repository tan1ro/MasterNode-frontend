"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

/**
 * Maps vertical scroll progress through a tall container to an active step index.
 * Framer-style sticky section scrollytelling.
 */
export function useScrollDrivenIndex(stepCount: number, stepVh = 55) {
  const containerRef = useRef<HTMLElement | null>(null)
  const reducedMotion = usePrefersReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  const scrollToIndex = useCallback(
    (index: number) => {
      const container = containerRef.current
      if (!container || stepCount <= 0) return

      const rect = container.getBoundingClientRect()
      const scrollTop = window.scrollY + rect.top
      const segment = (window.innerHeight * stepVh) / 100
      const target = scrollTop + index * segment + segment * 0.35

      window.scrollTo({ top: target, behavior: reducedMotion ? "auto" : "smooth" })
    },
    [reducedMotion, stepCount, stepVh]
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container || stepCount <= 0) return

    const update = () => {
      const rect = container.getBoundingClientRect()
      const segment = (window.innerHeight * stepVh) / 100
      const scrollable = segment * (stepCount - 1)

      if (scrollable <= 0) {
        setActiveIndex(0)
        setProgress(0)
        return
      }

      const scrolled = Math.min(Math.max(-rect.top, 0), scrollable)
      const ratio = scrolled / scrollable
      const index = Math.min(
        stepCount - 1,
        Math.max(0, Math.floor(ratio * stepCount))
      )

      setActiveIndex(index)
      setProgress(ratio)
    }

    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update, { passive: true })
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [stepCount, stepVh])

  return {
    containerRef,
    activeIndex: reducedMotion ? stepCount - 1 : activeIndex,
    progress: reducedMotion ? 1 : progress,
    reducedMotion,
    scrollToIndex,
    scrollHeightVh: stepCount * stepVh,
  }
}
