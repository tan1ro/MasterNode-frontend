"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ComponentType, ReactNode } from "react"
import { HomeGridBackdrop } from "@/components/home/home-grid-backdrop"
import { HOME_FONT_CLASS } from "@/components/home/home-fonts"
import { HOME_SHELL } from "@/components/home/home-accent-styles"
import { isHomeLandingRoute, isPublicSiteRoute } from "@/lib/app-shell-routes"
import { cn } from "@/lib/utils"

/**
 * Route-aware backdrop that gives every public/marketing page the same
 * home-landing treatment (grid, shared fonts). The home page (`/`) already
 * renders its own `HomePageShell`, so it is excluded here to avoid a doubled backdrop.
 */
export function MarketingChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? ""
  const active = isPublicSiteRoute(pathname) && !isHomeLandingRoute(pathname)

  if (!active) {
    return <>{children}</>
  }

  return (
    <div
      className={cn(
        "home-landing relative isolate min-h-screen bg-background font-sans text-foreground",
        HOME_FONT_CLASS
      )}
    >
      <HomeGridBackdrop />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

/** Blue pill eyebrow matching the home "Platform Capabilities" badge. */
export function MarketingEyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="home-section-badge inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.08em]">
      <span
        className="size-1.5 rounded-full bg-[#3B82F6] shadow-[0_0_8px_#3B82F6]"
        aria-hidden
      />
      {children}
    </span>
  )
}

/**
 * Standard marketing page hero: eyebrow + large white headline + muted
 * description + optional actions, centered under the transparent site nav.
 */
export function MarketingHero({
  eyebrow,
  title,
  description,
  actions,
  align = "center",
}: {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  align?: "center" | "left"
}) {
  const centered = align === "center"
  return (
    <header
      className={cn(
        "px-4 pb-10 pt-[calc(var(--home-landing-nav-height)+3rem)] sm:px-6 sm:pb-12",
        centered ? "text-center" : "text-left"
      )}
    >
      <div className={cn(HOME_SHELL, "max-w-4xl", centered ? "flex flex-col items-center" : "")}>
        {eyebrow ? <MarketingEyebrow>{eyebrow}</MarketingEyebrow> : null}
        <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>
        {description ? (
          <p
            className={cn(
              "mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg",
              centered ? "mx-auto" : ""
            )}
          >
            {description}
          </p>
        ) : null}
        {actions ? (
          <div
            className={cn(
              "mt-8 flex flex-wrap items-center gap-3",
              centered ? "justify-center" : ""
            )}
          >
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  )
}

/** Section wrapper with the shared max-width container and page padding. */
export function MarketingSection({
  children,
  className,
  id,
  width = "wide",
}: {
  children: ReactNode
  className?: string
  id?: string
  width?: "wide" | "narrow"
}) {
  return (
    <section id={id} className={cn("px-4 sm:px-6 lg:px-10", className)}>
      <div className={cn(HOME_SHELL, width === "narrow" ? "max-w-3xl" : "")}>
        {children}
      </div>
    </section>
  )
}

/** Left-aligned section heading used inside marketing sections. */
export function MarketingSectionTitle({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("mb-8", className)}>
      {eyebrow ? (
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  )
}

/** Glass panel matching home capability/pricing cards. */
export function MarketingCard({
  children,
  className,
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <div
      id={id}
      className={cn(
        "rounded-2xl border border-border bg-card/80 p-6 backdrop-blur-sm transition-colors dark:border-white/10 dark:bg-white/[0.02]",
        className
      )}
    >
      {children}
    </div>
  )
}

/** Icon + title + description feature card, used across marketing pages. */
export function MarketingFeatureCard({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: ComponentType<{ className?: string }>
  title: ReactNode
  description: ReactNode
  className?: string
}) {
  return (
    <MarketingCard className={cn("h-full", className)}>
      <div className="flex gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-amber dark:border-white/10 dark:bg-white/[0.04]">
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
    </MarketingCard>
  )
}

/** Primary solid CTA button (home style). */
export function MarketingCtaButton({
  href,
  children,
  className,
}: {
  href: string
  children: ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        "home-cta-gradient inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold transition-colors",
        className
      )}
    >
      {children}
    </Link>
  )
}

/** Secondary ghost button (bordered) matching the home hero secondary CTA. */
export function MarketingGhostButton({
  href,
  children,
  className,
}: {
  href: string
  children: ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-border hover:bg-muted/50 dark:border-white/15 dark:text-white/85 dark:hover:border-white/30 dark:hover:text-white",
        className
      )}
    >
      {children}
    </Link>
  )
}
