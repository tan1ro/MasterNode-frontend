"use client"

import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  CircleDollarSign,
  Download,
  LogIn,
  Menu,
  Rss,
  Wand2,
  X,
} from "lucide-react"
import { useState } from "react"
import { BrandLogoNav } from "@/components/layout/brand-logo"
import { NavLink } from "@/components/layout/nav-link"
// import { ThemeToggle } from "@/components/layout/theme-toggle"
import { HOME_SHELL } from "@/components/home/home-accent-styles"
import { type NavItem } from "@/constants/navigation"
import { useLandingNavScroll } from "@/hooks/use-landing-nav-scroll"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"

const NAV_LINKS: ReadonlyArray<NavItem> = [
  { href: "#capabilities", label: "Features", icon: Wand2 },
  { href: "#desktop", label: "Desktop", icon: Download },
  { href: ROUTES.pricing, label: "Pricing", icon: CircleDollarSign },
  { href: ROUTES.docs, label: "Docs", icon: BookOpen },
  { href: ROUTES.about, label: "Blog", icon: Rss },
]

function MobileNavLink({
  href,
  label,
  icon: Icon,
  onNavigate,
}: NavItem & { onNavigate?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-amber/10 hover:text-amber"
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      {label}
    </Link>
  )
}

export function HomeLandingNav({
  ctaHref,
  isSignedIn,
}: {
  ctaHref: string
  isSignedIn: boolean
}) {
  const [open, setOpen] = useState(false)
  const scrolled = useLandingNavScroll()

  return (
    <header
      className={cn(
        "mn-public-nav home-landing-nav fixed inset-x-0 top-0 z-50 border-b font-sans transition-[background-color,border-color,backdrop-filter,box-shadow] duration-300",
        scrolled || open
          ? "border-border bg-background shadow-sm"
          : "border-transparent bg-gradient-to-b from-background/80 via-background/30 to-transparent"
      )}
    >
      <div className={cn(HOME_SHELL, "home-landing-nav-inner px-4 sm:px-6")}>
        {/* Mobile / tablet: hamburger | centered logo | signup */}
        <div className="grid h-[var(--home-landing-nav-height)] grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-2 xl:hidden">
          <button
            type="button"
            className="justify-self-start rounded-md p-2 text-muted-foreground hover:bg-amber/10 hover:text-amber"
            aria-label="Toggle menu"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="flex min-w-0 justify-center justify-self-center px-1">
            <BrandLogoNav />
          </div>

          <Link
            href={ctaHref}
            className="home-cta-gradient justify-self-end inline-flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold text-[#0A0A14]"
          >
            {isSignedIn ? "Open" : "Sign up"}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>

        {/* Desktop */}
        <div className="hidden h-[var(--home-landing-nav-height)] items-center justify-between gap-4 xl:flex">
          <div className="flex min-w-0 items-center gap-4 sm:gap-6">
            <BrandLogoNav />
            <nav className="flex items-center gap-1" aria-label="Landing">
              {NAV_LINKS.map((item) => (
                <NavLink key={item.label} {...item} />
              ))}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* <ThemeToggle className="text-muted-foreground hover:bg-amber/10 hover:text-amber" /> */}
            <Link
              href={ROUTES.signIn}
              className="inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-amber/10 hover:text-amber xl:px-3"
            >
              <LogIn className="h-4 w-4 shrink-0" aria-hidden />
              Sign in
            </Link>
            <Link
              href={ctaHref}
              className="home-cta-gradient inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-[#0A0A14]"
            >
              {isSignedIn ? "Open workspace" : "Get started"}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>

        {open ? (
          <div className="border-t border-border bg-background pb-3 pt-3 xl:hidden">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((item) => (
                <MobileNavLink
                  key={item.label}
                  {...item}
                  onNavigate={() => setOpen(false)}
                />
              ))}
              <Link
                href={ROUTES.signIn}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-amber/10 hover:text-amber"
                onClick={() => setOpen(false)}
              >
                <LogIn className="h-4 w-4 shrink-0" aria-hidden />
                Sign in
              </Link>
              <Link
                href={isSignedIn ? ctaHref : ROUTES.signUp}
                className="home-cta-gradient mt-2 inline-flex items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-semibold text-[#0A0A14]"
                onClick={() => setOpen(false)}
              >
                {isSignedIn ? "Open workspace" : "Sign up"}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  )
}
