import { NextResponse } from "next/server"
import { validateSignUpPassword } from "@/lib/auth-validation"
import { backendPost, BackendFetchError } from "@/lib/server/backend-fetch"
import { logClientError } from "@/lib/log-error"

export const runtime = "nodejs"

type ResetPasswordResponse = {
  ok?: boolean
  detail?: string
}

/**
 * POST /api/auth/reset-password
 * Body: { token, new_password }
 * Consumes a password-reset token (valid for 10 minutes) and sets a new password.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      token?: unknown
      new_password?: unknown
      newPassword?: unknown
    }

    const token = typeof body.token === "string" ? body.token.trim() : ""
    const newPassword =
      typeof body.new_password === "string"
        ? body.new_password
        : typeof body.newPassword === "string"
          ? body.newPassword
          : ""

    if (!token || token.length < 20) {
      return NextResponse.json(
        { error: "Invalid or missing reset token. Request a new reset link." },
        { status: 400 }
      )
    }

    const passwordError = validateSignUpPassword(newPassword)
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 })
    }

    const { data, status } = await backendPost<ResetPasswordResponse>("/v1/auth/reset-password", {
      token,
      new_password: newPassword,
    })

    if (status !== 200 || !data.ok) {
      const detail =
        typeof data.detail === "string"
          ? data.detail
          : "This reset link is invalid or has expired. Request a new one."
      return NextResponse.json({ error: detail }, { status: status === 200 ? 400 : status })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    logClientError("api/auth/reset-password", err)
    if (err instanceof BackendFetchError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json(
      { error: "Could not reset password. Please try again." },
      { status: 500 }
    )
  }
}
