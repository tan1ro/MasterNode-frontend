"use client"

import Link from "next/link"
import { RefreshCw } from "lucide-react"
import { useAppAuth } from "@/hooks/use-app-auth"
import { useSuperuserHealthBundle } from "@/hooks/use-superuser-health-bundle"
import { SuperuserAccessDenied } from "@/components/superuser/superuser-gate"
import { PageHeader } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ROUTES } from "@/lib/routes"
import {
  buildBackendHealthChips,
  formatHealthCheckedAt,
} from "@/lib/superuser-page-health"
import { cn } from "@/lib/utils"

function statusClass(status: string) {
  if (status === "ok") return "text-emerald"
  if (status === "warn" || status === "loading") return "text-amber"
  if (status === "error") return "text-destructive"
  return "text-muted-foreground"
}

export default function SuperuserMonitorHealthPage() {
  const { isSuperUser } = useAppAuth()
  const bundle = useSuperuserHealthBundle(isSuperUser)

  if (!isSuperUser) {
    return <SuperuserAccessDenied title="Health" />
  }

  const chips = buildBackendHealthChips(bundle.health, {
    loading: bundle.healthLoading,
    error: bundle.healthError,
  })
  const components = bundle.health?.components ?? []
  const providers = bundle.health?.llm_provider_keys ?? []

  return (
    <div className="container mx-auto space-y-6 p-4 sm:p-6 max-w-5xl">
      <PageHeader
        title="Health"
        description="API readiness, queue depth, degradation, and component probes."
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => bundle.refetchAll()}>
          <RefreshCw className={cn("mr-2 h-4 w-4", bundle.isFetching && "animate-spin")} />
          Refresh
        </Button>
        <p className="text-xs text-muted-foreground">
          Checked {formatHealthCheckedAt(bundle.healthUpdatedAt)}
        </p>
        <Link
          href={ROUTES.superuserMonitor}
          className="ml-auto inline-flex h-9 items-center rounded-md px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          Back to Monitor
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {chips.map((chip) => (
          <Card key={chip.id} className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{chip.label}</CardTitle>
              <CardDescription className={statusClass(chip.status)}>
                {chip.status.toUpperCase()}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{chip.detail || "—"}</CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Ready / queue / degradation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              Ready:{" "}
              <span className="font-medium text-foreground">
                {bundle.readyError
                  ? "error"
                  : bundle.ready?.ready === true
                    ? "yes"
                    : bundle.ready?.ready === false
                      ? "no"
                      : "—"}
              </span>
            </p>
            <p>
              Queue OK:{" "}
              <span className="font-medium text-foreground">
                {bundle.ready?.queue_ok == null ? "—" : String(bundle.ready.queue_ok)}
              </span>
            </p>
            <p>
              Degradation level:{" "}
              <span className="font-medium text-foreground">
                {bundle.degradation?.level ?? "—"}
              </span>
            </p>
            {bundle.queue ? (
              <pre className="mt-3 max-h-48 overflow-auto rounded-md bg-muted/30 p-3 text-xs">
                {JSON.stringify(bundle.queue, null, 2)}
              </pre>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">LLM providers</CardTitle>
            <CardDescription>Configured gateway keys (no secrets shown).</CardDescription>
          </CardHeader>
          <CardContent>
            {providers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No provider rows.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {providers.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2"
                  >
                    <span className="font-medium">{p.id}</span>
                    <span className={p.configured ? "text-emerald" : "text-muted-foreground"}>
                      {p.configured ? "configured" : "missing"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Components</CardTitle>
        </CardHeader>
        <CardContent>
          {bundle.healthLoading && !components.length ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : components.length === 0 ? (
            <p className="text-sm text-muted-foreground">No component probes returned.</p>
          ) : (
            <ul className="space-y-2">
              {components.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 px-3 py-2 text-sm"
                >
                  <span className="font-medium">{c.id}</span>
                  <span className={c.online ? "text-emerald" : "text-destructive"}>
                    {c.online ? "online" : "offline"}
                    {typeof c.latency_ms === "number" ? ` · ${Math.round(c.latency_ms)}ms` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
