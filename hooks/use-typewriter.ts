"use client"

import { useEffect, useState } from "react"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

type TypewriterOptions = {
  active?: boolean
  charMs?: number
  startDelay?: number
}

export function useTypewriter(
  text: string,
  { active = false, charMs = 30, startDelay = 0 }: TypewriterOptions = {}
) {
  const reducedMotion = usePrefersReducedMotion()
  const [displayed, setDisplayed] = useState(reducedMotion && active ? text : "")
  const [done, setDone] = useState(reducedMotion && active)

  useEffect(() => {
    if (!active) {
      setDisplayed("")
      setDone(false)
      return
    }

    if (reducedMotion) {
      setDisplayed(text)
      setDone(true)
      return
    }

    setDisplayed("")
    setDone(false)

    let index = 0
    let intervalId: number | undefined
    const delayId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        index += 1
        setDisplayed(text.slice(0, index))
        if (index >= text.length) {
          if (intervalId !== undefined) window.clearInterval(intervalId)
          setDone(true)
        }
      }, charMs)
    }, startDelay)

    return () => {
      window.clearTimeout(delayId)
      if (intervalId !== undefined) window.clearInterval(intervalId)
    }
  }, [active, charMs, reducedMotion, startDelay, text])

  return {
    displayed,
    done,
    isTyping: active && !done,
  }
}

type SequenceOptions = TypewriterOptions & {
  linePauseMs?: number
}

export function useTypewriterSequence(
  lines: readonly string[],
  { active = false, charMs = 30, linePauseMs = 360, startDelay = 0 }: SequenceOptions = {}
) {
  const reducedMotion = usePrefersReducedMotion()
  const joined = lines.join(" ")
  const [outputs, setOutputs] = useState<string[]>(() =>
    reducedMotion && active ? [...lines] : lines.map(() => "")
  )
  const [done, setDone] = useState(reducedMotion && active)

  useEffect(() => {
    if (!active) {
      setOutputs(lines.map(() => ""))
      setDone(false)
      return
    }

    if (reducedMotion) {
      setOutputs([...lines])
      setDone(true)
      return
    }

    setOutputs(lines.map(() => ""))
    setDone(false)

    let lineIndex = 0
    let charIndex = 0
    let timerId: number | undefined

    const tick = () => {
      if (lineIndex >= lines.length) {
        setDone(true)
        return
      }

      const line = lines[lineIndex] ?? ""
      charIndex += 1
      setOutputs((prev) => {
        const next = [...prev]
        next[lineIndex] = line.slice(0, charIndex)
        return next
      })

      if (charIndex >= line.length) {
        lineIndex += 1
        charIndex = 0
        timerId = window.setTimeout(tick, linePauseMs)
      } else {
        timerId = window.setTimeout(tick, charMs)
      }
    }

    timerId = window.setTimeout(tick, startDelay)

    return () => {
      if (timerId !== undefined) window.clearTimeout(timerId)
    }
  }, [active, charMs, linePauseMs, lines, reducedMotion, startDelay])

  return {
    outputs,
    done,
    isTyping: active && !done,
    ariaLabel: joined,
  }
}
