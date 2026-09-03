"use client"

import { useEffect, useRef, useState, type ComponentType } from "react"
import { usePathname } from "next/navigation"
import {
  Activity,
  ChevronDown,
  Copy,
  ExternalLink,
  RefreshCw,
  Server,
  Database,
  Cpu,
  Globe,
  KeyRound,
} from "lucide-react"
import Link from "next/link"
import { useAppAuth } from "@/hooks/use-app-auth"
import { useAuthSession } from "@/providers/auth-session-provider"
import { useEntitlements } from "@/hooks/use-entitlements"
import { useSuperuserHealthBundle } from "@/hooks/use-superuser-health-bundle"
import {
  buildBackendHealthChips,
  buildPageHealthChips,
  formatHealthCheckedAt,
  mergeSuperuserHealthChips,
  type HealthChip,
  type HealthChipStatus,
} from "@/lib/superuser-page-health"
import { API_DOCS_URL, API_HEALTH_URL, getClientApiBaseUrl, ROUTES } from "@/lib/routes"
import { getStoredApiKey } from "@/lib/storage"
import { cn } from "@/lib/utils"
import type { HealthComponent, LlmProviderKeyStatus } from "@/types/api"

const STATUS_DOT: Record<HealthChipStatus, string> = {
  ok: "bg-emerald",
  warn: "bg-amber",
  error: "bg-destructive",
  loading: "bg-muted-foreground animate-pulse",
  unknown: "bg-muted-foreground",
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon?: ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <section className="space-y-2">
      <h3 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {Icon ? <Icon className="h-3 w-3 text-amber" aria-hidden /> : null}
        {title}
      </h3>
      {children}
    </section>
  )
}

function Row({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className={cn("min-w-0 text-right break-all", mono && "font-mono")}>{value}</span>
    </div>
  )
}

function ComponentRow({ c }: { c: HealthComponent }) {
  return (
    <div className="rounded-lg border border-border/40 px-2.5 py-2 text-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn("h-2 w-2 shrink-0 rounded-full", c.online ? "bg-emerald" : "bg-destructive")}
            aria-hidden
          />
          <span className="font-medium truncate">{c.label}</span>
          {c.detail ? (
            <span className="truncate text-muted-foreground">({c.detail})</span>
          ) : null}
        </div>
        <span className="shrink-0 font-mono tabular-nums text-muted-foreground">
          {typeof c.latency_ms === "number" ? `${c.latency_ms} ms` : "—"}
        </span>
      </div>
      <p className="mt-1 font-mono text-[10px] text-muted-foreground">{c.id}</p>
    </div>
  )
}

function ProviderGrid({ rows }: { rows: LlmProviderKeyStatus[] }) {
  if (!rows.length) {
    return <p className="text-xs text-muted-foreground">No provider slots reported.</p>
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {rows.map((p) => (
        <span
          key={p.id}
          className={cn(
            "rounded-md border px-2 py-0.5 font-mono text-[10px]",
            p.configured
              ? "border-emerald/35 bg-emerald/10 text-emerald"
              : "border-border/50 bg-muted/30 text-muted-foreground"
          )}
        >
          {p.id}
          {p.configured ? "" : " · missing"}
        </span>
      ))}
    </div>
  )
}

function JsonBlock({ data, error }: { data: unknown; error: Error | null }) {
  if (error) {
    return (
      <p className="rounded-md border border-destructive/30 bg-destructive/5 px-2 py-1.5 text-xs text-destructive">
        {error.message}
      </p>
    )
  }
  if (data == null) {
    return <p className="text-xs text-muted-foreground">No data</p>
  }
  return (
    <pre className="max-h-28 overflow-auto rounded-md border border-border/40 bg-muted/20 p-2 font-mono text-[10px] leading-relaxed text-foreground/90">
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}

function HealthPanel({
  pathname,
  chips,
  bundle,
}: {
  pathname: string
  chips: HealthChip[]
  bundle: ReturnType<typeof useSuperuserHealthBundle>
}) {
  const { user } = useAppAuth()
  const { authReady, authLoading } = useAuthSession()
  const entitlements = useEntitlements()
  const health = bundle.health
  const components = health?.components ?? []
  const providers = health?.llm_provider_keys ?? []

  const apiBase = getClientApiBaseUrl()
  const hasApiKey = Boolean(getStoredApiKey()?.trim())

  const copyDiagnostics = () => {
    const payload = {
      checked_at: new Date().toISOString(),
      route: pathname,
      api_base: apiBase,
      chips,
      health,
      ready: bundle.ready,
      queue: bundle.queue,
      degradation: bundle.degradation,
      user: user ? { id: user.id, email: user.email, accountType: user.accountType } : null,
    }
    void navigator.clipboard?.writeText(JSON.stringify(payload, null, 2))
  }

  return (
    <div className="space-y-4 p-3 sm:p-4">
      <div className="flex flex-wrap items-center gap-1.5">
        {chips.map((chip) => (
          <span
            key={chip.id}
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10px]",
              chip.status === "ok" && "border-emerald/40 bg-emerald/10 text-emerald",
              chip.status === "warn" && "border-amber/40 bg-amber/10 text-amber",
              chip.status === "error" && "border-destructive/40 bg-destructive/10 text-destructive",
              chip.status === "loading" && "border-border/50 bg-muted/40 text-muted-foreground"
            )}
            title={chip.detail}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[chip.status])} aria-hidden />
            {chip.label}
          </span>
        ))}
      </div>

      <Section title="Frontend & session" icon={Globe}>
        <div className="space-y-1 rounded-lg border border-border/40 bg-muted/10 px-2.5 py-2">
          <Row label="Route" value={pathname} mono />
          <Row label="Browser online" value={typeof navigator !== "undefined" && navigator.onLine ? "Yes" : "No"} />
          <Row label="API base (client)" value={apiBase} mono />
          <Row label="Auth session ready" value={authLoading ? "Loading…" : authReady ? "Yes" : "No"} />
          <Row label="Signed-in user" value={user?.email ?? "—"} mono />
          <Row label="Tenant id" value={user?.id ?? "—"} mono />
          <Row label="Local role" value={user?.accountType ?? "—"} />
          <Row label="Profile (API)" value={entitlements.profile?.account_type ?? "—"} />
          <Row label="Superuser (API)" value={entitlements.profile?.is_superuser ? "Yes" : "No"} />
          <Row label="API key in browser" value={hasApiKey ? "Present" : "None"} />
        </div>
      </Section>

      <Section title="API summary" icon={Server}>
        <div className="space-y-1 rounded-lg border border-border/40 bg-muted/10 px-2.5 py-2">
          <Row label="Overall status" value={health?.status ?? (bundle.healthLoading ? "…" : "—")} mono />
          <Row label="Service" value={health?.service ?? "—"} mono />
          <Row label="LLM aggregate" value={health?.llm_providers ?? "—"} />
          <Row
            label="Subsystems"
            value={
              health?.online_count != null && health?.total_count != null
                ? `${health.online_count} / ${health.total_count} online`
                : "—"
            }
          />
          <Row
            label="Last probe"
            value={
              bundle.healthFetching
                ? "Checking…"
                : formatHealthCheckedAt(bundle.healthUpdatedAt)
            }
            mono
          />
          {bundle.healthError ? (
            <p className="pt-1 text-xs text-destructive">{bundle.healthError.message}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <a
            href={API_HEALTH_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-amber hover:underline"
          >
            Open /health <ExternalLink className="h-3 w-3" />
          </a>
          <Link href={API_DOCS_URL} target="_blank" className="inline-flex items-center gap-1 text-[10px] text-amber hover:underline">
            API docs <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </Section>

      <Section title="Database" icon={Database}>
        <div className="space-y-1 rounded-lg border border-border/40 bg-muted/10 px-2.5 py-2">
          <Row label="Mongo status" value={health?.database ?? "—"} mono />
          <Row
            label="Orchestrator ping"
            value={
              components.find((c) => c.id === "master_orchestrator")?.online ? "Up" : "Down or unknown"
            }
          />
          <Row
            label="Orchestrator latency"
            value={
              (() => {
                const ms = components.find((c) => c.id === "master_orchestrator")?.latency_ms
                return typeof ms === "number" ? `${ms} ms` : "—"
              })()
            }
            mono
          />
        </div>
      </Section>

      <Section title="Pipeline services" icon={Cpu}>
        {bundle.healthLoading && !components.length ? (
          <p className="text-xs text-muted-foreground">Loading components…</p>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {components.map((c) => (
              <ComponentRow key={c.id} c={c} />
            ))}
          </div>
        )}
      </Section>

      <Section title="LLM provider keys (server)" icon={KeyRound}>
        <ProviderGrid rows={providers} />
        {health?.llm_providers_configured?.length ? (
          <p className="text-[10px] text-muted-foreground">
            Configured: {health.llm_providers_configured.join(", ")}
          </p>
        ) : null}
      </Section>

      <Section title="Readiness (/ready)" icon={Activity}>
        <div className="space-y-1 rounded-lg border border-border/40 bg-muted/10 px-2.5 py-2">
          <Row label="Ready for traffic" value={bundle.ready?.ready == null ? "—" : bundle.ready.ready ? "Yes" : "No"} />
          <Row label="Queue healthy" value={bundle.ready?.queue_ok == null ? "—" : bundle.ready.queue_ok ? "Yes" : "No"} />
        </div>
        <JsonBlock data={bundle.ready} error={bundle.readyError} />
      </Section>

      <Section title="Task queue (/health/queue)" icon={Server}>
        <JsonBlock data={bundle.queue} error={bundle.queueError} />
      </Section>

      <Section title="Degradation ladder" icon={Activity}>
        {bundle.degradation ? (
          <div className="space-y-1 rounded-lg border border-border/40 bg-muted/10 px-2.5 py-2">
            <Row label="Active level" value={String(bundle.degradation.level ?? "—")} mono />
            {bundle.degradation.levels
              ? Object.entries(bundle.degradation.levels).map(([lvl, desc]) => (
                  <Row key={lvl} label={`L${lvl}`} value={desc} />
                ))
              : null}
          </div>
        ) : (
          <JsonBlock data={null} error={bundle.degradationError} />
        )}
      </Section>

      <div className="flex flex-wrap gap-2 border-t border-border/40 pt-3">
        <button
          type="button"
          onClick={() => bundle.refetchAll()}
          className="inline-flex items-center gap-1 rounded-md border border-border/50 bg-muted/30 px-2.5 py-1 text-xs hover:bg-muted/50"
        >
          <RefreshCw className={cn("h-3 w-3", bundle.isFetching && "animate-spin")} />
          Refresh all
        </button>
        <button
          type="button"
          onClick={copyDiagnostics}
          className="inline-flex items-center gap-1 rounded-md border border-border/50 bg-muted/30 px-2.5 py-1 text-xs hover:bg-muted/50"
        >
          <Copy className="h-3 w-3" />
          Copy JSON
        </button>
        <Link
          href={ROUTES.dashboard}
          className="inline-flex items-center gap-1 rounded-md border border-amber/30 bg-amber/10 px-2.5 py-1 text-xs text-amber hover:bg-amber/15"
        >
          Dashboard health card
        </Link>
      </div>
    </div>
  )
}

type Placement = "nav" | "strip"

export function SuperuserHealthAdminDropdown({ placement = "nav" }: { placement?: Placement }) {
  const pathname = usePathname() ?? "/"
  const { hydrated, user } = useAppAuth()
  const { isSuperUser } = useEntitlements()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const bundle = useSuperuserHealthBundle(hydrated && isSuperUser)

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  if (!hydrated || !isSuperUser) return null

  const chips = mergeSuperuserHealthChips(
    buildPageHealthChips(hydrated),
    buildBackendHealthChips(bundle.health, {
      loading: bundle.healthLoading,
      error: bundle.healthError,
    })
  )

  const worst = chips.some((c) => c.status === "error")
    ? "error"
    : chips.some((c) => c.status === "warn")
      ? "warn"
      : chips.some((c) => c.status === "loading")
        ? "loading"
        : "ok"

  const online = bundle.health?.online_count ?? 0
  const total = bundle.health?.total_count ?? 0

  return (
    <div className={cn("relative", placement === "strip" && "shrink-0")} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border text-xs font-medium transition-colors",
          placement === "nav"
            ? "px-2.5 py-2 border-border/50 hover:bg-amber/10 hover:text-amber hover:border-amber/25"
            : "px-2 py-0.5 border-amber/30 bg-amber/10 text-amber",
          open && "bg-amber/15 border-amber/25 text-amber",
          worst === "error" && !open && "border-destructive/40 text-destructive",
          worst === "ok" && !open && "text-muted-foreground"
        )}
      >
        <Activity className="h-4 w-4 shrink-0" aria-hidden />
        <span className={cn(placement === "nav" && "hidden sm:inline")}>Health</span>
        {total > 0 ? (
          <span className="font-mono text-[10px] tabular-nums opacity-80">
            {online}/{total}
          </span>
        ) : null}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Superuser health admin"
          className={cn(
            "z-[60] overflow-hidden rounded-lg border border-border/60 bg-background/98 shadow-xl backdrop-blur-md",
            placement === "nav"
              ? "absolute right-0 top-full mt-2 w-[min(28rem,calc(100vw-2rem))]"
              : "absolute left-0 top-full mt-1 w-[min(28rem,calc(100vw-2rem))]"
          )}
        >
          <div className="flex items-center justify-between gap-2 border-b border-border/40 bg-muted/20 px-3 py-2">
            <div>
              <p className="text-xs font-semibold text-foreground">Health admin</p>
              <p className="text-[10px] text-muted-foreground">
                {user?.email ?? "superuser"} · {formatHealthCheckedAt(bundle.healthUpdatedAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void bundle.refetchAll()}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted/60"
              aria-label="Refresh health"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", bundle.isFetching && "animate-spin")} />
            </button>
          </div>
          <div className="max-h-[min(32rem,70vh)] overflow-y-auto">
            <HealthPanel pathname={pathname} chips={chips} bundle={bundle} />
          </div>
        </div>
      ) : null}
    </div>
  )
}
