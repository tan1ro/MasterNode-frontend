"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { signOut, subscribeAuth } from "@/lib/app-auth"
import { isLegacyTokenStorage } from "@/lib/auth-config"
import { ensureValidAccessToken } from "@/lib/session-token"
import {
  bootstrapSessionFromBff,
  hasAuthCredentials,
  hasLocalAppSession,
} from "@/lib/session-token-store"
import { useAppAuth } from "@/hooks/use-app-auth"
import { scrubClientPrivacyResidue } from "@/lib/client-privacy"
import { getStoredApiKey } from "@/lib/storage"

type AuthSessionContextValue = {
  /** True when signed out, or when a usable access JWT (or API key) is available. */
  authReady: boolean
  /** Resolving JWT refresh on load. */
  authLoading: boolean
}

const AuthSessionContext = createContext<AuthSessionContextValue>({
  authReady: false,
  authLoading: false,
})

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAppAuth()
  const [authReady, setAuthReady] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authEpoch, setAuthEpoch] = useState(0)

  useEffect(() => subscribeAuth(() => setAuthEpoch((n) => n + 1)), [])

  useEffect(() => {
    scrubClientPrivacyResidue()
  }, [])

  useEffect(() => {
    if (!isSignedIn) {
      setAuthReady(false)
      setAuthLoading(false)
      return
    }

    let cancelled = false
    setAuthLoading(true)

    const bootstrap = isLegacyTokenStorage()
      ? Promise.resolve(null)
      : bootstrapSessionFromBff()

    void bootstrap
      .then(() => {
        if (cancelled) return
        if (!hasAuthCredentials()) {
          if (hasLocalAppSession()) void signOut()
          setAuthReady(false)
          setAuthLoading(false)
          return
        }
        return ensureValidAccessToken()
      })
      .then((token) => {
        if (cancelled) return
        if (!token) {
          if (hasLocalAppSession()) void signOut()
          setAuthReady(false)
          return
        }
        setAuthReady(true)
      })
      .finally(() => {
        if (!cancelled) setAuthLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isSignedIn, authEpoch])

  return (
    <AuthSessionContext.Provider value={{ authReady, authLoading }}>
      {children}
    </AuthSessionContext.Provider>
  )
}

export function useAuthSession() {
  return useContext(AuthSessionContext)
}

/** Gate protected API queries until JWT refresh finished. */
export function useProtectedQueryEnabled(): boolean {
  const { isSignedIn } = useAppAuth()
  const { authReady } = useAuthSession()
  if (!isSignedIn) return false
  // Email/password sessions must wait for JWT — do not fire on a stale `api_key` alone.
  if (hasLocalAppSession()) return authReady
  if (getStoredApiKey()?.trim()) {
    return true
  }
  return authReady
}
