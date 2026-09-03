import { getEffectiveTimeZone } from "@/lib/datetime-local"

/** IANA timezone for chat stream (settings override or browser default). */
export function getClientTimezone(): string {
  if (typeof window === "undefined") return ""
  try {
    return getEffectiveTimeZone().trim() || ""
  } catch {
    return ""
  }
}
