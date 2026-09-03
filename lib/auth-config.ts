/** True when running a production build (auth uses BFF + HttpOnly cookies). */
export function isProductionAuth(): boolean {
  return process.env.NODE_ENV === "production"
}

/** True in development when legacy localStorage tokens are allowed. */
export function isLegacyTokenStorage(): boolean {
  return !isProductionAuth()
}
