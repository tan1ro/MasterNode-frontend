import type { HealthResponse } from "@/types/api"

export type HealthChipStatus = "ok" | "warn" | "error" | "loading" | "unknown"

export type HealthChip = {
  id: string
  label: string
  status: HealthChipStatus
  detail?: string
}

export function formatHealthCheckedAt(ms: number | undefined): string {
  if (!ms) return "—"
  try {
    return new Date(ms).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  } catch {
    return "—"
  }
}

/** Frontend-only signals (hydration, browser online). */
export function buildPageHealthChips(hydrated: boolean): HealthChip[] {
  const online = typeof navigator === "undefined" ? true : navigator.onLine
  return [
    {
      id: "page",
      label: "Page",
      status: hydrated && online ? "ok" : hydrated && !online ? "warn" : "loading",
      detail: hydrated ? (online ? "UI ready" : "Browser offline") : "Loading session",
    },
  ]
}

/** API + DB from `GET /health` (no extra backend routes). */
export function buildBackendHealthChips(
  health: HealthResponse | undefined,
  options: { loading: boolean; error: Error | null }
): HealthChip[] {
  const { loading, error } = options

  if (loading && !health) {
    return [
      { id: "api", label: "API", status: "loading", detail: "Checking…" },
      { id: "db", label: "DB", status: "loading", detail: "Checking…" },
    ]
  }

  if (error || !health) {
    const msg = error?.message?.slice(0, 80) || "Unreachable"
    return [
      { id: "api", label: "API", status: "error", detail: msg },
      { id: "db", label: "DB", status: "error", detail: "Unknown" },
    ]
  }

  const apiStatus = health.status === "ok" ? "ok" : health.status === "degraded" ? "warn" : "warn"
  const mongo = health.components?.find((c) => c.id === "master_orchestrator")
  const dbConnected =
    health.database === "connected" || (mongo?.online === true && health.database !== "unavailable")

  const online = health.online_count ?? 0
  const total = health.total_count ?? 0
  const apiLatency =
    health.components?.reduce((sum, c) => sum + (typeof c.latency_ms === "number" ? c.latency_ms : 0), 0) ??
    0

  return [
    {
      id: "api",
      label: "API",
      status: apiStatus,
      detail: `${health.status ?? "unknown"} · ${online}/${total} services · ~${Math.round(apiLatency)}ms`,
    },
    {
      id: "db",
      label: "DB",
      status: dbConnected ? "ok" : "error",
      detail: dbConnected
        ? health.database === "connected"
          ? "MongoDB connected"
          : "MongoDB ping ok"
        : health.database === "unavailable"
          ? "Unavailable"
          : "Not connected",
    },
  ]
}

export function mergeSuperuserHealthChips(
  page: HealthChip[],
  backend: HealthChip[]
): HealthChip[] {
  return [...page, ...backend]
}
