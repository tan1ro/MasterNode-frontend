"use client"

import type { ComponentType } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { ChevronDown, Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import type { NavItem } from "@/constants/navigation"

type NavIcon = ComponentType<{ className?: string }>

export function WorkspaceNavDropdown({
  items,
  triggerLabel = "Workspace",
  triggerIcon: Icon = Layers,
}: {
  items: NavItem[]
  /** Desktop label (abbreviated on small xl). */
  triggerLabel?: string
  triggerIcon?: NavIcon
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const isAnyActive = items.some((item) => {
    const pathOnly = item.href.split("#")[0] || item.href
    return pathname === pathOnly || pathname?.startsWith(`${pathOnly}/`)
  })

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`${triggerLabel} menu`}
        className={cn(
          "flex items-center gap-1 px-2 xl:px-3 py-2 rounded-md text-sm font-medium transition-colors border",
          isAnyActive || open
            ? "bg-amber/15 text-amber border-amber/25"
            : "text-muted-foreground hover:bg-amber/10 hover:text-amber border-transparent"
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Icon className="h-4 w-4 shrink-0" aria-hidden />
        <span className="hidden sm:inline">{triggerLabel}</span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full mt-1 min-w-[220px] rounded-md border border-border bg-background/95 backdrop-blur-md shadow-lg z-50 py-1"
        >
          {items.map((item) => {
            const Icon = item.icon
            const pathOnly = item.href.split("#")[0] || item.href
            const active =
              pathname === pathOnly || pathname?.startsWith(`${pathOnly}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-amber/15 text-amber"
                    : "text-muted-foreground hover:bg-amber/10 hover:text-amber"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
