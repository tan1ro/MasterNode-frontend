"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { probeBackendHealth } from "@/lib/backend-unavailable"
import { ROUTES } from "@/lib/routes"

const RETRY_MS = 5000

interface BackendUnavailableRecoveryProps {
  returnTo?: string | null
}

export function BackendUnavailableRecovery({ returnTo }: BackendUnavailableRecoveryProps) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const check = async () => {
      setChecking(true)
      const online = await probeBackendHealth()
      if (cancelled) return

      setChecking(false)
      setAttempts((count) => count + 1)

      if (online) {
        const destination =
          returnTo && returnTo.startsWith("/") && !returnTo.startsWith("/errors")
            ? returnTo
            : ROUTES.dashboard
        router.replace(destination)
        return
      }

      timer = setTimeout(check, RETRY_MS)
    }

    void check()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [returnTo, router])

  return (
    <div
      className="mb-8 flex w-full flex-col items-center gap-2 rounded-md border border-white/10 bg-black/30 px-4 py-3 text-sm text-[#8B92A9] lg:items-start lg:text-left"
      role="status"
      aria-live="polite"
    >
      <div className="inline-flex items-center gap-2">
        {checking ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-sky" aria-hidden />
        ) : null}
        <span>
          {checking
            ? "Checking if the MasterNode API is back online…"
            : "Backend is still unavailable. Retrying automatically…"}
        </span>
      </div>
      {attempts > 0 ? (
        <span className="text-xs text-[#8B92A9]">Attempts: {attempts}</span>
      ) : null}
    </div>
  )
}
