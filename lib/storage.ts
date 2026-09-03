const isBrowser = typeof window !== "undefined"

export const APP_USER_ID_STORAGE_KEY = "app_user_id"
export const API_KEY_STORAGE_KEY = "api_key"

function sessionStore(): Storage | null {
  if (!isBrowser) return null
  try {
    return sessionStorage
  } catch {
    return null
  }
}

function localStore(): Storage | null {
  if (!isBrowser) return null
  try {
    return localStorage
  } catch {
    return null
  }
}

/**
 * Active API key for X-API-Key / WebSocket auth.
 * Stored in sessionStorage (tab-scoped) — not durable localStorage — so secrets
 * do not survive browser restarts. Migrates any legacy localStorage copy once.
 */
export function getStoredApiKey(): string | null {
  const session = sessionStore()
  const local = localStore()
  if (!session && !local) return null
  try {
    const fromSession = session?.getItem(API_KEY_STORAGE_KEY)?.trim()
    if (fromSession) return fromSession
    const legacy = local?.getItem(API_KEY_STORAGE_KEY)?.trim()
    if (legacy) {
      try {
        session?.setItem(API_KEY_STORAGE_KEY, legacy)
      } catch {
        // keep reading via local until remove
      }
      try {
        local?.removeItem(API_KEY_STORAGE_KEY)
      } catch {
        // ignore
      }
      return legacy
    }
  } catch {
    return null
  }
  return null
}

export function setStoredApiKey(key: string): void {
  const safe = key.trim()
  if (!safe) return
  try {
    sessionStore()?.setItem(API_KEY_STORAGE_KEY, safe)
  } catch {
    // ignore
  }
  try {
    localStore()?.removeItem(API_KEY_STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function removeStoredApiKey(): void {
  try {
    sessionStore()?.removeItem(API_KEY_STORAGE_KEY)
  } catch {
    // ignore
  }
  try {
    localStore()?.removeItem(API_KEY_STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function getStoredUserId(): string | null {
  const local = localStore()
  if (!local) return null
  try {
    return (
      local.getItem(APP_USER_ID_STORAGE_KEY) ??
      local.getItem("mn_auth_session_user_id") ??
      local.getItem("user_id")
    )
  } catch {
    return null
  }
}

export function setAppUserIdForBackendSync(userId: string): void {
  const local = localStore()
  if (!local) return
  const safe = userId.trim().slice(0, 100)
  if (!safe) return
  local.setItem(APP_USER_ID_STORAGE_KEY, safe)
}

export function getStoredAppUserId(): string | null {
  const local = localStore()
  if (!local) return null
  const raw = local.getItem(APP_USER_ID_STORAGE_KEY)
  if (!raw) return null
  const safe = raw.trim().slice(0, 120)
  return safe || null
}

export function clearAppUserIdForBackendSync(): void {
  try {
    localStore()?.removeItem(APP_USER_ID_STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function setStoredUserId(id: string): void {
  const local = localStore()
  if (!local) return
  // Prefer the canonical session key; keep user_id only as a short mirror for legacy readers.
  const safe = id.trim().slice(0, 100)
  if (!safe) return
  local.setItem("mn_auth_session_user_id", safe)
  local.setItem("user_id", safe)
}

export function getOrCreateUserId(): string {
  if (!isBrowser) return "anonymous"
  const id = getStoredUserId()
  if (id) return id.trim().slice(0, 100)
  const anon = `user_${Math.random().toString(36).substring(2, 11)}`
  setStoredUserId(anon)
  return anon
}

export function isApiKeyActive(storedKey: string | null, candidateKey: string): boolean {
  if (!storedKey) return false
  return storedKey === candidateKey || storedKey.startsWith(candidateKey.substring(0, 10))
}
