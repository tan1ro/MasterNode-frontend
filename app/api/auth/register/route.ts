import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { backendPost, backendGet } from "@/lib/server/backend-fetch"
import { setTokenCookies, setSessionCookie } from "@/lib/server/auth-cookies"
import { signSessionPayload } from "@/lib/server/auth-session"
import { buildSessionFromTokensAndProfile } from "@/lib/server/build-session-from-profile"
import { isEmailVerificationTokenValid, SIGNUP_VERIFY_COOKIE } from "@/lib/otp"
import { normalizeEmail } from "@/lib/auth-validation"
import { logClientError } from "@/lib/log-error"

// Node runtime required for jose (proof-token verification).
export const runtime = "nodejs"

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
    const body = await req.json()
    const email = typeof body?.email === "string" ? normalizeEmail(body.email) : ""

    // Enforce email OTP verification: require a valid proof cookie for this email.
    const cookieStore = await cookies()
    const proof = cookieStore.get(SIGNUP_VERIFY_COOKIE)?.value
    if (!email || !(await isEmailVerificationTokenValid(proof, email))) {
      return NextResponse.json(
        { detail: "Email not verified. Please verify the code sent to your email." },
        { status: 403 }
      )
    }

    const { data, status } = await backendPost<AuthTokenResponse>("/v1/auth/register", body)
    if (status !== 200 || !data.access_token) {
      const detail = typeof data.detail === "string" ? data.detail : "Registration failed"
      return NextResponse.json({ detail }, { status: status === 200 ? 400 : status })
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
    // Verification consumed — clear the proof cookie.
    res.cookies.set(SIGNUP_VERIFY_COOKIE, "", { path: "/", maxAge: 0 })
    return res
  } catch (err) {
    logClientError("api/auth/register", err)
    return NextResponse.json({ detail: "Registration failed" }, { status: 500 })
  }
}
