export function getOAuthBridgeSecret(): string | null {
  const secret =
    process.env.OAUTH_BRIDGE_SECRET?.trim() || process.env.AUTH_SESSION_SECRET?.trim() || ""
  return secret || null
}

export function oauthBridgeHeaders(): Record<string, string> {
  const secret = getOAuthBridgeSecret()
  if (!secret) return {}
  return { "X-OAuth-Bridge-Secret": secret }
}
