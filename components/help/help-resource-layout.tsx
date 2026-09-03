"use client"

import type { ComponentType, ReactNode } from "react"
import Link from "next/link"
import { HOME_SHELL } from "@/components/home/home-accent-styles"
import {
  MarketingCtaButton,
  MarketingEyebrow,
  MarketingGhostButton,
  MarketingSection,
} from "@/components/marketing/marketing-page"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"

interface HelpResourceLayoutProps {
  title: string
  description: string
  icon: ComponentType<{ className?: string }>
  children: ReactNode
  /** Optional primary CTA under the hero. */
  actions?: ReactNode
  width?: "wide" | "narrow"
}

export function HelpResourceLayout({
  title,
  description,
  icon: Icon,
  children,
  actions,
  width = "narrow",
}: HelpResourceLayoutProps) {
  return (
    <main className="pb-24">
      <header className="px-4 pb-10 pt-[calc(var(--home-landing-nav-height)+2rem)] text-center sm:px-6 sm:pb-12">
        <div className={cn(HOME_SHELL, "max-w-4xl")}>
          <div className="mb-6 text-left">
            <Link
              href={ROUTES.help}
              className="text-sm text-muted-foreground transition-colors hover:text-amber"
            >
              ← Help Center
            </Link>
          </div>
          <div className="flex flex-col items-center">
            <MarketingEyebrow>
              <span className="inline-flex items-center gap-2">
                <Icon className="size-3.5" aria-hidden />
                Help
              </span>
            </MarketingEyebrow>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {title}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {description}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {actions ?? (
                <>
                  <MarketingCtaButton href={ROUTES.chat}>Open chat</MarketingCtaButton>
                  <MarketingGhostButton href={ROUTES.contact}>Contact us</MarketingGhostButton>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <MarketingSection width={width} className="pb-10">
        {children}
      </MarketingSection>
    </main>
  )
}
