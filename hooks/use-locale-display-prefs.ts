"use client"

import { useEffect, useState } from "react"
import type { DateFormatPref, TimeFormatPref } from "@/constants/user-settings"
import { loadSettingsPreferences } from "@/lib/settings-preferences"

export interface LocaleDisplayPrefs {
  timezone: string
  dateFormat: DateFormatPref
  timeFormat: TimeFormatPref
  responseLanguage: string
  /** Bumps when locale prefs change so date formatters re-render. */
  revision: number
}

export function useLocaleDisplayPrefs(): LocaleDisplayPrefs {
  const [prefs, setPrefs] = useState<LocaleDisplayPrefs>(() => {
    const p = loadSettingsPreferences()
    return {
      timezone: p.timezone,
      dateFormat: p.dateFormat,
      timeFormat: p.timeFormat,
      responseLanguage: p.responseLanguage,
      revision: 0,
    }
  })

  useEffect(() => {
    const sync = () => {
      const p = loadSettingsPreferences()
      setPrefs((prev) => ({
        timezone: p.timezone,
        dateFormat: p.dateFormat,
        timeFormat: p.timeFormat,
        responseLanguage: p.responseLanguage,
        revision: prev.revision + 1,
      }))
    }
    window.addEventListener("masternode-settings-changed", sync)
    return () => window.removeEventListener("masternode-settings-changed", sync)
  }, [])

  return prefs
}
