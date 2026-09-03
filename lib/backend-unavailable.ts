import type { ApiError } from "@/types/api"
import { isAuthRoute, isErrorRoute, isPublicSiteRoute } from "@/lib/app-shell-routes"
import { API_BASE_URL, joinClientApiPath } from "@/lib/routes"

export const BACKEND_UNAVAILABLE_QUERY = "backend-unavailable"

/** Health-check redirect belongs on signed-in app pages, not marketing or auth. */
export function shouldMonitorBackend(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  if (isErrorRoute(pathname)) return false
  if (isAuthRoute(pathname)) return false
  if (isPublicSiteRoute(pathname)) return false
  return true
}

export function createBackendUnavailableError(
  message?: string,
  status: number = 503,
): ApiError {
  const err = new Error(
    message ??
      `MasterNode API is unavailable at ${API_BASE_URL}. Waiting for the backend to come back online.`,
  ) as ApiError
  err.httpStatus = status
  err.isConnectionError = true
  err.isBackendUnavailable = true
  err.isServerError = status >= 500
  return err
}

export function responseLooksLikeWrongServer(headers: Record<string, string | undefined>): boolean {
  const contentType = String(headers["content-type"] ?? "")
  const serverHdr = String(headers["server"] ?? "")
  return (
    contentType.includes("text/html") ||
    serverHdr.includes("WSGIServer") ||
    serverHdr.includes("Django")
  )
}

/** True when `/health` JSON is MasterNode FastAPI, not another app on the same port. */
export function looksLikeMasterNodeHealth(data: unknown): boolean {
  if (!data || typeof data !== "object") return false
  const service = (data as { service?: unknown }).service
  return service === "masternode-rag" || service === "masternode"
}

/** Lightweight probe that validates the FastAPI `/health` JSON shape. */
export async function probeBackendHealth(): Promise<boolean> {
  if (typeof window === "undefined") return false

  try {
    const res = await fetch(joinClientApiPath("health"), {
      method: "GET",
      cache: "no-store",
      headers: { Accept: "application/json" },
    })
    if (!res.ok) return false

    const contentType = res.headers.get("content-type") ?? ""
    if (!contentType.includes("application/json")) return false

    const data = (await res.json()) as Record<string, unknown>
    return looksLikeMasterNodeHealth(data)
  } catch {
    return false
  }
}
