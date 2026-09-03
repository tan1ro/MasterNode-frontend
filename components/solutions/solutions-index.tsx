import Link from "next/link"
import { ArrowUpRight, Layers, Sparkles } from "lucide-react"
import {
  SOLUTION_CATEGORY_ORDER,
  solutionsByCategory,
  type SolutionAccent,
} from "@/constants/solutions"
import { Reveal } from "@/components/solutions/reveal"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"

const ACCENT_ICON: Record<SolutionAccent, string> = {
  amber: "bg-amber/10 text-amber border-amber/25",
  cyan: "bg-cyan/10 text-cyan border-cyan/25",
  violet: "bg-violet/10 text-violet border-violet/25",
  emerald: "bg-emerald/10 text-emerald border-emerald/25",
  sky: "bg-sky/10 text-sky border-sky/25",
  oc: "bg-oc/10 text-oc border-oc/25",
}

export function SolutionsIndex() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6">
        <Reveal as="div">
          <header className="border-b border-border pb-8 dark:border-white/10">
            <span className="home-section-badge inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.08em]">
              <Layers className="size-3.5" aria-hidden />
              Solutions
            </span>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Every assistant in your gallery, orchestrated
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              MasterNode decomposes a goal, runs a swarm of specialized assistants in parallel, and
              merges validated results. Each solution below is built from the real assistants on
              your{" "}
              <Link href={ROUTES.agents} className="font-medium text-foreground underline-offset-4 hover:underline">
                Assistants
              </Link>{" "}
              page — grouped by workflow and by team.
            </p>
          </header>
        </Reveal>

        {SOLUTION_CATEGORY_ORDER.map((category) => (
          <section key={category} className="mt-12">
            <Reveal>
              <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {category}
              </h2>
            </Reveal>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {solutionsByCategory(category).map((solution, i) => {
                const Icon = solution.icon
                return (
                  <Reveal key={solution.slug} delay={(i % 3) * 80} className="h-full">
                    <Link
                      href={ROUTES.solution(solution.slug)}
                      className="group flex h-full flex-col rounded-2xl border border-border/60 bg-card/40 p-6 transition-colors hover:border-border hover:bg-card/70"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "flex size-11 items-center justify-center rounded-xl border",
                            ACCENT_ICON[solution.accent]
                          )}
                        >
                          <Icon className="size-5" aria-hidden />
                        </span>
                        <ArrowUpRight
                          className="size-4 text-muted-foreground/50 transition-colors group-hover:text-foreground"
                          aria-hidden
                        />
                      </div>
                      <h3 className="mt-4 font-semibold text-foreground">{solution.name}</h3>
                      <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                        {solution.subtitle}
                      </p>
                    </Link>
                  </Reveal>
                )
              })}
            </div>
          </section>
        ))}

        <Reveal className="mt-16 flex flex-col items-start justify-between gap-6 rounded-3xl border border-border/60 bg-card/40 p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl">
              <Sparkles className="size-5 text-amber" aria-hidden />
              Not sure where to start?
            </h2>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">
              Browse the full Assistants gallery and enable the ones that fit your work — then
              orchestrate them together.
            </p>
          </div>
          <Link
            href={ROUTES.agents}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/60"
          >
            Explore assistants
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </Reveal>
      </div>
    </main>
  )
}
