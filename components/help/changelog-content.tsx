"use client"

import Link from "next/link"
import {
  CHANGELOG_META,
  CHANGELOG_TYPE_LABELS,
  CHANGELOG_VERSIONS,
  type ChangelogSection,
  type ChangelogVersion,
} from "@/content/help/changelog"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"

const TYPE_STYLES: Record<ChangelogSection["type"], string> = {
  added: "text-emerald",
  changed: "text-sky",
  fixed: "text-amber",
  improved: "text-violet",
}

function ChangelogVersionBlock({ entry }: { entry: ChangelogVersion }) {
  const anchor = `v${entry.version.replace(/\./g, "-")}`

  return (
    <article id={anchor} className="scroll-mt-24 border-b border-border/60 py-8 last:border-b-0">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="font-mono text-lg font-semibold text-foreground">v{entry.version}</h2>
        <time dateTime={entry.date} className="text-sm text-muted-foreground">
          {entry.dateDisplay}
        </time>
      </div>

      <div className="mt-5 space-y-5">
        {entry.sections.map((section) => (
          <div key={`${entry.version}-${section.type}`}>
            <h3
              className={cn(
                "text-xs font-bold uppercase tracking-[0.14em]",
                TYPE_STYLES[section.type]
              )}
            >
              {CHANGELOG_TYPE_LABELS[section.type]}
            </h3>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
              {section.items.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </article>
  )
}

export function ChangelogContent() {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{CHANGELOG_META.lastUpdatedDisplay}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Semver-grouped technical changes. For user-facing launch write-ups, see{" "}
        <Link href={ROUTES.helpReleaseNotes} className="text-foreground underline-offset-2 hover:underline">
          Release notes
        </Link>
        .
      </p>

      <nav
        className="mt-6 rounded-xl border border-border/70 bg-muted/20 p-4"
        aria-label="Recent versions"
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Versions
        </p>
        <ul className="flex flex-wrap gap-x-4 gap-y-2 font-mono text-sm">
          {CHANGELOG_VERSIONS.map((entry) => {
            const anchor = `v${entry.version.replace(/\./g, "-")}`
            return (
              <li key={entry.version}>
                <a
                  href={`#${anchor}`}
                  className="text-foreground/90 underline-offset-2 hover:text-primary hover:underline"
                >
                  v{entry.version}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="mt-2">
        {CHANGELOG_VERSIONS.map((entry) => (
          <ChangelogVersionBlock key={entry.version} entry={entry} />
        ))}
      </div>
    </div>
  )
}
