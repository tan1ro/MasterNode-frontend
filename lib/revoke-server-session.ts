"use client"

/** Clear HttpOnly auth cookies (mn_session, tokens) via the BFF logout route. */
export async function revokeServerSession(options?: { stale?: boolean }): Promise<void> {
  if (typeof window === "undefined") return
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stale: options?.stale === true }),
    })
  } catch {
    // Best-effort — sign-in must still work if this fails.
  }
}
