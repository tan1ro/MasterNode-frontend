"use client"

import Link from "next/link"
import { ArrowLeft, ExternalLink, Link2, Unplug } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IntegrationBrandIcon } from "@/components/integrations/integration-brand-icon"
import { IntegrationToolPills } from "@/components/integrations/integration-tool-pills"
import { N8nPipelineSetup } from "@/components/integrations/n8n-pipeline-setup"
import { getIntegrationMeta } from "@/constants/integration-directory"
import type { IntegrationCatalogItem } from "@/types/api"
import { cn } from "@/lib/utils"

interface IntegrationDetailViewProps {
  integration: IntegrationCatalogItem
  onBack: () => void
  onConnect: () => void
  onDisconnect: () => void
  onTest: () => void
  isDisconnecting?: boolean
  isTesting?: boolean
}

export function IntegrationDetailView({
  integration,
  onBack,
  onConnect,
  onDisconnect,
  onTest,
  isDisconnecting = false,
  isTesting = false,
}: IntegrationDetailViewProps) {
  const meta = getIntegrationMeta(integration.id)
  const connected = integration.status === "connected"
  const setupRequired = integration.status === "setup_required"

  return (
    <div className="space-y-8">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to directory
      </button>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4 min-w-0">
          <IntegrationBrandIcon
            providerId={integration.id}
            brandColor={integration.brand_color}
            size="lg"
          />
          <div className="min-w-0">
            <h2 className="text-2xl font-heading font-bold tracking-wide">{integration.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {meta?.tagline ?? integration.description}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {connected ? (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isTesting}
                onClick={onTest}
              >
                {isTesting ? "Testing…" : "Test connection"}
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
            <Button
              type="button"
              size="sm"
              className="bg-amber text-amber-foreground hover:bg-amber/90"
              onClick={onConnect}
            >
              <Link2 className="h-3.5 w-3.5 mr-1.5" aria-hidden />
              {setupRequired ? "View setup" : "Connect"}
            </Button>
          )}
        </div>
      </header>

      <div className="space-y-6 max-w-3xl">
        <p className="text-sm leading-relaxed text-foreground/90">
          {meta?.description ?? integration.description}
        </p>

        {meta?.developer ? (
          <p className="text-sm text-muted-foreground">
            Developed by{" "}
            {meta.developerUrl ? (
              <a
                href={meta.developerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-foreground hover:text-amber transition-colors"
              >
                {meta.developer}
                <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
            ) : (
              <span className="text-foreground">{meta.developer}</span>
            )}
          </p>
        ) : null}

        <p className="text-xs text-muted-foreground border-l-2 border-amber/30 pl-3">
          Connectors run with your workspace credentials. Only connect apps you trust, and review
          what each tool can access before enabling in production.
        </p>

        {meta?.tools?.length ? (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-semibold text-foreground">Tools</h3>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
                {meta.tools.length}
              </span>
            </div>
            <IntegrationToolPills tools={meta.tools} />
          </section>
        ) : null}

        {integration.id === "n8n" ? (
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Pipeline template</h3>
            <N8nPipelineSetup className="border-0 shadow-none bg-muted/15" />
          </section>
        ) : null}

        <section className="grid gap-6 sm:grid-cols-2 pt-2 border-t border-border/60">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Author
            </h3>
            {meta?.developerUrl ? (
              <a
                href={meta.developerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-foreground hover:text-amber"
              >
                {meta.developer}
                <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
            ) : (
              <p className="text-sm">{meta?.developer ?? integration.name}</p>
            )}
          </div>
          {meta?.links?.length ? (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                More info
              </h3>
              <ul className="space-y-1.5">
                {meta.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-foreground hover:text-amber"
                      >
                        {link.label}
                        <ExternalLink className="h-3 w-3" aria-hidden />
                      </a>
                    ) : link.href.startsWith("/") ? (
                      <a
                        href={link.href}
                        download={link.href.endsWith(".json") ? true : undefined}
                        className="inline-flex items-center gap-1 text-sm text-foreground hover:text-amber"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="text-sm hover:text-amber">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        {connected && integration.workflow_name ? (
          <p className={cn("text-xs text-muted-foreground")}>
            Connected workflow:{" "}
            <span className="text-foreground font-medium">{integration.workflow_name}</span>
          </p>
        ) : null}
      </div>
    </div>
  )
}
