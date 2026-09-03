import { NextRequest, NextResponse } from "next/server"
import {
  invalidateLiveBackendOrigin,
  resolveLiveBackendOrigin,
} from "@/lib/server/resolve-backend"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
])

function filterHeaders(source: Headers): Headers {
  const headers = new Headers()
  source.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) headers.set(key, value)
  })
  return headers
}

async function proxy(req: NextRequest, path: string[]): Promise<Response> {
  const origin = await resolveLiveBackendOrigin()
  const target = new URL(path.map(encodeURIComponent).join("/"), `${origin}/`)
  req.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.append(key, value)
  })

  const method = req.method.toUpperCase()
  const headers = filterHeaders(req.headers)
  const body =
    method === "GET" || method === "HEAD" ? undefined : Buffer.from(await req.arrayBuffer())

  try {
    const upstream = await fetch(target, { method, headers, body })
    const out = new NextResponse(upstream.body, { status: upstream.status })
    upstream.headers.forEach((value, key) => {
      if (!HOP_BY_HOP.has(key.toLowerCase())) out.headers.set(key, value)
    })
    return out
  } catch (err) {
    invalidateLiveBackendOrigin()
    const reason = err instanceof Error ? err.message : "Network error"
    return NextResponse.json(
      { detail: `Cannot reach the MasterNode API at ${origin}. ${reason}` },
      { status: 502 }
    )
  }
}

type RouteContext = { params: { path?: string[] } }

export async function GET(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx.params.path ?? [])
}
export async function POST(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx.params.path ?? [])
}
export async function PUT(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx.params.path ?? [])
}
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx.params.path ?? [])
}
export async function DELETE(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx.params.path ?? [])
}
export async function OPTIONS(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx.params.path ?? [])
}
export async function HEAD(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx.params.path ?? [])
}
