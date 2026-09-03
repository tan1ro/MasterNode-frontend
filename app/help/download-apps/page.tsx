"use client"

import { Download, Globe, Smartphone } from "lucide-react"
import { DownloadCatalog } from "@/components/download/download-catalog"
import { HomeDesktopAppPreview } from "@/components/home/home-desktop-app-preview"
import { HelpResourceLayout } from "@/components/help/help-resource-layout"
import {
  MarketingCard,
  MarketingCtaButton,
  MarketingGhostButton,
  MarketingSectionTitle,
} from "@/components/marketing/marketing-page"
import { ROUTES } from "@/lib/routes"

export default function DownloadAppsPage() {
  return (
    <HelpResourceLayout
      title="Download apps"
      description="Install MasterNode Desktop on your laptop as a macOS .dmg or Windows .exe, or keep using the web app. The desktop app searches, generates a project in a folder you pick, and opens VS Code."
      icon={Download}
      width="wide"
      actions={
        <>
          <MarketingCtaButton href={ROUTES.download}>Download desktop</MarketingCtaButton>
          <MarketingGhostButton href={ROUTES.chat}>Open web app</MarketingGhostButton>
        </>
      }
    >
      <div id="desktop-package" className="scroll-mt-28">
        <div className="mx-auto w-full max-w-[56rem]">
          <HomeDesktopAppPreview />
        </div>
        <div className="mt-10">
          <DownloadCatalog />
        </div>
      </div>

      <div className="mt-14">
        <MarketingSectionTitle
          eyebrow="04 — also available"
          title="Web and mobile"
          description="Use the workspace in a browser today. Native phone apps are still on the way."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <MarketingCard>
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-amber dark:border-white/10 dark:bg-white/[0.04]">
                <Globe className="size-5" aria-hidden />
              </span>
              <h2 className="font-semibold text-foreground">Web app</h2>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Use the full MasterNode workspace in any modern browser — no install required.
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-cyan">Available now</p>
          </MarketingCard>
          <MarketingCard>
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-amber dark:border-white/10 dark:bg-white/[0.04]">
                <Smartphone className="size-5" aria-hidden />
              </span>
              <h2 className="font-semibold text-foreground">Mobile</h2>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              iOS and Android apps for chat on the go are still on the way.
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Coming soon
            </p>
          </MarketingCard>
        </div>
      </div>
    </HelpResourceLayout>
  )
}
