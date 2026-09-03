import { NextResponse } from "next/server"
import { validateEmail, normalizeEmail } from "@/lib/auth-validation"
import { sendResetPasswordEmail } from "@/lib/email"
import { PASSWORD_RESET_TTL_MINUTES } from "@/lib/password-reset"
import { smtpConfigured } from "@/lib/smtp"
import { backendPost, BackendFetchError } from "@/lib/server/backend-fetch"
import { resolveAppOrigin } from "@/lib/server/app-origin"
import { oauthBridgeHeaders } from "@/lib/server/oauth-bridge-secret"
import { ROUTES } from "@/lib/routes"
import { logClientError } from "@/lib/log-error"

export const runtime = "nodejs"

type ForgotPasswordResponse = {
  ok?: boolean
  reset_token?: string
  email?: string
  expires_in?: number
  detail?: string
}

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 * Creates a 10-minute reset token on the backend and emails the link via SMTP.
 * Always returns a generic success payload (anti-enumeration).
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { email?: unknown }
    const emailInput = typeof body.email === "string" ? body.email : ""

    const emailError = validateEmail(emailInput)
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 })
    }
    const email = normalizeEmail(emailInput)

    const { data, status } = await backendPost<ForgotPasswordResponse>(
      "/v1/auth/forgot-password",
      { email },
      oauthBridgeHeaders()
    )

    if (status === 401) {
      logClientError(
        "api/auth/forgot-password/bridge",
        new Error("Auth bridge secret rejected by API — AUTH_SESSION_SECRET must match the backend")
      )
      return NextResponse.json(
        {
          error:
            "Password reset email is misconfigured (auth bridge secret mismatch). Contact support.",
        },
        { status: 503 }
      )
    }

    if (status >= 500) {
      return NextResponse.json(
        { error: "Could not start password reset. Please try again." },
        { status: 502 }
      )
    }

    const token = typeof data.reset_token === "string" ? data.reset_token.trim() : ""
    if (token) {
      if (!smtpConfigured()) {
        return NextResponse.json(
          { error: "Email delivery is not configured. Please try again later." },
          { status: 503 }
        )
      }
      const origin = resolveAppOrigin(req)
      const resetUrl = `${origin}${ROUTES.resetPassword}?token=${encodeURIComponent(token)}`
      try {
        await sendResetPasswordEmail(email, resetUrl)
      } catch (err) {
        logClientError("api/auth/forgot-password/smtp", err)
        return NextResponse.json(
          { error: "Could not send reset email. Please try again." },
          { status: 500 }
        )
      }
    } else if (smtpConfigured() && Object.keys(oauthBridgeHeaders()).length > 0) {
      // Bridge was sent but API returned no token: either the account does not exist
      // (anti-enumeration — still return ok) OR the API omitted the token unexpectedly.
      // Log for ops; keep response generic.
      logClientError(
        "api/auth/forgot-password/no-token",
        new Error("Bridge authenticated request returned no reset_token (ok if email unknown)")
      )
    }
    return NextResponse.json({
      ok: true,
      expiresIn: data.expires_in ?? PASSWORD_RESET_TTL_MINUTES * 60,
    })
  } catch (err) {
    logClientError("api/auth/forgot-password", err)
    if (err instanceof BackendFetchError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json(
      { error: "Could not send reset instructions. Please try again." },
      { status: 500 }
    )
  }
}
