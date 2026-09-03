"use client"

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react"

const DEFAULT_MIN_WIDTH = 320
const DEFAULT_MIN_COMPANION = 360

export function clampSidePanelWidth(
  next: number,
  {
    minWidth,
    minCompanionWidth,
    viewportWidth,
    maxViewportRatio,
  }: {
    minWidth: number
    minCompanionWidth: number
    viewportWidth: number
    maxViewportRatio?: number
  }
): number {
  const byCompanion = viewportWidth - minCompanionWidth
  const byRatio =
    maxViewportRatio != null && maxViewportRatio > 0 && maxViewportRatio < 1
      ? Math.round(viewportWidth * maxViewportRatio)
      : Number.POSITIVE_INFINITY
  const max = Math.max(minWidth, Math.min(byCompanion, byRatio))
  return Math.min(max, Math.max(minWidth, Math.round(next)))
}

export function useResizableSidePanelWidth({
  storageKey,
  defaultWidth,
  minWidth = DEFAULT_MIN_WIDTH,
  minCompanionWidth = DEFAULT_MIN_COMPANION,
  maxViewportRatio,
  defaultViewportRatio,
}: {
  storageKey: string
  defaultWidth: number
  minWidth?: number
  minCompanionWidth?: number
  /** Cap panel width as a fraction of the viewport (e.g. 0.5 = Claude-style half screen). */
  maxViewportRatio?: number
  /** When no stored width exists, open at this fraction of the viewport. */
  defaultViewportRatio?: number
}) {
  const [width, setWidth] = useState(defaultWidth)
  const [isDragging, setIsDragging] = useState(false)
  const widthRef = useRef(width)
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null)

  widthRef.current = width

  const clampWidth = useCallback(
    (next: number) => {
      if (typeof window === "undefined") {
        return Math.max(minWidth, next)
      }
      return clampSidePanelWidth(next, {
        minWidth,
        minCompanionWidth,
        viewportWidth: window.innerWidth,
        maxViewportRatio,
      })
    },
    [minWidth, minCompanionWidth, maxViewportRatio]
  )

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (!raw) {
        const initial =
          defaultViewportRatio != null && defaultViewportRatio > 0
            ? window.innerWidth * defaultViewportRatio
            : defaultWidth
        setWidth(clampWidth(initial))
        return
      }
      const parsed = Number(raw)
      if (Number.isFinite(parsed)) {
        setWidth(clampWidth(parsed))
      }
    } catch {
      setWidth(clampWidth(defaultWidth))
    }
  }, [storageKey, defaultWidth, defaultViewportRatio, clampWidth])

  useEffect(() => {
    const onResize = () => setWidth((w) => clampWidth(w))
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [clampWidth])

  useEffect(() => {
    if (!isDragging) return
    const previousCursor = document.body.style.cursor
    const previousUserSelect = document.body.style.userSelect
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
    return () => {
      document.body.style.cursor = previousCursor
      document.body.style.userSelect = previousUserSelect
    }
  }, [isDragging])

  const persist = useCallback(() => {
    try {
      window.localStorage.setItem(storageKey, String(widthRef.current))
    } catch {
      // ignore quota / private mode
    }
  }, [storageKey])

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.button !== 0) return
      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)
      dragRef.current = { startX: event.clientX, startWidth: widthRef.current }
      setIsDragging(true)
    },
    []
  )

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!dragRef.current) return
      const delta = dragRef.current.startX - event.clientX
      setWidth(clampWidth(dragRef.current.startWidth + delta))
    },
    [clampWidth]
  )

  const onPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!dragRef.current) return
      dragRef.current = null
      setIsDragging(false)
      persist()
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }
    },
    [persist]
  )

  const nudgeWidth = useCallback(
    (delta: number) => {
      setWidth((w) => {
        const next = clampWidth(w + delta)
        widthRef.current = next
        try {
          window.localStorage.setItem(storageKey, String(next))
        } catch {
          // ignore
        }
        return next
      })
    },
    [clampWidth, storageKey]
  )

  return {
    width,
    isDragging,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    nudgeWidth,
  }
}
