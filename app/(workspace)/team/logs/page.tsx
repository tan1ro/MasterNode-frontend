"use client"

import { useMemo, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { ExternalLink } from "lucide-react"
import Link from "next/link"
import { PageHeader } from "@/components/shared/page-header"
import { Select } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { useAuditLogs } from "@/hooks"
import { ROUTES } from "@/lib/routes"
import { CLIENT_CHANNEL_UI, clientChannelLabel } from "@/constants/client-channel"
import type { AuditEvent, ClientChannel } from "@/types/api"

const TEAM_ACTION_PREFIXES = [
  "team.",
  "member.",
  "invite.",
  "role.",
  "auth.",
  "api_key.",
  "billing.",
]

function isTeamScopedEvent(ev: AuditEvent): boolean {
  const action = String(ev.action || "").toLowerCase()
  if (!action) return false
  return TEAM_ACTION_PREFIXES.some((prefix) => action.startsWith(prefix))
}

function formatTime(ev: AuditEvent): string {
  const raw = ev.ts
  if (!raw) return "—"
  try {
    return formatDistanceToNow(new Date(raw), { addSuffix: true })
  } catch {
    return String(raw).slice(0, 19)
  }
}

export default function TeamLogsPage() {
  const [channel, setChannel] = useState<ClientChannel>("web")
  const { data, isLoading, error } = useAuditLogs({ limit: 200, client_channel: channel })

  const events = useMemo(() => {
    const all = data?.events ?? []
    const scoped = all.filter(isTeamScopedEvent)
    return scoped.length > 0 ? scoped : all
  }, [data?.events])

  const channelLabel = useMemo(() => CLIENT_CHANNEL_UI[channel], [channel])

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-5xl">
      <PageHeader
        title="Team Logs"
        description="Team-scoped audit timeline: invites, role changes, billing, and API key activity."
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 w-full sm:w-auto">
          <Select
            value={channel}
            onChange={(e) => setChannel(e.target.value as ClientChannel)}
            className="w-full sm:w-[220px] bg-background shrink-0"
            aria-label="Log source"
          >
            <option value="web">{CLIENT_CHANNEL_UI.web}</option>
            <option value="api">{CLIENT_CHANNEL_UI.api}</option>
          </Select>
          <Link
            href={ROUTES.logs}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            All workspace logs
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </PageHeader>

      <p className="text-sm text-muted-foreground mb-6">
        Showing <span className="text-foreground font-medium">{channelLabel}</span> events filtered to team activity. For
        the full unfiltered audit timeline, see <Link href={ROUTES.logs} className="text-amber hover:underline">Logs</Link>.
      </p>

      <Card noGrid className="p-5 hover:translate-y-0 hover:scale-100">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {error && (
          <p className="text-sm text-destructive">
            Could not load audit events. Ensure MongoDB audit logging is enabled on the backend.
          </p>
        )}
        {!isLoading && !error && events.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No team events yet. Member invites, role changes, and billing actions will appear here.
          </p>
        )}
        <ul className="divide-y divide-border/60">
          {events.map((log, i) => {
            const label = (log.principal || "system").slice(0, 24)
            const metaCh = log.metadata && typeof log.metadata === "object" ? log.metadata["client_channel"] : null
            return (
              <li key={log.id ?? `${log.ts}-${i}`} className="flex items-start gap-3 py-3 first:pt-0">
                <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-[9px] font-bold text-primary uppercase">
                  {label.slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{log.action || "event"}</span>
                    {typeof metaCh === "string" && (metaCh === "web" || metaCh === "api") && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                        {clientChannelLabel(metaCh)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {log.resource || "—"}
                    {log.outcome ? ` · ${log.outcome}` : ""}
                  </p>
                </div>
                <time className="flex-shrink-0 text-[10px] text-muted-foreground tabular-nums">{formatTime(log)}</time>
              </li>
            )
          })}
        </ul>
      </Card>
    </div>
  )
}
