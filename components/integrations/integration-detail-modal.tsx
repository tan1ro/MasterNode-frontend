"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { ExternalLink, Link2, Unplug, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IntegrationBrandIcon } from "@/components/integrations/integration-brand-icon"
import { IntegrationMcpConnectCard } from "@/components/integrations/integration-mcp-connect-card"
import { IntegrationToolPills } from "@/components/integrations/integration-tool-pills"
import { getIntegrationMeta } from "@/constants/integration-directory"
import type { IntegrationCatalogItem } from "@/types/api"
import { cn } from "@/lib/utils"

interface IntegrationDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  integration: IntegrationCatalogItem | null
  onConnect: () => void
  onDisconnect: () => void
  onTest: () => void
  isDisconnecting?: boolean
  isTesting?: boolean
}

export function IntegrationDetailModal({
  open,
  onOpenChange,
  integration,
  onConnect,
  onDisconnect,
  onTest,
  isDisconnecting = false,
  isTesting = false,
}: IntegrationDetailModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    window.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, onOpenChange])

  if (!mounted || !open || !integration) return null

  const meta = getIntegrationMeta(integration.id)
  const connected = integration.status === "connected"

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto",
          "rounded-t-2xl sm:rounded-2xl border border-border bg-background shadow-xl"
        )}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-border/60 bg-background/95 px-5 py-3 backdrop-blur-sm">
          <span className="text-sm font-medium text-muted-foreground">Connector</span>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex items-start gap-4">
            <IntegrationBrandIcon
              providerId={integration.id}
              brandColor={integration.brand_color}
              size="lg"
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-heading font-bold">{integration.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {meta?.tagline ?? integration.description}
              </p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-foreground/90">
            {meta?.description ?? integration.description}
          </p>

          {meta?.developer ? (
            <p className="text-sm text-muted-foreground">
              By{" "}
              {meta.developerUrl ? (
                <a
                  href={meta.developerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-amber inline-flex items-center gap-0.5"
                >
                  {meta.developer}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                meta.developer
              )}
            </p>
          ) : null}

          {meta?.tools?.length ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Capabilities
              </p>
              <IntegrationToolPills tools={meta.tools} maxVisible={6} />
            </div>
          ) : null}

          {connected ? (
            <>
              <IntegrationMcpConnectCard
                providerId={integration.id}
                zapierMode={integration.id === "zapier"}
              />
              <p className="text-xs text-muted-foreground rounded-lg border border-border/60 bg-muted/15 p-3">
                MCP clients can call <span className="font-mono">integration_invoke</span> with
                provider <span className="font-mono">{integration.id}</span>. Use{" "}
                <span className="font-mono">integrations_list</span> to see available actions.
              </p>
            </>
          ) : integration.id === "zapier" ? (
            <IntegrationMcpConnectCard providerId="zapier" zapierMode />
          ) : null}

          <div className="flex flex-wrap gap-2 pt-2">
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
                  <Unplug className="h-3.5 w-3.5 mr-1" />
                  {isDisconnecting ? "Removing…" : "Remove"}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                size="sm"
                className="bg-amber text-amber-foreground hover:bg-amber/90"
                onClick={onConnect}
              >
                <Link2 className="h-3.5 w-3.5 mr-1.5" />
                Connect
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
