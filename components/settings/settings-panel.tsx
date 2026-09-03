"use client"

import { useAppAuth } from "@/hooks/use-app-auth"
import { SettingsPanelGuest } from "@/components/settings/settings-panel-guest"
import { SettingsPanelSignedIn } from "@/components/settings/settings-panel-signed-in"

export function SettingsPanel() {
  const { isSignedIn } = useAppAuth()
  return isSignedIn ? <SettingsPanelSignedIn /> : <SettingsPanelGuest />
}
