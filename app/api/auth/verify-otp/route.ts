import { NextResponse } from "next/server"
import { validateEmail, normalizeEmail } from "@/lib/auth-validation"
import {
  OtpError,
  verifyOtp,
  SIGNUP_VERIFY_COOKIE,
  SIGNUP_VERIFY_COOKIE_MAX_AGE,
} from "@/lib/otp"
import { logClientError } from "@/lib/log-error"

// Node runtime required for crypto + jose (not Edge).
export const runtime = "nodejs"

/**
 * POST /api/auth/verify-otp
 * Body: { email, otp }
 * On success: deletes the OTP and sets an HttpOnly proof cookie the register
 * route checks. Never returns the OTP itself.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { email?: unknown; otp?: unknown }
    const emailInput = typeof body.email === "string" ? body.email : ""
    const otpInput = typeof body.otp === "string" ? body.otp : ""

    const emailError = validateEmail(emailInput)
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 })
    }
    const email = normalizeEmail(emailInput)

    const { token } = await verifyOtp(email, otpInput)

    const res = NextResponse.json({ ok: true, verified: true })
    res.cookies.set(SIGNUP_VERIFY_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SIGNUP_VERIFY_COOKIE_MAX_AGE,
    })
    return res
  } catch (err) {
    if (err instanceof OtpError) {
      return NextResponse.json({ error: err.message, ...err.meta }, { status: err.status })
    }
    logClientError("api/auth/verify-otp", err)
    return NextResponse.json(
      { error: "Could not verify the code. Please try again." },
      { status: 500 }
    )
  }
}
