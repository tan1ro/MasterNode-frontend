export const DESKTOP_UA_TOKEN = "MasterNodeDesktop"

export function isMasterNodeDesktop(
  userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent
): boolean {
  if (userAgent.includes(DESKTOP_UA_TOKEN)) return true
  const usingLiveNavigator =
    typeof navigator !== "undefined" && userAgent === navigator.userAgent
  if (!usingLiveNavigator) return false
  if (
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("mn-desktop")
  ) {
    return true
  }
  if (typeof window !== "undefined" && window.masternodeDesktop?.isDesktop) {
    return true
  }
  return false
}

export function desktopOsFromUserAgent(
  userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent
): "mac" | "windows" | "linux" {
  if (/Win/i.test(userAgent)) return "windows"
  if (/Linux/i.test(userAgent) && !/Android/i.test(userAgent)) return "linux"
  return "mac"
}
