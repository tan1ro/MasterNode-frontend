"use client"

import { useEffect, useRef, useState } from "react"
import { Activity, Bot, Layers, Library, Sparkles, type LucideIcon } from "lucide-react"
import { HOME_CAPABILITIES } from "@/components/home/home-design-tokens"
import { HomePixelDecor } from "@/components/home/home-pixel-decor"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const ICONS: LucideIcon[] = [Bot, Sparkles, Library, Layers, Activity]
export const CAPABILITY_CARD_COUNT = HOME_CAPABILITIES.length
const STACK_PEEK_PX = 14
/** Extra scroll (vh) while pinned for each card hand-off. */
export const CAPABILITY_SCROLL_STEP_VH = 14
/** No tail — next section begins as soon as the last card stacks. */
export const CAPABILITY_SCROLL_TAIL_VH = 0

function homeLandingNavHeightPx() {
  if (typeof window === "undefined") return 56
  return (
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--home-landing-nav-height")
    ) || 56
  )
}

/** Scroll distance (px) consumed while cards 02–0n stack onto 01. */
export function capabilityAnimationDistancePx(
  viewport: number = typeof window !== "undefined" ? window.innerHeight : 800,
  cardCount: number = CAPABILITY_CARD_COUNT,
  stepVh: number = CAPABILITY_SCROLL_STEP_VH
) {
  return Math.max(0, cardCount - 1) * (stepVh / 100) * viewport
}

/** Pin block height + animation runway — ends when the last card stacks. */
export function capabilityScrollerHeightPx(
  pinHeightPx: number,
  viewport: number = typeof window !== "undefined" ? window.innerHeight : 800,
  cardCount: number = CAPABILITY_CARD_COUNT,
  stepVh: number = CAPABILITY_SCROLL_STEP_VH
) {
  return pinHeightPx + capabilityAnimationDistancePx(viewport, cardCount, stepVh)
}

/** @deprecated Fallback before pin height is measured. */
export function capabilityScrollHeightVh(cardCount: number = CAPABILITY_CARD_COUNT) {
  return 100 + Math.max(0, cardCount - 1) * CAPABILITY_SCROLL_STEP_VH + CAPABILITY_SCROLL_TAIL_VH
}

export function computeCapabilityStackProgress(scroller: HTMLElement): number {
  const rect = scroller.getBoundingClientRect()
  const pinOffset = homeLandingNavHeightPx()
  const animationDistance = capabilityAnimationDistancePx(window.innerHeight)
  return clamp((pinOffset - rect.top) / Math.max(animationDistance, 1), 0, 1)
}

export type CardMotion = {
  translateY: number
  scale: number
  opacity: number
  stackTop: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function cardMotion(progress: number, index: number, viewport: number): CardMotion {
  const stackTop = index * STACK_PEEK_PX

  if (index === 0) {
    return { translateY: 0, scale: 1, opacity: 1, stackTop: 0 }
  }

  const segments = CAPABILITY_CARD_COUNT - 1
  const segStart = (index - 1) / segments
  const segEnd = index / segments
  const slideEnd = segStart + (segEnd - segStart) * 0.88

  let local = 0
  if (progress >= slideEnd) {
    local = 1
  } else if (progress > segStart) {
    local = (progress - segStart) / (slideEnd - segStart)
  }

  const enterDistance = Math.min(viewport * 0.42, 360)
  return {
    translateY: (1 - local) * enterDistance,
    scale: 1,
    opacity: local <= 0 ? 0 : 1,
    stackTop,
  }
}

export function useCapabilityStackMotion(
  scrollerRef: React.RefObject<HTMLElement | null>,
  active: boolean = true
) {
  const reducedMotion = usePrefersReducedMotion()
  const [progress, setProgress] = useState(0)
  const [viewport, setViewport] = useState(0)

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller || !active) {
      setProgress(0)
      return
    }

    const update = () => {
      setViewport(window.innerHeight)
      if (reducedMotion) {
        setProgress(1)
        return
      }
      setProgress(computeCapabilityStackProgress(scroller))
    }

    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update, { passive: true })
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [scrollerRef, reducedMotion, active])

  const vh = viewport || (typeof window !== "undefined" ? window.innerHeight : 800)
  const motions = HOME_CAPABILITIES.map((_, index) =>
    reducedMotion
      ? { translateY: 0, scale: 1, opacity: 1, stackTop: index * STACK_PEEK_PX }
      : cardMotion(progress, index, vh)
  )

  return { progress, motions, reducedMotion }
}

function CapabilityCard({ index }: { index: number }) {
  const item = HOME_CAPABILITIES[index]
  const Icon = ICONS[index] ?? Activity
  const step = String(index + 1).padStart(2, "0")

  return (
    <article
      className="home-capability-card relative isolate overflow-hidden rounded-[1.25rem] border-2 sm:rounded-[2rem]"
      style={{ borderColor: item.border }}
    >
      <HomePixelDecor variant="capability" accentColor={item.accent} />

      <div className="relative z-10 flex h-full flex-col justify-start p-5 sm:p-7 lg:p-9">
        <div className="max-w-[40rem]">
          <div className="mb-3 flex items-center gap-3 sm:mb-4 sm:gap-4">
            <span
              className="font-heading text-xl font-semibold tabular-nums tracking-wide sm:text-3xl"
              style={{ color: item.accent }}
            >
              {step}
            </span>
            <Icon
              className="size-6 shrink-0 sm:size-8"
              style={{ color: item.accent }}
              strokeWidth={1.6}
              aria-hidden
            />
          </div>
          <h3 className="text-xl font-bold leading-tight text-foreground sm:text-2xl lg:text-3xl">
            {item.title}
          </h3>
          <p className="mt-2 text-[0.95rem] font-medium leading-relaxed text-foreground/90 sm:mt-3 sm:text-lg">
            {item.lead}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {item.body}
          </p>
          <p
            className="mt-3 max-w-xl border-l-2 pl-3 text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:pl-4 sm:text-[0.95rem]"
            style={{ borderColor: item.accent }}
          >
            <span
              className="mr-1.5 font-semibold tracking-wide"
              style={{ color: item.accent }}
            >
              Why it matters:
            </span>
            {item.why}
          </p>
        </div>
      </div>
    </article>
  )
}

export function HomeCapabilityStackStage({
  motions,
  className,
}: {
  motions: CardMotion[]
  className?: string
}) {
  return (
    <div
      className={cn("home-capability-stack-stage mx-auto w-full max-w-5xl", className)}
      style={{
        minHeight: `calc(var(--home-capability-card-height) + ${(CAPABILITY_CARD_COUNT - 1) * STACK_PEEK_PX}px)`,
      }}
    >
      {HOME_CAPABILITIES.map((item, index) => {
        const motion = motions[index]
        return (
          <div
            key={item.title}
            className="home-capability-stack-item"
            style={{
              top: motion.stackTop,
              zIndex: index + 1,
              opacity: motion.opacity,
              transform: `translate3d(0, ${motion.translateY}px, 0) scale(${motion.scale})`,
            }}
          >
            <CapabilityCard index={index} />
          </div>
        )
      })}
    </div>
  )
}
