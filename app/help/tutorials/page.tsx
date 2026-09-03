"use client"

import Link from "next/link"
import { Rocket } from "lucide-react"
import { HelpResourceLayout } from "@/components/help/help-resource-layout"
import { HelpCardGrid } from "@/components/help/help-card-grid"
import { MarketingCard, MarketingCtaButton, MarketingGhostButton } from "@/components/marketing/marketing-page"
import { HELP_TUTORIALS } from "@/content/help/tutorials"
import { ROUTES } from "@/lib/routes"

export default function TutorialsPage() {
  const items = HELP_TUTORIALS.map((t) => ({
    title: t.title,
    description: t.description,
    href: `#${t.id}`,
    badge: t.duration,
  }))

  return (
    <HelpResourceLayout
      title="Tutorials"
      description="Step-by-step guides to run your first chat, task, and API integration."
      icon={Rocket}
      actions={
        <>
          <MarketingCtaButton href={ROUTES.chat}>Open chat</MarketingCtaButton>
          <MarketingGhostButton href={ROUTES.docs}>Full docs</MarketingGhostButton>
        </>
      }
    >
      <HelpCardGrid items={items} />

      <div className="mt-12 space-y-6">
        {HELP_TUTORIALS.map((tutorial) => (
          <MarketingCard
            key={tutorial.id}
            id={tutorial.id}
            className="scroll-mt-28"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold text-foreground">{tutorial.title}</h2>
              {tutorial.duration ? (
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {tutorial.duration}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{tutorial.description}</p>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
              {tutorial.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            {tutorial.href.startsWith("http") || tutorial.href.startsWith("/") ? (
              <p className="mt-4 text-sm">
                <Link
                  href={tutorial.href}
                  className="text-amber underline-offset-4 hover:underline"
                >
                  Open related page →
                </Link>
              </p>
            ) : null}
          </MarketingCard>
        ))}
      </div>

      <MarketingCard className="mt-10 border-amber/25 bg-amber/[0.04] text-center">
        <p className="text-sm text-muted-foreground">
          Prefer a deep dive? Read the{" "}
          <Link href={ROUTES.docs} className="text-amber underline-offset-4 hover:underline">
            documentation
          </Link>{" "}
          or ask on{" "}
          <Link href={ROUTES.contact} className="text-amber underline-offset-4 hover:underline">
            contact
          </Link>
          .
        </p>
      </MarketingCard>
    </HelpResourceLayout>
  )
}
