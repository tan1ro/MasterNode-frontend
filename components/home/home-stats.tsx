"use client"

import { HOME_STATS } from "@/components/home/home-design-tokens"
import { HomeAnimatedStatValue } from "@/components/home/home-animated-stat-value"
import { HOME_SHELL } from "@/components/home/home-accent-styles"
import {
  HomeSectionRevealItem,
  SECTION_REVEAL,
} from "@/components/home/home-section-reveal"
import { useHomeScrollReveal } from "@/hooks/use-home-scroll-reveal"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const STAT_STAGGER_MS = 380
const STATS_TITLE = "AI that scales with ambition."
const STATS_SUBTITLE =
  "From prototype to production — masternode handles the complexity."

export function HomeStats({ className }: { className?: string }) {
  const { ref: headerRef, visible: headerVisible } = useHomeScrollReveal(0.15)
  const { ref: statsRef, visible: statsVisible } = useHomeScrollReveal(0.2)
  const reducedMotion = usePrefersReducedMotion()

  return (
    <section className={cn("px-4 py-12 sm:px-6 sm:py-24 lg:px-10 lg:py-28", className)}>
      <div className={HOME_SHELL}>
        <div
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className="mx-auto max-w-5xl text-center"
        >
          <h2 className="text-2xl font-semibold leading-tight text-foreground sm:text-4xl lg:text-5xl">
            <HomeSectionRevealItem
              visible={headerVisible}
              reducedMotion={reducedMotion}
              delayMs={SECTION_REVEAL.firstLine}
              className="block"
            >
              {STATS_TITLE}
            </HomeSectionRevealItem>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
            <HomeSectionRevealItem
              visible={headerVisible}
              reducedMotion={reducedMotion}
              delayMs={SECTION_REVEAL.firstLine + SECTION_REVEAL.lineStagger}
              className="block"
            >
              {STATS_SUBTITLE}
            </HomeSectionRevealItem>
          </p>

          <HomeSectionRevealItem
            as="div"
            visible={headerVisible}
            reducedMotion={reducedMotion}
            delayMs={SECTION_REVEAL.divider}
            className="mx-auto mt-6 h-0.5 w-48 max-w-full bg-gradient-to-r from-transparent via-[#FFA600] to-transparent sm:mt-8 sm:w-64"
            aria-hidden
          />
        </div>

        <dl
          ref={statsRef as React.RefObject<HTMLDListElement>}
          className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-x-5 gap-y-8 sm:mt-16 sm:grid-cols-4 sm:gap-x-8 sm:gap-y-14"
        >
          {HOME_STATS.map((stat, index) => (
            <div key={stat.label} className="home-stat-item text-center">
              <dt className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl">
                <HomeAnimatedStatValue
                  value={stat.value}
                  accent={stat.accent}
                  active={statsVisible}
                  delayMs={index * STAT_STAGGER_MS}
                />
              </dt>
              <dd className="mt-2 text-[0.6875rem] uppercase tracking-wide text-muted-foreground sm:mt-3 sm:text-sm">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
