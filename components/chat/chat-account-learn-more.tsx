"use client"

import Link from "next/link"
import { useRef, useState, type ComponentType } from "react"
import { createPortal } from "react-dom"
import {
  ArrowUpCircle,
  BookOpen,
  ChevronRight,
  Cookie,
  ExternalLink,
  FileQuestion,
  GraduationCap,
  HelpCircle,
  Info,
  Keyboard,
  Rocket,
  Scale,
  Shield,
} from "lucide-react"
import { useFlyoutMenuPosition } from "@/components/chat/sidebar/use-sidebar-menu-position"
import { ACCOUNT_MORE_MENU_SECTIONS } from "@/constants/learn-more-menu"
import { cn } from "@/lib/utils"

const MORE_MENU_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  help: HelpCircle,
  faq: FileQuestion,
  about: Info,
  tutorials: Rocket,
  courses: GraduationCap,
  docs: BookOpen,
  usage: Scale,
  privacy: Shield,
  "privacy-choices": Cookie,
  shortcuts: Keyboard,
  api: ArrowUpCircle,
}

export function ChatAccountMoreMenu({
  onClose,
  useFixedFlyout = false,
}: {
  onClose: () => void
  /** When true, submenu is portaled with fixed positioning (for sidebar account menu). */
  useFixedFlyout?: boolean
  /** @deprecated Use useFixedFlyout instead. */
  align?: "sidebar" | "rail"
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const flyoutStyle = useFlyoutMenuPosition(triggerRef, open && useFixedFlyout)

  const submenu = open ? (
    <div
      role="menu"
      aria-label="More"
      data-account-menu=""
      className={cn(
        useFixedFlyout ? "fixed" : "absolute left-full bottom-0 ml-0.5",
        "z-[210] min-w-[14.5rem] overflow-hidden rounded-xl border border-border/80",
        "bg-popover text-popover-foreground shadow-2xl py-1"
      )}
      style={useFixedFlyout ? flyoutStyle ?? undefined : undefined}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {ACCOUNT_MORE_MENU_SECTIONS.map((section, sectionIndex) => (
        <div
          key={section.items[0]?.key ?? sectionIndex}
          className={cn(
            sectionIndex > 0 && "border-t border-border/60 py-1",
            sectionIndex === 0 && "py-1"
          )}
        >
          {section.items.map((item) => {
            const Icon = MORE_MENU_ICONS[item.key]
            return (
              <Link
                key={item.key}
                href={item.href}
                role="menuitem"
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                onClick={onClose}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2 text-sm text-foreground/90",
                  "hover:bg-muted/60 transition-colors"
                )}
              >
                {Icon ? (
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                ) : null}
                <span className="flex-1 truncate">{item.label}</span>
                {item.external ? (
                  <ExternalLink
                    className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                ) : null}
              </Link>
            )
          })}
        </div>
      ))}
    </div>
  ) : null

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        ref={triggerRef}
        type="button"
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-3 px-3 py-2.5 text-sm text-foreground/90",
          "hover:bg-muted/60 transition-colors text-left",
          open && "bg-muted/60"
        )}
        onFocus={() => setOpen(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setOpen(false)
          }
        }}
      >
        <Info className="h-[1.125rem] w-[1.125rem] shrink-0" aria-hidden />
        <span className="flex-1 truncate text-left">Learn more</span>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      </button>

      {useFixedFlyout && typeof document !== "undefined"
        ? submenu
          ? createPortal(submenu, document.body)
          : null
        : submenu}
    </div>
  )
}

/** @deprecated Use ChatAccountMoreMenu */
export const ChatAccountLearnMore = ChatAccountMoreMenu
