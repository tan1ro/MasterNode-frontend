"use client"

import Link from "next/link"
import { useMemo, useRef, useState } from "react"
import {
  ArrowRight,
  ArrowUpRight,
  LayoutGrid,
  List,
  Mail,
  Newspaper,
  Search,
  Sparkles,
} from "lucide-react"
import { HOME_SHELL } from "@/components/home/home-accent-styles"
import { BLOG_ACCENT_TILE } from "@/components/blog/blog-accents"
import {
  BLOG_CATEGORIES,
  BLOG_ICONS,
  type BlogCategory,
  type BlogPost,
} from "@/constants/blog"
import { BRANDING } from "@/constants/branding"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"

type Filter = "All" | BlogCategory
type ViewMode = "grid" | "list"

export function BlogIndex({
  posts,
  featured,
  ctaHref,
}: {
  posts: BlogPost[]
  featured: BlogPost[]
  ctaHref: string
}) {
  const [category, setCategory] = useState<Filter>("All")
  const [query, setQuery] = useState("")
  const [view, setView] = useState<ViewMode>("grid")
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)

  const heroPost = featured[0] ?? posts[0]
  const stripPosts = featured.slice(0, 4)

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: posts.length }
    for (const cat of BLOG_CATEGORIES) {
      counts[cat] = posts.filter((p) => p.category === cat).length
    }
    return counts
  }, [posts])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts.filter((post) => {
      const matchesCategory = category === "All" || post.category === category
      const matchesQuery =
        q.length === 0 ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q) ||
        post.author.name.toLowerCase().includes(q)
      return matchesCategory && matchesQuery
    })
  }, [posts, category, query])

  function selectCategory(next: Filter) {
    setCategory(next)
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  function onSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSubscribed(true)
    setEmail("")
  }

  return (
    <main className="pb-24">
      {/* Hero */}
      <section
        className={cn(HOME_SHELL, "px-4 pt-[calc(var(--home-landing-nav-height)+3rem)] sm:px-6")}
      >
        <div className="grid gap-10 lg:grid-cols-[minmax(0,18rem)_1fr] lg:gap-14">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              <Newspaper className="h-4 w-4 text-amber" aria-hidden />
              Blog
            </p>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Product news, engineering notes, and practical guides for teams building with parallel
              agents.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href={ctaHref}
                className="home-cta-gradient inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-[#0A0A14]"
              >
                Try MasterNode
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href={ROUTES.helpReleaseNotes}
                className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-amber/40 hover:text-amber dark:border-white/15"
              >
                Release notes
              </Link>
            </div>
            <p className="mt-5 text-xs text-muted-foreground/80">
              {posts.length} posts · Updated regularly
            </p>
          </div>

          <nav aria-label="Browse by category" className="flex flex-col">
            {BLOG_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => selectCategory(cat)}
                className="group flex items-baseline justify-between gap-4 border-b border-border/40 py-2.5 text-left last:border-b-0 dark:border-white/10"
              >
                <span className="font-serif text-3xl leading-tight tracking-tight text-foreground/90 transition-colors group-hover:text-foreground sm:text-4xl">
                  {cat}
                </span>
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="tabular-nums">{categoryCounts[cat] ?? 0}</span>
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* Featured hero post */}
      {heroPost ? (
        <section className={cn(HOME_SHELL, "mt-12 px-4 sm:px-6")}>
          <Link
            href={`${ROUTES.blog}/${heroPost.slug}`}
            className="group grid overflow-hidden rounded-2xl border border-border dark:border-white/10 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
          >
            <div
              className={cn(
                "relative flex min-h-[12rem] items-center justify-center bg-gradient-to-br sm:min-h-[16rem]",
                BLOG_ACCENT_TILE[heroPost.accent]
              )}
            >
              {(() => {
                const Icon = BLOG_ICONS[heroPost.icon]
                return <Icon className="h-16 w-16 opacity-90 transition-transform duration-300 group-hover:scale-110 sm:h-20 sm:w-20" aria-hidden />
              })()}
              <span className="absolute left-4 top-4 rounded-full border border-border bg-background/85 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide backdrop-blur-sm dark:border-white/15 dark:bg-black/35">
                Featured
              </span>
            </div>
            <div className="flex flex-col justify-center bg-muted/20 p-6 sm:p-8 dark:bg-white/[0.03]">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-semibold uppercase tracking-wide text-amber">{heroPost.category}</span>
                <span aria-hidden>·</span>
                <time dateTime={heroPost.isoDate}>{heroPost.date}</time>
                <span aria-hidden>·</span>
                <span>{heroPost.readingMinutes} min read</span>
              </div>
              <h2 className="mt-3 text-2xl font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-amber sm:text-3xl">
                {heroPost.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {heroPost.excerpt}
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                Read article
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
              </span>
            </div>
          </Link>
        </section>
      ) : null}

      {/* Featured strip */}
      {stripPosts.length > 1 ? (
        <section className={cn(HOME_SHELL, "mt-10 px-4 sm:px-6")}>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            More highlights
          </p>
          <div className="grid divide-y divide-border border-y border-border dark:divide-white/10 dark:border-white/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-3">
            {stripPosts.slice(1, 4).map((post) => (
              <Link
                key={post.slug}
                href={`${ROUTES.blog}/${post.slug}`}
                className="group px-0 py-4 transition-colors sm:px-5 first:sm:pl-0 last:sm:pr-0"
              >
                <h3 className="text-sm font-semibold leading-snug text-foreground/90 transition-colors group-hover:text-amber">
                  {post.title}
                </h3>
                <p className="mt-2 text-xs text-muted-foreground/70">
                  {post.date} · {post.category}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Toolbar + feed */}
      <section className={cn(HOME_SHELL, "mt-12 px-4 sm:px-6")} ref={gridRef}>
        <div className="flex flex-col gap-4 border-b border-border pb-5 dark:border-white/10 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, topic, or author"
              aria-label="Search posts"
              className="w-full rounded-md border border-border bg-muted/30 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-border focus:outline-none focus:ring-1 focus:ring-ring/30 dark:border-white/10 dark:bg-white/[0.03]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-1.5">
              {(["All", ...BLOG_CATEGORIES] as Filter[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    category === cat
                      ? "border-border bg-muted/50 text-foreground dark:border-white/25 dark:bg-white/10"
                      : "border-border text-muted-foreground hover:border-border hover:text-foreground dark:border-white/10 dark:hover:border-white/20"
                  )}
                >
                  {cat}
                  <span className="ml-1.5 tabular-nums opacity-70">{categoryCounts[cat] ?? 0}</span>
                </button>
              ))}
            </div>

            <div className="ml-1 inline-flex rounded-md border border-border p-0.5 dark:border-white/10">
              <button
                type="button"
                onClick={() => setView("grid")}
                aria-label="Grid view"
                aria-pressed={view === "grid"}
                className={cn(
                  "rounded p-1.5 transition-colors",
                  view === "grid"
                    ? "bg-muted/50 text-foreground dark:bg-white/10"
                    : "text-muted-foreground/70 hover:text-foreground"
                )}
              >
                <LayoutGrid className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                aria-label="List view"
                aria-pressed={view === "list"}
                className={cn(
                  "rounded p-1.5 transition-colors",
                  view === "list"
                    ? "bg-muted/50 text-foreground dark:bg-white/10"
                    : "text-muted-foreground/70 hover:text-foreground"
                )}
              >
                <List className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Showing {filtered.length} of {posts.length}
          {category !== "All" ? ` in ${category}` : ""}
          {query.trim() ? ` for “${query.trim()}”` : ""}
        </p>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-muted-foreground/80">No posts match your search.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("")
                setCategory("All")
              }}
              className="mt-3 text-sm font-medium text-amber underline-offset-4 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : view === "grid" ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <div className="mt-4 divide-y divide-border dark:divide-white/10">
            {filtered.map((post) => (
              <PostRow key={post.slug} post={post} />
            ))}
          </div>
        )}
      </section>

      {/* Subscribe + links */}
      <section className={cn(HOME_SHELL, "mt-16 px-4 sm:px-6")}>
        <div className="grid gap-6 rounded-2xl border border-border bg-muted/20 p-6 dark:border-white/10 dark:bg-white/[0.03] sm:p-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Stay in the loop
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              New posts and product updates
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Get a short note when we publish guides and release write-ups. No spam — only shipping
              news from {BRANDING.productName}.
            </p>
          </div>

          <div>
            {subscribed ? (
              <p className="rounded-lg border border-emerald/30 bg-emerald/10 px-4 py-3 text-sm text-emerald">
                Thanks — we&apos;ll be in touch at the address you shared.
              </p>
            ) : (
              <form onSubmit={onSubscribe} className="flex flex-col gap-2 sm:flex-row">
                <label className="sr-only" htmlFor="blog-subscribe-email">
                  Email
                </label>
                <div className="relative min-w-0 flex-1">
                  <Mail
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70"
                    aria-hidden
                  />
                  <input
                    id="blog-subscribe-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full rounded-md border border-border bg-background py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring/40 dark:border-white/15"
                  />
                </div>
                <button
                  type="submit"
                  className="home-cta-gradient inline-flex shrink-0 items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold text-[#0A0A14]"
                >
                  Subscribe
                </button>
              </form>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Prefer the full list? See{" "}
              <Link href={ROUTES.helpReleaseNotes} className="text-foreground underline-offset-2 hover:underline">
                Release notes
              </Link>{" "}
              or{" "}
              <Link href={ROUTES.contact} className="text-foreground underline-offset-2 hover:underline">
                Contact
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

function PostCard({ post }: { post: BlogPost }) {
  const Icon = BLOG_ICONS[post.icon]
  return (
    <Link href={`${ROUTES.blog}/${post.slug}`} className="group flex flex-col">
      <div
        className={cn(
          "relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-border bg-gradient-to-br dark:border-white/10",
          BLOG_ACCENT_TILE[post.accent]
        )}
      >
        <Icon
          className="h-14 w-14 opacity-90 transition-transform duration-300 group-hover:scale-110"
          aria-hidden
        />
        <span className="absolute left-3 top-3 rounded-full border border-border bg-background/80 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-foreground backdrop-blur-sm dark:border-white/15 dark:bg-black/30 dark:text-white">
          {post.category}
        </span>
      </div>
      <p className="mt-4 text-xs text-muted-foreground/70">
        {post.date} · {post.readingMinutes} min read
      </p>
      <h3 className="mt-1 flex items-start justify-between gap-2 font-semibold leading-snug text-foreground transition-colors group-hover:text-amber">
        {post.title}
        <ArrowUpRight
          className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70 transition-colors group-hover:text-amber"
          aria-hidden
        />
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
    </Link>
  )
}

function PostRow({ post }: { post: BlogPost }) {
  const Icon = BLOG_ICONS[post.icon]
  return (
    <Link href={`${ROUTES.blog}/${post.slug}`} className="group flex items-center gap-4 py-5">
      <span
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-gradient-to-br dark:border-white/10",
          BLOG_ACCENT_TILE[post.accent]
        )}
      >
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
          <span className="font-semibold uppercase tracking-wide text-muted-foreground">
            {post.category}
          </span>
          <span aria-hidden>·</span>
          <span>{post.date}</span>
          <span aria-hidden>·</span>
          <span>{post.readingMinutes} min</span>
        </div>
        <h3 className="mt-1 truncate font-semibold text-foreground transition-colors group-hover:text-amber">
          {post.title}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{post.excerpt}</p>
      </div>
      <ArrowUpRight
        className="h-5 w-5 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-amber"
        aria-hidden
      />
    </Link>
  )
}
