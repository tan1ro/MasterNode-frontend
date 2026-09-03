"use client"

import { useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { httpErrorRoute } from "@/lib/routes"
import { isBackendUnavailable } from "@/types/api"
import { redirectIfBackendUnavailable } from "@/lib/redirect-server-error"

const SERVER_ERROR_PATH = httpErrorRoute(500)

function isOnServerErrorPage(pathname: string): boolean {
  return pathname === SERVER_ERROR_PATH || /^\/errors\/5\d\d$/.test(pathname)
}

/** Navigate to the 500 page when the MasterNode API is unreachable. */
export function useRedirectOnBackendUnavailable(error: unknown, enabled = true): void {
  const router = useRouter()
  const pathname = usePathname()
  const redirected = useRef(false)

  useEffect(() => {
    if (!enabled || !error || !isBackendUnavailable(error) || redirected.current) return
    if (isOnServerErrorPage(pathname)) return
    redirected.current = true
    redirectIfBackendUnavailable(router, pathname)
  }, [enabled, error, pathname, router])
}
