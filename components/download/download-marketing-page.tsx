"use client"

import Link from "next/link"
import { ArrowRight, BookOpen, Globe, History } from "lucide-react"
import { DownloadCatalog } from "@/components/download/download-catalog"
import { HomeDesktopAppPreview } from "@/components/home/home-desktop-app-preview"
import { HomeDesktopDownloadCta } from "@/components/home/home-desktop-download-cta"
import {
  MarketingCard,
  MarketingGhostButton,
  MarketingHero,
  MarketingSection,
  MarketingSectionTitle,
} from "@/components/marketing/marketing-page"
import { useAppAuth } from "@/hooks/use-app-auth"
import { ROLE_HOME, parseRole } from "@/lib/rbac"
import { ROUTES } from "@/lib/routes"

export function DownloadMarketingPage() {
  const { isSignedIn, accountType } = useAppAuth()
  const workspaceHref = isSignedIn
    ? ROLE_HOME[parseRole(accountType) ?? "creator"]
    : ROUTES.signUp

  return (
    <main className="pb-24">
      <MarketingHero
        eyebrow="Desktop"
        title="Download MasterNode for your laptop"
        description="Install the native app as a macOS .dmg, Windows .exe, or Linux zip. Describe a goal, pick a folder, and MasterNode searches, generates the project, and opens VS Code — with you starting every run."
        actions={
          <>
            <HomeDesktopDownloadCta className="home-cta-gradient inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold text-[#0D0D10]" />
            <MarketingGhostButton href={ROUTES.changelog}>
              Previous releases
              <History className="size-4" aria-hidden />
            </MarketingGhostButton>
          </>
        }
      />

      <MarketingSection className="pb-14">
        <div className="mx-auto w-full max-w-[56rem]">
          <HomeDesktopAppPreview />
        </div>
      </MarketingSection>

      <MarketingSection className="pb-14">
        <DownloadCatalog />
      </MarketingSection>

      <MarketingSection className="pb-14">
        <MarketingSectionTitle
          eyebrow="04 — also available"
          title="Use MasterNode in the browser"
          description="The same workspace runs in any modern browser — no install required. Help Center covers setup if you want a walkthrough."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <MarketingCard className="h-full">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-amber dark:border-white/10 dark:bg-white/[0.04]">
                <Globe className="size-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground">Web app</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Open chat, tasks, and memory in the browser. Sign in once and pick up where you left off.
                </p>
                <Link
                  href={workspaceHref}
                  className="mt-4 inline-flex items-center gap-2 rounded-md border border-border px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-amber/40 hover:text-amber dark:border-white/16"
                >
                  {isSignedIn ? "Open workspace" : "Get started free"}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </div>
          </MarketingCard>
          <MarketingCard className="h-full">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-amber dark:border-white/10 dark:bg-white/[0.04]">
                <BookOpen className="size-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground">Setup guides</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Laptop install notes, web vs desktop, and what to do after you download the package.
                </p>
                <Link
                  href={ROUTES.helpDownloadApps}
                  className="mt-4 inline-flex items-center gap-2 rounded-md border border-border px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-amber/40 hover:text-amber dark:border-white/16"
                >
                  Help Center
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </div>
          </MarketingCard>
        </div>
      </MarketingSection>

      <MarketingSection width="narrow">
        <MarketingCard className="border-amber/20 bg-amber/[0.04]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-foreground">Ready to run an agent on this laptop?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Download the package for your OS, or start in the browser while the installer finishes.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <HomeDesktopDownloadCta className="home-cta-gradient inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold text-[#0D0D10]" />
              <Link
                href={workspaceHref}
                className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-amber/40 hover:text-amber dark:border-white/16"
              >
                {isSignedIn ? "Open workspace" : "Use the web app"}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </MarketingCard>
      </MarketingSection>
    </main>
  )
}
