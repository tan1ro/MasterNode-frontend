"use client"

import { useEffect, useState } from "react"
import { loadSettingsPreferences } from "@/lib/settings-preferences"

export interface AppearancePrefs {
  compactDensity: boolean
  showTokenCostHints: boolean
}

export function useAppearancePrefs(): AppearancePrefs {
  const [prefs, setPrefs] = useState<AppearancePrefs>(() => {
    const p = loadSettingsPreferences()
    return {
      compactDensity: p.compactDensity,
      showTokenCostHints: p.showTokenCostHints,
    }
  })

  useEffect(() => {
    const sync = () => {
      const p = loadSettingsPreferences()
      setPrefs({
        compactDensity: p.compactDensity,
        showTokenCostHints: p.showTokenCostHints,
      })
    }
    sync()
    window.addEventListener("masternode-settings-changed", sync)
    return () => window.removeEventListener("masternode-settings-changed", sync)
  }, [])

  return prefs
}
