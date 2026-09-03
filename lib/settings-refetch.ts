import { SETTINGS_PREF_KEYS } from "@/lib/settings-preferences"

/** Matches refresh interval from Settings (seconds). */
export function getTaskListRefetchIntervalMs(): number | false {
  if (typeof window === "undefined") return false
  const raw = localStorage.getItem(SETTINGS_PREF_KEYS.refreshInterval) ?? "10"
  const sec = parseInt(raw, 10)
  if (Number.isNaN(sec) || sec <= 0) return false
  const clamped = Math.min(Math.max(sec, 5), 120)
  return clamped * 1000
}
