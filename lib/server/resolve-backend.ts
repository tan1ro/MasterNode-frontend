import { parseApiBaseUrls, resolveApiBaseUrl } from "@/lib/routes"
import { looksLikeMasterNodeHealth } from "@/lib/backend-unavailable"

const LIVE_TTL_MS = 20_000
const MISS_TTL_MS = 5_000

let cached: { origin: string; expires: number } | null = null

function apiEnv(): string | undefined {
  return process.env.NEXT_PUBLIC_API_URL || process.env.API_URL
}

function probeTimeoutMs(origin: string): number {
  try {
    const host = new URL(origin).hostname
    if (host === "localhost" || host === "127.0.0.1") return 5_000
  } catch {
    // fall through
  }
  return origin.startsWith("https:") ? 12_000 : 5_000
}

/** `localhost` can be slow or fail in Node; try loopback IP as a backup probe. */
function localProbeAliases(origin: string): string[] {
  try {
    const url = new URL(origin)
    const normalized = origin.replace(/\/$/, "")
    if (url.hostname === "localhost") {
      const loopback = new URL(origin)
      loopback.hostname = "127.0.0.1"
      return [normalized, loopback.origin]
    }
    if (url.hostname === "127.0.0.1") {
      const localhost = new URL(origin)
      localhost.hostname = "localhost"
      return [normalized, localhost.origin]
    }
    return [normalized]
  } catch {
    return [origin.replace(/\/$/, "")]
  }
}

async function probeOriginOnce(origin: string): Promise<boolean> {
  const controller = new AbortController()
  const timeoutMs = probeTimeoutMs(origin)
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${origin.replace(/\/$/, "")}/health`, {
      method: "GET",
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    })
    if (!res.ok) return false
    const contentType = res.headers.get("content-type") ?? ""
    if (!contentType.includes("application/json")) return false
    const data: unknown = await res.json()
    return looksLikeMasterNodeHealth(data)
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

async function probeMasterNode(origin: string): Promise<boolean> {
  for (const candidate of localProbeAliases(origin)) {
    if (await probeOriginOnce(candidate)) return true
  }
  return false
}

export function invalidateLiveBackendOrigin(): void {
  cached = null
}

/** When every probe fails, prefer the first configured origin (usually local dev). */
function pickFallbackOrigin(candidates: string[]): string {
  return candidates[0] || resolveApiBaseUrl(apiEnv())
}

/** First MasterNode FastAPI origin that answers `/health`. */
export async function resolveLiveBackendOrigin(): Promise<string> {
  if (cached && Date.now() < cached.expires) return cached.origin

  const candidates = parseApiBaseUrls(apiEnv())
  for (const origin of candidates) {
    if (await probeMasterNode(origin)) {
      cached = { origin, expires: Date.now() + LIVE_TTL_MS }
      return origin
    }
  }

  const fallback = pickFallbackOrigin(candidates)
  cached = { origin: fallback, expires: Date.now() + MISS_TTL_MS }
  return fallback
}

export function wsOriginFromHttp(origin: string): string {
  return origin.replace(/^http/, "ws")
}
