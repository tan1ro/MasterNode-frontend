import { NextResponse } from "next/server"
import { backendPost, backendGet, BackendFetchError } from "@/lib/server/backend-fetch"
import { setTokenCookies, setSessionCookie } from "@/lib/server/auth-cookies"
import { signSessionPayload } from "@/lib/server/auth-session"
import { buildSessionFromTokensAndProfile } from "@/lib/server/build-session-from-profile"
import { logClientError } from "@/lib/log-error"

type AuthTokenResponse = {
  tenant_id: string
  email?: string
  access_token: string
  refresh_token?: string
  expires_in?: number
  detail?: string
}

type AuthProfileResponse = {
  account_type?: string
  plan?: string
  email?: string
  is_superuser?: boolean
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; password?: string }
    const { data, status } = await backendPost<AuthTokenResponse>("/v1/auth/login", {
      email: body.email,
      password: body.password,
    })
    if (status !== 200 || !data.access_token) {
      const detail = typeof data.detail === "string" ? data.detail : "Invalid credentials"
      return NextResponse.json({ detail }, { status: status === 200 ? 401 : status })
    }

    const profileRes = await backendGet<AuthProfileResponse>("/v1/auth/me", data.access_token)
    const profile = profileRes.status === 200 ? profileRes.data : {}
    const session = buildSessionFromTokensAndProfile(data.tenant_id, data.email, profile)
    const signed = await signSessionPayload(session)

    const res = NextResponse.json({
      tenant_id: data.tenant_id,
      email: data.email,
      access_token: data.access_token,
      expires_in: data.expires_in ?? 3600,
      session,
    })
    setTokenCookies(res, data)
    setSessionCookie(res, signed)
    return res
  } catch (err) {
    logClientError("api/auth/login", err)
    if (err instanceof BackendFetchError) {
      return NextResponse.json({ detail: err.message }, { status: err.status })
    }
    return NextResponse.json({ detail: "Login failed" }, { status: 500 })
  }
}
