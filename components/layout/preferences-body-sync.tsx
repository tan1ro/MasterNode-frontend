"use client"

import { useEffect } from "react"
import { FONT_SIZE_OPTIONS } from "@/constants/user-settings"
import { loadSettingsPreferences } from "@/lib/settings-preferences"

/** Applies appearance preferences (compact density, cost hints) to document root. */
export function PreferencesBodySync() {
  useEffect(() => {
    const apply = () => {
      const prefs = loadSettingsPreferences()
      document.documentElement.classList.toggle("compact-density", prefs.compactDensity)
      document.documentElement.dataset.showTokenCostHints = prefs.showTokenCostHints ? "1" : "0"
      const fontCss =
        FONT_SIZE_OPTIONS.find((o) => o.value === prefs.fontSize)?.css ?? "15px"
      document.documentElement.style.setProperty("--chat-font-size", fontCss)
    }
    apply()
    window.addEventListener("masternode-settings-changed", apply)
    return () => window.removeEventListener("masternode-settings-changed", apply)
  }, [])

  return null
}
