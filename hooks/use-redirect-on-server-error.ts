"use client"

import { useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { httpErrorRoute } from "@/lib/routes"
import { isServerError, isBackendUnavailable } from "@/types/api"
import { redirectIfServerError } from "@/lib/redirect-server-error"

const SERVER_ERROR_PATH = httpErrorRoute(500)

function isOnServerErrorPage(pathname: string): boolean {
  return pathname === SERVER_ERROR_PATH || /^\/errors\/5\d\d$/.test(pathname)
}

/** Navigate to the branded 500 page when a query/mutation surfaces a 5xx API error. */
export function useRedirectOnServerError(error: unknown, enabled = true): void {
  const router = useRouter()
  const pathname = usePathname()
  const redirected = useRef(false)

  useEffect(() => {
    if (!enabled || !error || redirected.current) return
    if (isBackendUnavailable(error) || isServerError(error)) {
      if (isOnServerErrorPage(pathname)) return
      redirected.current = true
      redirectIfServerError(router, error, pathname)
    }
  }, [enabled, error, pathname, router])
}
