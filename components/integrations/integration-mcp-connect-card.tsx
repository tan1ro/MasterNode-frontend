"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Check, Copy, Link2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useClipboard } from "@/hooks/use-clipboard"
import { integrationsService, type McpConnectInfo } from "@/services/integrations"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"

interface IntegrationMcpConnectCardProps {
  providerId?: string
  className?: string
  /** When true, emphasize Zapier GET hook URL. */
  zapierMode?: boolean
}

function CopyRow({
  label,
  value,
  hint,
  mono = true,
}: {
  label: string
  value: string
  hint?: string
  mono?: boolean
}) {
  const { copy, hasCopied } = useClipboard()

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-foreground">{label}</span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 shrink-0 gap-1 px-2 text-xs"
          onClick={() => void copy(value)}
        >
          {hasCopied(value) ? (
            <>
              <Check className="h-3 w-3" aria-hidden />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" aria-hidden />
              Copy link
            </>
          )}
        </Button>
      </div>
      <p
        className={cn(
          "break-all rounded-md border border-border/60 bg-muted/20 px-2.5 py-2 text-xs text-muted-foreground",
          mono && "font-mono"
        )}
      >
        {value}
      </p>
      {hint ? <p className="text-[11px] text-muted-foreground leading-relaxed">{hint}</p> : null}
    </div>
  )
}

export function IntegrationMcpConnectCard({
  providerId,
  className,
  zapierMode = false,
}: IntegrationMcpConnectCardProps) {
  const [info, setInfo] = useState<McpConnectInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { copy, hasCopied } = useClipboard()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    integrationsService
      .mcpConnectInfo()
      .then((data) => {
        if (!cancelled) setInfo(data)
      })
      .catch(() => {
        if (!cancelled) setError("Could not load MCP connection info.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const claudeJson = info
    ? JSON.stringify(info.claude_desktop_config, null, 2)
    : ""

  const invokeExample = info
    ? info.integration_invoke_url_template.replace("{provider}", providerId || "zapier")
    : ""

  return (
    <div
      className={cn(
        "rounded-lg border border-amber/25 bg-amber/5 p-3 space-y-3",
        className
      )}
    >
      <div className="flex items-start gap-2">
        <Link2 className="h-4 w-4 text-amber mt-0.5 shrink-0" aria-hidden />
        <div>
          <p className="text-sm font-medium text-foreground">
            {zapierMode ? "Get MCP link for Zapier" : "MCP connection links"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Copy URLs like Claude Desktop — use GET in Zapier Webhooks, or connect MCP clients with
            your API key from{" "}
            <Link href={ROUTES.apiKeys} className="text-amber hover:underline">
              API Keys
            </Link>
            .
          </p>
        </div>
      </div>

      {loading ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          Loading connection links…
        </p>
      ) : null}

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      {info && !loading ? (
        <div className="space-y-3">
          {zapierMode ? (
            <CopyRow
              label="Zapier GET hook (no API key needed)"
              value={info.zapier_get_url}
              hint={info.zapier_note}
            />
          ) : null}

          <CopyRow
            label="MCP actions (GET)"
            value={info.mcp_actions_get_url}
            hint={`${info.auth_note} Required header: ${info.auth_header}.`}
          />

          {info.mcp_enabled ? (
            <CopyRow
              label="MCP server (HTTP)"
              value={info.mcp_http_url}
              hint="Use in Claude Desktop, Cursor, or other MCP clients with your API key."
            />
          ) : (
            <p className="text-xs text-muted-foreground rounded-md border border-border/50 bg-background/50 px-2.5 py-2">
              MCP server is not enabled on this deployment (`MCP_ENABLED=1` on the backend).
            </p>
          )}

          {invokeExample ? (
            <CopyRow
              label="Invoke integration (POST)"
              value={invokeExample}
              hint='POST JSON: {"action":"trigger","params":{"message":"..."}} with X-API-Key.'
            />
          ) : null}

          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-foreground">Claude Desktop config</span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 shrink-0 gap-1 px-2 text-xs"
                disabled={!claudeJson}
                onClick={() => void copy(claudeJson)}
              >
                {hasCopied(claudeJson) ? (
                  <>
                    <Check className="h-3 w-3" aria-hidden />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" aria-hidden />
                    Copy JSON
                  </>
                )}
              </Button>
            </div>
            <pre className="max-h-32 overflow-auto rounded-md border border-border/60 bg-muted/20 p-2 text-[10px] leading-relaxed text-muted-foreground">
              {claudeJson}
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  )
}
