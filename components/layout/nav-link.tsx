"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface NavLinkProps {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  variant?: "desktop" | "mobile" | "pill"
  onClick?: () => void
}

const baseStyles = {
  desktop:
    "flex items-center gap-1.5 border px-2.5 py-2 rounded-md text-sm font-medium transition-colors 2xl:gap-2 2xl:px-3",
  mobile:
    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
  pill:
    "flex items-center gap-2 rounded-full border border-foreground/25 px-3 py-1.5 text-xs lowercase tracking-wide transition-colors",
}

const activeStyle = "border-amber/25 bg-amber/15 text-amber"
const inactiveStyle =
  "border-transparent text-muted-foreground hover:bg-amber/10 hover:text-amber"
const pillActiveStyle = "border-amber/40 bg-amber/10 text-amber"
const pillInactiveStyle =
  "text-muted-foreground hover:border-amber/50 hover:text-amber"

export function NavLink({
  href,
  label,
  icon: Icon,
  variant = "desktop",
  onClick,
}: NavLinkProps) {
  const pathname = usePathname()
  const pathOnly = href.split("#")[0] || href
  const isActive =
    pathname === pathOnly || pathname?.startsWith(`${pathOnly}/`)

  const isPill = variant === "pill"

  return (
    <Link
      href={href}
      className={cn(
        baseStyles[variant],
        isPill
          ? isActive
            ? pillActiveStyle
            : pillInactiveStyle
          : isActive
            ? activeStyle
            : inactiveStyle
      )}
      onClick={onClick}
    >
      <Icon className="h-4 w-4 shrink-0 stroke-[1.5]" aria-hidden />
      <span>{isPill ? label.toLowerCase() : label}</span>
    </Link>
  )
}
