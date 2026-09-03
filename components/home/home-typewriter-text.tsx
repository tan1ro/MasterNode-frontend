"use client"

import { useEffect, useState } from "react"
import { useTypewriter, useTypewriterSequence } from "@/hooks/use-typewriter"
import { cn } from "@/lib/utils"

function TypewriterCaret({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "home-typewriter-caret ml-0.5 inline-block h-[0.9em] w-px translate-y-px animate-pulse bg-[#FFA600] align-middle",
        className
      )}
      aria-hidden
    />
  )
}

export function HomeTypewriterText({
  text,
  active = true,
  charMs = 30,
  startDelay = 0,
  className,
  showCaret = true,
  onComplete,
}: {
  text: string
  active?: boolean
  charMs?: number
  startDelay?: number
  className?: string
  showCaret?: boolean
  onComplete?: () => void
}) {
  const { displayed, done, isTyping } = useTypewriter(text, {
    active,
    charMs,
    startDelay,
  })

  useEffect(() => {
    if (done) onComplete?.()
  }, [done, onComplete])

  return (
    <span className={className} aria-label={text}>
      {displayed}
      {showCaret && isTyping ? <TypewriterCaret /> : null}
    </span>
  )
}

export function HomeTypewriterLines({
  lines,
  lineClassName,
  lineClassNames,
  className,
  active = true,
  charMs = 32,
  linePauseMs = 400,
  startDelay = 0,
  showCaret = true,
  onComplete,
}: {
  lines: readonly string[]
  lineClassName?: string
  lineClassNames?: readonly string[]
  className?: string
  active?: boolean
  charMs?: number
  linePauseMs?: number
  startDelay?: number
  showCaret?: boolean
  onComplete?: () => void
}) {
  const { outputs, done, isTyping, ariaLabel } = useTypewriterSequence(lines, {
    active,
    charMs,
    linePauseMs,
    startDelay,
  })

  useEffect(() => {
    if (done) onComplete?.()
  }, [done, onComplete])

  const content = outputs.map((line, index) => (
    <span
      key={`${index}-${lines[index]}`}
      className={lineClassNames?.[index] ?? lineClassName}
    >
      {line}
      {showCaret && isTyping && index === outputs.length - 1 ? (
        <TypewriterCaret />
      ) : null}
    </span>
  ))

  if (className) {
    return (
      <span className={className} aria-label={ariaLabel}>
        {content}
      </span>
    )
  }

  return <>{content}</>
}

/** Starts typing after mount — for above-the-fold hero copy on page load. */
export function HomeHeroTypewriterMount({
  children,
  delayMs = 120,
}: {
  children: (active: boolean) => React.ReactNode
  delayMs?: number
}) {
  const [active, setActive] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setActive(true), delayMs)
    return () => window.clearTimeout(id)
  }, [delayMs])

  return <>{children(active)}</>
}
