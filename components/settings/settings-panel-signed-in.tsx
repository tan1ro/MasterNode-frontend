"use client"

import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
import { useAppShell } from "@/components/layout/app-shell-context"
import {
  SETTINGS_SECTIONS,
  SettingsSectionNav,
  filterSettingsSections,
  resolveSettingsGroupId,
} from "@/components/settings/settings-section-nav"
import { SettingsPanelBody } from "@/components/settings/settings-panel-body"
import {
  SettingsPanelCloseButton,
  SettingsPanelFrame,
  SettingsPanelOverlay,
  SETTINGS_SIDEBAR_COL_SIGNED,
} from "@/components/settings/settings-panel-shell"
import { cn } from "@/lib/utils"
import { isMasterNodeDesktop } from "@/lib/desktop-runtime"

export function SettingsPanelSignedIn() {
  const { settingsOpen, settingsSection, closeSettings } = useAppShell()
  const [search, setSearch] = useState("")
  const [activeId, setActiveId] = useState(SETTINGS_SECTIONS[0]?.id ?? "account")

  const filteredSections = useMemo(
    () => filterSettingsSections(search, isMasterNodeDesktop()),
    [search]
  )

  useEffect(() => {
    if (!settingsOpen) {
      setSearch("")
      return
    }
    const resolved = resolveSettingsGroupId(settingsSection)
    if (resolved) {
      setActiveId(resolved)
      return
    }
    setActiveId(SETTINGS_SECTIONS[0]?.id ?? "account")
  }, [settingsOpen, settingsSection])

  useEffect(() => {
    if (filteredSections.length === 0) return
    if (!filteredSections.some((s) => s.id === activeId)) {
      setActiveId(filteredSections[0].id)
    }
  }, [filteredSections, activeId])

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

  const activeLabel = SETTINGS_SECTIONS.find((s) => s.id === activeId)?.label ?? "Settings"

  return (
    <SettingsPanelOverlay
      onClose={closeSettings}
      titleId="settings-panel-section-title"
      dialogClassName="max-w-4xl"
    >
      <SettingsPanelFrame
        sidebarWidth={SETTINGS_SIDEBAR_COL_SIGNED}
        sidebarHeader={
          <div className="flex w-full items-center justify-between gap-2">
            <h2 className="truncate text-sm font-semibold tracking-tight text-foreground">
              Settings
            </h2>
            <SettingsPanelCloseButton onClose={closeSettings} />
          </div>
        }
        sidebar={
          <>
            <div className="px-0.5 lg:px-1">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search settings…"
                  aria-label="Search settings"
                  className={cn(
                    "settings-panel-search w-full rounded-lg border py-2 pl-8 pr-2 text-sm",
                    "placeholder:text-muted-foreground focus:outline-none"
                  )}
                />
              </div>
            </div>
            {filteredSections.length > 0 ? (
              <SettingsSectionNav
                activeId={activeId}
                onSelect={setActiveId}
                sections={filteredSections}
              />
            ) : (
              <p className="px-2 py-4 text-xs text-muted-foreground">No matching settings.</p>
            )}
          </>
        }
        contentTitle={activeLabel}
        titleId="settings-panel-section-title"
      >
        <SettingsPanelBody activeSection={activeId} />
      </SettingsPanelFrame>
    </SettingsPanelOverlay>
  )
}
