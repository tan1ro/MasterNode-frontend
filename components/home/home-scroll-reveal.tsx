"use client"

import { useHomeScrollReveal } from "@/hooks/use-home-scroll-reveal"
import { cn } from "@/lib/utils"

export function HomeScrollReveal({
  children,
  className,
  delayMs = 0,
}: {
  children: React.ReactNode
  className?: string
  delayMs?: number
}) {
  const { ref, visible } = useHomeScrollReveal()

  return (
    <div
      ref={ref}
      className={cn(
        "home-scroll-reveal",
        visible && "home-scroll-reveal--visible",
        className
      )}
      style={{ transitionDelay: visible ? `${delayMs}ms` : "0ms" }}
    >
      {children}
    </div>
  )
}

export function HomeScrollRevealStagger({
  children,
  className,
  staggerMs = 80,
}: {
  children: React.ReactNode
  className?: string
  staggerMs?: number
}) {
  const { ref, visible } = useHomeScrollReveal(0.08)

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={className}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <div
              key={index}
              className={cn(
                "home-scroll-reveal",
                visible && "home-scroll-reveal--visible"
              )}
              style={{
                transitionDelay: visible ? `${index * staggerMs}ms` : "0ms",
              }}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  )
}
