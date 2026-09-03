"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { ChevronDown, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ApiErrorCallout } from "@/components/shared/api-error-callout"
import { IntegrationBrandIcon } from "@/components/integrations/integration-brand-icon"
import { IntegrationMcpConnectCard } from "@/components/integrations/integration-mcp-connect-card"
import type { IntegrationCatalogItem } from "@/types/api"
import { cn } from "@/lib/utils"

const N8N_TEMPLATE_URL = "/integrations/n8n-masternode-pipeline.workflow.json"

interface IntegrationConnectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  integration: IntegrationCatalogItem | null
  isPending?: boolean
  error: unknown
  onConnectWebhook: (webhookUrl: string, workflowName: string, notifyTaskEvents: boolean) => void
  onConnectToken: (token: string, extras?: { site_url?: string; email?: string }) => void
  onConnectOAuth: () => void
}

export function IntegrationConnectDialog({
  open,
  onOpenChange,
  integration,
  isPending = false,
  error,
  onConnectWebhook,
  onConnectToken,
  onConnectOAuth,
}: IntegrationConnectDialogProps) {
  const [mounted, setMounted] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState("")
  const [workflowName, setWorkflowName] = useState("")
  const [apiToken, setApiToken] = useState("")
  const [jiraSite, setJiraSite] = useState("")
  const [jiraEmail, setJiraEmail] = useState("")
  const [notifyTaskEvents, setNotifyTaskEvents] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) onOpenChange(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, isPending, onOpenChange])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = ""
      }
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      setWebhookUrl("")
      setWorkflowName("")
      setApiToken("")
      setJiraSite("")
      setJiraEmail("")
      setNotifyTaskEvents(true)
      setShowAdvanced(false)
    }
  }, [open])

  if (!mounted || !open || !integration) return null

  const oauthBlocked =
    integration.connection_type === "oauth" && integration.oauth_configured === false
  const isN8n = integration.id === "n8n"
  const isSlack = integration.id === "slack"
  const isDiscord = integration.id === "discord"
  const isZapier = integration.id === "zapier"
  const isJira = integration.id === "jira"
  const isWebhook = integration.connection_type === "webhook"
  const isToken = integration.connection_type === "api_token"

  const webhookLabel = isSlack
    ? "Slack incoming webhook"
    : isDiscord
      ? "Discord webhook URL"
      : isZapier
        ? "Zapier catch hook URL"
        : "Automation link"
  const webhookPlaceholder = isSlack
    ? "https://hooks.slack.com/services/..."
    : isDiscord
      ? "https://discord.com/api/webhooks/..."
      : isZapier
        ? "https://hooks.zapier.com/hooks/catch/..."
        : "Paste from your n8n Webhook node"
  const webhookHelp = isSlack
    ? "In Slack, create an Incoming Webhook for your channel and paste the URL here."
    : isDiscord
      ? "In Discord channel settings → Integrations → Webhooks, copy the webhook URL."
      : isZapier
        ? "In Zapier: (1) Copy the GET hook above into Webhooks by Zapier → GET, or (2) create a Catch Hook and paste its URL below."
        : "In n8n, add a Webhook trigger, activate the workflow, and copy the production link."

  const tokenLabel =
    integration.id === "github"
      ? "Personal access token"
      : integration.id === "linear"
        ? "Linear API key"
        : integration.id === "dropbox"
          ? "Dropbox access token"
          : integration.id === "airtable"
            ? "Airtable personal access token"
            : integration.id === "jira"
              ? "Jira API token"
              : "Integration token"
  const tokenPlaceholder =
    integration.id === "github"
      ? "ghp_… or github_pat_…"
      : integration.id === "linear"
        ? "lin_api_…"
        : integration.id === "dropbox"
          ? "sl.…"
          : integration.id === "airtable"
            ? "pat…"
            : integration.id === "jira"
              ? "Atlassian API token"
              : "Paste from Notion"
  const tokenHelp =
    integration.id === "github"
      ? "Create a token at github.com/settings/tokens with repo/issue scope."
      : integration.id === "linear"
        ? "Create an API key in Linear → Settings → API."
        : integration.id === "dropbox"
          ? "Generate an access token in the Dropbox App Console."
          : integration.id === "airtable"
            ? "Create a personal access token at airtable.com/create/tokens."
            : integration.id === "jira"
              ? "Create an API token at id.atlassian.com/manage-profile/security/api-tokens."
              : "Create an integration at notion.so/my-integrations, then paste the token here."

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={() => !isPending && onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="integration-connect-title"
        className={cn(
          "relative z-10 w-full max-w-md rounded-xl border border-border bg-background p-5 shadow-xl"
        )}
      >
        <div className="mb-4 flex items-start gap-3">
          <IntegrationBrandIcon
            providerId={integration.id}
            brandColor={integration.brand_color}
          />
          <div>
            <h2 id="integration-connect-title" className="text-lg font-semibold">
              Add {integration.name}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isN8n
                ? "Link your n8n workspace to use it from chat and tasks."
                : integration.description}
            </p>
          </div>
        </div>

        {isWebhook ? (
          <div className="space-y-3">
            {isZapier ? (
              <IntegrationMcpConnectCard providerId="zapier" zapierMode />
            ) : null}
            <div>
              <Label htmlFor="automation-url">{webhookLabel}</Label>
              <Input
                id="automation-url"
                type="url"
                placeholder={webhookPlaceholder}
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">{webhookHelp}</p>
            </div>
            <div>
              <Label htmlFor="workflow-label">
                {isSlack ? "Channel label (optional)" : isZapier ? "Zap label (optional)" : "Label (optional)"}
              </Label>
              <Input
                id="workflow-label"
                placeholder={
                  isSlack ? "e.g. #engineering" : isZapier ? "e.g. Slack notify" : "e.g. Slack alerts"
                }
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="mt-1"
              />
            </div>
            {isN8n ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowAdvanced((v) => !v)}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <ChevronDown
                    className={cn("h-3.5 w-3.5 transition-transform", showAdvanced && "rotate-180")}
                  />
                  Advanced options
                </button>
                {showAdvanced ? (
                  <div className="space-y-3 rounded-lg border border-border/60 bg-muted/15 p-3">
                    <label className="flex items-start gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        className="mt-1 rounded border-border"
                        checked={notifyTaskEvents}
                        onChange={(e) => setNotifyTaskEvents(e.target.checked)}
                      />
                      <span>
                        <span className="text-foreground">Notify when tasks finish</span>
                        <span className="block text-xs text-muted-foreground mt-0.5">
                          Send updates to the same automation when pipeline tasks complete or fail.
                        </span>
                      </span>
                    </label>
                    <Button asChild size="sm" variant="outline" className="w-full">
                      <a href={N8N_TEMPLATE_URL} download="masternode-pipeline.workflow.json">
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        Download starter workflow
                      </a>
                    </Button>
                  </div>
                ) : null}
              </>
            ) : null}
            <Button
              className="w-full bg-amber text-amber-foreground hover:bg-amber/90"
              disabled={!webhookUrl.trim() || isPending}
              onClick={() =>
                onConnectWebhook(webhookUrl.trim(), workflowName.trim(), notifyTaskEvents)
              }
            >
              {isPending ? "Adding…" : "Add to workspace"}
            </Button>
          </div>
        ) : null}

        {isToken ? (
          <div className="space-y-3">
            {isJira ? (
              <>
                <div>
                  <Label htmlFor="jira-site">Jira site</Label>
                  <Input
                    id="jira-site"
                    placeholder="yourcompany.atlassian.net"
                    value={jiraSite}
                    onChange={(e) => setJiraSite(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="jira-email">Atlassian account email</Label>
                  <Input
                    id="jira-email"
                    type="email"
                    placeholder="you@company.com"
                    value={jiraEmail}
                    onChange={(e) => setJiraEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </>
            ) : null}
            <div>
              <Label htmlFor="integration-token">{tokenLabel}</Label>
              <Input
                id="integration-token"
                type="password"
                placeholder={tokenPlaceholder}
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">{tokenHelp}</p>
            </div>
            <Button
              className="w-full bg-amber text-amber-foreground hover:bg-amber/90"
              disabled={
                !apiToken.trim() ||
                isPending ||
                (isJira && (!jiraSite.trim() || !jiraEmail.trim()))
              }
              onClick={() =>
                onConnectToken(apiToken.trim(), {
                  site_url: jiraSite.trim() || undefined,
                  email: jiraEmail.trim() || undefined,
                })
              }
            >
              {isPending ? "Adding…" : "Add to workspace"}
            </Button>
          </div>
        ) : null}

        {integration.connection_type === "oauth" ? (
          <div className="space-y-3">
            {oauthBlocked ? (
              <p className="text-sm text-muted-foreground rounded-lg border border-amber/30 bg-amber/5 p-3">
                This connector is not enabled on your server yet. Ask your admin to configure{" "}
                {integration.name} sign-in.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Sign in with {integration.name} to grant access. We store credentials securely for
                your workspace only.
              </p>
            )}
            <Button
              className="w-full bg-amber text-amber-foreground hover:bg-amber/90"
              disabled={oauthBlocked || isPending}
              onClick={onConnectOAuth}
            >
              {isPending ? "Redirecting…" : `Continue with ${integration.name}`}
            </Button>
          </div>
        ) : null}

        {error ? (
          <div className="mt-3">
            <ApiErrorCallout error={error} />
          </div>
        ) : null}

        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}
