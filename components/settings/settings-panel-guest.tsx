"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAppShell } from "@/components/layout/app-shell-context"
import {
  GUEST_SETTINGS_SECTIONS,
  SettingsSectionNav,
} from "@/components/settings/settings-section-nav"
import {
  SettingsPanelCloseButton,
  SettingsPanelFrame,
  SettingsPanelOverlay,
  SettingsRow,
  SettingsRows,
  SETTINGS_SIDEBAR_COL_GUEST,
} from "@/components/settings/settings-panel-shell"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useSettingsPage } from "@/hooks/use-settings-page"
import { RESPONSE_LANGUAGE_OPTIONS } from "@/constants/user-settings"
import { clearAllStoredChats } from "@/lib/chat-storage"
import {
  DEFAULT_SETTINGS_PREFERENCES,
  persistSettingsPreferences,
} from "@/lib/settings-preferences"
import { usePathname } from "next/navigation"
import { chatSignInHref } from "@/lib/chat-auth-links"
import { ROUTES } from "@/lib/routes"
import { formatAppVersion } from "@/lib/app-version"

function SettingsGuestGeneral() {
  const { prefs, patch } = useSettingsPage()

  return (
    <SettingsRows>
      <SettingsRow label="Language">
        <Select
          id="guestLanguage"
          value={prefs.responseLanguage}
          onChange={(e) => patch({ responseLanguage: e.target.value })}
          className="w-full"
        >
          {RESPONSE_LANGUAGE_OPTIONS.map((opt) => (
            <option key={opt.value || "__auto"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </SettingsRow>
      <SettingsRow label="App version">
        <span className="text-sm tabular-nums text-muted-foreground">{formatAppVersion()}</span>
      </SettingsRow>
    </SettingsRows>
  )
}

function SettingsGuestDataControls() {
  const pathname = usePathname()
  const signInHref = chatSignInHref(pathname)
  const [status, setStatus] = useState<string | null>(null)

  const flash = (msg: string) => {
    setStatus(msg)
    setTimeout(() => setStatus(null), 2500)
  }

  const clearChats = () => {
    if (!confirm("Delete all locally saved chat sessions in this browser?")) return
    clearAllStoredChats()
    flash("Local chat data cleared")
  }

  const resetPreferences = () => {
    if (!confirm("Reset appearance and other saved preferences on this browser?")) return
    persistSettingsPreferences(DEFAULT_SETTINGS_PREFERENCES)
    window.dispatchEvent(new Event("masternode-settings-changed"))
    flash("Preferences reset — reload if theme looks wrong")
  }

  return (
    <div className="flex flex-col">
      <p className="border-b border-border/50 px-5 py-4 text-sm text-muted-foreground dark:border-white/10">
        These actions only affect data stored in this browser. Sign in to manage account data on the
        server.
      </p>
      <SettingsRows>
        <SettingsRow label="Chat history on this device">
          <Button type="button" variant="outline" size="sm" className="w-full" onClick={clearChats}>
            Clear
          </Button>
        </SettingsRow>
        <SettingsRow label="Reset preferences">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={resetPreferences}
          >
            Reset
          </Button>
        </SettingsRow>
      </SettingsRows>
      {status ? (
        <p className="px-5 py-3 text-xs text-emerald-500" role="status">
          {status}
        </p>
      ) : null}
      <p className="border-t border-border/50 px-5 py-4 text-xs text-muted-foreground dark:border-white/10">
        <Link href={signInHref} className="font-medium text-amber hover:underline">
          Log in
        </Link>{" "}
        for API keys, billing, notifications, and cloud-synced settings.
      </p>
    </div>
  )
}

function SettingsGuestBody({ activeSection }: { activeSection: string }) {
  if (activeSection === "local-data") return <SettingsGuestDataControls />
  return <SettingsGuestGeneral />
}

export function SettingsPanelGuest() {
  const { settingsOpen, settingsSection, closeSettings } = useAppShell()
  const [activeId, setActiveId] = useState(GUEST_SETTINGS_SECTIONS[0]?.id ?? "general")

  useEffect(() => {
    if (!settingsOpen) return
    if (settingsSection === "appearance") {
      setActiveId("general")
      return
    }
    if (settingsSection && GUEST_SETTINGS_SECTIONS.some((s) => s.id === settingsSection)) {
      setActiveId(settingsSection)
    }
  }, [settingsOpen, settingsSection])

  useEffect(() => {
    if (!settingsOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeSettings()
    }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [settingsOpen, closeSettings])

  if (!settingsOpen) return null

  const activeLabel =
    GUEST_SETTINGS_SECTIONS.find((s) => s.id === activeId)?.label ?? "General"

  return (
    <SettingsPanelOverlay
      onClose={closeSettings}
      titleId="settings-guest-title"
      dialogClassName="max-w-lg"
    >
      <SettingsPanelFrame
        sidebarWidth={SETTINGS_SIDEBAR_COL_GUEST}
        sidebarHeader={
          <div className="flex w-full items-center justify-between gap-2">
            <h2 className="truncate text-sm font-semibold tracking-tight text-foreground">
              Settings
            </h2>
            <SettingsPanelCloseButton onClose={closeSettings} />
          </div>
        }
        sidebar={
          <SettingsSectionNav
            activeId={activeId}
            onSelect={setActiveId}
            sections={GUEST_SETTINGS_SECTIONS}
          />
        }
        contentTitle={activeLabel}
        titleId="settings-guest-title"
      >
        <SettingsGuestBody activeSection={activeId} />
      </SettingsPanelFrame>
    </SettingsPanelOverlay>
  )
}
