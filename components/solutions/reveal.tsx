"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

type RevealDirection = "up" | "left" | "right" | "none"

const HIDDEN: Record<RevealDirection, string> = {
  up: "translate-y-8",
  left: "-translate-x-8",
  right: "translate-x-8",
  none: "",
}

/**
 * Fades + slides its children into view once they scroll into the viewport.
 * Respects `prefers-reduced-motion` (renders visible immediately).
 */
export function Reveal({
  children,
  className,
  direction = "up",
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode
  className?: string
  direction?: RevealDirection
  /** Stagger delay in ms. */
  delay?: number
  as?: "div" | "section" | "li" | "article"
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    if (reduce) {
      setShown(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const Component = Tag as "div"
  return (
    <Component
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        "transition-all duration-700 ease-out will-change-transform motion-reduce:transition-none",
        shown ? "translate-x-0 translate-y-0 opacity-100" : cn("opacity-0", HIDDEN[direction]),
        className
      )}
    >
      {children}
    </Component>
  )
}
