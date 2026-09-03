"use client"

import Link from "next/link"
import { ArrowUpRight, ChevronDown, type LucideIcon } from "lucide-react"
import { useState } from "react"
import type { SiteNavMenu } from "@/constants/site-nav"
import { cn } from "@/lib/utils"

export type SiteNavMobileTopLink = {
  href: string
  label: string
  icon: LucideIcon
}

const MOBILE_ROW =
  "flex w-full items-center justify-between border-b border-border px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted dark:border-white/[0.06] dark:text-white/85 dark:hover:bg-white/[0.06]"

/**
 * Mobile navigation: one collapsible accordion section per top-level menu,
 * built from the same {@link SiteNavMenu} data as the desktop mega-menu.
 */
export function SiteNavMobile({
  menus,
  onNavigate,
  topLink,
}: {
  menus: SiteNavMenu[]
  onNavigate: () => void
  topLink?: SiteNavMobileTopLink
}) {
  const [openLabel, setOpenLabel] = useState<string | null>(null)
  const TopIcon = topLink?.icon

  return (
    <div className="flex flex-col bg-background">
      {topLink ? (
        <Link href={topLink.href} onClick={onNavigate} className={MOBILE_ROW}>
          <span className="flex items-center gap-3">
            {TopIcon ? <TopIcon className="h-4 w-4 shrink-0 text-amber" aria-hidden /> : null}
            {topLink.label}
          </span>
          <span className="h-4 w-4 shrink-0" aria-hidden />
        </Link>
      ) : null}
      {menus.map((menu) => {
        const isOpen = openLabel === menu.label
        const Icon = menu.icon
        return (
          <div key={menu.label} className="border-b border-border last:border-b-0 dark:border-white/[0.06]">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenLabel(isOpen ? null : menu.label)}
              className={cn(MOBILE_ROW, "border-b-0")}
            >
              <span className="flex items-center gap-3">
                {Icon ? <Icon className="h-4 w-4 shrink-0 text-amber" aria-hidden /> : null}
                {menu.label}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200 dark:text-white/50",
                  isOpen ? "rotate-180" : "rotate-0"
                )}
                aria-hidden
              />
            </button>

            {isOpen ? (
              <div className="bg-background pb-2">
                {menu.columns.map((column) => (
                  <div key={column.title} className="pt-1">
                    <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
                      {column.title}
                    </p>
                    {column.links.map((link) => {
                      const Icon = link.icon
                      return (
                        <Link
                          key={link.label}
                          href={link.href}
                          onClick={onNavigate}
                          target={link.external ? "_blank" : undefined}
                          rel={link.external ? "noopener noreferrer" : undefined}
                          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-amber/10 hover:text-amber"
                        >
                          {Icon ? (
                            <Icon className="h-4 w-4 shrink-0 text-amber" aria-hidden />
                          ) : null}
                          <span className="flex-1">{link.label}</span>
                          {link.external ? (
                            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/60" aria-hidden />
                          ) : null}
                        </Link>
                      )
                    })}
                  </div>
                ))}

                {menu.footerLink ? (
                  <Link
                    href={menu.footerLink.href}
                    onClick={onNavigate}
                    className="mt-1 flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-amber transition-colors hover:bg-amber/10"
                  >
                    {menu.footerLink.label}
                    <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
