"use client"

import { useEffect, useState, type CSSProperties, type RefObject } from "react"

interface MenuPositionOptions {
  /** Gap between trigger and menu (px). */
  gap?: number
  /** Horizontal inset from trigger edges (px). */
  insetX?: number
  /** Place menu above trigger (default) or below. */
  placement?: "above" | "below"
}

export function useSidebarMenuPosition(
  triggerRef: RefObject<HTMLElement | null>,
  open: boolean,
  options: MenuPositionOptions = {}
): CSSProperties | null {
  const { gap = 8, insetX = 8, placement = "above" } = options
  const [style, setStyle] = useState<CSSProperties | null>(null)

  useEffect(() => {
    if (!open || !triggerRef.current) {
      setStyle(null)
      return
    }

    const update = () => {
      const el = triggerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const width = Math.max(rect.width - insetX * 2, 200)

      if (placement === "above") {
        setStyle({
          position: "fixed",
          left: rect.left + insetX,
          width,
          bottom: window.innerHeight - rect.top + gap,
          zIndex: 200,
        })
        return
      }

      setStyle({
        position: "fixed",
        left: rect.left + insetX,
        width,
        top: rect.bottom + gap,
        zIndex: 200,
      })
    }

    update()
    window.addEventListener("resize", update)
    window.addEventListener("scroll", update, true)
    return () => {
      window.removeEventListener("resize", update)
      window.removeEventListener("scroll", update, true)
    }
  }, [open, triggerRef, gap, insetX, placement])

  return style
}

/** Fixed position for rail avatar menu (opens to the right of trigger). */
export function useRailMenuPosition(
  triggerRef: RefObject<HTMLElement | null>,
  open: boolean,
  gap = 8
): CSSProperties | null {
  const [style, setStyle] = useState<CSSProperties | null>(null)

  useEffect(() => {
    if (!open || !triggerRef.current) {
      setStyle(null)
      return
    }

    const update = () => {
      const el = triggerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      setStyle({
        position: "fixed",
        left: rect.right + gap,
        bottom: window.innerHeight - rect.bottom,
        minWidth: "15rem",
        zIndex: 200,
      })
    }

    update()
    window.addEventListener("resize", update)
    window.addEventListener("scroll", update, true)
    return () => {
      window.removeEventListener("resize", update)
      window.removeEventListener("scroll", update, true)
    }
  }, [open, triggerRef, gap])

  return style
}

interface FlyoutMenuPositionOptions {
  gap?: number
  minWidth?: number
  viewportPadding?: number
}

/** Fixed flyout to the right of a menu row; grows upward (drop-up) from the trigger bottom. */
export function useFlyoutMenuPosition(
  triggerRef: RefObject<HTMLElement | null>,
  open: boolean,
  options: FlyoutMenuPositionOptions = {}
): CSSProperties | null {
  const { gap = 4, minWidth = 232, viewportPadding = 8 } = options
  const [style, setStyle] = useState<CSSProperties | null>(null)

  useEffect(() => {
    if (!open || !triggerRef.current) {
      setStyle(null)
      return
    }

    const update = () => {
      const el = triggerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()

      let left = rect.right + gap
      if (left + minWidth > window.innerWidth - viewportPadding) {
        left = Math.max(viewportPadding, rect.left - minWidth - gap)
      }

      setStyle({
        position: "fixed",
        left,
        bottom: window.innerHeight - rect.bottom,
        minWidth: `${minWidth}px`,
        maxHeight: Math.max(rect.bottom - viewportPadding, 120),
        overflowY: "auto",
        zIndex: 210,
      })
    }

    update()
    window.addEventListener("resize", update)
    window.addEventListener("scroll", update, true)
    return () => {
      window.removeEventListener("resize", update)
      window.removeEventListener("scroll", update, true)
    }
  }, [open, triggerRef, gap, minWidth, viewportPadding])

  return style
}
