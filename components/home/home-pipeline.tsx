"use client"

import { HomePipelineWorkflow } from "@/components/home/home-pipeline-workflow"
import {
  HomeSectionRevealItem,
  sectionLineDelay,
} from "@/components/home/home-section-reveal"
import { useHomeScrollReveal } from "@/hooks/use-home-scroll-reveal"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const PIPELINE_LINE_ONE = "FIVE STAGES"
const PIPELINE_LINE_TWO = "ONE FLOW"

export function HomePipeline({ className }: { className?: string }) {
  const { ref, visible } = useHomeScrollReveal(0.12)
  const reducedMotion = usePrefersReducedMotion()

  return (
    <section
      id="pipeline"
      className={cn(
        "scroll-mt-28 px-4 pt-8 pb-8 sm:px-6 sm:pt-12 sm:pb-16 lg:px-10 lg:pt-20 lg:pb-24",
        className
      )}
      aria-labelledby="home-pipeline-heading"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div ref={ref as React.RefObject<HTMLDivElement>} className="home-pipeline-heading-wrap">
          <h2
            id="home-pipeline-heading"
            className="home-pipeline-section-title text-[clamp(1.85rem,8vw,6.5rem)] leading-none"
          >
            <HomeSectionRevealItem
              visible={visible}
              reducedMotion={reducedMotion}
              delayMs={sectionLineDelay(0)}
              className="block text-foreground"
            >
              {PIPELINE_LINE_ONE}
            </HomeSectionRevealItem>
            <HomeSectionRevealItem
              visible={visible}
              reducedMotion={reducedMotion}
              delayMs={sectionLineDelay(1)}
              className="block text-[#2DCFCF]"
            >
              {PIPELINE_LINE_TWO}
            </HomeSectionRevealItem>
          </h2>
        </div>

        <div className="mt-8 sm:mt-12 lg:mt-16">
          <HomePipelineWorkflow />
        </div>
      </div>
    </section>
  )
}
