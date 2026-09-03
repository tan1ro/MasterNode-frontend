"use client"

import { Suspense, useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useAppShell } from "@/components/layout/app-shell-context"
import { parseSettingsPanelParams } from "@/lib/settings-panel-routes"

function AppShellSettingsSyncInner() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const { settingsOpen, openSettings, closeSettings } = useAppShell()

  const { open, section } = parseSettingsPanelParams(searchParams)

  useEffect(() => {
    if (open && !settingsOpen) {
      openSettings(section ?? undefined)
    }
  }, [open, section, settingsOpen, openSettings])

  useEffect(() => {
    if (!settingsOpen && open) {
      const params = new URLSearchParams(searchParams.toString())
      params.delete("settings")
      params.delete("section")
      const q = params.toString()
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false })
    }
  }, [settingsOpen, open, pathname, router, searchParams])

  return null
}

export function AppShellSettingsSync() {
  return (
    <Suspense fallback={null}>
      <AppShellSettingsSyncInner />
    </Suspense>
  )
}
