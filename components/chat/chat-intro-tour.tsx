"use client"

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { useAppShell } from "@/components/layout/app-shell-context"
import type { ChatTourPlacement, ChatTourStep } from "@/lib/chat-intro-tour"
import {
  CHAT_TOUR_DESKTOP_MQ,
  CHAT_TOUR_MENU_EVENT,
  CHAT_TOUR_SIDEBAR_SETTLE_MS,
  getChatTourSteps,
  resolveChatTourSteps,
} from "@/lib/chat-intro-tour"
import { cn } from "@/lib/utils"
import "./chat-intro-tour.css"

const SPOTLIGHT_PAD = 8
const CARD_GAP = 14
const VIEWPORT_PAD = 16
const MOBILE_VIEWPORT_PAD = 12

type Rect = {
  top: number
  left: number
  width: number
  height: number
}

function readIsDesktop(): boolean {
  if (typeof window === "undefined") return true
  return window.matchMedia(CHAT_TOUR_DESKTOP_MQ).matches
}

function useTourDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(readIsDesktop)
  useEffect(() => {
    const mq = window.matchMedia(CHAT_TOUR_DESKTOP_MQ)
    const sync = () => setIsDesktop(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])
  return isDesktop
}

function rectFromDomRect(box: DOMRect): Rect {
  return { top: box.top, left: box.left, width: box.width, height: box.height }
}

function mergeRects(a: Rect, b: Rect): Rect {
  const top = Math.min(a.top, b.top)
  const left = Math.min(a.left, b.left)
  const right = Math.max(a.left + a.width, b.left + b.width)
  const bottom = Math.max(a.top + a.height, b.top + b.height)
  return { top, left, width: right - left, height: bottom - top }
}

function readElementRect(element: HTMLElement): Rect | null {
  const own = element.getBoundingClientRect()
  if (own.width > 0 && own.height > 0) return rectFromDomRect(own)

  let union: Rect | null = null
  element.querySelectorAll("a, button").forEach((node) => {
    if (!(node instanceof HTMLElement)) return
    const box = node.getBoundingClientRect()
    if (box.width <= 0 || box.height <= 0) return
    const rect = rectFromDomRect(box)
    union = union ? mergeRects(union, rect) : rect
  })
  return union
}

function readTargetRect(selector: string | undefined): Rect | null {
  if (!selector || typeof document === "undefined") return null
  const element = document.querySelector(selector)
  if (!(element instanceof HTMLElement)) return null
  return readElementRect(element)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function spotlightStyle(rect: Rect | null): React.CSSProperties | undefined {
  if (!rect) return undefined
  return {
    top: rect.top - SPOTLIGHT_PAD,
    left: rect.left - SPOTLIGHT_PAD,
    width: rect.width + SPOTLIGHT_PAD * 2,
    height: rect.height + SPOTLIGHT_PAD * 2,
  }
}

function effectivePlacement(
  placement: ChatTourPlacement,
  isDesktop: boolean,
  target: Rect | null,
  options?: { openComposerMenu?: boolean; needsSidebar?: boolean }
): ChatTourPlacement {
  const { openComposerMenu, needsSidebar } = options ?? {}
  // Composer menu opens upward — keep the tour card centered so it stays readable.
  if (openComposerMenu) return "center"
  // On mobile, park the card at the bottom while the sidebar drawer is open.
  if (!isDesktop && needsSidebar) return "bottom"
  if (isDesktop || placement !== "right") return placement
  // Tall drawer targets (whole sidebar) — center the tip instead of pinning above.
  if (target && target.height > window.innerHeight * 0.45) return "center"
  return "top"
}

function cardStyle(
  placement: ChatTourPlacement,
  target: Rect | null,
  cardSize: { width: number; height: number },
  isDesktop: boolean,
  options?: { openComposerMenu?: boolean; needsSidebar?: boolean }
): React.CSSProperties {
  const pad = isDesktop ? VIEWPORT_PAD : MOBILE_VIEWPORT_PAD
  const resolved = effectivePlacement(placement, isDesktop, target, options)

  if (resolved === "center" || !target) {
    return {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    }
  }

  if (resolved === "bottom") {
    return {
      bottom: pad,
      left: "50%",
      transform: "translateX(-50%)",
    }
  }

  const { width: cardW, height: cardH } = cardSize
  const maxTop = Math.max(pad, window.innerHeight - cardH - pad)
  const maxLeft = Math.max(pad, window.innerWidth - cardW - pad)

  if (resolved === "right") {
    const preferredLeft = target.left + target.width + SPOTLIGHT_PAD * 2 + CARD_GAP
    const left =
      preferredLeft + cardW <= window.innerWidth - pad
        ? preferredLeft
        : clamp(target.left - cardW - CARD_GAP, pad, maxLeft)

    return {
      top: clamp(target.top + target.height / 2 - cardH / 2, pad, maxTop),
      left,
    }
  }

  const spaceAbove = target.top - pad
  const spaceBelow = window.innerHeight - (target.top + target.height) - pad
  const need = cardH + CARD_GAP

  let top: number
  if (need <= spaceAbove) {
    top = target.top - cardH - CARD_GAP
  } else if (need <= spaceBelow) {
    top = target.top + target.height + CARD_GAP
  } else if (spaceAbove >= spaceBelow) {
    // Prefer keeping the spotlight visible — pin card to the top of free space.
    top = pad
  } else {
    top = clamp(target.top + target.height + CARD_GAP, pad, maxTop)
  }

  return {
    top: clamp(top, pad, maxTop),
    left: clamp(target.left + target.width / 2 - cardW / 2, pad, maxLeft),
  }
}

function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="mn-chat-tour__dots" aria-hidden>
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={cn("mn-chat-tour__dot", index === current && "mn-chat-tour__dot--active")}
        />
      ))}
    </div>
  )
}

export function ChatIntroTour({
  displayName,
  onComplete,
  onExit,
}: {
  displayName?: string | null
  onComplete: () => void
  onExit: () => void
}) {
  const steps = useMemo(() => getChatTourSteps(displayName), [displayName])
  const [resolvedSteps, setResolvedSteps] = useState(steps)
  const [stepIndex, setStepIndex] = useState(0)
  const [targetRect, setTargetRect] = useState<Rect | null>(null)
  const [cardSize, setCardSize] = useState({ width: 320, height: 200 })
  const cardRef = useRef<HTMLDivElement>(null)
  const { setSidebarOpen, sidebarOpen } = useAppShell()
  const isDesktop = useTourDesktop()

  const step: ChatTourStep | undefined = resolvedSteps[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex >= resolvedSteps.length - 1

  useEffect(() => {
    const refresh = () => setResolvedSteps(resolveChatTourSteps(displayName))
    refresh()
    const id = window.setTimeout(refresh, 500)
    return () => window.clearTimeout(id)
  }, [displayName])

  useEffect(() => {
    if (stepIndex >= resolvedSteps.length && resolvedSteps.length > 0) {
      setStepIndex(Math.max(0, resolvedSteps.length - 1))
    }
  }, [resolvedSteps.length, stepIndex])

  const syncTarget = useCallback(() => {
    if (!isDesktop && step?.needsSidebar && !sidebarOpen) {
      setTargetRect(null)
      return
    }
    const spotlight = step?.spotlightTarget ? readTargetRect(step.spotlightTarget) : null
    setTargetRect(spotlight ?? readTargetRect(step?.target))
  }, [isDesktop, sidebarOpen, step?.needsSidebar, step?.spotlightTarget, step?.target])

  // Auto open/close the mobile drawer; keep desktop sidebar expanded for nav steps.
  useLayoutEffect(() => {
    if (!step) return
    if (isDesktop) {
      setSidebarOpen(true)
      return
    }
    setSidebarOpen(Boolean(step.needsSidebar))
  }, [isDesktop, setSidebarOpen, step?.id, step?.needsSidebar])

  useLayoutEffect(() => {
    syncTarget()
    const card = cardRef.current
    if (!card) return
    const measure = () => {
      setCardSize({ width: card.offsetWidth, height: card.offsetHeight })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(card)
    return () => observer.disconnect()
  }, [stepIndex, step?.id, syncTarget])

  useEffect(() => {
    if (!step) return
    if (!isDesktop && step.needsSidebar && !sidebarOpen) return

    syncTarget()
    const target = step.target
      ? (document.querySelector(step.target) as HTMLElement | null)
      : null
    target?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" })

    const timers = CHAT_TOUR_SIDEBAR_SETTLE_MS.map((ms) => window.setTimeout(syncTarget, ms))

    window.addEventListener("resize", syncTarget)
    window.addEventListener("scroll", syncTarget, true)
    return () => {
      timers.forEach((id) => window.clearTimeout(id))
      window.removeEventListener("resize", syncTarget)
      window.removeEventListener("scroll", syncTarget, true)
    }
  }, [isDesktop, sidebarOpen, step?.needsSidebar, step?.target, stepIndex, syncTarget])

  useEffect(() => {
    const sidebarStep = Boolean(step?.needsSidebar && !isDesktop)
    document.body.classList.toggle("mn-chat-tour-sidebar-step", sidebarStep)
    return () => document.body.classList.remove("mn-chat-tour-sidebar-step")
  }, [isDesktop, step?.id, step?.needsSidebar])

  useEffect(() => {
    if (!step?.openComposerMenu) return
    window.dispatchEvent(new CustomEvent(CHAT_TOUR_MENU_EVENT, { detail: { open: true } }))
    let frame = 0
    let raf = requestAnimationFrame(function tick() {
      syncTarget()
      frame += 1
      if (frame < 40) raf = requestAnimationFrame(tick)
    })
    return () => {
      cancelAnimationFrame(raf)
      window.dispatchEvent(new CustomEvent(CHAT_TOUR_MENU_EVENT, { detail: { open: false } }))
    }
  }, [step?.openComposerMenu, step?.id, syncTarget])

  useEffect(() => {
    document.body.classList.add("mn-chat-tour-open")
    return () => document.body.classList.remove("mn-chat-tour-open")
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        onExit()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onExit])

  if (!step || resolvedSteps.length === 0) return null

  const placementOptions = {
    openComposerMenu: step.openComposerMenu,
    needsSidebar: step.needsSidebar,
  }
  const placement = effectivePlacement(
    step.placement,
    isDesktop,
    targetRect,
    placementOptions
  )
  const showSpotlight = Boolean(step.target && targetRect)

  const content = (
    <div className="mn-chat-tour" role="dialog" aria-modal="true" aria-labelledby="mn-chat-tour-title">
      {showSpotlight && targetRect ? (
        <div className="mn-chat-tour__spotlight" style={spotlightStyle(targetRect)} />
      ) : (
        <button
          type="button"
          className="mn-chat-tour__backdrop"
          aria-label="Close tour"
          onClick={onExit}
        />
      )}

      <div
        ref={cardRef}
        className={cn(
          "mn-chat-tour__card",
          !isDesktop && "mn-chat-tour__card--mobile",
          placement === "center" && "mn-chat-tour__card--center",
          placement === "bottom" && "mn-chat-tour__card--bottom"
        )}
        style={{
          ...cardStyle(step.placement, targetRect, cardSize, isDesktop, placementOptions),
          zIndex: 100003,
        }}
      >
        <div className="mn-chat-tour__card-header">
          <p className="mn-chat-tour__step-label">
            Step {stepIndex + 1} of {resolvedSteps.length}
          </p>
          <button type="button" className="mn-chat-tour__skip" onClick={onExit}>
            Skip tour
          </button>
        </div>

        <h2 id="mn-chat-tour-title" className="mn-chat-tour__title">
          {step.title}
        </h2>
        <p className="mn-chat-tour__description">{step.description}</p>

        <StepDots total={resolvedSteps.length} current={stepIndex} />

        <div className="mn-chat-tour__actions">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isFirst}
            onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
          >
            Back
          </Button>
          <Button
            type="button"
            size="sm"
            className="mn-chat-tour__next"
            onClick={() => {
              if (isLast) {
                onComplete()
                return
              }
              setStepIndex((index) => Math.min(resolvedSteps.length - 1, index + 1))
            }}
          >
            {isLast ? "Start chatting" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  )

  if (typeof document === "undefined") return null
  return createPortal(content, document.body)
}
