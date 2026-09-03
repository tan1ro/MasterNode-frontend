"use client"

import { useEffect, useState } from "react"
import { Download } from "lucide-react"
import { AppleLogo, LinuxLogo, WindowsLogo } from "@/components/download/os-icons"
import { MarketingCard } from "@/components/marketing/marketing-page"
import {
  DESKTOP_APP_VERSION,
  DESKTOP_PLATFORMS,
  desktopButtonsForPlatform,
  detectDesktopPlatform,
  type DesktopDownloadButton,
  type DesktopPlatformId,
} from "@/lib/desktop-app"
import { cn } from "@/lib/utils"

const PLATFORM_ICONS = {
  macos: AppleLogo,
  windows: WindowsLogo,
  linux: LinuxLogo,
} as const

function DownloadFileButton({
  button,
  primary,
}: {
  button: DesktopDownloadButton
  primary?: boolean
}) {
  return (
    <a
      href={button.href}
      download={button.filename}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors",
        primary
          ? "home-cta-gradient text-[#0D0D10]"
          : "border border-border text-foreground hover:border-amber/40 dark:border-white/16"
      )}
    >
      <Download className="size-4 shrink-0" aria-hidden />
      <span className="truncate">{button.label}</span>
      <span className="shrink-0 font-medium opacity-70">.{button.format}</span>
    </a>
  )
}

export function DesktopDownloadPanel({
  selected,
  onSelect,
  className,
}: {
  selected?: DesktopPlatformId
  onSelect?: (id: DesktopPlatformId) => void
  className?: string
}) {
  const [suggested, setSuggested] = useState<DesktopPlatformId>("macos")
  const [internal, setInternal] = useState<DesktopPlatformId>("macos")
  const active = selected ?? internal

  useEffect(() => {
    const next = detectDesktopPlatform()
    setSuggested(next)
    if (selected == null) setInternal(next)
  }, [selected])

  const choose = (id: DesktopPlatformId) => {
    if (selected == null) setInternal(id)
    onSelect?.(id)
  }

  return (
    <div className={cn("grid gap-4 sm:grid-cols-3", className)}>
      {DESKTOP_PLATFORMS.map((platform) => {
        const Icon = PLATFORM_ICONS[platform.id]
        const isActive = platform.id === active
        const isSuggested = platform.id === suggested
        const pack = desktopButtonsForPlatform(platform.id)
        return (
          <MarketingCard
            key={platform.id}
            className={cn(
              "flex h-full flex-col transition-colors",
              isActive
                ? "border-amber/45 bg-amber/[0.06]"
                : "hover:border-amber/35 hover:bg-muted/40 dark:hover:border-white/20"
            )}
          >
            <button
              type="button"
              className="flex flex-1 flex-col text-left"
              onClick={() => choose(platform.id)}
              aria-pressed={isActive}
            >
              <span className="flex items-start justify-between gap-3">
                <span className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-foreground dark:border-white/10 dark:bg-white/[0.04]">
                    <Icon className="size-6" aria-hidden />
                  </span>
                  <span className="font-semibold text-foreground">{platform.label}</span>
                </span>
                {isSuggested ? (
                  <span className="home-section-badge home-section-badge--amber shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]">
                    This device
                  </span>
                ) : null}
              </span>
              <span className="mt-3 text-sm text-muted-foreground">{platform.detail}</span>
            </button>
            <div className="mt-5 flex flex-col gap-2">
              <DownloadFileButton button={pack.buttons[0]} primary={isActive} />
              <DownloadFileButton button={pack.buttons[1]} />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{pack.requirements}</p>
          </MarketingCard>
        )
      })}
      <p className="sm:col-span-3 text-center text-xs text-muted-foreground">
        Package v{DESKTOP_APP_VERSION} · macOS .dmg · Windows .exe · Linux .zip
      </p>
    </div>
  )
}
