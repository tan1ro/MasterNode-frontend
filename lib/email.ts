/**
 * Transactional email templates + SMTP sender (server-only).
 */
import { getEmailFrom, getSmtpTransport } from "@/lib/smtp"
import { PASSWORD_RESET_TTL_MINUTES } from "@/lib/password-reset"

const OTP_SUBJECT = "Verify your email"
const RESET_PASSWORD_SUBJECT = "Reset your MasterNode password"

export { PASSWORD_RESET_TTL_MINUTES }

/** Plain-text fallback body. */
export function otpEmailText(code: string): string {
  return [
    "Your verification code is:",
    "",
    code,
    "",
    "This code expires in 5 minutes.",
    "",
    "If you didn't request this, ignore this email.",
  ].join("\n")
}

/** Branded HTML email body. */
export function otpEmailHtml(code: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#0b0d12;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:480px;margin:0 auto;padding:40px 24px;color:#f0f2f8;">
      <h1 style="font-size:20px;margin:0 0 8px;">Verify your email</h1>
      <p style="color:#8b92a9;font-size:14px;margin:0 0 24px;">
        Enter this code to finish creating your MasterNode account.
      </p>
      <div style="font-size:34px;font-weight:700;letter-spacing:10px;
                  background:#12151c;border:1px solid #23262f;border-radius:12px;
                  padding:18px 0;text-align:center;color:#dc8d18;">
        ${code}
      </div>
      <p style="color:#8b92a9;font-size:13px;margin:24px 0 0;">
        This code expires in 5 minutes. If you didn't request this, you can safely
        ignore this email.
      </p>
    </div>
  </body>
</html>`
}

/** Send an OTP email via SMTP (Gmail). Throws on delivery failure. */
export async function sendOtpEmail(to: string, code: string): Promise<void> {
  const transport = getSmtpTransport()
  await transport.sendMail({
    from: getEmailFrom(),
    to,
    subject: OTP_SUBJECT,
    html: otpEmailHtml(code),
    text: otpEmailText(code),
  })
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

/** Plain-text password-reset email. */
export function resetPasswordEmailText(resetUrl: string): string {
  return [
    "Reset your MasterNode password",
    "",
    "We received a request to reset the password for your account.",
    "Open this link to choose a new password:",
    "",
    resetUrl,
    "",
    `This link expires in ${PASSWORD_RESET_TTL_MINUTES} minutes.`,
    "",
    "If you didn't request this, you can safely ignore this email.",
  ].join("\n")
}

/** Branded HTML password-reset email. */
export function resetPasswordEmailHtml(resetUrl: string): string {
  const safeUrl = escapeHtml(resetUrl)
  return `<!doctype html>
<html>
  <body style="margin:0;background:#0b0d12;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:480px;margin:0 auto;padding:40px 24px;color:#f0f2f8;">
      <h1 style="font-size:20px;margin:0 0 8px;">Reset your password</h1>
      <p style="color:#8b92a9;font-size:14px;margin:0 0 24px;">
        We received a request to reset the password for your MasterNode account.
        Click the button below to choose a new one.
      </p>
      <p style="margin:0 0 24px;text-align:center;">
        <a href="${safeUrl}"
           style="display:inline-block;background:#dc8d18;color:#0b0d12;text-decoration:none;
                  font-weight:700;font-size:14px;padding:12px 22px;border-radius:10px;">
          Reset password
        </a>
      </p>
      <p style="color:#8b92a9;font-size:13px;margin:0 0 12px;word-break:break-all;">
        Or copy this link:<br/>
        <a href="${safeUrl}" style="color:#b0f900;">${safeUrl}</a>
      </p>
      <p style="color:#8b92a9;font-size:13px;margin:0;">
        This link expires in ${PASSWORD_RESET_TTL_MINUTES} minutes. If you didn't request this,
        you can safely ignore this email.
      </p>
    </div>
  </body>
</html>`
}

/** Send a password-reset email via SMTP. Throws on delivery failure. */
export async function sendResetPasswordEmail(to: string, resetUrl: string): Promise<void> {
  const transport = getSmtpTransport()
  await transport.sendMail({
    from: getEmailFrom(),
    to,
    subject: RESET_PASSWORD_SUBJECT,
    html: resetPasswordEmailHtml(resetUrl),
    text: resetPasswordEmailText(resetUrl),
  })
}
