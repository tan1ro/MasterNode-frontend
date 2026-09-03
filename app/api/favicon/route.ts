import { NextRequest, NextResponse } from "next/server"

const TRANSPARENT_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
)

const DOMAIN_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i

function normalizeDomain(raw: string | null): string | null {
  const value = (raw || "").trim().toLowerCase()
  if (!value || value.length > 253) return null
  if (!DOMAIN_RE.test(value)) return null
  return value
}

async function fetchFavicon(domain: string): Promise<Response | null> {
  const sources = [
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`,
    `https://${domain}/favicon.ico`,
  ]
  for (const url of sources) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "MasterNode/1.0 (+favicon-proxy)" },
        signal: AbortSignal.timeout(4000),
        next: { revalidate: 86400 },
      })
      if (!res.ok) continue
      const contentType = res.headers.get("content-type") || ""
      if (!contentType.startsWith("image/")) continue
      const bytes = await res.arrayBuffer()
      if (bytes.byteLength < 16) continue
      return new NextResponse(bytes, {
        status: 200,
        headers: {
          "Content-Type": contentType.split(";")[0].trim() || "image/png",
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        },
      })
    } catch {
      continue
    }
  }
  return null
}

export async function GET(request: NextRequest) {
  const domain = normalizeDomain(request.nextUrl.searchParams.get("domain"))
  if (!domain) {
    return new NextResponse(TRANSPARENT_PNG, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    })
  }

  const proxied = await fetchFavicon(domain)
  if (proxied) return proxied

  return new NextResponse(TRANSPARENT_PNG, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=300",
    },
  })
}
