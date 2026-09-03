"use client"

import { ArrowRight } from "lucide-react"
import { BrandPiMark } from "@/components/layout/brand-logo"
import { useAppShell } from "@/components/layout/app-shell-context"
import { useDesktopUpdate } from "@/hooks/use-desktop-update"
import { cn } from "@/lib/utils"

function copyForStatus(
  status: ReturnType<typeof useDesktopUpdate>["state"]["status"],
  versionLabel: string,
  latestLabel: string,
  progress: number,
  error?: string | null
): { title: string; detail: string } {
  if (status === "checking") {
    return { title: "Checking for updates…", detail: versionLabel }
  }
  if (status === "downloading") {
    return { title: "Downloading update", detail: `${progress}%` }
  }
  if (status === "ready") {
    return { title: "Relaunch to update", detail: latestLabel }
  }
  if (status === "available") {
    return { title: "Update available", detail: latestLabel }
  }
  if (status === "error") {
    return { title: "Couldn’t update", detail: error || "Try again" }
  }
  return { title: "MasterNode Desktop", detail: versionLabel }
}

export function ChatSidebarUpdateCard({ className }: { className?: string }) {
  const { openSettings } = useAppShell()
  const { isDesktop, state, versionLabel, latestLabel, startUpdate, relaunchUpdate } =
    useDesktopUpdate()

  if (!isDesktop) return null

  const { title, detail } = copyForStatus(
    state.status,
    versionLabel,
    latestLabel,
    state.progress,
    state.error
  )
  const busy = state.status === "checking" || state.status === "downloading"

  return (
    <div className={cn("flex w-full min-w-0 flex-col", className)}>
      <button
        type="button"
        disabled={busy}
        aria-label={`${title}. ${detail}`}
        onClick={() => {
          if (state.status === "ready") {
            void relaunchUpdate()
            return
          }
          if (state.status === "available" || state.status === "error") {
            void startUpdate()
            return
          }
          openSettings("desktop-app")
        }}
        className={cn(
          "flex w-full min-w-0 items-center gap-2.5 rounded-xl px-2.5 py-2 text-left",
          "bg-muted/80 text-foreground transition-colors hover:bg-muted",
          "ring-1 ring-inset ring-border/50",
          "disabled:cursor-default disabled:hover:bg-muted/80"
        )}
      >
        <BrandPiMark
          size="sm"
          showBeta={false}
          className="shrink-0"
          markClassName="h-5 w-5"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium leading-5">{title}</span>
          <span className="block truncate text-[11px] tabular-nums text-muted-foreground">
            {detail}
          </span>
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      </button>
      <div className="mx-1 mb-1.5 mt-2 h-px bg-border/60" aria-hidden />
    </div>
  )
}

export function ChatSidebarUpdateRailButton() {
  const { openSettings } = useAppShell()
  const { isDesktop, state, relaunchUpdate, startUpdate } = useDesktopUpdate()
  if (!isDesktop) return null
  const needsAttention =
    state.status === "available" ||
    state.status === "ready" ||
    state.status === "downloading" ||
    state.status === "error"
  if (!needsAttention) return null

  return (
    <button
      type="button"
      title={state.status === "ready" ? "Relaunch to update" : "Desktop update"}
      aria-label={state.status === "ready" ? "Relaunch to update" : "Desktop update"}
      className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-muted/80 hover:bg-muted"
      onClick={() => {
        if (state.status === "ready") {
          void relaunchUpdate()
          return
        }
        if (state.status === "available" || state.status === "error") {
          void startUpdate()
          return
        }
        openSettings("desktop-app")
      }}
    >
      <BrandPiMark size="sm" showBeta={false} markClassName="h-5 w-5" />
    </button>
  )
}
