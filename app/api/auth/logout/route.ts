import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { backendPost } from "@/lib/server/backend-fetch"
import { REFRESH_COOKIE, clearHttpOnlyAuthCookies, clearTokenCookies } from "@/lib/server/auth-cookies"

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { stale?: boolean }
  const staleOnly = body.stale === true

  if (!staleOnly) {
    const refresh = cookies().get(REFRESH_COOKIE)?.value?.trim()
    if (refresh) {
      try {
        await backendPost("/v1/auth/logout", { refresh_token: refresh })
      } catch {
        // Best-effort
      }
    }
  }

  const res = NextResponse.json({ ok: true })
  if (staleOnly) {
    clearHttpOnlyAuthCookies(res)
  } else {
    clearTokenCookies(res)
  }
  return res
}
