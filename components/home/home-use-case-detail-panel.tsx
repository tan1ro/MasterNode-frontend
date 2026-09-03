"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { assistantCategoryTheme } from "@/components/agent-templates/template-role-utils"
import { HOME_USE_CASE_BENEFITS } from "@/components/home/home-use-case-benefits"
import type { UseCaseHub } from "@/components/home/home-use-case-network-data"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/routes"

export function HomeUseCaseDetailPanel({
  hub,
  className,
}: {
  hub: UseCaseHub
  className?: string
}) {
  const Icon = hub.icon
  const theme = assistantCategoryTheme(hub.id)

  return (
    <aside
      className={cn(
        "home-use-case-detail flex min-w-0 max-w-full flex-col overflow-hidden rounded-2xl bg-background/80 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none",
        className
      )}
      aria-live="polite"
    >
      <div className="min-w-0 divide-y divide-border/60 dark:divide-white/10">
        {HOME_USE_CASE_BENEFITS.map((benefit) => {
          const BenefitIcon = benefit.icon
          return (
            <div key={benefit.id} className="py-4 first:pt-0">
              <div className="flex min-w-0 items-center gap-3">
                <BenefitIcon
                  className="size-5 shrink-0 text-muted-foreground sm:size-6"
                  strokeWidth={1.6}
                  aria-hidden
                />
                <h3 className="min-w-0 whitespace-nowrap font-heading text-lg font-semibold leading-none text-foreground sm:text-xl">
                  {benefit.title}
                </h3>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          )
        })}
      </div>

      <div
        key={hub.id}
        className="home-use-case-detail__domain mt-6 rounded-2xl border border-border/70 bg-card/50 p-5 dark:border-white/10 dark:bg-white/[0.03]"
      >
        <div className="flex items-center gap-2.5">
          <span className={cn("flex size-8 items-center justify-center rounded-lg", theme.cardIcon)}>
            <Icon className="size-4" aria-hidden />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Selected domain
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-heading text-base font-semibold text-foreground">{hub.label}</p>
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{hub.description}</p>
        <p className="mt-3 text-sm italic text-foreground/80">&ldquo;{hub.examples[0]}&rdquo;</p>
      </div>

      <Link
        href={ROUTES.signUp}
        className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-amber"
      >
        Try it free
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </aside>
  )
}
