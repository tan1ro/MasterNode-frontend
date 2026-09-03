"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowUpRight, ChevronDown } from "lucide-react"
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { HOME_SHELL } from "@/components/home/home-accent-styles"
import type { SiteNavLink, SiteNavMenu } from "@/constants/site-nav"
import { cn } from "@/lib/utils"

/** Delay (ms) before a menu closes so the cursor can travel to the panel. */
const CLOSE_DELAY = 140

const GRID_COLS: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
}

const NAV_LINK_HOVER =
  "hover:bg-muted focus-visible:bg-muted dark:hover:bg-white/[0.06] dark:focus-visible:bg-white/[0.06]"

function MegaPanelLink({
  link,
  onNavigate,
}: {
  link: SiteNavLink
  onNavigate: () => void
}) {
  const Icon = link.icon
  const external = link.external

  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={cn(
        "group/link flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber/40",
        NAV_LINK_HOVER
      )}
    >
      {Icon ? (
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber/10 text-amber transition-colors group-hover/link:bg-amber/15">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1 text-sm font-medium text-foreground transition-colors group-hover/link:text-foreground dark:text-white/85 dark:group-hover/link:text-white">
          {link.label}
          {external ? (
            <ArrowUpRight
              className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover/link:text-amber dark:text-white/40"
              aria-hidden
            />
          ) : null}
        </span>
        {link.description ? (
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            {link.description}
          </span>
        ) : null}
      </span>
    </Link>
  )
}

function MegaPanel({
  menu,
  onNavigate,
}: {
  menu: SiteNavMenu
  onNavigate: () => void
}) {
  const gridCols = GRID_COLS[menu.columns.length] ?? GRID_COLS[2]

  return (
    <div className={cn(HOME_SHELL, "px-4 py-6 sm:px-6")}>
      <div className={cn("grid grid-cols-1 gap-x-8 gap-y-6", gridCols)}>
        {menu.columns.map((column) => (
          <div key={column.title}>
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
              {column.title}
            </p>
            <div className="flex flex-col">
              {column.links.map((link) => (
                <MegaPanelLink
                  key={link.label}
                  link={link}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {menu.footerLink ? (
        <div className="mt-4 border-t border-border pt-4 dark:border-white/[0.08]">
          <Link
            href={menu.footerLink.href}
            onClick={onNavigate}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-amber transition-colors hover:text-amber/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber/40"
          >
            {menu.footerLink.label}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      ) : null}
    </div>
  )
}

/**
 * Desktop mega-menu: hover-intent triggers plus one shared full-width panel that
 * swaps content as you move between triggers. Reports its open state so the
 * header can switch to its solid treatment while a menu is showing.
 *
 * Pass `leading` (e.g. Chat link) so top-level items share one equal-gap row.
 */
export function SiteNavMega({
  menus,
  onOpenChange,
  leading,
}: {
  menus: SiteNavMenu[]
  onOpenChange?: (open: boolean) => void
  leading?: ReactNode
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pathname = usePathname()

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }, [])

  const open = useCallback(
    (index: number) => {
      clearCloseTimer()
      setActiveIndex(index)
    },
    [clearCloseTimer]
  )

  const scheduleClose = useCallback(() => {
    clearCloseTimer()
    closeTimer.current = setTimeout(() => setActiveIndex(null), CLOSE_DELAY)
  }, [clearCloseTimer])

  const closeNow = useCallback(() => {
    clearCloseTimer()
    setActiveIndex(null)
  }, [clearCloseTimer])

  useEffect(() => {
    onOpenChange?.(activeIndex !== null)
  }, [activeIndex, onOpenChange])

  useEffect(() => {
    closeNow()
  }, [pathname, closeNow])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeNow()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [closeNow])

  useEffect(() => clearCloseTimer, [clearCloseTimer])

  const activeMenu = activeIndex !== null ? menus[activeIndex] : null

  return (
    <div className="hidden xl:block" onMouseLeave={scheduleClose}>
      <nav className="flex items-center gap-1.5" aria-label="Primary">
        {leading}
        {menus.map((menu, index) => {
          const isActive = index === activeIndex
          const Icon = menu.icon
          return (
            <button
              key={menu.label}
              type="button"
              aria-haspopup="true"
              aria-expanded={isActive}
              aria-controls="site-nav-mega-panel"
              onMouseEnter={() => open(index)}
              onFocus={() => open(index)}
              onClick={() => (isActive ? closeNow() : open(index))}
              className={cn(
                "flex items-center gap-1.5 rounded-md border px-2.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber/40 2xl:gap-2 2xl:px-3",
                isActive
                  ? "border-border/60 bg-muted text-foreground dark:border-white/10 dark:bg-white/[0.06] dark:text-white"
                  : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-white/[0.06] dark:hover:text-white"
              )}
            >
              {Icon ? (
                <Icon className="h-4 w-4 shrink-0 stroke-[1.5]" aria-hidden />
              ) : null}
              {menu.label}
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  isActive ? "rotate-180" : "rotate-0"
                )}
                aria-hidden
              />
            </button>
          )
        })}
      </nav>

      {activeMenu ? (
        <div
          id="site-nav-mega-panel"
          role="region"
          aria-label={`${activeMenu.label} menu`}
          className="fixed inset-x-0 top-14 z-40 border-t border-border bg-background/95 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-black/95 dark:shadow-[0_24px_48px_rgba(0,0,0,0.45)]"
          onMouseEnter={clearCloseTimer}
          onMouseLeave={scheduleClose}
        >
          <MegaPanel menu={activeMenu} onNavigate={closeNow} />
        </div>
      ) : null}
    </div>
  )
}
