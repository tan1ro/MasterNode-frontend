import { NextResponse } from "next/server"
import { validateEmail, normalizeEmail } from "@/lib/auth-validation"
import { OtpError, requestOtp } from "@/lib/otp"
import { logClientError } from "@/lib/log-error"

// Node runtime required for crypto + nodemailer SMTP (not Edge).
export const runtime = "nodejs"

/**
 * POST /api/auth/resend-otp
 * Body: { email }
 * Same as send-otp but enforces a 60s cooldown; returns remaining seconds if too early.
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

    const result = await requestOtp(email, { enforceCooldown: true })
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
    logClientError("api/auth/resend-otp", err)
    return NextResponse.json(
      { error: "Could not resend verification code. Please try again." },
      { status: 500 }
    )
  }
}
