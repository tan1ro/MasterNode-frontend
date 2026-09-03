"use client"

const AUTH_BOOTSTRAP_SUFFIXES = [
  "/v1/auth/login",
  "/api/v1/auth/login",
  "/v1/auth/register",
  "/api/v1/auth/register",
  "/v1/auth/refresh",
  "/api/v1/auth/refresh",
  "/v1/auth/guest",
  "/api/v1/auth/guest",
  "/v1/organizations/search",
  "/api/v1/organizations/search",
  "/v1/auth/check-email",
  "/api/v1/auth/check-email",
] as const

export function isAuthBootstrapRequest(url?: string): boolean {
  if (!url) return false
  return AUTH_BOOTSTRAP_SUFFIXES.some((suffix) => url.includes(suffix))
}

const AUTH_LOGIN_SUFFIXES = ["/v1/auth/login", "/api/v1/auth/login"] as const

export function isAuthLoginRequest(url?: string): boolean {
  if (!url) return false
  return AUTH_LOGIN_SUFFIXES.some((suffix) => url.includes(suffix))
}
