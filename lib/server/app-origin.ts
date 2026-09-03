/**
 * Resolve the public app origin for absolute links in emails (server-only).
 */
export function resolveAppOrigin(req: Request): string {
  const env =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.AUTH_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim()
  if (env) {
    try {
      return new URL(env).origin
    } catch {
      /* fall through */
    }
  }

  const host = (req.headers.get("x-forwarded-host") || req.headers.get("host") || "").trim()
  if (host) {
    const proto = (req.headers.get("x-forwarded-proto") || "https").split(",")[0].trim() || "https"
    return `${proto}://${host}`
  }

  return "http://localhost:3000"
}
