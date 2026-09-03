"use client"

import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import {
  ABOUT_AUDIENCE,
  ABOUT_CAPABILITIES,
  ABOUT_DOMAIN,
  ABOUT_HERO,
  ABOUT_HOW_IT_WORKS,
  ABOUT_LINKS,
  ABOUT_MISSION,
  ABOUT_PRINCIPLES,
  ABOUT_STATUS,
} from "@/constants/about"
import { accentMap, homeMinimalPanel } from "@/components/home/home-accent-styles"
import {
  MarketingCard,
  MarketingCtaButton,
  MarketingGhostButton,
  MarketingHero,
  MarketingSection,
  MarketingSectionTitle,
} from "@/components/marketing/marketing-page"
import { useAppAuth } from "@/hooks/use-app-auth"
import { ROLE_HOME, parseRole } from "@/lib/rbac"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"

export function AboutPage() {
  const { isSignedIn, accountType } = useAppAuth()
  const ctaHref = isSignedIn
    ? ROLE_HOME[parseRole(accountType) ?? "creator"]
    : ROUTES.signUp

  return (
    <main className="pb-16 sm:pb-20">
      <MarketingHero
        eyebrow={ABOUT_HERO.badge}
        title={ABOUT_HERO.title}
        description={ABOUT_HERO.subtitle}
        actions={
          <>
            <MarketingCtaButton href={ctaHref}>
              {isSignedIn ? "Open workspace" : "Get started free"}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </MarketingCtaButton>
            <MarketingGhostButton href={ROUTES.platform}>
              Explore the platform
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </MarketingGhostButton>
          </>
        }
      />

      {/* Status */}
      <MarketingSection width="narrow" className="pb-10 pt-0">
        <MarketingCard className="border-amber/20 bg-amber/[0.03]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground/80">
                Where we are
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{ABOUT_STATUS.summary}</p>
            </div>
            <dl className="flex shrink-0 gap-6 text-right">
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground/70">Version</dt>
                <dd className="mt-0.5 font-mono text-sm font-semibold text-foreground">
                  {ABOUT_STATUS.version}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground/70">Phase</dt>
                <dd className="mt-0.5 text-sm font-semibold text-foreground">{ABOUT_STATUS.phase}</dd>
              </div>
            </dl>
          </div>
        </MarketingCard>
      </MarketingSection>

      {/* Mission */}
      <MarketingSection width="narrow" className="pb-14">
        <MarketingSectionTitle eyebrow="Mission" title="Specialists in parallel" />
        <div className="space-y-3 text-base leading-relaxed text-muted-foreground">
          <p className="text-lg font-medium text-foreground">{ABOUT_MISSION.lead}</p>
          <p>{ABOUT_MISSION.body}</p>
        </div>
      </MarketingSection>

      {/* Domain specialists */}
      <MarketingSection className="pb-14">
        <MarketingSectionTitle
          eyebrow={ABOUT_DOMAIN.badge}
          title={ABOUT_DOMAIN.title}
          description={ABOUT_DOMAIN.description}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {ABOUT_DOMAIN.specialists.map((specialist) => {
            const Icon = specialist.icon
            const accent = accentMap[specialist.accent] ?? accentMap.amber
            return (
              <article key={specialist.title} className={cn(homeMinimalPanel, "h-full")}>
                <span className={cn("inline-flex size-10 items-center justify-center rounded-lg", accent.icon)}>
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className={cn("mt-4 text-lg font-semibold", accent.title)}>{specialist.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{specialist.description}</p>
              </article>
            )
          })}
        </div>
        <div className="mt-6 text-center sm:text-left">
          <Link
            href={ROUTES.agents}
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground/85 underline-offset-4 hover:text-amber hover:underline"
          >
            Browse assistants
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </MarketingSection>

      {/* How it works */}
      <MarketingSection className="pb-14">
        <MarketingSectionTitle
          eyebrow="02 — how it works"
          title="From prompt to deliverable"
          description="Every serious request follows the same path."
        />
        <div className="grid gap-8 sm:grid-cols-3">
          {ABOUT_HOW_IT_WORKS.map((step) => (
            <article key={step.step}>
              <span className="font-mono text-4xl font-bold leading-none text-[#2DCFCF]/35">{step.step}</span>
              <h3 className="mt-3 text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </article>
          ))}
        </div>
      </MarketingSection>

      {/* Principles + capabilities side by side on large screens */}
      <MarketingSection className="pb-14">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-14">
          <div>
            <MarketingSectionTitle
              eyebrow="03 — principles"
              title="How we build"
              className="mb-6"
            />
            <div className="space-y-4">
              {ABOUT_PRINCIPLES.map((principle) => {
                const Icon = principle.icon
                const accent = accentMap[principle.accent] ?? accentMap.amber
                return (
                  <div key={principle.title} className="flex gap-3">
                    <span
                      className={cn(
                        "mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg",
                        accent.icon
                      )}
                    >
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div>
                      <h3 className="font-semibold text-foreground">{principle.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {principle.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <MarketingSectionTitle
              eyebrow="04 — product"
              title="What you can use today"
              className="mb-6"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {ABOUT_CAPABILITIES.map((cap) => {
                const Icon = cap.icon
                return (
                  <div key={cap.title} className={cn(homeMinimalPanel, "h-full p-4")}>
                    <Icon className="size-4 text-amber" aria-hidden />
                    <h3 className="mt-2 text-sm font-semibold text-foreground">{cap.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{cap.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </MarketingSection>

      {/* Audience */}
      <MarketingSection className="pb-14">
        <MarketingSectionTitle eyebrow="05 — who it's for" title="Built for people who ship" />
        <div className="grid gap-4 sm:grid-cols-3">
          {ABOUT_AUDIENCE.map((item) => {
            const Icon = item.icon
            return (
              <article key={item.title} className={cn(homeMinimalPanel, "h-full")}>
                <Icon className="size-5 text-amber" aria-hidden />
                <h3 className="mt-3 font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </article>
            )
          })}
        </div>
      </MarketingSection>

      {/* CTA */}
      <MarketingSection width="narrow" className="pb-8">
        <MarketingCard className="border-amber/25 bg-amber/[0.04] text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Ready to swarm?</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Open a workspace, attach a specialist, and try Pipeline mode — plans you can approve before
            agents run.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <MarketingCtaButton href={ctaHref}>
              {isSignedIn ? "Open workspace" : "Create account"}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </MarketingCtaButton>
            <MarketingGhostButton href={ROUTES.blog}>
              Read the blog
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </MarketingGhostButton>
          </div>
          <nav
            aria-label="Related links"
            className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground"
          >
            {ABOUT_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-amber">
                {link.label}
              </Link>
            ))}
          </nav>
        </MarketingCard>
      </MarketingSection>
    </main>
  )
}
