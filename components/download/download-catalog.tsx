"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AppWindow, Check, Code2, Copy, Layers, Zap } from "lucide-react"
import { DesktopDownloadPanel } from "@/components/download/desktop-download-panel"
import { AppleLogo, LinuxLogo, WindowsLogo } from "@/components/download/os-icons"
import {
  MarketingCard,
  MarketingSectionTitle,
} from "@/components/marketing/marketing-page"
import { useClipboard } from "@/hooks/use-clipboard"
import {
  DESKTOP_APP_VERSION,
  DESKTOP_CLI_VERSION,
  DESKTOP_IDE_EXTENSIONS,
  desktopCliCommands,
  detectDesktopPlatform,
  type DesktopPlatformId,
} from "@/lib/desktop-app"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"

const IDE_ICONS = {
  vscode: Code2,
  "visual-studio": AppWindow,
  jetbrains: Layers,
  zed: Zap,
} as const

const OS_ICONS = {
  macos: AppleLogo,
  windows: WindowsLogo,
  linux: LinuxLogo,
} as const

function VersionBadge({ version }: { version: string }) {
  return (
    <span className="home-section-badge home-section-badge--amber inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
      v{version}
    </span>
  )
}

function CliBlock({
  platform,
  label,
  command,
}: {
  platform: DesktopPlatformId
  label: string
  command: string
}) {
  const { copy, hasCopied } = useClipboard()
  const copied = hasCopied(command)
  const Icon = OS_ICONS[platform]

  return (
    <div className="space-y-3">
      <p className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Icon className="size-4" />
        {label}
      </p>
      <div className="flex items-center gap-1 rounded-2xl border border-border bg-muted/40 py-2 pl-4 pr-1.5 dark:border-white/12 dark:bg-white/[0.04]">
        <pre className="min-w-0 flex-1 overflow-x-auto font-mono text-[13px] leading-6 text-foreground">
          <code>{command}</code>
        </pre>
        <button
          type="button"
          className="flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-white/[0.06]"
          onClick={() => copy(command)}
          aria-label={copied ? "Copied" : "Copy install command"}
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </button>
      </div>
    </div>
  )
}

export function DownloadCatalog({ className }: { className?: string }) {
  const [platform, setPlatform] = useState<DesktopPlatformId>("macos")
  const [origin, setOrigin] = useState("https://masternode.in")
  const cliCommands = desktopCliCommands(platform, origin)

  useEffect(() => {
    setPlatform(detectDesktopPlatform())
    setOrigin(window.location.origin)
  }, [])

  return (
    <div className={cn("space-y-14", className)}>
      <section>
        <MarketingSectionTitle
          eyebrow="01 — package"
          title={
            <span className="inline-flex flex-wrap items-center gap-2">
              MasterNode Desktop
              <VersionBadge version={DESKTOP_APP_VERSION} />
            </span>
          }
          description="Native windowing, an integrated agent panel, and a full execution workspace. macOS ships as .dmg, Windows as .exe, Linux as a zip."
        />
        <DesktopDownloadPanel selected={platform} onSelect={setPlatform} />
      </section>

      <section>
        <MarketingSectionTitle
          eyebrow="02 — terminal"
          title={
            <span className="inline-flex flex-wrap items-center gap-2">
              MasterNode CLI
              <VersionBadge version={DESKTOP_CLI_VERSION} />
            </span>
          }
          description="Install from your terminal, then describe a goal and let the agent work in a folder you pick."
        />
        <div className="space-y-6">
          {cliCommands.map((item) => (
            <CliBlock
              key={item.label}
              platform={platform}
              label={item.label}
              command={item.command}
            />
          ))}
        </div>
      </section>

      <section>
        <MarketingSectionTitle
          eyebrow="03 — editors"
          title="MasterNode for IDEs"
          description="Bring agent capabilities into the editor you already use, or stay in the standalone desktop app above."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {DESKTOP_IDE_EXTENSIONS.map((ide) => {
            const Icon = IDE_ICONS[ide.id]
            return (
              <MarketingCard key={ide.id} className="h-full">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-foreground dark:border-white/10 dark:bg-white/[0.04]">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground">{ide.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {ide.description}
                    </p>
                    <Link
                      href={ROUTES.docs}
                      className="mt-4 inline-flex rounded-md border border-border px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-amber/40 hover:text-amber dark:border-white/16"
                    >
                      View docs
                    </Link>
                  </div>
                </div>
              </MarketingCard>
            )
          })}
        </div>
      </section>
    </div>
  )
}
