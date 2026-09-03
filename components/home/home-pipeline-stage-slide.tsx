"use client"

import { useHomeScrollReveal } from "@/hooks/use-home-scroll-reveal"
import { cn } from "@/lib/utils"

export function HomePipelineStageSlide({
  from,
  children,
  className,
  delayMs = 0,
}: {
  from: "left" | "right"
  children: React.ReactNode
  className?: string
  delayMs?: number
}) {
  const { ref, visible, reducedMotion } = useHomeScrollReveal(0.14)

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn(
        reducedMotion
          ? "opacity-100"
          : cn(
              "home-pipeline-stage-slide",
              from === "left"
                ? "home-pipeline-stage-slide--from-left"
                : "home-pipeline-stage-slide--from-right",
              visible && "home-pipeline-stage-slide--visible"
            ),
        className
      )}
      style={
        visible && !reducedMotion && delayMs > 0
          ? { transitionDelay: `${delayMs}ms` }
          : undefined
      }
    >
      {children}
    </div>
  )
}
