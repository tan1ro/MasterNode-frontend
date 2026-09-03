"use client"

import { useLayoutEffect, useRef, useState } from "react"
import { HOME_SHELL } from "@/components/home/home-accent-styles"
import {
  HomeCapabilityStackStage,
  capabilityScrollerHeightPx,
  capabilityScrollHeightVh,
  useCapabilityStackMotion,
} from "@/components/home/home-capability-stack"
import {
  HomeSectionRevealItem,
  SECTION_REVEAL,
} from "@/components/home/home-section-reveal"
import { useHomeScrollReveal } from "@/hooks/use-home-scroll-reveal"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const FEATURES_TITLE = "Everything you need to turn AI into real work."
const FEATURES_SUBTITLE =
  "Agents, expertise, memory and workflows — coordinated in one execution layer."

export function HomeFeatures({ className }: { className?: string }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const [scrollerHeightPx, setScrollerHeightPx] = useState<number | null>(null)
  const { ref: headerRevealRef, visible } = useHomeScrollReveal(0.08)
  const reducedMotion = usePrefersReducedMotion()
  const { motions } = useCapabilityStackMotion(scrollerRef, true)
  const scrollHeightFallbackVh = capabilityScrollHeightVh()

  useLayoutEffect(() => {
    if (reducedMotion) {
      setScrollerHeightPx(null)
      return
    }

    const pin = pinRef.current
    if (!pin) return

    const update = () => {
      setScrollerHeightPx(capabilityScrollerHeightPx(pin.offsetHeight))
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(pin)
    window.addEventListener("resize", update, { passive: true })
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", update)
    }
  }, [reducedMotion])

  return (
    <section
      id="capabilities"
      className={cn(
        "home-capabilities-section scroll-mt-[calc(var(--home-landing-nav-height)+1rem)]",
        className
      )}
    >
      <div
        ref={scrollerRef}
        className="home-capabilities-scroller"
        style={{
          height: reducedMotion
            ? undefined
            : scrollerHeightPx != null
              ? `${scrollerHeightPx}px`
              : `${scrollHeightFallbackVh}vh`,
        }}
      >
        <div ref={pinRef} className="home-capabilities-pin">
          <div className={cn(HOME_SHELL, "px-4 sm:px-6 lg:px-10")}>
            <div
              ref={headerRevealRef as React.RefObject<HTMLDivElement>}
              className="mx-auto flex max-w-3xl flex-col items-center text-center"
            >
              <HomeSectionRevealItem
                visible={visible}
                reducedMotion={reducedMotion}
                delayMs={0}
                className="home-section-badge inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.08em]"
              >
                <span
                  className="size-1.5 rounded-full bg-[#3B82F6] shadow-[0_0_8px_#3B82F6]"
                  aria-hidden
                />
                Platform Capabilities
              </HomeSectionRevealItem>

              <h2 className="mt-4 text-3xl font-bold leading-tight text-foreground sm:mt-5 sm:text-4xl">
                <HomeSectionRevealItem
                  visible={visible}
                  reducedMotion={reducedMotion}
                  delayMs={SECTION_REVEAL.firstLine}
                  className="block"
                >
                  {FEATURES_TITLE}
                </HomeSectionRevealItem>
              </h2>

              <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground sm:mt-4">
                <HomeSectionRevealItem
                  visible={visible}
                  reducedMotion={reducedMotion}
                  delayMs={SECTION_REVEAL.firstLine + SECTION_REVEAL.lineStagger}
                  className="block"
                >
                  {FEATURES_SUBTITLE}
                </HomeSectionRevealItem>
              </p>
            </div>

            <HomeCapabilityStackStage motions={motions} className="mt-5 sm:mt-6" />
          </div>
        </div>
      </div>
    </section>
  )
}
