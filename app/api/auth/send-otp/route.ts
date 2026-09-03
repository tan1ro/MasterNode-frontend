import { NextResponse } from "next/server"
import { validateEmail, normalizeEmail } from "@/lib/auth-validation"
import { OtpError, requestOtp } from "@/lib/otp"
import { logClientError } from "@/lib/log-error"

// Node runtime required for crypto + nodemailer SMTP (not Edge).
export const runtime = "nodejs"

/**
 * POST /api/auth/send-otp
 * Body: { email }
 * Sends a fresh 6-digit code (rate limited). Never returns the code.
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

    const result = await requestOtp(email, { enforceCooldown: false })
    return NextResponse.json({
      ok: true,
      expiresIn: result.expiresInSeconds,
      cooldown: result.cooldownSeconds,
      ...(result.devCode ? { devCode: result.devCode } : {}),
    })
  } catch (err) {
    if (err instanceof OtpError) {
      return NextResponse.json(
        { error: err.message, code: err.code, ...err.meta },
        { status: err.status }
      )
    }
    logClientError("api/auth/send-otp", err)
    return NextResponse.json(
      { error: "Could not send verification code. Please try again." },
      { status: 500 }
    )
  }
}
