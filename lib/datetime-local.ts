/**
 * API timestamps are stored in UTC. When the backend omits a timezone suffix,
 * treat the value as UTC and render in the signed-in user's browser timezone.
 */

import type { DateFormatPref, TimeFormatPref } from "@/constants/user-settings"
import { loadSettingsPreferences } from "@/lib/settings-preferences"

/** IANA timezone for the current browser session (user's locale region). */
export function getUserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  } catch {
    return "UTC"
  }
}

/** User-selected timezone from settings, or browser default. */
export function getEffectiveTimeZone(): string {
  if (typeof window === "undefined") return getUserTimeZone()
  const pref = loadSettingsPreferences().timezone.trim()
  return pref || getUserTimeZone()
}

function dateFormatOptions(format: DateFormatPref): Intl.DateTimeFormatOptions {
  if (format === "ymd") return { year: "numeric", month: "2-digit", day: "2-digit" }
  if (format === "mdy") return { year: "numeric", month: "2-digit", day: "2-digit" }
  return { year: "numeric", month: "2-digit", day: "2-digit" }
}

function localeForDateFormat(format: DateFormatPref): string | undefined {
  if (format === "ymd") return "sv-SE"
  if (format === "mdy") return "en-US"
  return "en-GB"
}

function timeFormatOptions(format: TimeFormatPref): Pick<Intl.DateTimeFormatOptions, "hour12"> {
  return { hour12: format === "12h" }
}

function userFormatPrefs(): { dateFormat: DateFormatPref; timeFormat: TimeFormatPref } {
  if (typeof window === "undefined") {
    return { dateFormat: "dmy", timeFormat: "12h" }
  }
  const p = loadSettingsPreferences()
  return { dateFormat: p.dateFormat, timeFormat: p.timeFormat }
}

/** Ensure naive ISO strings from the API are parsed as UTC. */
export function normalizeUtcIso(iso: string): string {
  const raw = iso.trim()
  if (!raw) return raw
  if (/[zZ]$/.test(raw)) return raw
  if (/[+-]\d{2}:?\d{2}$/.test(raw)) return raw
  return raw.includes("T") ? `${raw}Z` : `${raw}T00:00:00.000Z`
}

export function parseApiTimestamp(iso: string | undefined | null): Date | null {
  if (!iso?.trim()) return null
  const d = new Date(normalizeUtcIso(iso))
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatUserDateTime(
  iso: string | undefined | null,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = parseApiTimestamp(iso)
  if (!d) return "—"
  const { timeFormat } = userFormatPrefs()
  return new Intl.DateTimeFormat(undefined, {
    timeZone: getEffectiveTimeZone(),
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    ...timeFormatOptions(timeFormat),
    ...options,
  }).format(d)
}

export function formatUserDate(iso: string | undefined | null): string {
  const d = parseApiTimestamp(iso)
  if (!d) return "—"
  const { dateFormat } = userFormatPrefs()
  return new Intl.DateTimeFormat(localeForDateFormat(dateFormat), {
    timeZone: getEffectiveTimeZone(),
    ...dateFormatOptions(dateFormat),
  }).format(d)
}

function calendarDayKey(d: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d)
}

/** Short label when hovering a chat message (Today · 4:22 PM). */
export function formatMessageDayTime(iso: string | undefined | null): string {
  const d = parseApiTimestamp(iso)
  if (!d) return ""
  const tz = getEffectiveTimeZone()
  const { timeFormat } = userFormatPrefs()
  const now = new Date()
  const day = calendarDayKey(d, tz)
  const today = calendarDayKey(now, tz)
  const yesterday = calendarDayKey(new Date(now.getTime() - 86_400_000), tz)

  const time = new Intl.DateTimeFormat(undefined, {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
    ...timeFormatOptions(timeFormat),
  }).format(d)

  if (day === today) return `Today · ${time}`
  if (day === yesterday) return `Yesterday · ${time}`
  const datePart = new Intl.DateTimeFormat(undefined, {
    timeZone: tz,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d)
  return `${datePart} · ${time}`
}

/** Calendar day key (YYYY-MM-DD) in the user's timezone — for thread day separators. */
export function messageDayKey(iso: string | undefined | null): string {
  const d = parseApiTimestamp(iso)
  if (!d) return ""
  return calendarDayKey(d, getEffectiveTimeZone())
}

/**
 * Centered thread divider above a message group.
 * e.g. "Today at 3:18 PM", "Mon, Jul 6 at 3:18 PM"
 */
export function formatMessageThreadDivider(iso: string | undefined | null): string {
  const d = parseApiTimestamp(iso)
  if (!d) return ""
  const tz = getEffectiveTimeZone()
  const { timeFormat } = userFormatPrefs()
  const now = new Date()
  const day = calendarDayKey(d, tz)
  const today = calendarDayKey(now, tz)
  const yesterday = calendarDayKey(new Date(now.getTime() - 86_400_000), tz)

  const time = new Intl.DateTimeFormat(undefined, {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
    ...timeFormatOptions(timeFormat),
  }).format(d)

  if (day === today) return `Today at ${time}`
  if (day === yesterday) return `Yesterday at ${time}`

  const datePart = new Intl.DateTimeFormat(undefined, {
    timeZone: tz,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d)
  return `${datePart} at ${time}`
}

/** Full timestamp for action icon tooltips (Copy, Edit, Retry). */
export function formatMessageActionTooltipTime(iso: string | undefined | null): string {
  const d = parseApiTimestamp(iso)
  if (!d) return ""
  const { timeFormat } = userFormatPrefs()
  return new Intl.DateTimeFormat(undefined, {
    timeZone: getEffectiveTimeZone(),
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    ...timeFormatOptions(timeFormat),
  }).format(d)
}
