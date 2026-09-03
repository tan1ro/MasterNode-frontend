"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  MarketingCard,
  MarketingCtaButton,
  MarketingGhostButton,
  MarketingHero,
  MarketingSection,
  MarketingSectionTitle,
} from "@/components/marketing/marketing-page"
import { HELP_QUICK_LINKS, HELP_RESOURCES, HELP_TOPICS } from "@/constants/help"
import { ROUTES } from "@/lib/routes"

export default function HelpPage() {
  const [query, setQuery] = useState("")

  const filteredResources = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return HELP_RESOURCES
    return HELP_RESOURCES.filter(
      (item) =>
        item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
    )
  }, [query])

  const filteredTopics = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return HELP_TOPICS
    return HELP_TOPICS.filter((topic) => topic.title.toLowerCase().includes(q))
  }, [query])

  return (
    <main className="pb-24">
      <MarketingHero
        eyebrow="Help Center"
        title="Learn how MasterNode works"
        description="Self-serve guides for “How do I…?” — FAQs, tutorials, and product references. No ticket required."
        actions={
          <>
            <MarketingCtaButton href={ROUTES.helpTutorials}>Start a tutorial</MarketingCtaButton>
            <MarketingGhostButton href={ROUTES.helpFaq}>Browse FAQ</MarketingGhostButton>
          </>
        }
      />

      <MarketingSection width="narrow" className="pb-10">
        <label htmlFor="help-search" className="sr-only">
          Search help articles
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="help-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guides — e.g. upload a PDF, memory, billing…"
            className="h-11 pl-10"
            autoComplete="off"
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Search → article → solution. For something broken, use{" "}
          <Link href={ROUTES.support} className="text-amber underline-offset-4 hover:underline">
            Support
          </Link>
          .
        </p>
      </MarketingSection>

      <MarketingSection className="pb-14">
        <MarketingSectionTitle
          eyebrow="01 — categories"
          title="Browse by topic"
          description="Getting started, features, account, billing, privacy, and API."
        />
        <div className="flex flex-wrap gap-3">
          {filteredTopics.map((topic) => {
            const Icon = topic.icon
            return (
              <Link key={topic.title} href={topic.href}>
                <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/80 px-4 py-2 text-sm text-foreground transition-colors hover:border-amber/40 hover:text-amber dark:border-white/10 dark:bg-white/[0.02]">
                  <Icon className="size-4 text-amber" aria-hidden />
                  {topic.title}
                </span>
              </Link>
            )
          })}
        </div>
        {filteredTopics.length === 0 && (
          <p className="mt-3 text-sm text-muted-foreground">No topics match that search.</p>
        )}
      </MarketingSection>

      <MarketingSection className="pb-14">
        <MarketingSectionTitle
          eyebrow="02 — guides"
          title="Learn the product"
          description="FAQs, tutorials, courses, and references for everyday work."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} className="group block h-full">
                <MarketingCard className="h-full transition-colors hover:border-amber/35 hover:bg-muted/40 dark:hover:border-white/20 dark:hover:bg-white/[0.04]">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-amber dark:border-white/10 dark:bg-white/[0.04]">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <ArrowUpRight
                      className="size-4 text-muted-foreground/50 transition-colors group-hover:text-amber"
                      aria-hidden
                    />
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </MarketingCard>
              </Link>
            )
          })}
        </div>
        {filteredResources.length === 0 && (
          <p className="mt-3 text-sm text-muted-foreground">No guides match that search.</p>
        )}
      </MarketingSection>

      <MarketingSection className="pb-14">
        <MarketingSectionTitle
          eyebrow="03 — elsewhere"
          title="Need a different kind of help?"
          description="Learn here. Fix on Support. Reach the company on Contact."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {HELP_QUICK_LINKS.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} className="group block h-full">
                <MarketingCard className="h-full transition-colors hover:border-amber/35 hover:bg-muted/40 dark:hover:border-white/20 dark:hover:bg-white/[0.04]">
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-amber dark:border-white/10 dark:bg-white/[0.04]">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1 font-semibold text-foreground">
                        {item.title}
                        <ArrowUpRight
                          className="size-4 text-muted-foreground/50 transition-colors group-hover:text-amber"
                          aria-hidden
                        />
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </MarketingCard>
              </Link>
            )
          })}
        </div>
      </MarketingSection>

      <MarketingSection width="narrow">
        <MarketingCard className="border-amber/25 bg-amber/[0.04] text-center">
          <h2 className="text-xl font-semibold text-foreground">Still stuck?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            If something isn&apos;t working, open Support. For sales or partnerships, use Contact.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <MarketingCtaButton href={ROUTES.support}>Open Support</MarketingCtaButton>
            <MarketingGhostButton href={ROUTES.contact}>Contact company</MarketingGhostButton>
          </div>
        </MarketingCard>
      </MarketingSection>
    </main>
  )
}
