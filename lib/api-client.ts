import axios, { type InternalAxiosRequestConfig } from "axios"
import type { ApiError } from "@/types/api"
import { API_BASE_URL, getClientApiBaseUrl, ROUTES } from "@/lib/routes"
import { isAuthBootstrapRequest, isAuthLoginRequest } from "@/lib/api-auth"
import { apiErrorFromResponse } from "@/lib/resolve-api-error"
import {
  clearGuestToken,
  ensureValidAccessToken,
  ensureGuestToken,
  hasLocalAppSession,
} from "@/lib/session-token"
import { logClientError } from "@/lib/log-error"
import { getStoredApiKey, removeStoredApiKey } from "@/lib/storage"
import {
  createBackendUnavailableError,
  responseLooksLikeWrongServer,
} from "@/lib/backend-unavailable"

export const apiClient = axios.create({
  baseURL: getClientApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
})

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
  _guestRetry?: boolean
  _apiKeyRetry?: boolean
}

function isChatApiUrl(url?: string): boolean {
  return (
    typeof url === "string" &&
    (url.includes("/v1/chat") || url.includes("/api/v1/chat"))
  )
}

function isPasswordChangeRequest(url?: string): boolean {
  return (
    typeof url === "string" &&
    (url.includes("/v1/auth/password") || url.includes("/api/v1/auth/password"))
  )
}

async function attachBearer(config: InternalAxiosRequestConfig) {
  if (typeof window === "undefined") return
  if (isAuthBootstrapRequest(config.url)) return

  const access = await ensureValidAccessToken()
  if (access) {
    config.headers["Authorization"] = `Bearer ${access}`
    delete config.headers["X-API-Key"]
    return
  }

  const apiKey = getStoredApiKey()
  if (apiKey?.trim()) {
    config.headers["X-API-Key"] = apiKey.trim()
    delete config.headers["Authorization"]
    return
  }

  delete config.headers["X-API-Key"]

  const isChat =
    typeof config.url === "string" &&
    (config.url.includes("/v1/chat") || config.url.includes("/api/v1/chat"))
  if (isChat) {
    try {
      const guest = await ensureGuestToken()
      config.headers["Authorization"] = `Bearer ${guest}`
    } catch {
      delete config.headers["Authorization"]
    }
    return
  }

  delete config.headers["Authorization"]
}

export async function buildAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {}
  if (typeof window === "undefined") return headers
  const access = await ensureValidAccessToken()
  if (access) {
    headers["Authorization"] = `Bearer ${access}`
    return headers
  }
  const apiKey = getStoredApiKey()?.trim()
  if (apiKey) {
    headers["X-API-Key"] = apiKey
    return headers
  }
  try {
    const guest = await ensureGuestToken()
    headers["Authorization"] = `Bearer ${guest}`
  } catch {
    // Guest token fetch failed; caller may retry
  }
  return headers
}

function prepareClientRequest(config: InternalAxiosRequestConfig) {
  if (typeof window === "undefined") return

  config.baseURL = getClientApiBaseUrl()

  // Axios treats `/path` as host-root absolute; strip the slash for relative proxy bases.
  if (
    config.baseURL.startsWith("/") &&
    typeof config.url === "string" &&
    config.url.startsWith("/")
  ) {
    config.url = config.url.replace(/^\//, "")
  }
}

apiClient.interceptors.request.use(async (config) => {
  if (typeof FormData !== "undefined" && config.data instanceof FormData && config.headers) {
    delete config.headers["Content-Type"]
  }

  if (typeof window !== "undefined") {
    prepareClientRequest(config)
    await attachBearer(config)
    delete config.headers["X-User-ID"]
  }
  return config
})

function requestHadBearer(config: RetryConfig | undefined): boolean {
  const headers = config?.headers
  if (!headers) return false
  return Boolean(
    headers.Authorization ||
      headers.authorization ||
      (typeof headers.get === "function" && headers.get("Authorization"))
  )
}

function requestHadApiKey(config: RetryConfig | undefined): boolean {
  const headers = config?.headers
  if (!headers) return false
  return Boolean(
    headers["X-API-Key"] ||
      headers["x-api-key"] ||
      (typeof headers.get === "function" &&
        (headers.get("X-API-Key") || headers.get("x-api-key")))
  )
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      const customError = createBackendUnavailableError()
      logClientError("api-client.network", customError, { url: error.config?.url })
      return Promise.reject(customError)
    }

    const status = error.response.status
    const data = error.response.data
    const headers = error.response.headers as Record<string, string | undefined>
    const wrongServer = responseLooksLikeWrongServer(headers)

    const config = error.config as RetryConfig | undefined
    const hadBearer = requestHadBearer(config)
    const usedApiKey = requestHadApiKey(config)

    if (status === 401 && typeof window !== "undefined" && config && !config._retry && hadBearer) {
      config._retry = true
      try {
        const token = await ensureValidAccessToken()
        if (token) {
          config.headers = config.headers ?? {}
          config.headers.Authorization = `Bearer ${token}`
          return apiClient.request(config)
        }
      } catch (refreshErr) {
        logClientError("api-client.refresh-retry", refreshErr)
      }
    }

    if (
      status === 401 &&
      typeof window !== "undefined" &&
      config &&
      isChatApiUrl(config.url) &&
      !hasLocalAppSession() &&
      !(await ensureValidAccessToken()) &&
      hadBearer &&
      !config._guestRetry
    ) {
      config._guestRetry = true
      clearGuestToken()
      try {
        const guest = await ensureGuestToken()
        config.headers = config.headers ?? {}
        config.headers.Authorization = `Bearer ${guest}`
        delete config.headers["X-API-Key"]
        return apiClient.request(config)
      } catch (guestErr) {
        logClientError("api-client.guest-retry", guestErr)
      }
    }

    if (
      status === 401 &&
      typeof window !== "undefined" &&
      config &&
      isChatApiUrl(config.url) &&
      usedApiKey &&
      !config._apiKeyRetry
    ) {
      config._apiKeyRetry = true
      removeStoredApiKey()
      await attachBearer(config)
      return apiClient.request(config)
    }

    if (status === 401 && typeof window !== "undefined") {
      if (usedApiKey) {
        removeStoredApiKey()
      }
      if (hadBearer && !isPasswordChangeRequest(config?.url)) {
        const { hasLocalAppSession } = await import("@/lib/session-token-store")
        const { signOut } = await import("@/lib/app-auth")
        if (hasLocalAppSession()) {
          await signOut({ redirectTo: ROUTES.signIn })
        }
      }
    }

    if (wrongServer) {
      const customError = createBackendUnavailableError(undefined, 503)
      logClientError("api-client.backend-unavailable", customError, {
        url: error.config?.url,
        status,
      })
      return Promise.reject(customError)
    }

    if (status === 404) {
      const requestUrl = [error.config?.baseURL, error.config?.url]
        .filter((part) => typeof part === "string" && part.trim())
        .join("")
        .replace(/([^:]\/)\/+/g, "$1")
      const message =
        typeof data?.detail === "string"
          ? data.detail
          : `Endpoint not found: ${requestUrl || error.config?.url}. Check NEXT_PUBLIC_API_URL and that the FastAPI server is running.`
      return Promise.reject(apiErrorFromResponse(404, data?.detail, message))
    }

    if (status === 401) {
      const loginFallback = isAuthLoginRequest(config?.url)
        ? "Invalid email or password."
        : "Authentication required. Sign in again or set your MasterNode API key on API Keys."
      return Promise.reject(apiErrorFromResponse(401, data?.detail, loginFallback))
    }

    if (status === 402) {
      return Promise.reject(
        apiErrorFromResponse(
          402,
          data?.detail,
          "Insufficient prepaid balance for API key usage. Add credits on the Billing page."
        )
      )
    }

    if (status === 403) {
      return Promise.reject(
        apiErrorFromResponse(
          403,
          data?.detail,
          "You do not have permission to perform this action. Check your plan or API key scopes."
        )
      )
    }

    if (status >= 500) {
      const fallback = `Internal server error (${status}). The backend failed while handling this request.`
      const apiErr = apiErrorFromResponse(status, data?.detail, fallback)
      logClientError("api-client.server", apiErr, { url: error.config?.url, status })
      return Promise.reject(apiErr)
    }

    const detail = data?.detail
    if (detail !== undefined && detail !== null) {
      if (typeof detail === "string" && detail.trim()) {
        return Promise.reject(apiErrorFromResponse(status, detail, detail.trim()))
      }
      if (typeof detail === "object") {
        const o = detail as Record<string, unknown>
        const parts: string[] = []
        if (typeof o.message === "string" && o.message.trim()) parts.push(o.message.trim())
        if (typeof o.attempted_user_id === "string" && o.attempted_user_id.trim()) {
          parts.push(`User id: ${o.attempted_user_id.trim()}`)
        }
        if (o.preflight_status !== undefined && o.preflight_status !== null) {
          parts.push(`Preflight HTTP: ${String(o.preflight_status)}`)
        }
        if (typeof o.auth_source === "string" && o.auth_source.trim()) {
          parts.push(`Auth: ${o.auth_source.trim()}`)
        }
        if (parts.length > 0) {
          return Promise.reject(apiErrorFromResponse(status, detail, parts.join(" · ")))
        }
        try {
          return Promise.reject(apiErrorFromResponse(status, detail, JSON.stringify(detail)))
        } catch {
          return Promise.reject(apiErrorFromResponse(status, detail, `Request failed (${status})`))
        }
      }
    }

    const fallback =
      typeof data?.message === "string" && data.message.trim()
        ? data.message.trim()
        : `Request failed (${status})`
    return Promise.reject(apiErrorFromResponse(status, data?.detail, fallback))
  }
)
