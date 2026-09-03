"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/routes"
import type { ApiKeyRecord, HealthResponse } from "@/types/api"

function maskKeyPreview(k: string) {
  if (!k || k.length < 8) return "••••••••"
  return `${k.slice(0, 6)}…${k.slice(-4)}`
}

interface SystemHealthCardProps {
  health: HealthResponse | undefined
  isLoading: boolean
  error: Error | null
  apiKeys: ApiKeyRecord[] | undefined
  keysLoading: boolean
  getStoredApiKey: () => string | null
  isApiKeyActive: (stored: string | null, key: string) => boolean
}

export function SystemHealthCard({
  health,
  isLoading,
  error,
  apiKeys,
  keysLoading,
  getStoredApiKey,
  isApiKeyActive,
}: SystemHealthCardProps) {
  const [stored, setStored] = useState<string | null>(null)
  useEffect(() => {
    setStored(getStoredApiKey())
  }, [apiKeys])
  const online = health?.online_count ?? 0
  const total = health?.total_count ?? 0
  const summary = total > 0 ? `${online}/${total} Online` : "—"

  const components = health?.components ?? []
  const providerRows = health?.llm_provider_keys ?? []
  const configuredProviders = providerRows.filter((p) => p.configured).map((p) => p.id)

  return (
    <Card accent="sky" interactive={false} className="border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold font-heading tracking-wide">System health</CardTitle>
            <CardDescription>Superuser view — pipeline services, vector store, and LLM gateway</CardDescription>
          </div>
          <div
            className={cn(
              "text-sm font-mono font-semibold tabular-nums",
              total > 0 && online === total && "text-emerald",
              total > 0 && online < total && "text-amber"
            )}
          >
            {isLoading ? "…" : summary}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <p className="text-sm text-destructive">
            Could not load health: {error.message}
          </p>
        )}

        {isLoading && !components.length ? (
          <p className="text-sm text-muted-foreground">Loading system status…</p>
        ) : (
          <div className="space-y-2">
            {components.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border/40 px-3 py-2.5 text-sm"
              >
                <div className="flex min-w-0 flex-1 items-start gap-2">
                  <span
                    className={cn(
                      "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                      c.online ? "bg-emerald" : "bg-destructive/80"
                    )}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium leading-snug">{c.label}</div>
                    {c.detail ? (
                      <p
                        className="mt-0.5 text-xs text-muted-foreground line-clamp-3 break-words"
                        title={c.detail}
                      >
                        {c.detail}
                      </p>
                    ) : null}
                  </div>
                </div>
                <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
                  {typeof c.latency_ms === "number" ? `${c.latency_ms}ms` : "—"}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">LLM provider keys (server)</p>
          {configuredProviders.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {configuredProviders.map((id) => (
                <span
                  key={id}
                  className="rounded-md border border-emerald/30 bg-emerald/10 px-2 py-0.5 font-mono text-xs text-emerald"
                >
                  {id}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No provider API keys configured on the server.</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Your API keys</p>
            <Link href={ROUTES.apiKeys} className="text-xs font-mono text-amber hover:underline">
              Manage
            </Link>
          </div>
          {keysLoading ? (
            <p className="text-xs text-muted-foreground">Loading keys…</p>
          ) : apiKeys && apiKeys.length > 0 ? (
            <ul className="space-y-1.5">
              {apiKeys.map((k) => {
                const inUse = isApiKeyActive(stored, k.api_key)
                const badge =
                  inUse ? "In use" : k.last_used ? "Used recently" : "Ready"
                return (
                  <li
                    key={k.key_id}
                    className="flex items-center justify-between gap-2 rounded-md border border-border/40 px-2 py-1.5 text-xs"
                  >
                    <span className="truncate font-medium">{k.name}</span>
                    <span className="shrink-0 font-mono text-muted-foreground">{maskKeyPreview(k.api_key)}</span>
                    <span
                      className={cn(
                        "shrink-0 text-[10px] uppercase",
                        inUse ? "text-amber" : "text-emerald"
                      )}
                    >
                      {badge}
                    </span>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">
              No keys yet. Create one under{" "}
              <Link href={ROUTES.apiKeys} className="text-amber hover:underline">
                API Keys
              </Link>
              .
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
