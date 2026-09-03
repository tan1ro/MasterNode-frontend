function encodeSecret(value: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(value, "utf8"))
  }
  return new TextEncoder().encode(value)
}

export function getAuthSessionSecret(): Uint8Array {
  const raw = process.env.AUTH_SESSION_SECRET?.trim()
  if (!raw) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SESSION_SECRET is required in production")
    }
    return encodeSecret("dev-only-masternode-session-secret-change-me")
  }
  return encodeSecret(raw)
}
