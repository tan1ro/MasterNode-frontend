import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { httpErrorRoute } from "@/lib/routes"
import { isServerError, isBackendUnavailable, getHttpStatus } from "@/types/api"
import { BACKEND_UNAVAILABLE_QUERY } from "@/lib/backend-unavailable"

/** Navigate to the branded HTTP error page when an API call surfaces a 5xx error. */
export function redirectIfServerError(
  router: AppRouterInstance,
  error: unknown,
  pathname?: string | null
): boolean {
  if (isBackendUnavailable(error)) {
    return redirectIfBackendUnavailable(router, pathname)
  }

  const status = getHttpStatus(error)
  if (!isServerError(error) && (status === null || status < 500)) return false
  const code = status === 502 || status === 503 || status === 504 ? status : 500
  const returnTo =
    pathname && pathname !== "/" ? `?from=${encodeURIComponent(pathname)}` : ""
  router.replace(`${httpErrorRoute(code)}${returnTo}`)
  return true
}

/** Navigate to the 500 page when the MasterNode API is unreachable. */
export function redirectIfBackendUnavailable(
  router: AppRouterInstance,
  pathname?: string | null
): boolean {
  const params = new URLSearchParams()
  params.set("reason", BACKEND_UNAVAILABLE_QUERY)
  if (pathname && pathname !== "/") {
    params.set("from", pathname)
  }
  router.replace(`${httpErrorRoute(500)}?${params.toString()}`)
  return true
}
