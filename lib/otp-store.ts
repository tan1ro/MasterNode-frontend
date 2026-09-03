/**
 * OTP persistence layer. Uses Neon when DATABASE_URL is set, otherwise MongoDB
 * when MONGODB_URL is set. Throws a clear error when neither is configured.
 */
import { getSql } from "@/lib/neon"
import { getEmailOtpsCollection } from "@/lib/mongo"
import { OtpError } from "@/lib/otp-error"

export interface OtpRow {
  email: string
  otp_hash: string
  expires_at: string
  created_at: string
  attempts: number
  send_count: number
  send_window_start: string
  last_sent_at: string | null
  verified: boolean
  verified_at: string | null
}

type OtpBackend = "neon" | "mongo"

function hasNeonConfig(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim() || process.env.NEON_DATABASE_URL?.trim())
}

function hasMongoConfig(): boolean {
  return Boolean(process.env.MONGODB_URL?.trim())
}

export function getOtpBackend(): OtpBackend {
  if (hasNeonConfig()) return "neon"
  if (hasMongoConfig()) return "mongo"
  throw new OtpError(
    503,
    "not_configured",
    "Email verification is currently unavailable. Please try again later."
  )
}

function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString()
  return String(value)
}

function toNullableIso(value: unknown): string | null {
  if (value == null) return null
  return toIso(value)
}

function normalizeMongoRow(doc: Record<string, unknown> | null): OtpRow | null {
  if (!doc) return null
  return {
    email: String(doc.email ?? ""),
    otp_hash: String(doc.otp_hash ?? ""),
    expires_at: toIso(doc.expires_at),
    created_at: toIso(doc.created_at),
    attempts: Number(doc.attempts ?? 0),
    send_count: Number(doc.send_count ?? 0),
    send_window_start: toIso(doc.send_window_start),
    last_sent_at: toNullableIso(doc.last_sent_at),
    verified: Boolean(doc.verified),
    verified_at: toNullableIso(doc.verified_at),
  }
}

export async function fetchOtpRow(email: string): Promise<OtpRow | null> {
  const backend = getOtpBackend()
  try {
    if (backend === "neon") {
      const sql = getSql()
      const rows = (await sql`
        select email, otp_hash, expires_at, created_at, attempts, send_count,
               send_window_start, last_sent_at, verified, verified_at
        from email_otps
        where email = ${email}
        limit 1
      `) as unknown as OtpRow[]
      return rows[0] ?? null
    }

    const collection = await getEmailOtpsCollection()
    const doc = await collection.findOne({ email })
    return normalizeMongoRow(doc as Record<string, unknown> | null)
  } catch (err) {
    if (err instanceof OtpError) throw err
    const raw = err instanceof Error ? err.message : String(err)
    console.error("[MasterNode] OTP store fetch failed:", raw)
    if (/ECONNREFUSED|ENOTFOUND|ETIMEDOUT|querySrv|MongoServerSelectionError|MongoNetworkError/i.test(raw)) {
      throw new OtpError(
        503,
        "db_unavailable",
        "Verification database is unreachable."
      )
    }
    throw new OtpError(500, "db_error", "Verification service is unavailable.")
  }
}

export async function upsertOtpRow(row: OtpRow): Promise<void> {
  const backend = getOtpBackend()
  try {
    if (backend === "neon") {
      const sql = getSql()
      await sql`
        insert into email_otps (
          email, otp_hash, expires_at, created_at, attempts, send_count,
          send_window_start, last_sent_at, verified, verified_at
        ) values (
          ${row.email}, ${row.otp_hash}, ${row.expires_at}, ${row.created_at}, ${row.attempts},
          ${row.send_count}, ${row.send_window_start}, ${row.last_sent_at}, ${row.verified}, ${row.verified_at}
        )
        on conflict (email) do update set
          otp_hash = excluded.otp_hash,
          expires_at = excluded.expires_at,
          attempts = excluded.attempts,
          send_count = excluded.send_count,
          send_window_start = excluded.send_window_start,
          last_sent_at = excluded.last_sent_at,
          verified = excluded.verified,
          verified_at = excluded.verified_at
      `
      return
    }

    const collection = await getEmailOtpsCollection()
    await collection.updateOne(
      { email: row.email },
      {
        $set: {
          otp_hash: row.otp_hash,
          expires_at: new Date(row.expires_at),
          created_at: new Date(row.created_at),
          attempts: row.attempts,
          send_count: row.send_count,
          send_window_start: new Date(row.send_window_start),
          last_sent_at: row.last_sent_at ? new Date(row.last_sent_at) : null,
          verified: row.verified,
          verified_at: row.verified_at ? new Date(row.verified_at) : null,
        },
        $setOnInsert: { email: row.email },
      },
      { upsert: true }
    )
  } catch (err) {
    if (err instanceof OtpError) throw err
    const raw = err instanceof Error ? err.message : String(err)
    console.error("[MasterNode] OTP store upsert failed:", raw)
    if (/ECONNREFUSED|ENOTFOUND|ETIMEDOUT|querySrv|MongoServerSelectionError|MongoNetworkError/i.test(raw)) {
      throw new OtpError(
        503,
        "db_unavailable",
        "Verification database is unreachable. Check MONGODB_URL / network and try again."
      )
    }
    throw new OtpError(500, "db_error", "Could not create a verification code.")
  }
}

export async function incrementOtpAttempts(email: string, attempts: number): Promise<void> {
  const backend = getOtpBackend()
  try {
    if (backend === "neon") {
      const sql = getSql()
      await sql`update email_otps set attempts = ${attempts} where email = ${email}`
      return
    }
    const collection = await getEmailOtpsCollection()
    await collection.updateOne({ email }, { $set: { attempts } })
  } catch {
    throw new OtpError(500, "db_error", "Verification service is unavailable.")
  }
}

export async function deleteOtpRow(email: string): Promise<void> {
  const backend = getOtpBackend()
  try {
    if (backend === "neon") {
      const sql = getSql()
      await sql`delete from email_otps where email = ${email}`
      return
    }
    const collection = await getEmailOtpsCollection()
    await collection.deleteOne({ email })
  } catch {
    throw new OtpError(500, "db_error", "Verification service is unavailable.")
  }
}
