import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

describe("routes", () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("defaults API and WS base when env unset", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "")
    const { API_BASE_URL, WS_BASE_URL, API_HEALTH_URL, API_DOCS_URL, httpErrorRoute } =
      await import("./routes")
    expect(API_BASE_URL).toBe("http://localhost:8000")
    expect(WS_BASE_URL).toBe("ws://localhost:8000")
    expect(API_HEALTH_URL).toBe("http://localhost:8000/health")
    expect(API_DOCS_URL).toBe("http://localhost:8000/docs")
    expect(httpErrorRoute(404)).toBe("/errors/404")
  })

  it("getClientApiBaseUrl uses proxy in the browser by default", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8000")
    vi.stubEnv("NODE_ENV", "development")
    const { getClientApiBaseUrl, DEV_API_PROXY_PREFIX } = await import("./routes")
    expect(getClientApiBaseUrl()).toBe(DEV_API_PROXY_PREFIX)
  })

  it("getClientApiBaseUrl bypasses proxy when NEXT_PUBLIC_USE_API_PROXY=0", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://edge.example.com")
    vi.stubEnv("NEXT_PUBLIC_USE_API_PROXY", "0")
    const { getClientApiBaseUrl, API_BASE_URL } = await import("./routes")
    expect(getClientApiBaseUrl()).toBe(API_BASE_URL)
  })

  it("resolveApiBaseUrl picks the first valid URL from comma-separated env", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8000, https://masternode.onrender.com")
    const { API_BASE_URL, parseApiBaseUrls } = await import("./routes")
    expect(API_BASE_URL).toBe("http://localhost:8000")
    expect(parseApiBaseUrls(process.env.NEXT_PUBLIC_API_URL)).toEqual([
      "http://localhost:8000",
      "https://masternode.onrender.com",
    ])
  })

  it("uses NEXT_PUBLIC_API_URL for HTTP and WS", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://edge.example.com:8443")
    const { API_BASE_URL, WS_BASE_URL } = await import("./routes")
    expect(API_BASE_URL).toBe("https://edge.example.com:8443")
    expect(WS_BASE_URL).toBe("wss://edge.example.com:8443")
  })

  it("joinClientApiPath respects the dev proxy prefix", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8000")
    const { joinClientApiPath } = await import("./routes")
    expect(joinClientApiPath("/health")).toBe("/api/backend/health")
    expect(joinClientApiPath("v1/task")).toBe("/api/backend/v1/task")
  })

  it("ROUTES exposes stable paths", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8000")
    const { ROUTES } = await import("./routes")
    expect(ROUTES.dashboard).toBe("/dashboard")
    expect(ROUTES.taskDetail("abc")).toBe("/tasks/abc")
    expect(ROUTES.errorsIndex).toBe("/errors")
    expect(ROUTES.logs).toBe("/logs")
    expect(ROUTES.superuserTasks).toBe("/superuser/tasks")
    expect(ROUTES.superuserMonitor).toBe("/superuser/monitor")
    expect(ROUTES.superuserFeedback).toBe("/superuser/feedback")
    expect(ROUTES.superuserErrors).toBe("/superuser/errors")
    expect(ROUTES.superuserBilling).toBe("/superuser/billing")
  })
})
