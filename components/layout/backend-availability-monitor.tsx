"use client"

import { usePathname } from "next/navigation"
import { useHealth } from "@/hooks/use-health"
import { useRedirectOnBackendUnavailable } from "@/hooks/use-redirect-on-backend-unavailable"
import { shouldMonitorBackend } from "@/lib/backend-unavailable"

/** Proactively redirect to the 500 page when `/health` fails in the app shell. */
export function BackendAvailabilityMonitor() {
  const pathname = usePathname()
  const enabled = shouldMonitorBackend(pathname)
  const { error } = useHealth({
    enabled,
    refetchInterval: enabled ? 30_000 : false,
    refetchIntervalInBackground: true,
  })

  useRedirectOnBackendUnavailable(error, enabled)

  return null
}
