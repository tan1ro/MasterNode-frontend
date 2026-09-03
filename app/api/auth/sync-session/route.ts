import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { ACCESS_COOKIE } from "@/lib/server/auth-cookies"
import { signSessionPayload } from "@/lib/server/auth-session"
import { setSessionCookie } from "@/lib/server/auth-cookies"
import { backendGet } from "@/lib/server/backend-fetch"
import { buildSessionFromTokensAndProfile } from "@/lib/server/build-session-from-profile"
import { logClientError } from "@/lib/log-error"

type AuthProfileResponse = {
  tenant_id: string
  email?: string
  account_type?: string
  plan?: string
  is_superuser?: boolean
}

function resolveAccessToken(req: Request): string | null {
  const fromCookie = cookies().get(ACCESS_COOKIE)?.value?.trim()
  if (fromCookie) return fromCookie
  const auth = req.headers.get("authorization")?.trim()
  if (auth?.toLowerCase().startsWith("bearer ")) {
    const token = auth.slice(7).trim()
    return token || null
  }
  return null
}

export async function POST(req: Request) {
  try {
    const access = resolveAccessToken(req)
    if (!access) {
      return NextResponse.json({ detail: "Not authenticated" }, { status: 401 })
    }
    const { data, status } = await backendGet<AuthProfileResponse>("/v1/auth/me", access)
    if (status !== 200) {
      return NextResponse.json({ detail: "Profile fetch failed" }, { status })
    }
    const session = buildSessionFromTokensAndProfile(data.tenant_id, data.email, data)
    const signed = await signSessionPayload(session)
    const res = NextResponse.json({ session })
    setSessionCookie(res, signed)
    return res
  } catch (err) {
    logClientError("api/auth/sync-session", err)
    return NextResponse.json({ detail: "Sync failed" }, { status: 500 })
  }
}
