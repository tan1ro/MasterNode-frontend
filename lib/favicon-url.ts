/** Same-origin favicon URL (proxied server-side to satisfy CSP). */
export function faviconUrlForDomain(domain: string): string {
  const normalized = domain.trim().toLowerCase()
  if (!normalized) return "/api/favicon"
  return `/api/favicon?domain=${encodeURIComponent(normalized)}`
}
