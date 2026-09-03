import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { backendPost, backendGet } from "@/lib/server/backend-fetch"
import { oauthBridgeHeaders } from "@/lib/server/oauth-bridge-secret"
import { setTokenCookies, setSessionCookie } from "@/lib/server/auth-cookies"
import { signSessionPayload } from "@/lib/server/auth-session"
import { buildSessionFromTokensAndProfile } from "@/lib/server/build-session-from-profile"
import { ROUTES } from "@/lib/routes"
import { safeRedirectPath } from "@/lib/safe-redirect"
import { logClientError } from "@/lib/log-error"

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

function errorRedirect(req: Request, message: string): NextResponse {
  const url = new URL(ROUTES.signIn, req.url)
  url.searchParams.set("oauth_error", message)
  return NextResponse.redirect(url)
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return errorRedirect(req, "OAuth sign-in did not return an email address.")
    }

    const provider = session.provider
    const providerAccountId = session.providerAccountId
    if (!provider || !providerAccountId) {
      return errorRedirect(req, "OAuth provider details are missing.")
    }

    const { data, status } = await backendPost<AuthTokenResponse>(
      "/v1/auth/oauth",
      {
        email: session.user.email,
        username: session.user.name || session.user.email.split("@")[0],
        provider,
        provider_account_id: providerAccountId,
        account_type: "creator",
      },
      oauthBridgeHeaders()
    )

    if (status !== 200 || !data.access_token) {
      const detail = typeof data.detail === "string" ? data.detail : "OAuth sign-in failed"
      return errorRedirect(req, detail)
    }

    const profileRes = await backendGet<AuthProfileResponse>("/v1/auth/me", data.access_token)
    const profile = profileRes.status === 200 ? profileRes.data : {}
    const signedSession = await signSessionPayload(
      buildSessionFromTokensAndProfile(data.tenant_id, data.email, profile)
    )

    const redirectTarget = safeRedirectPath(
      new URL(req.url).searchParams.get("redirect_url"),
      ROUTES.chat
    )
    const completeUrl = new URL("/auth/oauth/complete", req.url)
    completeUrl.searchParams.set("redirect_url", redirectTarget)

    const res = NextResponse.redirect(completeUrl)
    setTokenCookies(res, data)
    setSessionCookie(res, signedSession)

    res.cookies.set("authjs.session-token", "", { path: "/", maxAge: 0 })
    res.cookies.set("__Secure-authjs.session-token", "", { path: "/", maxAge: 0, secure: true })
    return res
  } catch (err) {
    logClientError("api/auth/oauth/callback", err)
    return errorRedirect(req, "OAuth sign-in failed. Please try again.")
  }
}
