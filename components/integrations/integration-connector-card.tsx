"use client"

import { CheckCircle2, CircleDashed, Settings2, Unplug } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IntegrationBrandIcon } from "@/components/integrations/integration-brand-icon"
import type { IntegrationCatalogItem, IntegrationStatus } from "@/types/api"
import { cn } from "@/lib/utils"

interface IntegrationConnectorCardProps {
  integration: IntegrationCatalogItem
  onConnect: () => void
  onDisconnect: () => void
  onTest: () => void
  isDisconnecting?: boolean
  isTesting?: boolean
}

function statusLabel(status: IntegrationStatus): string {
  if (status === "connected") return "Connected"
  if (status === "setup_required") return "Setup required"
  return "Not connected"
}

function StatusBadge({ status }: { status: IntegrationStatus }) {
  const connected = status === "connected"
  const setup = status === "setup_required"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        connected && "bg-emerald/15 text-emerald",
        setup && "bg-amber/15 text-amber",
        !connected && !setup && "bg-muted text-muted-foreground"
      )}
    >
      {connected ? (
        <CheckCircle2 className="h-3 w-3" aria-hidden />
      ) : setup ? (
        <Settings2 className="h-3 w-3" aria-hidden />
      ) : (
        <CircleDashed className="h-3 w-3" aria-hidden />
      )}
      {statusLabel(status)}
    </span>
  )
}

export function IntegrationConnectorCard({
  integration,
  onConnect,
  onDisconnect,
  onTest,
  isDisconnecting = false,
  isTesting = false,
}: IntegrationConnectorCardProps) {
  const connected = integration.status === "connected"
  const accent =
    integration.id === "n8n"
      ? "destructive"
      : integration.id === "canva"
        ? "cyan"
        : integration.id === "google_docs"
          ? "sky"
          : "violet"

  return (
    <Card accent={accent} className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <IntegrationBrandIcon
              providerId={integration.id}
              brandColor={integration.brand_color}
            />
            <div className="min-w-0">
              <CardTitle className="text-base">{integration.name}</CardTitle>
              <CardDescription className="mt-1">{integration.description}</CardDescription>
            </div>
          </div>
          <StatusBadge status={integration.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {connected && integration.id === "n8n" ? (
          <p className="text-xs text-muted-foreground">
            Pipeline events:{" "}
            <span className="text-foreground">task.accepted, completed, failed</span>
            {" · "}
            Chat: <span className="text-foreground">“trigger n8n workflow …”</span>
          </p>
        ) : null}
        {connected && integration.workflow_name ? (
          <p className="text-xs text-muted-foreground">
            Workflow: <span className="text-foreground">{integration.workflow_name}</span>
          </p>
        ) : null}
        {connected &&
        integration.connection?.config &&
        typeof integration.connection.config === "object" &&
        "display_name" in integration.connection.config ? (
          <p className="text-xs text-muted-foreground">
            Account:{" "}
            <span className="text-foreground">
              {String(integration.connection.config.display_name)}
            </span>
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {connected ? (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isTesting}
                onClick={onTest}
              >
                {isTesting ? "Testing…" : "Test"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-muted-foreground"
                disabled={isDisconnecting}
                onClick={onDisconnect}
              >
                <Unplug className="h-3.5 w-3.5 mr-1" aria-hidden />
                {isDisconnecting ? "Disconnecting…" : "Disconnect"}
              </Button>
            </>
          ) : (
            <Button type="button" size="sm" onClick={onConnect}>
              {integration.status === "setup_required" ? "View setup" : "Connect"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
