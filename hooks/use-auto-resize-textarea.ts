"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { CHAT_COMPOSER_MAX_HEIGHT_PX } from "@/constants/chat-layout"

/** Matches compact composer row: `h-9` / `leading-9`. */
const SINGLE_LINE_HEIGHT_PX = 36

function measureTextarea(el: HTMLTextAreaElement, maxHeightPx: number) {
  el.style.height = "auto"
  const style = window.getComputedStyle(el)
  const paddingY =
    parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
  const contentHeight = Math.max(0, el.scrollHeight - paddingY)
  const scrollable = el.scrollHeight > maxHeightPx
  const multiline =
    el.value.includes("\n") || contentHeight > SINGLE_LINE_HEIGHT_PX
  const next = multiline
    ? Math.min(el.scrollHeight, maxHeightPx)
    : SINGLE_LINE_HEIGHT_PX

  return { multiline, scrollable, next }
}

export function useAutoResizeTextarea(
  value: string,
  maxHeightPx = CHAT_COMPOSER_MAX_HEIGHT_PX
) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [isScrollable, setIsScrollable] = useState(false)
  const [isMultiline, setIsMultiline] = useState(false)

  const resize = useCallback(() => {
    const el = ref.current
    if (!el) return

    if (!el.value.trim()) {
      el.style.height = `${SINGLE_LINE_HEIGHT_PX}px`
      el.style.overflowY = "hidden"
      setIsScrollable((prev) => (prev ? false : prev))
      setIsMultiline((prev) => (prev ? false : prev))
      return
    }

    const { multiline, scrollable, next } = measureTextarea(el, maxHeightPx)
    el.style.height = `${next}px`
    el.style.overflowY = scrollable ? "auto" : "hidden"
    setIsScrollable((prev) => (prev === scrollable ? prev : scrollable))
    setIsMultiline((prev) => (prev === multiline ? prev : multiline))
  }, [maxHeightPx])

  useEffect(() => {
    resize()
  }, [value, resize])

  return { ref, resize, isScrollable, isMultiline }
}
