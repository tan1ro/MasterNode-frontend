/**
 * Neon (serverless PostgreSQL) client (server-only).
 *
 * Replaces the former Supabase admin client. Used for privileged writes to the
 * `email_otps` table. NEVER import this from client components — the connection
 * string must never reach the browser.
 *
 * Env:
 *   DATABASE_URL (or NEON_DATABASE_URL)
 *   e.g. postgresql://user:pass@ep-xxxx.aws.neon.tech/neondb?sslmode=require
 */
import { neon, type NeonQueryFunction } from "@neondatabase/serverless"

let cached: NeonQueryFunction<false, false> | null = null

/** Return a cached Neon SQL tagged-template client. Throws if not configured. */
export function getSql(): NeonQueryFunction<false, false> {
  const url = process.env.DATABASE_URL?.trim() || process.env.NEON_DATABASE_URL?.trim()
  if (!url) {
    throw new Error("Neon is not configured (set DATABASE_URL)")
  }
  if (!cached) {
    cached = neon(url)
  }
  return cached
}
