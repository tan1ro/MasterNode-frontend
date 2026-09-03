"use client"

import Link from "next/link"
import { Github, Linkedin, Twitter } from "lucide-react"
import { BrandLogo } from "@/components/layout/brand-logo"
import { AppVersionLine } from "@/components/layout/app-version-line"
import { FooterRegionSelector } from "@/components/layout/footer-region-selector"
import { HOME_SHELL } from "@/components/home/home-accent-styles"
import { socialLinksFromEnv } from "@/constants/footer"
import {
  SITE_FOOTER_LEGAL_LINKS,
  type SiteFooterColumn,
  type SiteFooterLink,
} from "@/constants/site-footer"
import { cn } from "@/lib/utils"

function FooterNavLink({ link, className }: { link: SiteFooterLink; className?: string }) {
  const Icon = link.icon
  const shared = cn(
    "inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline",
    className
  )

  const content = (
    <>
      <Icon className="size-3.5 shrink-0 opacity-70" aria-hidden />
      <span>{link.label}</span>
    </>
  )

  if (link.external) {
    return (
      <a href={link.href} className={shared} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    )
  }

  return (
    <Link href={link.href} className={shared}>
      {content}
    </Link>
  )
}

function FooterColumn({ column }: { column: SiteFooterColumn }) {
  if (column.links.length === 0) return null

  return (
    <nav aria-labelledby={`footer-${column.id}`}>
      <h2
        id={`footer-${column.id}`}
        className="text-xs font-semibold uppercase tracking-[0.08em] text-foreground"
      >
        {column.title}
      </h2>
      <ul className="mt-4 space-y-2.5">
        {column.links.map((link) => (
          <li key={`${column.id}-${link.label}`}>
            <FooterNavLink link={link} />
          </li>
        ))}
      </ul>
    </nav>
  )
}

function FooterBottomLegalBar({ className }: { className?: string }) {
  return (
    <nav
      aria-label="Legal"
      className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 text-xs", className)}
    >
      {SITE_FOOTER_LEGAL_LINKS.map((link, index) => (
        <span key={link.href} className="inline-flex items-center gap-2">
          {index > 0 ? <span className="text-muted-foreground/50" aria-hidden>|</span> : null}
          <FooterNavLink link={link} className="text-xs" />
        </span>
      ))}
    </nav>
  )
}

function SocialLinks({ className }: { className?: string }) {
  const social = socialLinksFromEnv()

  return (
    <div className={cn("flex items-center gap-4", className)}>
      {social.github ? (
        <a
          href={social.github}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground transition-colors hover:text-foreground"
          aria-label="GitHub"
        >
          <Github className="size-4" />
        </a>
      ) : null}
      {social.twitter ? (
        <a
          href={social.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Twitter"
        >
          <Twitter className="size-4" />
        </a>
      ) : null}
      {social.linkedin ? (
        <a
          href={social.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground transition-colors hover:text-foreground"
          aria-label="LinkedIn"
        >
          <Linkedin className="size-4" />
        </a>
      ) : null}
    </div>
  )
}

export function SiteFooter({
  variant,
  columns,
  className,
}: {
  variant: "home" | "app"
  columns: SiteFooterColumn[]
  className?: string
}) {
  const isHome = variant === "home"

  return (
    <footer
      className={cn(
        "relative z-10 isolate mt-auto border-t border-border bg-background dark:bg-[#040206]",
        isHome ? "" : "backdrop-blur-xl",
        className
      )}
    >
      <div className={cn(isHome ? HOME_SHELL : "container mx-auto max-w-7xl px-4 sm:px-6")}>
        <div
          className={cn(
            "grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-6 lg:gap-8 lg:py-14",
            isHome ? "px-4 sm:px-6 lg:px-10" : ""
          )}
        >
          <div className="sm:col-span-2 lg:col-span-2">
            <BrandLogo size="md" asLink variant="full" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {isHome
                ? "AI agent teams for real work."
                : "Parallel LLM agent orchestration — π (Pi) Parallel Intelligence Engine."}
            </p>
            <SocialLinks className="mt-6" />
          </div>

          {columns.map((column) => (
            <FooterColumn key={column.id} column={column} />
          ))}
        </div>

        <div
          className={cn(
            "border-t border-border py-6",
            isHome ? "px-4 sm:px-6 lg:px-10" : ""
          )}
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <FooterBottomLegalBar />
            <div className="ml-auto flex items-center gap-4">
              {isHome ? (
                <p className="hidden italic text-muted-foreground sm:block">
                  Built for teams that get work done.
                </p>
              ) : (
                <AppVersionLine />
              )}
              <FooterRegionSelector />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
