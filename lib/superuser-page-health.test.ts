import { describe, expect, it } from "vitest"
import { buildBackendHealthChips, buildPageHealthChips } from "./superuser-page-health"
import type { HealthResponse } from "@/types/api"

describe("buildPageHealthChips", () => {
  it("reports ok when hydrated", () => {
    const chips = buildPageHealthChips(true)
    expect(chips[0]?.status).toBe("ok")
  })
})

describe("buildBackendHealthChips", () => {
  it("maps connected database and ok API", () => {
    const health: HealthResponse = {
      status: "ok",
      database: "connected",
      online_count: 6,
      total_count: 6,
      components: [
        { id: "master_orchestrator", label: "Mongo", online: true, latency_ms: 12 },
      ],
    }
    const chips = buildBackendHealthChips(health, { loading: false, error: null })
    expect(chips.find((c) => c.id === "api")?.status).toBe("ok")
    expect(chips.find((c) => c.id === "db")?.status).toBe("ok")
  })

  it("reports error when fetch fails", () => {
    const chips = buildBackendHealthChips(undefined, {
      loading: false,
      error: new Error("Network Error"),
    })
    expect(chips.find((c) => c.id === "api")?.status).toBe("error")
  })
})
