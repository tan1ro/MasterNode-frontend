"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

export type ScrollspyOptions = {
  count: number
  getHash?: (index: number) => string | null
  /** Only sync hash while the spy root is on screen */
  rootId?: string
  enabled?: boolean
}

function getScrollMarginTop(el: HTMLElement): number {
  const raw = getComputedStyle(el).scrollMarginTop
  const parsed = parseFloat(raw)
  return Number.isNaN(parsed) ? 0 : parsed
}

/**
 * Scrollspy driven by section position relative to viewport center (main page scroll).
 */
export function useScrollspy({
  count,
  getHash,
  rootId,
  enabled = true,
}: ScrollspyOptions) {
  const reducedMotion = usePrefersReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)
  const sentinelRefs = useRef<(HTMLElement | null)[]>([])
  const isScrollingToRef = useRef(false)
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef = useRef<number | null>(null)

  const setSentinelRef = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      sentinelRefs.current[index] = el
    },
    []
  )

  const resolveActiveIndex = useCallback(() => {
    if (count <= 0) return 0

    const nodes = sentinelRefs.current.slice(0, count).filter(Boolean) as HTMLElement[]
    if (nodes.length === 0) return 0

    const viewportCenter = window.innerHeight * 0.42
    let bestIdx = 0
    let bestDistance = Infinity

    nodes.forEach((node, idx) => {
      const rect = node.getBoundingClientRect()
      const sectionCenter = rect.top + rect.height / 2
      const distance = Math.abs(sectionCenter - viewportCenter)

      if (distance < bestDistance) {
        bestDistance = distance
        bestIdx = idx
      }
    })

    return bestIdx
  }, [count])

  const scrollToIndex = useCallback(
    (index: number) => {
      const el = sentinelRefs.current[index]
      if (!el || count <= 0) return

      isScrollingToRef.current = true
      if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current)

      const top =
        window.scrollY + el.getBoundingClientRect().top - getScrollMarginTop(el) - 96

      window.scrollTo({
        top: Math.max(0, top),
        behavior: reducedMotion ? "auto" : "smooth",
      })

      setActiveIndex(index)

      const hash = getHash?.(index)
      if (hash && typeof window !== "undefined") {
        window.history.replaceState(null, "", hash)
      }

      scrollEndTimerRef.current = setTimeout(
        () => {
          isScrollingToRef.current = false
        },
        reducedMotion ? 80 : 900
      )
    },
    [count, getHash, reducedMotion]
  )

  const updateActiveFromScroll = useCallback(() => {
    if (!enabled || count <= 0 || isScrollingToRef.current) return

    const next = resolveActiveIndex()
    setActiveIndex((prev) => (prev === next ? prev : next))
  }, [count, enabled, resolveActiveIndex])

  useEffect(() => {
    if (!enabled || count <= 0) return

    const onScrollOrResize = () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        updateActiveFromScroll()
      })
    }

    onScrollOrResize()
    window.addEventListener("scroll", onScrollOrResize, { passive: true })
    window.addEventListener("resize", onScrollOrResize, { passive: true })

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      window.removeEventListener("scroll", onScrollOrResize)
      window.removeEventListener("resize", onScrollOrResize)
    }
  }, [count, enabled, updateActiveFromScroll])

  useEffect(() => {
    if (!enabled || !getHash) return

    const root = rootId ? document.getElementById(rootId) : null
    if (root) {
      const rect = root.getBoundingClientRect()
      const inView = rect.bottom > 0 && rect.top < window.innerHeight
      if (!inView) return
    }

    const hash = getHash(activeIndex)
    if (!hash || typeof window === "undefined") return
    if (window.location.hash === hash) return
    window.history.replaceState(null, "", hash)
  }, [activeIndex, enabled, getHash, rootId])

  useEffect(() => {
    return () => {
      if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current)
    }
  }, [])

  return {
    activeIndex,
    setSentinelRef,
    scrollToIndex,
    reducedMotion,
  }
}
