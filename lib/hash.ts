/**
 * OTP hashing utilities (server-only).
 *
 * OTPs are never stored in plain text. We store an HMAC-SHA256 digest keyed with
 * a server secret, and compare in constant time to avoid timing attacks.
 */
import { createHmac, timingSafeEqual } from "crypto"

/** Secret used to key the OTP HMAC. Falls back to the session secret. */
function getOtpSecret(): string {
  const secret =
    process.env.OTP_HASH_SECRET?.trim() || process.env.AUTH_SESSION_SECRET?.trim()
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("OTP_HASH_SECRET (or AUTH_SESSION_SECRET) is required in production")
    }
    return "dev-only-otp-hash-secret-change-me"
  }
  return secret
}

/** Hash an OTP bound to a specific email so a leaked hash can't be reused elsewhere. */
export function hashOtp(email: string, otp: string): string {
  return createHmac("sha256", getOtpSecret())
    .update(`${email.trim().toLowerCase()}:${otp}`)
    .digest("hex")
}

/** Constant-time comparison of two hex digests. */
export function safeCompareHash(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8")
  const bufB = Buffer.from(b, "utf8")
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}
