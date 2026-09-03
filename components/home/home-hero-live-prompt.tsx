"use client"

import { useEffect, useRef, useState } from "react"
import { HOME_HERO_PROMPTS } from "@/components/home/home-hero-prompts"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const PROMPT_COUNT = HOME_HERO_PROMPTS.length
const ROTATE_MS = 5500
const TYPE_MS = 22
const DEFAULT_INDEX = Math.max(
  0,
  HOME_HERO_PROMPTS.findIndex((item) => item.id === "student")
)

const PERSONA_TEXT: Record<string, string> = {
  "text-emerald": "text-[#00D27E]",
  "text-cyan": "text-[#00FFFE]",
  "text-amber": "text-[#FFA600]",
  "text-oc": "text-[#E8703A]",
  "text-violet": "text-[#8750CC]",
  "text-sky": "text-[#3B82F6]",
}

const PERSONA_DOT: Record<string, string> = {
  "text-emerald": "bg-[#00D27E]",
  "text-cyan": "bg-[#00FFFE]",
  "text-amber": "bg-[#FFA600]",
  "text-oc": "bg-[#E8703A]",
  "text-violet": "bg-[#8750CC]",
  "text-sky": "bg-[#3B82F6]",
}

export function HomeHeroLivePrompt({
  className,
  id = "home-hero-live-prompt",
}: {
  className?: string
  id?: string
}) {
  const reducedMotion = usePrefersReducedMotion()
  const [active, setActive] = useState(DEFAULT_INDEX)
  const [typed, setTyped] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const typeTimerRef = useRef<number | null>(null)

  const example = HOME_HERO_PROMPTS[active] ?? HOME_HERO_PROMPTS[DEFAULT_INDEX]
  const personaText = PERSONA_TEXT[example.accentText] ?? "text-[#00FFFE]"
  const personaDot = PERSONA_DOT[example.accentText] ?? "bg-[#00FFFE]"

  useEffect(() => {
    const full = example.prompt

    if (typeTimerRef.current !== null) {
      window.clearInterval(typeTimerRef.current)
      typeTimerRef.current = null
    }

    if (reducedMotion) {
      setTyped(full)
      setIsTyping(false)
      return
    }

    let index = 0
    setTyped("")
    setIsTyping(true)

    typeTimerRef.current = window.setInterval(() => {
      index += 1
      setTyped(full.slice(0, index))
      if (index >= full.length) {
        if (typeTimerRef.current !== null) {
          window.clearInterval(typeTimerRef.current)
          typeTimerRef.current = null
        }
        setIsTyping(false)
      }
    }, TYPE_MS)

    return () => {
      if (typeTimerRef.current !== null) {
        window.clearInterval(typeTimerRef.current)
        typeTimerRef.current = null
      }
    }
  }, [active, example.prompt, reducedMotion])

  useEffect(() => {
    if (reducedMotion) return

    const rotateTimer = window.setInterval(() => {
      setActive((prev) => (prev + 1) % PROMPT_COUNT)
    }, ROTATE_MS)

    return () => window.clearInterval(rotateTimer)
  }, [reducedMotion])

  return (
    <div className={cn("home-hero-live-prompt w-full min-w-0", className)}>
      <div className="home-hero-prompt-meta mb-2 flex items-center justify-between gap-3 sm:mb-3 sm:gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn("size-1.5 shrink-0 rounded-full", personaDot)}
            aria-hidden
          />
          <span
            className={cn(
              "truncate text-[11px] font-semibold uppercase tracking-[0.14em] sm:text-xs",
              personaText
            )}
          >
            {example.persona}
          </span>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 text-[11px] lowercase text-muted-foreground sm:text-xs">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#00D27E] opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-[#00D27E]" />
          </span>
          live
        </span>
      </div>

      <div
        id={id}
        className="home-hero-prompt-box w-full border border-border bg-card px-3.5 py-3 text-left sm:px-5 sm:py-[1.125rem] dark:border-white/[0.08] dark:bg-[#0a0b0d]"
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="min-h-[2.5rem] break-words text-left text-sm leading-[1.55] text-foreground sm:min-h-[3rem] sm:text-[0.9375rem] sm:leading-[1.65]">
          <span className="text-[#00FFFE]">&ldquo;</span>
          {typed}
          {isTyping ? (
            <span
              className="ml-0.5 inline-block h-4 w-px animate-pulse bg-[#FFA600] align-middle"
              aria-hidden
            />
          ) : null}
          {!isTyping && typed.length > 0 ? (
            <span className="text-[#00FFFE]">&rdquo;</span>
          ) : null}
        </p>
      </div>
    </div>
  )
}
