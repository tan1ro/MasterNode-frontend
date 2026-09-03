export type DayPart = "morning" | "afternoon" | "evening"

/** Local hour → morning (5–11), afternoon (12–16), evening (17–4). */
export function getDayPart(hour: number): DayPart {
  if (hour >= 5 && hour < 12) return "morning"
  if (hour >= 12 && hour < 17) return "afternoon"
  return "evening"
}

const GREETING_BY_PART: Record<DayPart, string> = {
  morning: "Good morning",
  afternoon: "Good afternoon",
  evening: "Good evening",
}

export function buildTimeGreetingParts(
  username?: string | null,
  date: Date = new Date()
): { prefix: string; name: string | null } {
  const prefix = GREETING_BY_PART[getDayPart(date.getHours())]
  const name = username?.trim() || null
  return { prefix, name }
}

export function buildTimeGreeting(username?: string | null, date: Date = new Date()): string {
  const { prefix, name } = buildTimeGreetingParts(username, date)
  return name ? `${prefix}, ${name}` : prefix
}

export function resolveGreetingUsername(
  username?: string | null,
  email?: string | null
): string | undefined {
  const fromUsername = username?.trim()
  if (fromUsername) return fromUsername
  const local = email?.split("@")[0]?.trim()
  return local || undefined
}
