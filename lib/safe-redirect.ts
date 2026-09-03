/** Same-origin relative path only — blocks open redirects. */
export function safeRedirectPath(raw: string | null | undefined, fallback: string): string {
  const path = (raw ?? "").trim()
  if (!path.startsWith("/") || path.startsWith("//")) return fallback
  if (path.includes("://")) return fallback
  return path
}
