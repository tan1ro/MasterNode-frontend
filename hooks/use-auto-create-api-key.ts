"use client"

import { useState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { autoCreateApiKey } from "./use-api-keys"
import { useProtectedQueryEnabled } from "@/providers/auth-session-provider"
import { getStoredApiKey, getStoredUserId } from "@/lib/storage"

/**
 * Automatically creates an API key on first visit if none exists.
 * Returns { isAutoCreating } so the page can show a loading state.
 */
export function useAutoCreateApiKey() {
  const queryClient = useQueryClient()
  const authReady = useProtectedQueryEnabled()
  const [isAutoCreating, setIsAutoCreating] = useState(false)

  useEffect(() => {
    if (!authReady) return
    let cancelled = false

    const run = async () => {
      if (getStoredApiKey()) return
      setIsAutoCreating(true)
      try {
        const userId = getStoredUserId()
        const key = await autoCreateApiKey(userId)
        if (!cancelled && key) {
          queryClient.invalidateQueries({ queryKey: ["api-keys"] })
          queryClient.invalidateQueries({ queryKey: ["wallet"] })
        }
      } catch (err) {
        if (!cancelled) console.error("Error auto-creating API key:", err)
      } finally {
        if (!cancelled) setIsAutoCreating(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [queryClient, authReady])

  return { isAutoCreating }
}
