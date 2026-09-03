"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { HOME_SHELL } from "@/components/home/home-accent-styles"
import { HomeDesktopAppPreview } from "@/components/home/home-desktop-app-preview"
import { HomeDesktopDownloadCta } from "@/components/home/home-desktop-download-cta"
import {
  HomeSectionRevealItem,
  SECTION_REVEAL,
} from "@/components/home/home-section-reveal"
import { useHomeScrollReveal } from "@/hooks/use-home-scroll-reveal"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"

const SECTION_TITLE = "MasterNode on your laptop"
const SECTION_SUBTITLE =
  "The desktop app is the same MasterNode workspace as the website — chat, agents, and pipeline — with the same π mark, in a native window."

export function HomeDesktopAppSection({ className }: { className?: string }) {
  const { ref, visible } = useHomeScrollReveal(0.12)
  const reducedMotion = usePrefersReducedMotion()

  return (
    <section
      id="desktop"
      className={cn(
        "scroll-mt-[calc(var(--home-landing-nav-height)+1rem)] px-4 pb-10 sm:px-6 sm:pb-12 lg:px-10 lg:pb-14",
        className
      )}
      aria-labelledby="home-desktop-heading"
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
              className="home-section-badge home-section-badge--amber inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.08em]"
            >
              Desktop for laptop
            </HomeSectionRevealItem>

            <h2
              id="home-desktop-heading"
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
            <HomeDesktopAppPreview />
          </HomeSectionRevealItem>

          <HomeSectionRevealItem
            as="div"
            visible={visible}
            reducedMotion={reducedMotion}
            delayMs={SECTION_REVEAL.content + 80}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:mt-10"
          >
            <HomeDesktopDownloadCta className="home-cta-gradient inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold text-[#0D0D10] sm:px-6 sm:py-3" />
            <Link
              href={ROUTES.download}
              className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-[#F5A524]/50 dark:border-white/16 sm:px-6 sm:py-3"
            >
              All platforms
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </HomeSectionRevealItem>
        </div>
      </div>
    </section>
  )
}
