import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react"
import { HOME_SHELL } from "@/components/home/home-accent-styles"
import { BLOG_ACCENT_TILE } from "@/components/blog/blog-accents"
import { BLOG_ICONS, BLOG_POSTS, getPostBySlug, getRelatedPosts } from "@/constants/blog"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) {
    return { title: "Post not found — MasterNode Blog" }
  }
  return {
    title: `${post.title} — MasterNode Blog`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.isoDate,
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) {
    notFound()
  }

  const related = getRelatedPosts(post.slug)
  const Icon = BLOG_ICONS[post.icon]

  return (
    <main className="pb-24">
      <article className={cn(HOME_SHELL, "max-w-3xl px-4 pt-[calc(var(--home-landing-nav-height)+3rem)] sm:px-6")}>
        <Link
          href={ROUTES.blog}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground/80 transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Blog
        </Link>

        <header className="mt-6">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground/70">
            <span className="rounded-full border border-border dark:border-white/15 bg-muted/40 dark:bg-white/[0.04] px-2.5 py-0.5 font-semibold uppercase tracking-wide text-amber">
              {post.category}
            </span>
            <time dateTime={post.isoDate}>{post.date}</time>
            <span aria-hidden>·</span>
            <span>{post.readingMinutes} min read</span>
          </div>
          <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">{post.excerpt}</p>
          <p className="mt-5 text-sm text-muted-foreground/80">
            By <span className="font-medium text-foreground/80">{post.author.name}</span> · {post.author.role}
          </p>
        </header>

        <div
          className={cn(
            "mt-8 flex aspect-[16/7] items-center justify-center overflow-hidden rounded-2xl border border-border dark:border-white/10 bg-gradient-to-br",
            BLOG_ACCENT_TILE[post.accent]
          )}
        >
          <Icon className="h-16 w-16 opacity-90" aria-hidden />
        </div>

        <div className="mt-10 space-y-8">
          {post.content.map((section, i) => (
            <section key={section.heading ?? `section-${i}`}>
              {section.heading ? (
                <h2 className="text-xl font-semibold tracking-tight text-foreground">{section.heading}</h2>
              ) : null}
              {section.paragraphs?.map((paragraph, j) => (
                <p
                  key={j}
                  className={cn(
                    "text-[15px] leading-relaxed text-muted-foreground",
                    section.heading ? (j === 0 ? "mt-3" : "mt-4") : j === 0 ? "" : "mt-4"
                  )}
                >
                  {paragraph}
                </p>
              ))}
              {section.bullets ? (
                <ul className="mt-4 space-y-2">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-muted-foreground">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber" aria-hidden />
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-3 rounded-2xl border border-amber/20 bg-amber/[0.04] p-6">
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-foreground">Try MasterNode</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Bring your own model keys and run your first parallel workflow in minutes.
            </p>
          </div>
          <Link
            href={ROUTES.signUp}
            className="home-cta-gradient inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-[#0A0A14]"
          >
            Get started
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </article>

      {related.length > 0 ? (
        <section className={cn(HOME_SHELL, "mt-16 px-4 sm:px-6")}>
          <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground/70">
            Keep reading
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {related.map((rel) => {
              const RelIcon = BLOG_ICONS[rel.icon]
              return (
                <Link
                  key={rel.slug}
                  href={`${ROUTES.blog}/${rel.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-muted/20 p-5 transition-colors hover:border-border hover:bg-muted/40 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/20 dark:hover:bg-white/[0.04]"
                >
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-xl border border-border dark:border-white/10 bg-gradient-to-br",
                      BLOG_ACCENT_TILE[rel.accent]
                    )}
                  >
                    <RelIcon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="mt-4 text-xs text-muted-foreground/70">{rel.date}</span>
                  <span className="mt-1 flex items-start justify-between gap-2 font-medium text-foreground">
                    {rel.title}
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground/70 transition-colors group-hover:text-amber" aria-hidden />
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      ) : null}
    </main>
  )
}
