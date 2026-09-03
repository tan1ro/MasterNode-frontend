"use client"

import { useEffect } from "react"
import { useAuthSession } from "@/providers/auth-session-provider"
import { syncAuthProfileFromApi } from "@/lib/sync-auth-profile"

/** Sync local profile after JWT session is ready. */
export function AuthProfileSync() {
  const { authReady } = useAuthSession()

  useEffect(() => {
    if (!authReady) return
    void syncAuthProfileFromApi()
  }, [authReady])

  return null
}
