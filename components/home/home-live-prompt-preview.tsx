"use client"

import { useCallback, useEffect, useState } from "react"
import { HOME_HERO_PROMPTS } from "@/components/home/home-hero-prompts"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const PROMPT_COUNT = HOME_HERO_PROMPTS.length
const ROTATE_MS = 5500
const TYPE_MS = 22

export function HomeLivePromptPreview({
  className,
  id,
}: {
  className?: string
  id?: string
}) {
  const reducedMotion = usePrefersReducedMotion()
  const [active, setActive] = useState(0)
  const [typed, setTyped] = useState("")
  const [isTyping, setIsTyping] = useState(true)

  const example = HOME_HERO_PROMPTS[active] ?? HOME_HERO_PROMPTS[0]

  const goTo = useCallback((index: number) => {
    setActive((index + PROMPT_COUNT) % PROMPT_COUNT)
  }, [])

  useEffect(() => {
    const full = example.prompt
    if (reducedMotion) {
      setTyped(full)
      setIsTyping(false)
      return
    }

    let index = 0
    setTyped("")
    setIsTyping(true)

    const typeTimer = window.setInterval(() => {
      index += 1
      setTyped(full.slice(0, index))
      if (index >= full.length) {
        window.clearInterval(typeTimer)
        setIsTyping(false)
      }
    }, TYPE_MS)

    return () => window.clearInterval(typeTimer)
  }, [active, example.prompt, reducedMotion])

  useEffect(() => {
    if (reducedMotion) return

    const rotateTimer = window.setInterval(() => {
      setActive((prev) => (prev + 1) % PROMPT_COUNT)
    }, ROTATE_MS)

    return () => window.clearInterval(rotateTimer)
  }, [reducedMotion])

  return (
    <div
      className={cn(
        "relative z-10 shrink-0 border-t border-border/50 bg-background/50 px-4 py-3 backdrop-blur-sm sm:px-5 sm:py-4",
        className
      )}
    >
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn("size-1.5 shrink-0 rounded-full", example.accentDot)}
            aria-hidden
          />
          <span
            className={cn(
              "truncate font-mono text-[10px] font-medium uppercase tracking-wider sm:text-[11px]",
              example.accentText
            )}
          >
            {example.persona}
          </span>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald" />
          </span>
          live
        </span>
      </div>

      <div
        id={id}
        className="rounded-xl border border-border/60 bg-background/80 px-3.5 py-3 sm:px-4 sm:py-3.5"
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="min-h-[4.5rem] text-sm leading-relaxed text-foreground sm:min-h-[4rem] sm:text-[15px] sm:leading-relaxed">
          <span className="font-mono text-cyan/90">&ldquo;</span>
          {typed}
          {isTyping ? (
            <span
              className="ml-0.5 inline-block h-4 w-px animate-pulse bg-amber align-middle"
              aria-hidden
            />
          ) : null}
          {!isTyping && typed.length > 0 ? (
            <span className="font-mono text-cyan/90">&rdquo;</span>
          ) : null}
        </p>
      </div>

      <div
        className="mt-3 flex gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Example prompts by role"
      >
        {HOME_HERO_PROMPTS.map((item, idx) => {
          const isActive = idx === active
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="hero-live-prompt"
              onClick={() => goTo(idx)}
              className={cn(
                "shrink-0 rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-wide transition-colors sm:text-[10px]",
                isActive
                  ? cn("border-border/80 bg-background", item.accentText)
                  : "border-transparent text-muted-foreground/50 hover:border-border/40 hover:text-muted-foreground"
              )}
            >
              {item.persona}
            </button>
          )
        })}
      </div>
    </div>
  )
}
