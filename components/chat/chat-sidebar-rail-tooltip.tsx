"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { createPortal } from "react-dom"
import { CHAT_SIDEBAR_META_TEXT_CLASS, CHAT_SIDEBAR_TEXT_CLASS } from "@/constants/chat-layout"
import { cn } from "@/lib/utils"

/** Hover label for collapsed sidebar rail icons (portaled so labels are not clipped). */
export function ChatSidebarRailTooltip({
  label,
  description,
  children,
  className,
  hidden,
}: {
  label: string
  /** Secondary line (e.g. plan name on account avatar). */
  description?: string
  children: ReactNode
  className?: string
  /** Hide flyout while a popover/menu is open on the trigger. */
  hidden?: boolean
}) {
  const rich = Boolean(description?.trim())
  const triggerRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  const updatePosition = useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setPosition({
      top: rect.top + rect.height / 2,
      left: rect.right + 8,
    })
  }, [])

  const show = useCallback(() => {
    if (hidden) return
    updatePosition()
    setOpen(true)
  }, [hidden, updatePosition])

  const hide = useCallback(() => {
    setOpen(false)
  }, [])

  useEffect(() => {
    if (!open) return
    const onLayout = () => updatePosition()
    window.addEventListener("resize", onLayout)
    window.addEventListener("scroll", onLayout, true)
    return () => {
      window.removeEventListener("resize", onLayout)
      window.removeEventListener("scroll", onLayout, true)
    }
  }, [open, updatePosition])

  const tooltipVisible = open && !hidden

  const tooltip =
    tooltipVisible && typeof document !== "undefined"
      ? createPortal(
          <span
            role="tooltip"
            className={cn(
              "pointer-events-none fixed z-[220] -translate-y-1/2",
              "rounded-md border border-border/60 bg-popover text-popover-foreground shadow-md",
              "animate-in fade-in-0 zoom-in-95 duration-100 motion-reduce:animate-none",
              rich
                ? "min-w-[11rem] max-w-[15rem] px-3 py-2 whitespace-normal"
                : cn("whitespace-nowrap px-2.5 py-1.5 font-medium", CHAT_SIDEBAR_META_TEXT_CLASS)
            )}
            style={{ top: position.top, left: position.left }}
          >
            <span className={cn("block", rich ? cn("font-medium", CHAT_SIDEBAR_TEXT_CLASS) : "")}>
              {label}
            </span>
            {rich ? (
              <span className={cn("mt-0.5 block text-muted-foreground", CHAT_SIDEBAR_META_TEXT_CLASS)}>
                {description}
              </span>
            ) : null}
          </span>,
          document.body
        )
      : null

  return (
    <div
      ref={triggerRef}
      className={cn(
        "relative flex w-full items-center justify-center",
        className
      )}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocusCapture={show}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          hide()
        }
      }}
    >
      {children}
      {tooltip}
    </div>
  )
}
