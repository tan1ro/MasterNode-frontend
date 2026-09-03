"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  RELEASE_NOTES_ARTICLES,
  RELEASE_NOTE_VERSIONS,
  RELEASE_NOTES_META,
  releaseNoteVersionAnchor,
  type ReleaseNoteArticle,
} from "@/content/help/release-notes"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"

const TAG_STYLES: Record<NonNullable<ReleaseNoteArticle["tag"]>, string> = {
  Added: "bg-emerald/15 text-emerald border-emerald/30",
  Changed: "bg-sky/15 text-sky border-sky/30",
  Fixed: "bg-amber/15 text-amber border-amber/30",
  Improved: "bg-violet/15 text-violet border-violet/30",
}

function ReleaseNoteEntry({ article }: { article: ReleaseNoteArticle }) {
  return (
    <article
      id={article.id}
      className="scroll-mt-28 border-b border-border/50 py-8 last:border-b-0"
    >
      <div className="flex flex-wrap items-center gap-2">
        <time dateTime={article.date} className="text-sm font-medium text-muted-foreground">
          {article.dateDisplay}
        </time>
        {article.tag ? (
          <span
            className={cn(
              "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              TAG_STYLES[article.tag]
            )}
          >
            {article.tag}
          </span>
        ) : null}
      </div>

      <h3 className="mt-2 text-xl font-semibold leading-snug tracking-tight text-foreground">
        {article.title}
      </h3>

      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
        {article.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 64)}>{paragraph}</p>
        ))}
      </div>

      {article.bullets?.map((group) => (
        <div key={group.heading ?? group.items[0]} className="mt-5">
          {group.heading ? (
            <p className="mb-2 text-sm font-semibold text-foreground">{group.heading}</p>
          ) : null}
          <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            {group.items.map((item) => (
              <li key={item} className="flex gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/70" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {article.footnote ? (
        <p className="mt-5 text-sm italic text-muted-foreground/90">{article.footnote}</p>
      ) : null}
    </article>
  )
}

function VersionSidebar({ activeVersion }: { activeVersion: string }) {
  const current =
    RELEASE_NOTE_VERSIONS.find((item) => item.version === activeVersion) ??
    RELEASE_NOTE_VERSIONS[0]
  if (!current) return null

  const shortDate = current.dateDisplay.replace(/,?\s*\d{4}$/, "")

  return (
    <nav
      aria-label="Current release version"
      className="rounded-xl border border-border/70 bg-muted/10 p-3 lg:sticky lg:top-24"
    >
      <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Version
      </p>
      <div className="mt-2 flex items-center justify-between gap-2 rounded-md bg-background px-2 py-1.5 text-foreground ring-1 ring-border/70">
        <span className="font-mono text-[13px] font-semibold leading-none">
          v{current.version}
        </span>
        <span className="shrink-0 text-[11px] tabular-nums leading-none opacity-75">
          {shortDate}
        </span>
      </div>
      {current.summary ? (
        <p className="mt-2 px-1 text-[11px] leading-snug text-muted-foreground">
          {current.summary}
        </p>
      ) : null}
      <p className="mt-3 border-t border-border/50 px-1 pt-2.5 text-[11px] text-muted-foreground">
        <Link href={ROUTES.changelog} className="underline-offset-2 hover:text-foreground hover:underline">
          Changelog
        </Link>
      </p>
    </nav>
  )
}

export function ReleaseNotesContent() {
  const [activeVersion, setActiveVersion] = useState(RELEASE_NOTE_VERSIONS[0]?.version ?? "")

  useEffect(() => {
    const nodes = RELEASE_NOTE_VERSIONS.map((item) =>
      document.getElementById(releaseNoteVersionAnchor(item.version))
    ).filter((el): el is HTMLElement => Boolean(el))

    if (nodes.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        const top = visible[0]?.target
        if (!top?.id) return
        const match = RELEASE_NOTE_VERSIONS.find(
          (item) => releaseNoteVersionAnchor(item.version) === top.id
        )
        if (match) setActiveVersion(match.version)
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0.1, 0.25, 0.5] }
    )

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  const articlesByVersion = RELEASE_NOTE_VERSIONS.map((item) => ({
    ...item,
    articles: RELEASE_NOTES_ARTICLES.filter((a) => a.version === item.version),
  }))

  return (
    <div>
      <p className="text-sm text-muted-foreground">{RELEASE_NOTES_META.lastUpdatedDisplay}</p>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Product updates for everyone using MasterNode.ai — what changed, why it matters, and how to
        try it. The side panel tracks the release you’re reading.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[168px_minmax(0,1fr)] lg:gap-10">
        <VersionSidebar activeVersion={activeVersion} />

        <div className="min-w-0">
          {/* Mobile version chips */}
          <div className="mb-8 flex gap-2 overflow-x-auto pb-1 lg:hidden" aria-label="Jump to version">
            {RELEASE_NOTE_VERSIONS.map((item) => (
              <a
                key={item.version}
                href={item.href}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 font-mono text-xs font-semibold transition-colors",
                  item.version === activeVersion
                    ? "border-foreground/30 bg-foreground text-background"
                    : "border-border/70 text-muted-foreground hover:text-foreground"
                )}
              >
                v{item.version}
              </a>
            ))}
          </div>

          {articlesByVersion.map((group) => (
            <section
              key={group.version}
              id={releaseNoteVersionAnchor(group.version)}
              className="scroll-mt-24 border-b border-border/70 pb-10 last:border-b-0 last:pb-0"
            >
              <header className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="font-mono text-2xl font-semibold tracking-tight text-foreground">
                  v{group.version}
                </h2>
                <time dateTime={group.date} className="text-sm text-muted-foreground">
                  {group.dateDisplay}
                </time>
              </header>
              <p className="mb-2 text-sm text-muted-foreground">
                {group.articles.length === 1
                  ? "1 update in this release"
                  : `${group.articles.length} updates in this release`}
              </p>

              <div>
                {group.articles.map((article) => (
                  <ReleaseNoteEntry key={article.id} article={article} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
