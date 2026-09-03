const SESSION_KEY = "mn_analytics_session_id"
const APP_OPEN_KEY = "mn_app_open_tracked"

export function getAnalyticsSessionId(): string {
  if (typeof window === "undefined") return "server"
  try {
    const existing = sessionStorage.getItem(SESSION_KEY)
    if (existing) return existing
    const id = `sess_${crypto.randomUUID()}`
    sessionStorage.setItem(SESSION_KEY, id)
    return id
  } catch {
    return `sess_${Date.now()}`
  }
}

/** Clear analytics session markers when the user withdraws analytics consent. */
export function clearAnalyticsSession(): void {
  if (typeof window === "undefined") return
  try {
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(APP_OPEN_KEY)
  } catch {
    /* ignore */
  }
}

export function createEventId(prefix = "evt"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

export function detectClientContext() {
  if (typeof window === "undefined") {
    return {
      device: "server",
      browser: "unknown",
      operating_system: "unknown",
      language: "en",
      app_version: process.env.NEXT_PUBLIC_APP_VERSION || "dev",
    }
  }

  const ua = navigator.userAgent
  const browser = /Edg\//.test(ua)
    ? "edge"
    : /Chrome\//.test(ua)
      ? "chrome"
      : /Safari\//.test(ua)
        ? "safari"
        : /Firefox\//.test(ua)
          ? "firefox"
          : "other"
  const operating_system = /Mac OS X/.test(ua)
    ? "macos"
    : /Windows/.test(ua)
      ? "windows"
      : /Android/.test(ua)
        ? "android"
        : /iPhone|iPad/.test(ua)
          ? "ios"
          : /Linux/.test(ua)
            ? "linux"
            : "other"
  const device = /Mobi|Android/i.test(ua) ? "mobile" : "desktop"

  return {
    device,
    browser,
    operating_system,
    language: navigator.language || "en",
    app_version: process.env.NEXT_PUBLIC_APP_VERSION || "dev",
  }
}

export function isDoNotTrackEnabled(): boolean {
  if (typeof navigator === "undefined") return false
  const dnt = (navigator as Navigator & { doNotTrack?: string }).doNotTrack
  return dnt === "1" || dnt === "yes"
}
