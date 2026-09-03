export type OAuthProviderId = "google" | "github" | "microsoft" | "apple"

const PROVIDER_ENV: Record<OAuthProviderId, [string, string]> = {
  google: ["AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET"],
  github: ["AUTH_GITHUB_ID", "AUTH_GITHUB_SECRET"],
  microsoft: ["AUTH_MICROSOFT_ID", "AUTH_MICROSOFT_SECRET"],
  apple: ["AUTH_APPLE_ID", "AUTH_APPLE_SECRET"],
}

const PUBLIC_FLAGS: Record<OAuthProviderId, string> = {
  google: "NEXT_PUBLIC_OAUTH_GOOGLE_ENABLED",
  github: "NEXT_PUBLIC_OAUTH_GITHUB_ENABLED",
  microsoft: "NEXT_PUBLIC_OAUTH_MICROSOFT_ENABLED",
  apple: "NEXT_PUBLIC_OAUTH_APPLE_ENABLED",
}

export const OAUTH_PROVIDER_LABELS: Record<OAuthProviderId, string> = {
  google: "Google",
  github: "GitHub",
  microsoft: "Microsoft",
  apple: "Apple",
}

export function isOAuthProviderConfigured(id: OAuthProviderId): boolean {
  const [clientIdKey, clientSecretKey] = PROVIDER_ENV[id]
  return Boolean(process.env[clientIdKey]?.trim() && process.env[clientSecretKey]?.trim())
}

/** Server-only: providers with both client id and secret set. */
export function getConfiguredOAuthProviders(): OAuthProviderId[] {
  return (Object.keys(PROVIDER_ENV) as OAuthProviderId[]).filter(isOAuthProviderConfigured)
}

export function isPublicOAuthProviderEnabled(id: OAuthProviderId): boolean {
  return process.env[PUBLIC_FLAGS[id]] === "1"
}

/** Client-safe list derived from public env flags. */
export function getPublicOAuthProviders(options?: { isAppleDevice?: boolean }): OAuthProviderId[] {
  const isAppleDevice = options?.isAppleDevice ?? false
  const out: OAuthProviderId[] = []
  if (isPublicOAuthProviderEnabled("google")) out.push("google")
  if (isPublicOAuthProviderEnabled("github")) out.push("github")
  if (isPublicOAuthProviderEnabled("microsoft")) out.push("microsoft")
  if (isPublicOAuthProviderEnabled("apple") && isAppleDevice) out.push("apple")
  return out
}

export function isOAuthEnabled(options?: { isAppleDevice?: boolean }): boolean {
  return getPublicOAuthProviders(options).length > 0
}
