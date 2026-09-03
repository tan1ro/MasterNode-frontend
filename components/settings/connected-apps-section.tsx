"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Link2, Plug, Unplug } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Callout } from "@/components/ui/callout"
import { SettingsSectionCard } from "@/components/settings/settings-pref-controls"
import { ROUTES } from "@/lib/routes"
import { integrationsService } from "@/services/integrations"
import type { IntegrationCatalogItem } from "@/types/api"
import { getErrorMessage } from "@/types/api"
import { cn } from "@/lib/utils"

export function ConnectedAppsSection() {
  const [integrations, setIntegrations] = useState<IntegrationCatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)

  const loadIntegrations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await integrationsService.list()
      setIntegrations(res.integrations || [])
    } catch (err) {
      setError(getErrorMessage(err, "Could not load connected apps"))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadIntegrations()
  }, [loadIntegrations])

  const connected = useMemo(
    () => integrations.filter((item) => item.status === "connected"),
    [integrations]
  )

  const handleDisconnect = async (providerId: string) => {
    setDisconnecting(providerId)
    setError(null)
    try {
      await integrationsService.disconnect(providerId)
      await loadIntegrations()
    } catch (err) {
      setError(getErrorMessage(err, "Could not disconnect app"))
    } finally {
      setDisconnecting(null)
    }
  }

  return (
    <Card variant="minimal" interactive={false} id="connected-apps" accent="amber" className="scroll-mt-24">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Plug className="h-5 w-5 text-amber-400" />
          <div>
            <CardTitle>Connected apps</CardTitle>
            <CardDescription>OAuth integrations and third-party connectors.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <SettingsSectionCard
          icon={Link2}
          title="Third-party connectors"
          description="n8n, Canva, Google Docs, Notion, Slack, GitHub, and more."
          accent="amber"
        >
          <p className="text-sm text-muted-foreground mb-3">
            Connected apps expose MCP tools (<code className="text-xs">integrations_list</code>,{" "}
            <code className="text-xs">integration_invoke</code>) for agents and API clients.
          </p>
          <Link
            href={ROUTES.integrations}
            className="inline-flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Open integrations directory
          </Link>
        </SettingsSectionCard>

        <SettingsSectionCard
          icon={Plug}
          title="Authorised applications"
          description="Apps you have granted access to in this workspace."
          accent="amber"
        >
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading authorised apps…</p>
          ) : error ? (
            <p className="text-xs text-red-400" role="alert">
              {error}
            </p>
          ) : connected.length === 0 ? (
            <Callout type="info">
              No third-party apps are connected yet. Use the integrations directory to connect Canva, Google Drive,
              Slack, n8n, and other providers.
            </Callout>
          ) : (
            <ul className="space-y-2">
              {connected.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-2 rounded-lg border border-border/50 bg-muted/10 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{item.name || item.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.connection_type === "oauth" ? "OAuth connection" : "API / webhook connection"}
                      {item.workflow_name ? ` · ${item.workflow_name}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                        "bg-emerald-500/15 text-emerald-400"
                      )}
                    >
                      Connected
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={disconnecting === item.id}
                      onClick={() => void handleDisconnect(item.id)}
                    >
                      <Unplug className="mr-1.5 h-3.5 w-3.5" />
                      {disconnecting === item.id ? "Disconnecting…" : "Disconnect"}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SettingsSectionCard>
      </CardContent>
    </Card>
  )
}
