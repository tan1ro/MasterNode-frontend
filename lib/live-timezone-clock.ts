export interface ZonedClockParts {
  hour: number
  minute: number
  second: number
  time24: string
  time12: string
  dateLabel: string
  weekday: string
  tzAbbrev: string
}

export function getZonedClockParts(timeZone: string, at: Date = new Date()): ZonedClockParts {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    weekday: "long",
    month: "short",
    day: "numeric",
  })
  const parts = dtf.formatToParts(at)
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value || 0)
  const hour = pick("hour")
  const minute = pick("minute")
  const second = pick("second")
  const weekday = parts.find((p) => p.type === "weekday")?.value || ""
  const month = parts.find((p) => p.type === "month")?.value || ""
  const day = parts.find((p) => p.type === "day")?.value || ""

  const abbrevParts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "short",
  }).formatToParts(at)
  const tzAbbrev =
    abbrevParts.find((p) => p.type === "timeZoneName")?.value?.replace(/\s+/g, "") || ""

  const pad = (n: number) => String(n).padStart(2, "0")
  const time24 = `${pad(hour)}:${pad(minute)}`
  const h12 = hour % 12 || 12
  const ampm = hour >= 12 ? "PM" : "AM"
  const time12 = `${h12}:${pad(minute)} ${ampm}`

  return {
    hour,
    minute,
    second,
    time24,
    time12,
    dateLabel: `${weekday}, ${month} ${day}`,
    weekday,
    tzAbbrev,
  }
}

/** Offset in minutes for `timeZone` at `at` (positive east of UTC). */
export function timeZoneOffsetMinutes(timeZone: string, at: Date = new Date()): number {
  const utc = new Date(at.toLocaleString("en-US", { timeZone: "UTC" }))
  const zoned = new Date(at.toLocaleString("en-US", { timeZone }))
  return Math.round((zoned.getTime() - utc.getTime()) / 60000)
}

export function formatOffsetVsUserTime(
  targetTimeZone: string,
  userTimeZone?: string,
  at: Date = new Date()
): string {
  const userTz =
    userTimeZone?.trim() || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  const targetOffset = timeZoneOffsetMinutes(targetTimeZone, at)
  const userOffset = timeZoneOffsetMinutes(userTz, at)
  const diff = targetOffset - userOffset

  if (diff === 0) return "Today, same as your time"

  const sign = diff > 0 ? "+" : "-"
  const abs = Math.abs(diff)
  const hours = Math.floor(abs / 60)
  const mins = abs % 60
  const hourPart = hours > 0 ? `${hours}hr${hours === 1 ? "" : "s"}` : ""
  const minPart = mins > 0 ? `${mins}min${mins === 1 ? "" : "s"}` : ""
  const body = [hourPart, minPart].filter(Boolean).join(" ")
  return `Today, ${sign}${body}`
}

export function formatLocationClockLine(
  location: string,
  timeZone: string,
  at: Date = new Date()
): string {
  const parts = location
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
  const city = parts[0] || location
  const country = parts.length > 1 ? parts[parts.length - 1] : ""
  const abbrev =
    getZonedClockParts(timeZone, at).tzAbbrev ||
    timeZone.split("/").pop()?.replace(/_/g, " ") ||
    timeZone
  if (country && country.toLowerCase() !== city.toLowerCase()) {
    return `${city}, ${country} (${abbrev})`
  }
  return `${city} (${abbrev})`
}
