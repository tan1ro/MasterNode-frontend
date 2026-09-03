"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  DEFAULT_SETTINGS_PREFERENCES,
  loadSettingsPreferences,
  mergeServerPreferences,
  persistSettingsPreferences,
  preferencesForServerSync,
  settingsPreferencesEqual,
  type SettingsPreferences,
} from "@/lib/settings-preferences"
import { preferencesService } from "@/services/preferences"
import type { PreferencesPersistStatus } from "@/components/settings"
import { useAppAuth } from "@/hooks/use-app-auth"

const TASKS_QUERY_PREFIX = ["tasks"] as const

export function useSettingsPage() {
  const queryClient = useQueryClient()
  const { isSignedIn, hydrated } = useAppAuth()
  const [prefs, setPrefs] = useState<SettingsPreferences>(DEFAULT_SETTINGS_PREFERENCES)
  const [persistStatus, setPersistStatus] = useState<PreferencesPersistStatus>("idle")
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const skipPersist = useRef(true)
  const hydratedFromServer = useRef(false)
  const savedIdleTimer = useRef<number | null>(null)

  useEffect(() => {
    setPrefs(loadSettingsPreferences())
    queueMicrotask(() => {
      skipPersist.current = false
    })
  }, [])

  useEffect(() => {
    const reloadFromStorage = () => {
      const loaded = loadSettingsPreferences()
      setPrefs((prev) => {
        if (settingsPreferencesEqual(prev, loaded)) return prev
        skipPersist.current = true
        queueMicrotask(() => {
          skipPersist.current = false
        })
        return loaded
      })
    }
    window.addEventListener("masternode-settings-changed", reloadFromStorage)
    return () => window.removeEventListener("masternode-settings-changed", reloadFromStorage)
  }, [])

  useEffect(() => {
    if (!hydrated || !isSignedIn || hydratedFromServer.current) return
    let cancelled = false
    void (async () => {
      try {
        const remote = await preferencesService.get()
        if (cancelled) return
        hydratedFromServer.current = true
        const local = loadSettingsPreferences()
        const merged = mergeServerPreferences(local, remote.preferences)
        if (settingsPreferencesEqual(local, merged)) return
        skipPersist.current = true
        persistSettingsPreferences(merged)
        setPrefs(merged)
        queueMicrotask(() => {
          skipPersist.current = false
        })
      } catch {
        /* keep localStorage */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [hydrated, isSignedIn])

  useEffect(() => {
    if (skipPersist.current) return
    setPersistStatus("saving")
    if (savedIdleTimer.current != null) {
      window.clearTimeout(savedIdleTimer.current)
      savedIdleTimer.current = null
    }
    const t = window.setTimeout(() => {
      try {
        persistSettingsPreferences(prefs)
        setPersistStatus("saved")
        setSavedAt(new Date())
        savedIdleTimer.current = window.setTimeout(() => {
          setPersistStatus("idle")
          savedIdleTimer.current = null
        }, 2500)
        void queryClient.invalidateQueries({ queryKey: TASKS_QUERY_PREFIX })
        if (isSignedIn) {
          void preferencesService.put(preferencesForServerSync(prefs)).catch(() => {
            /* local cache remains source of truth offline */
          })
        }
      } catch {
        setPersistStatus("idle")
      }
    }, 450)
    return () => window.clearTimeout(t)
  }, [prefs, queryClient, isSignedIn])

  useEffect(() => {
    return () => {
      if (savedIdleTimer.current != null) window.clearTimeout(savedIdleTimer.current)
    }
  }, [])

  const patch = useCallback((partial: Partial<SettingsPreferences>) => {
    setPrefs((prev) => ({ ...prev, ...partial }))
  }, [])

  return { prefs, patch, persistStatus, savedAt, setPrefs }
}
