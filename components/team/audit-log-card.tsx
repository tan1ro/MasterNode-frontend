"use client"

import { formatDistanceToNow } from "date-fns"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { useAuditLogs } from "@/hooks"
import { CLIENT_CHANNEL_UI } from "@/constants/client-channel"
import type { AuditEvent, ClientChannel } from "@/types/api"

function formatTime(ev: AuditEvent): string {
  const raw = ev.ts
  if (!raw) return "—"
  try {
    return formatDistanceToNow(new Date(raw), { addSuffix: true })
  } catch {
    return String(raw).slice(0, 19)
  }
}

export function AuditLogCard() {
  const [channel, setChannel] = useState<ClientChannel>("web")
  const { data, isLoading, error } = useAuditLogs({ limit: 50, client_channel: channel })

  const events = data?.events ?? []

  return (
    <Card noGrid className="p-5 hover:translate-y-0 hover:scale-100">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold text-foreground">Audit Log</h3>
        <Select
          value={channel}
          onChange={(e) => setChannel(e.target.value as ClientChannel)}
          className="w-full sm:w-[180px] bg-background text-xs"
          aria-label="Audit log source"
        >
          <option value="web">{CLIENT_CHANNEL_UI.web}</option>
          <option value="api">{CLIENT_CHANNEL_UI.api}</option>
        </Select>
      </div>
      {isLoading && <p className="text-xs text-muted-foreground">Loading…</p>}
      {error && (
        <p className="text-xs text-destructive">
          Could not load audit events. Requires MongoDB audit logging on the backend.
        </p>
      )}
      {!isLoading && !error && events.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No audit events yet. Actions such as RAG ingest and queries are logged when persistence is enabled.
        </p>
      )}
      <div className="space-y-2.5">
        {events.map((log, i) => {
          const label = (log.principal || "system").slice(0, 24)
          return (
            <div
              key={log.id ?? `${log.ts}-${i}`}
              className="flex items-start gap-3 border-b border-border/50 py-2 last:border-0"
            >
              <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-[9px] font-bold text-primary uppercase">
                {label.slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-medium text-foreground">{log.action || "event"}</span>
                <span className="text-xs text-muted-foreground"> — {log.resource || "—"}</span>
                {log.outcome && (
                  <span className="ml-1 text-[10px] text-muted-foreground">({log.outcome})</span>
                )}
              </div>
              <span className="flex-shrink-0 text-[10px] text-muted-foreground">{formatTime(log)}</span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
