"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { HOME_SHELL } from "@/components/home/home-accent-styles"
import { HomeScrollReveal } from "@/components/home/home-scroll-reveal"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function HomeCta({
  ctaHref,
  ctaLabel,
  className,
}: {
  ctaHref: string
  ctaLabel: string
  className?: string
}) {
  return (
    <section className={cn("border-t border-border px-4 py-14 sm:px-6 sm:py-20 lg:px-10", className)}>
      <div className={HOME_SHELL}>
        <HomeScrollReveal>
          <p className="font-mono text-[11px] lowercase tracking-[0.2em] text-muted-foreground">
            05 — start
          </p>
          <h2 className="mt-2 font-heading text-2xl font-semibold uppercase tracking-tight text-foreground sm:text-3xl">
            Ready to build?
          </h2>
          <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
            Bring your models and data.
          </p>
          <Link href={ctaHref} className="mt-8 inline-block">
            <Button
              size="lg"
              className="rounded-full border border-amber/30 bg-amber px-8 text-amber-foreground hover:bg-amber/90"
            >
              {ctaLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </HomeScrollReveal>
      </div>
    </section>
  )
}
