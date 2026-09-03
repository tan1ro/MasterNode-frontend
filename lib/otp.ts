/**
 * Email OTP core logic (server-only).
 *
 * Storage: Neon (`DATABASE_URL`) or MongoDB Atlas (`MONGODB_URL`).
 * Nothing is kept in memory, so this works across Vercel serverless invocations.
 *
 * Security:
 *  - OTPs are hashed (HMAC-SHA256) before storage; never stored/returned in plain.
 *  - Codes expire after 5 minutes.
 *  - Per-email rate limiting (max sends/hour) + 60s resend cooldown.
 *  - Max verification attempts before lock-out.
 *  - On success the row is deleted and a short-lived signed proof token is issued
 *    (validated by the register route) so signup can continue statelessly.
 */
import { randomInt } from "crypto"
import { SignJWT, jwtVerify } from "jose"
import { getAuthSessionSecret } from "@/lib/server/session-secret"
import { hashOtp, safeCompareHash } from "@/lib/hash"
import { sendOtpEmail } from "@/lib/email"
import {
  deleteOtpRow,
  fetchOtpRow,
  incrementOtpAttempts,
  upsertOtpRow,
  type OtpRow,
} from "@/lib/otp-store"
import { OtpError } from "@/lib/otp-error"

// --- Configuration -----------------------------------------------------------
const OTP_LENGTH = 6
const OTP_TTL_MS = 5 * 60 * 1000 // 5 minutes
const OTP_COOLDOWN_MS =
  process.env.NODE_ENV === "development" ? 10 * 1000 : 60 * 1000
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const MAX_SENDS_PER_WINDOW =
  process.env.NODE_ENV === "development" ? Number.MAX_SAFE_INTEGER : 5
const MAX_VERIFY_ATTEMPTS = 10 // max verification attempts per code
const VERIFICATION_TOKEN_TTL = "15m"
const VERIFICATION_TOKEN_PURPOSE = "signup_email_verification"

export const OTP_TTL_SECONDS = OTP_TTL_MS / 1000
export const OTP_COOLDOWN_SECONDS = OTP_COOLDOWN_MS / 1000

/** HttpOnly cookie that carries the email-verification proof token to /api/auth/register. */
export const SIGNUP_VERIFY_COOKIE = "mn_signup_verify"
/** Cookie lifetime in seconds (matches the proof token TTL). */
export const SIGNUP_VERIFY_COOKIE_MAX_AGE = 15 * 60

// --- Errors ------------------------------------------------------------------
export { OtpError } from "@/lib/otp-error"

// --- Helpers -----------------------------------------------------------------
/** Cryptographically strong zero-padded 6-digit code. */
export function generateOtp(): string {
  return randomInt(0, 10 ** OTP_LENGTH)
    .toString()
    .padStart(OTP_LENGTH, "0")
}

async function fetchRow(email: string): Promise<OtpRow | null> {
  return fetchOtpRow(email)
}

// --- Public API --------------------------------------------------------------
export interface RequestOtpResult {
  expiresInSeconds: number
  cooldownSeconds: number
  /** Local dev only when OTP_DEV_ECHO=1 — never set in production. */
  devCode?: string
}

function isDevOtpEchoEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.OTP_DEV_ECHO?.trim() === "1"
  )
}

/**
 * Generate a new OTP, store its hash, and email it. Enforces rate limiting and
 * (for resends) the 60-second cooldown. Any previous OTP is overwritten.
 */
export async function requestOtp(
  emailRaw: string,
  opts: { enforceCooldown?: boolean } = {}
): Promise<RequestOtpResult> {
  const email = emailRaw.trim().toLowerCase()
  const now = Date.now()
  const existing = await fetchRow(email)

  // Sliding 1-hour send window for rate limiting.
  let windowStart = existing ? new Date(existing.send_window_start).getTime() : now
  let sendCount = existing ? existing.send_count : 0
  if (!existing || now - windowStart > RATE_LIMIT_WINDOW_MS) {
    windowStart = now
    sendCount = 0
  }

  if (sendCount >= MAX_SENDS_PER_WINDOW) {
    const retryAfter = Math.ceil((windowStart + RATE_LIMIT_WINDOW_MS - now) / 1000)
    throw new OtpError(
      429,
      "rate_limited",
      "Too many codes requested. Please try again later.",
      { retryAfter }
    )
  }

  // Resend-request cooldown (separate endpoint).
  if (opts.enforceCooldown && existing?.last_sent_at) {
    const sinceLast = now - new Date(existing.last_sent_at).getTime()
    if (sinceLast < OTP_COOLDOWN_MS) {
      const remaining = Math.ceil((OTP_COOLDOWN_MS - sinceLast) / 1000)
      throw new OtpError(429, "cooldown", `Please wait ${remaining}s before requesting a new code.`, {
        retryAfter: remaining,
      })
    }
  }

  const code = generateOtp()
  const nowIso = new Date(now).toISOString()
  const row: OtpRow = {
    email,
    otp_hash: hashOtp(email, code),
    expires_at: new Date(now + OTP_TTL_MS).toISOString(),
    created_at: existing?.created_at ?? nowIso,
    attempts: 0,
    send_count: sendCount + 1,
    send_window_start: new Date(windowStart).toISOString(),
    last_sent_at: nowIso,
    verified: false,
    verified_at: null,
  }

  await upsertOtpRow(row)

  // Local dev: skip email and surface the code in the API response (OTP_DEV_ECHO=1).
  if (isDevOtpEchoEnabled()) {
    console.info(`[MasterNode] OTP dev echo for ${email}: ${code}`)
    return {
      expiresInSeconds: OTP_TTL_SECONDS,
      cooldownSeconds: OTP_COOLDOWN_SECONDS,
      devCode: code,
    }
  }

  // Send AFTER persisting so a code always exists to verify against.
  try {
    await sendOtpEmail(email, code)
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Could not send verification email."
    console.error("[MasterNode] OTP email send failed:", raw)

    // Local/dev: never block signup on SMTP/network blips — echo the code instead.
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[MasterNode] SMTP failed in development; returning OTP in the API response. " +
          "Set OTP_DEV_ECHO=1 to skip email entirely, or fix SMTP_* in frontend/.env.local."
      )
      console.info(`[MasterNode] OTP dev fallback for ${email}: ${code}`)
      return {
        expiresInSeconds: OTP_TTL_SECONDS,
        cooldownSeconds: OTP_COOLDOWN_SECONDS,
        devCode: code,
      }
    }

    const message =
      raw.includes("SMTP_USER") || raw.includes("SMTP_PASSWORD")
        ? "Email is not configured. Add SMTP_USER and SMTP_PASSWORD (Gmail App Password) to the server environment."
        : /EAUTH|Invalid login|Username and Password not accepted/i.test(raw)
          ? "Email login failed. Check SMTP_USER and the Gmail App Password."
          : /ENOTFOUND|ETIMEDOUT|ECONNREFUSED|ESOCKET|ECONNECTION/i.test(raw)
            ? "Could not reach the mail server. Check network / SMTP_HOST and try again."
            : "Could not send verification email. Please try again in a moment."
    throw new OtpError(503, "email_send_failed", message)
  }

  return { expiresInSeconds: OTP_TTL_SECONDS, cooldownSeconds: OTP_COOLDOWN_SECONDS }
}

/**
 * Verify a submitted OTP. On success deletes the record and returns a signed
 * proof token for the register step. Throws OtpError on any failure.
 */
export async function verifyOtp(emailRaw: string, otpRaw: string): Promise<{ token: string }> {
  const email = emailRaw.trim().toLowerCase()
  const otp = otpRaw.replace(/\D/g, "")
  if (otp.length !== OTP_LENGTH) {
    throw new OtpError(400, "invalid_format", "Enter the 6-digit code from your email.")
  }

  const row = await fetchRow(email)
  if (!row) {
    throw new OtpError(404, "not_found", "No active code. Request a new one.")
  }

  if (Date.now() > new Date(row.expires_at).getTime()) {
    await deleteOtpRow(email)
    throw new OtpError(400, "expired", "This code has expired. Request a new one.")
  }

  if (row.attempts >= MAX_VERIFY_ATTEMPTS) {
    throw new OtpError(429, "too_many_attempts", "Too many attempts. Request a new code.")
  }

  // Count this attempt before comparing.
  await incrementOtpAttempts(email, row.attempts + 1)

  if (!safeCompareHash(hashOtp(email, otp), row.otp_hash)) {
    const attemptsRemaining = Math.max(0, MAX_VERIFY_ATTEMPTS - (row.attempts + 1))
    throw new OtpError(400, "incorrect", "Incorrect code. Please try again.", { attemptsRemaining })
  }

  // Success: delete the OTP and issue a short-lived proof token.
  await deleteOtpRow(email)
  const token = await signVerificationToken(email)
  return { token }
}

// --- Verification proof token ------------------------------------------------
/** Sign a short-lived token proving `email` was verified via OTP. */
export async function signVerificationToken(email: string): Promise<string> {
  return new SignJWT({ purpose: VERIFICATION_TOKEN_PURPOSE })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(email.trim().toLowerCase())
    .setIssuedAt()
    .setExpirationTime(VERIFICATION_TOKEN_TTL)
    .sign(getAuthSessionSecret())
}

/** Return true when `token` is a valid, unexpired proof for `email`. */
export async function isEmailVerificationTokenValid(
  token: string | undefined | null,
  email: string
): Promise<boolean> {
  if (!token?.trim()) return false
  try {
    const { payload } = await jwtVerify(token.trim(), getAuthSessionSecret())
    return (
      payload.purpose === VERIFICATION_TOKEN_PURPOSE &&
      String(payload.sub ?? "").toLowerCase() === email.trim().toLowerCase()
    )
  } catch {
    return false
  }
}
