import { resolveApiBaseUrl } from "@/lib/routes"
import { invalidateLiveBackendOrigin, resolveLiveBackendOrigin } from "@/lib/server/resolve-backend"

export class BackendFetchError extends Error {
  readonly code: "unreachable" | "invalid_response"
  readonly status: number

  constructor(message: string, options: { code: "unreachable" | "invalid_response"; status: number }) {
    super(message)
    this.name = "BackendFetchError"
    this.code = options.code
    this.status = options.status
  }
}

export function backendUrl(path: string, origin = resolveApiBaseUrl(process.env.NEXT_PUBLIC_API_URL || process.env.API_URL)): string {
  const base = origin.replace(/\/$/, "")
  const p = path.startsWith("/") ? path : `/${path}`
  return `${base}${p}`
}

async function backendFetch(path: string, init: RequestInit): Promise<Response> {
  const origin = await resolveLiveBackendOrigin()
  const url = backendUrl(path, origin)
  try {
    return await fetch(url, init)
  } catch (err) {
    invalidateLiveBackendOrigin()
    const reason = err instanceof Error ? err.message : "Network error"
    throw new BackendFetchError(
      `Cannot reach the API at ${origin}. Ensure the MasterNode backend is running and NEXT_PUBLIC_API_URL is correct. (${reason})`,
      { code: "unreachable", status: 502 }
    )
  }
}

export async function backendPost<T>(
  path: string,
  body: unknown,
  extraHeaders?: Record<string, string>
): Promise<{ data: T; status: number }> {
  const res = await backendFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...extraHeaders },
    body: JSON.stringify(body),
  })
  const data = (await res.json().catch(() => ({}))) as T
  return { data, status: res.status }
}

export async function backendGet<T>(path: string, accessToken: string): Promise<{ data: T; status: number }> {
  const res = await backendFetch(path, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = (await res.json().catch(() => ({}))) as T
  return { data, status: res.status }
}
