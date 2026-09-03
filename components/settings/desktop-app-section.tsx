"use client"

import { Laptop, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useDesktopUpdate } from "@/hooks/use-desktop-update"
import { formatDesktopVersionLabel } from "@/lib/desktop-version"

function statusCopy(status: ReturnType<typeof useDesktopUpdate>["state"]["status"]): string {
  if (status === "up-to-date" || status === "idle") {
    return "You’re on the latest desktop package."
  }
  if (status === "checking") return "Checking the published catalog…"
  if (status === "downloading") return "Downloading the installer for this machine…"
  if (status === "ready") return "The installer is downloaded. Relaunch to apply it."
  if (status === "available") return "A newer desktop package is available."
  return "Check anytime for a newer laptop build."
}

export function DesktopAppSection() {
  const { isDesktop, state, checkForUpdate, startUpdate, relaunchUpdate } = useDesktopUpdate()
  const latest = formatDesktopVersionLabel(state.latestVersion || state.currentVersion)
  const current = formatDesktopVersionLabel(state.currentVersion)
  const action =
    state.status === "ready"
      ? { label: "Relaunch to update", onClick: () => void relaunchUpdate() }
      : state.status === "available" || state.status === "error"
        ? { label: "Download update", onClick: () => void startUpdate() }
        : { label: "Check for updates", onClick: () => void checkForUpdate() }

  return (
    <Card variant="minimal" interactive={false} id="desktop-app" accent="sky" className="scroll-mt-24">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Laptop className="h-5 w-5 text-sky-400" />
          <div>
            <CardTitle>Desktop app</CardTitle>
            <CardDescription>
              Version manager for the laptop package. Updates only install from this site’s catalog.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isDesktop ? (
          <>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">This app</p>
                <p className="font-medium tabular-nums">{current}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Latest published</p>
                <p className="font-medium tabular-nums">{latest}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {state.status === "downloading"
                ? `Downloading update… ${state.progress}%`
                : state.error && state.status === "error"
                  ? state.error
                  : statusCopy(state.status)}
            </p>
            <Button
              type="button"
              variant="secondary"
              disabled={state.status === "checking" || state.status === "downloading"}
              onClick={action.onClick}
            >
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
              {action.label}
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Version checks and installers run inside MasterNode Desktop. Open the laptop app to
            check, download, and relaunch updates.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
