import { NextResponse } from "next/server"
import { resolveLiveBackendOrigin, wsOriginFromHttp } from "@/lib/server/resolve-backend"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** Live MasterNode API origin for desktop/web WebSockets and health. */
export async function GET() {
  const origin = await resolveLiveBackendOrigin()
  return NextResponse.json(
    { origin, ws: wsOriginFromHttp(origin) },
    { headers: { "Cache-Control": "no-store" } }
  )
}
