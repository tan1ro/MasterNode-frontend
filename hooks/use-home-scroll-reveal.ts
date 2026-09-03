"use client"

import { useEffect, useRef, useState } from "react"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

export function useHomeScrollReveal(threshold = 0.12) {
  const ref = useRef<HTMLElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true)
      return
    }

    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry?.isIntersecting) return
        setVisible(true)
      },
      {
        threshold: [0, threshold],
        rootMargin: "0px 0px -10% 0px",
      }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [reducedMotion, threshold])

  return { ref, visible, reducedMotion }
}
