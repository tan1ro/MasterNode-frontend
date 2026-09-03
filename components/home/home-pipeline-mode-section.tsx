"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { HOME_SHELL } from "@/components/home/home-accent-styles"
import { PipelineModeIconGlow } from "@/components/chat/pipeline-mode-icon-glow"
import { ChatPipelinePanelDemo } from "@/components/pipeline/chat-pipeline-panel-demo"
import {
  HomeSectionRevealItem,
  SECTION_REVEAL,
} from "@/components/home/home-section-reveal"
import { useHomeScrollReveal } from "@/hooks/use-home-scroll-reveal"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"

const SECTION_TITLE = "Turn one prompt into a coordinated run"
const SECTION_SUBTITLE =
  "Pipeline mode splits complex work into parallel tracks, keeps agents in sync, and shows every stage live — just like in chat."

export function HomePipelineModeSection({
  className,
  ctaHref = ROUTES.signUp,
}: {
  className?: string
  ctaHref?: string
}) {
  const { ref, visible } = useHomeScrollReveal(0.12)
  const reducedMotion = usePrefersReducedMotion()

  return (
    <section
      id="pipeline-mode"
      className={cn(
        "home-pipeline-after-capabilities scroll-mt-[calc(var(--home-landing-nav-height)+1rem)] px-4 pb-10 sm:px-6 sm:pb-12 lg:px-10 lg:pb-14",
        className
      )}
      aria-labelledby="home-pipeline-mode-heading"
    >
      <div className={HOME_SHELL}>
        <div
          ref={ref as React.RefObject<HTMLDivElement>}
          className="mx-auto flex w-full max-w-[56rem] flex-col items-center"
        >
          <div className="flex w-full max-w-3xl flex-col items-center text-center">
            <HomeSectionRevealItem
              visible={visible}
              reducedMotion={reducedMotion}
              delayMs={0}
              className="home-section-badge home-section-badge--sky inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.08em]"
            >
              <PipelineModeIconGlow size="sm" surface="card" />
              Pipeline mode
            </HomeSectionRevealItem>

            <h2
              id="home-pipeline-mode-heading"
              className="mt-4 text-3xl font-bold leading-tight text-foreground sm:mt-5 sm:text-4xl"
            >
              <HomeSectionRevealItem
                visible={visible}
                reducedMotion={reducedMotion}
                delayMs={SECTION_REVEAL.firstLine}
                className="block"
              >
                {SECTION_TITLE}
              </HomeSectionRevealItem>
            </h2>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              <HomeSectionRevealItem
                visible={visible}
                reducedMotion={reducedMotion}
                delayMs={SECTION_REVEAL.firstLine + SECTION_REVEAL.lineStagger}
                className="block"
              >
                {SECTION_SUBTITLE}
              </HomeSectionRevealItem>
            </p>
          </div>

          <HomeSectionRevealItem
            as="div"
            visible={visible}
            reducedMotion={reducedMotion}
            delayMs={SECTION_REVEAL.content}
            className="mt-8 w-full sm:mt-10"
          >
            <ChatPipelinePanelDemo ctaHref={ctaHref} />
          </HomeSectionRevealItem>
        </div>

        <HomeSectionRevealItem
          visible={visible}
          reducedMotion={reducedMotion}
          delayMs={SECTION_REVEAL.content + 80}
          className="mt-8 flex justify-center sm:mt-10"
        >
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-[#38BDF8]/50 dark:border-white/16 sm:px-6 sm:py-3"
          >
            Try pipeline mode
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </HomeSectionRevealItem>
      </div>
    </section>
  )
}
