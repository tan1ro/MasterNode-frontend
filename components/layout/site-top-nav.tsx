"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowRight, LogIn, Menu, X } from "lucide-react"
import { useState } from "react"
import { BrandLogoNav } from "@/components/layout/brand-logo"
import { SiteNavMega } from "@/components/layout/site-nav-mega"
import { SiteNavMobile } from "@/components/layout/site-nav-mobile"
// import { ThemeToggle } from "@/components/layout/theme-toggle"
import { HOME_SHELL } from "@/components/home/home-accent-styles"
import { getSiteNavMenus } from "@/constants/site-nav"
import { useAppAuth } from "@/hooks/use-app-auth"
import { useLandingNavScroll } from "@/hooks/use-landing-nav-scroll"
import { isHomeLandingRoute } from "@/lib/app-shell-routes"
import { ROLE_HOME, parseRole } from "@/lib/rbac"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"

/**
 * Unified, transparent top navbar shared across every public/marketing page.
 * Transparent at the top of the page, fading to a blurred bar on scroll or
 * when a mega-menu is open. Follows the global light/dark theme.
 *
 * Desktop mega-menu shows from `xl` up; below that the hamburger + sheet is used
 * so links never collide with the CTA on tablet / narrow laptop widths.
 */
export function SiteTopNav() {
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const scrolled = useLandingNavScroll()
  const pathname = usePathname() ?? ""
  const { isSignedIn, accountType } = useAppAuth()

  const onHome = isHomeLandingRoute(pathname)
  const menus = getSiteNavMenus(onHome)
  const ctaHref = isSignedIn
    ? ROLE_HOME[parseRole(accountType) ?? "creator"]
    : ROUTES.signUp
  const ctaLabel = isSignedIn ? "Open workspace" : "Get started"
  const solid = scrolled || menuOpen
  const mobileMenuOpen = open

  return (
    <header
      className={cn(
        "mn-public-nav fixed inset-x-0 top-0 z-50 font-sans transition-[background-color,border-color,backdrop-filter,box-shadow] duration-300",
        mobileMenuOpen
          ? "border-b border-border bg-background shadow-sm"
          : solid
            ? "border-b border-border bg-background/85 shadow-sm backdrop-blur-md"
            : "border-b border-transparent bg-gradient-to-b from-background/80 via-background/30 to-transparent"
      )}
    >
      <div className={cn(HOME_SHELL, "px-4 sm:px-6")}>
        {/* Mobile / tablet: hamburger | centered logo | compact CTA */}
        <div className="grid h-14 grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-2 xl:hidden">
          <button
            type="button"
            className="justify-self-start rounded-md p-2 text-muted-foreground hover:bg-amber/10 hover:text-amber"
            aria-label="Toggle menu"
            aria-expanded={open}
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

        {/* Desktop (xl+): full mega-menu — enough width that links and CTA don't collide */}
        <div className="hidden h-14 items-center justify-between gap-3 xl:flex">
          <div className="flex min-w-0 items-center gap-3 2xl:gap-5">
            <BrandLogoNav className="shrink-0" />
            <SiteNavMega menus={menus} onOpenChange={setMenuOpen} />
          </div>

          <div className="flex shrink-0 items-center gap-2 2xl:gap-3">
            {/* <ThemeToggle className="text-muted-foreground hover:bg-amber/10 hover:text-amber" /> */}
            {!isSignedIn ? (
              <Link
                href={ROUTES.signIn}
                className="inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-amber/10 hover:text-amber 2xl:px-3"
              >
                <LogIn className="h-4 w-4 shrink-0" aria-hidden />
                Sign in
              </Link>
            ) : null}
            <Link
              href={ctaHref}
              className="home-cta-gradient inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-[#0A0A14]"
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>

        {open ? (
          <div className="scrollbar-none max-h-[calc(100vh-3.5rem)] overflow-y-auto border-t border-border bg-background pb-4 pt-0 xl:hidden">
            <SiteNavMobile menus={menus} onNavigate={() => setOpen(false)} />
            <div className="flex flex-col gap-2 border-t border-border px-3 pt-3 dark:border-white/[0.06]">
              {!isSignedIn ? (
                <Link
                  href={ROUTES.signIn}
                  className={cn(
                    "inline-flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-semibold transition-colors",
                    "border-border bg-background text-foreground hover:bg-muted",
                    "dark:border-white/16 dark:bg-white/[0.04] dark:text-white/90 dark:hover:border-cyan/45 dark:hover:bg-cyan/[0.06]"
                  )}
                  onClick={() => setOpen(false)}
                >
                  <LogIn className="h-4 w-4 shrink-0" aria-hidden />
                  Sign in
                </Link>
              ) : null}
              <Link
                href={isSignedIn ? ctaHref : ROUTES.signUp}
                className="home-cta-gradient inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-[#0A0A14]"
                onClick={() => setOpen(false)}
              >
                {isSignedIn ? ctaLabel : "Sign up"}
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  )
}
