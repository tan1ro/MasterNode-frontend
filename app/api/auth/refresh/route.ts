import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { backendPost } from "@/lib/server/backend-fetch"
import { REFRESH_COOKIE, setTokenCookies } from "@/lib/server/auth-cookies"
import { logClientError } from "@/lib/log-error"

type AuthTokenResponse = {
  access_token: string
  refresh_token?: string
  expires_in?: number
  detail?: string
}

export async function POST() {
  try {
    const refresh = cookies().get(REFRESH_COOKIE)?.value?.trim()
    if (!refresh) {
      return NextResponse.json({ detail: "No refresh token" }, { status: 401 })
    }
    const { data, status } = await backendPost<AuthTokenResponse>("/v1/auth/refresh", {
      refresh_token: refresh,
    })
    if (status !== 200 || !data.access_token) {
      const res = NextResponse.json(
        { detail: typeof data.detail === "string" ? data.detail : "Refresh failed" },
        { status: status === 200 ? 401 : status }
      )
      return res
    }
    const res = NextResponse.json({
      access_token: data.access_token,
      expires_in: data.expires_in ?? 3600,
    })
    setTokenCookies(res, data)
    return res
  } catch (err) {
    logClientError("api/auth/refresh", err)
    return NextResponse.json({ detail: "Refresh failed" }, { status: 500 })
  }
}
