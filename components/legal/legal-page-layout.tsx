"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft, CalendarClock } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { ROUTES } from "@/lib/routes"
import { LEGAL_LAST_UPDATED, type LegalDocMeta } from "@/constants/legal"
import type { LegalTocItem } from "@/content/legal/types"
import { cn } from "@/lib/utils"

interface LegalPageLayoutProps {
  title: string
  docId: LegalDocMeta["slug"] | "hub"
  description?: string
  icon?: LucideIcon
  sections?: LegalTocItem[]
  children: ReactNode
}

function TableOfContents({ sections }: { sections: LegalTocItem[] }) {
  return (
    <nav aria-label="On this page" className="space-y-1">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        On this page
      </p>
      {sections.map((item) => {
        const Icon = item.icon
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            <Icon className="size-4 shrink-0 text-muted-foreground/70 transition-colors group-hover:text-amber" aria-hidden />
            <span className="truncate">{item.title}</span>
          </a>
        )
      })}
    </nav>
  )
}

export function LegalPageLayout({
  title,
  docId,
  description,
  icon: Icon,
  sections,
  children,
}: LegalPageLayoutProps) {
  const lastUpdated = LEGAL_LAST_UPDATED[docId]
  const hasToc = Boolean(sections && sections.length > 0)

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6">
        <Link
          href={ROUTES.legal}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-amber"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Legal hub
        </Link>

        <header className="mt-6 flex flex-col gap-4 border-b border-border/40 pb-8 sm:flex-row sm:items-start">
          {Icon ? (
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-gradient-to-br from-amber/15 to-transparent text-amber">
              <Icon className="size-7" aria-hidden />
            </span>
          ) : null}
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
            {description ? (
              <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">
                {description}
              </p>
            ) : null}
            <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarClock className="size-4" aria-hidden />
              Last updated: {lastUpdated}
            </p>
          </div>
        </header>

        <div
          className={cn(
            "mt-10 gap-10",
            hasToc ? "lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]" : ""
          )}
        >
          {hasToc ? (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <TableOfContents sections={sections!} />
              </div>
            </aside>
          ) : null}

          <article className="prose prose-sm min-w-0 max-w-none space-y-12 text-muted-foreground dark:prose-invert">
            {children}
          </article>
        </div>
      </div>
    </main>
  )
}
