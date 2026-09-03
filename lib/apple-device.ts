/** True when the visitor is on an Apple platform (Mac, iPhone, iPad, iPod). */
export function isAppleDevice(): boolean {
  if (typeof navigator === "undefined") return false

  const ua = navigator.userAgent || ""
  const platform = navigator.platform || ""

  if (/iPad|iPhone|iPod/.test(ua)) return true
  if (/Mac|Macintosh/.test(platform) || /Macintosh/.test(ua)) {
    // iPadOS 13+ may report MacIntel with touch points.
    if (platform === "MacIntel" && navigator.maxTouchPoints > 1) return true
    return navigator.maxTouchPoints <= 1
  }

  return false
}
