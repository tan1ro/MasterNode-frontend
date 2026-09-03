import Link from "next/link"
import { ArrowLeft, ArrowRight, ArrowUpRight, Quote, Sparkles } from "lucide-react"
import type { SolutionAccent, SolutionDef } from "@/constants/solutions"
import { SolutionLiveDemo } from "@/components/solutions/solution-live-demo"
import { Reveal } from "@/components/solutions/reveal"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"

const ACCENT: Record<
  SolutionAccent,
  { text: string; softBg: string; border: string; dot: string; glow: string; button: string }
> = {
  amber: {
    text: "text-amber",
    softBg: "bg-amber/10",
    border: "border-amber/25",
    dot: "bg-amber",
    glow: "from-amber/20",
    button: "bg-amber text-black hover:bg-amber/90",
  },
  cyan: {
    text: "text-cyan",
    softBg: "bg-cyan/10",
    border: "border-cyan/25",
    dot: "bg-cyan",
    glow: "from-cyan/20",
    button: "bg-cyan text-black hover:bg-cyan/90",
  },
  violet: {
    text: "text-violet",
    softBg: "bg-violet/10",
    border: "border-violet/25",
    dot: "bg-violet",
    glow: "from-violet/20",
    button: "bg-violet text-violet-foreground hover:bg-violet/90",
  },
  emerald: {
    text: "text-emerald",
    softBg: "bg-emerald/10",
    border: "border-emerald/25",
    dot: "bg-emerald",
    glow: "from-emerald/20",
    button: "bg-emerald text-black hover:bg-emerald/90",
  },
  sky: {
    text: "text-sky",
    softBg: "bg-sky/10",
    border: "border-sky/25",
    dot: "bg-sky",
    glow: "from-sky/20",
    button: "bg-sky text-black hover:bg-sky/90",
  },
  oc: {
    text: "text-oc",
    softBg: "bg-oc/10",
    border: "border-oc/25",
    dot: "bg-oc",
    glow: "from-oc/20",
    button: "bg-oc text-black hover:bg-oc/90",
  },
}

const SHELL = "mx-auto w-full max-w-6xl px-4 sm:px-6"

export function SolutionPage({ solution }: { solution: SolutionDef }) {
  const c = ACCENT[solution.accent]
  const Icon = solution.icon

  return (
    <main className="min-h-screen pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden pt-24">
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-gradient-to-b to-transparent opacity-70",
            c.glow
          )}
          aria-hidden
        />
        <div className={cn(SHELL, "relative")}>
          <Link
            href={ROUTES.solutions}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground/80 transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            All solutions
          </Link>

          <div className="mt-6 grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em]",
                  c.border,
                  c.softBg,
                  c.text
                )}
              >
                <Icon className="size-3.5" aria-hidden />
                {solution.eyebrow} · {solution.name}
              </span>
              <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {solution.title}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {solution.subtitle}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={ROUTES.signUp}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors",
                    c.button
                  )}
                >
                  Get started
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                <Link
                  href={ROUTES.contact}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground/85 transition-colors hover:border-border hover:text-foreground"
                >
                  Contact sales
                </Link>
              </div>
            </div>

            <SolutionLiveDemo demo={solution.demo} accent={solution.accent} />
          </div>

          {/* Stats */}
          <dl className="mt-14 grid grid-cols-1 gap-4 border-t border-border pt-8 sm:grid-cols-3">
            {solution.stats.map((stat) => (
              <div key={stat.label}>
                <dt className={cn("text-3xl font-bold tracking-tight", c.text)}>{stat.value}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Value props */}
      <section className={cn(SHELL, "mt-20")}>
        <Reveal>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Built for {solution.name.toLowerCase()}
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {solution.valueProps.map((prop, i) => {
            const PropIcon = prop.icon
            return (
              <Reveal
                key={prop.title}
                delay={i * 80}
                className="rounded-2xl border border-border bg-muted/20 p-6 transition-colors hover:border-border dark:hover:border-white/20 hover:bg-muted/40"
              >
                <span
                  className={cn(
                    "flex size-11 items-center justify-center rounded-xl border",
                    c.border,
                    c.softBg,
                    c.text
                  )}
                >
                  <PropIcon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-semibold text-foreground">{prop.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {prop.description}
                </p>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* Assistants from the gallery */}
      <section className={cn(SHELL, "mt-20")}>
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em]",
                c.border,
                c.softBg,
                c.text
              )}
            >
              <Sparkles className="size-3.5" aria-hidden />
              {solution.galleryFocus} · from your gallery
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              The assistants behind this solution
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              These are real, ready-made assistants from the Assistants gallery. Enable them,
              customize the prompts, and orchestrate them together.
            </p>
          </div>
          <Link
            href={ROUTES.agents}
            className={cn("inline-flex items-center gap-1.5 text-sm font-semibold", c.text)}
          >
            Browse all assistants
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {solution.assistants.map((assistant, i) => {
            const AssistantIcon = assistant.icon
            return (
              <Reveal
                key={assistant.name}
                delay={(i % 3) * 80}
                className="group flex h-full flex-col rounded-2xl border border-border bg-muted/20 p-5 transition-colors hover:border-border dark:hover:border-white/20 hover:bg-muted/40"
              >
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl border",
                    c.border,
                    c.softBg,
                    c.text
                  )}
                >
                  <AssistantIcon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-semibold text-foreground">{assistant.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {assistant.blurb}
                </p>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* Capabilities */}
      <section className={cn(SHELL, "mt-16")}>
        <Reveal className="overflow-hidden rounded-3xl border border-border bg-muted/20">
          <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">{solution.capabilities.title}</h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                {solution.capabilities.description}
              </p>
              <Link
                href={ROUTES.docs}
                className={cn("mt-5 inline-flex items-center gap-1.5 text-sm font-semibold", c.text)}
              >
                Explore capabilities
                <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {solution.capabilities.items.map((item) => {
                const ItemIcon = item.icon
                return (
                  <li
                    key={item.label}
                    className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3"
                  >
                    <span className={cn("flex size-9 items-center justify-center rounded-lg", c.softBg, c.text)}>
                      <ItemIcon className="size-4" aria-hidden />
                    </span>
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </Reveal>
      </section>

      {/* Testimonial */}
      <section className={cn(SHELL, "mt-16")}>
        <Reveal
          as="div"
          className={cn("rounded-3xl border bg-gradient-to-br to-transparent", c.border, c.glow)}
        >
          <figure className="p-8 sm:p-10">
            <Quote className={cn("size-8", c.text)} aria-hidden />
            <blockquote className="mt-4 text-lg font-medium leading-relaxed text-foreground sm:text-xl">
              “{solution.testimonial.quote}”
            </blockquote>
            <figcaption className="mt-4 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{solution.testimonial.author}</span>
              {" · "}
              {solution.testimonial.role}
            </figcaption>
          </figure>
        </Reveal>
      </section>

      {/* CTA */}
      <section className={cn(SHELL, "mt-16")}>
        <Reveal className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-border bg-muted/20 p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Get started with MasterNode</h2>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">
              Start free and bring your own model keys. Scale into parallel orchestration as your
              workloads grow.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              href={ROUTES.signUp}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors",
                c.button
              )}
            >
              Start free
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href={ROUTES.pricing}
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground/85 transition-colors hover:border-border hover:text-foreground"
            >
              See pricing
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Resources */}
      <section className={cn(SHELL, "mt-16")}>
        <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground/70">
          {solution.name} resources
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {solution.resources.map((res, i) => {
            const ResIcon = res.icon
            return (
              <Reveal key={res.title} delay={i * 80} className="h-full">
                <Link
                  href={res.href}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-muted/20 p-5 transition-colors hover:border-border dark:hover:border-white/20 hover:bg-muted/40"
                >
                  <span className={cn("flex size-10 items-center justify-center rounded-xl", c.softBg, c.text)}>
                    <ResIcon className="size-5" aria-hidden />
                  </span>
                  <span className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
                    {res.type}
                  </span>
                  <span className="mt-1 flex items-center justify-between gap-2 font-medium text-foreground">
                    {res.title}
                    <ArrowUpRight
                      className="size-4 shrink-0 text-muted-foreground/70 transition-colors group-hover:text-foreground"
                      aria-hidden
                    />
                  </span>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </section>
    </main>
  )
}
