/**
 * Gmail / SMTP transport (server-only).
 *
 * Env:
 *   SMTP_HOST       defaults to smtp.gmail.com
 *   SMTP_PORT       defaults to 587 (STARTTLS)
 *   SMTP_USER       Gmail address, e.g. pi.masternode@gmail.com
 *   SMTP_PASSWORD   Gmail App Password (16 chars from Google Account → Security)
 *   SMTP_FROM       optional display from, e.g. "MasterNode <pi.masternode@gmail.com>"
 */
import nodemailer, { type Transporter } from "nodemailer"

let cachedTransport: Transporter | null = null

export function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_USER?.trim() && normalizeSmtpPassword(process.env.SMTP_PASSWORD))
}

/** Gmail app passwords are often pasted with spaces — strip them. */
function normalizeSmtpPassword(raw: string | undefined): string {
  return (raw || "").replace(/\s+/g, "")
}

/** Lazily create a cached nodemailer transport. Throws if SMTP is not configured. */
export function getSmtpTransport(): Transporter {
  const user = process.env.SMTP_USER?.trim()
  const pass = normalizeSmtpPassword(process.env.SMTP_PASSWORD)
  if (!user || !pass) {
    throw new Error("SMTP is not configured (set SMTP_USER and SMTP_PASSWORD)")
  }
  if (!cachedTransport) {
    const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com"
    const port = Number(process.env.SMTP_PORT?.trim() || 587)
    const secure = process.env.SMTP_SECURE?.trim() === "1" || port === 465
    cachedTransport = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      connectionTimeout: 15_000,
      greetingTimeout: 15_000,
      socketTimeout: 20_000,
    })
  }
  return cachedTransport
}

/** The From header used for outbound mail. */
export function getEmailFrom(): string {
  const from = process.env.SMTP_FROM?.trim()
  if (from) return from
  const user = process.env.SMTP_USER?.trim()
  if (user) return `MasterNode <${user}>`
  return "MasterNode"
}
