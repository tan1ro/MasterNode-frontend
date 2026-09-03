"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Key, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Callout } from "@/components/ui/callout"
import { ROUTES } from "@/lib/routes"
import { getStoredApiKey, setStoredApiKey } from "@/lib/storage"

export function ApiAccessSection() {
  const [storedKey, setStoredKey] = useState("")
  const [draft, setDraft] = useState("")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const k = getStoredApiKey() || ""
    setStoredKey(k)
    setDraft(k)
  }, [])

  const maskKey = (k: string) => {
    if (!k) return "Not set"
    if (k.length <= 8) return "••••••••"
    return `${k.slice(0, 4)}…${k.slice(-4)}`
  }

  const handleSave = () => {
    if (!draft.trim()) return
    setStoredApiKey(draft.trim())
    setStoredKey(draft.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    window.dispatchEvent(new Event("masternode-settings-changed"))
  }

  return (
    <Card variant="minimal" interactive={false} id="api-access" accent="amber" className="scroll-mt-24">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-amber-400" />
          <div>
            <CardTitle>API access (this browser)</CardTitle>
            <CardDescription>
              The active key is sent as <code className="text-xs">X-API-Key</code> on REST calls. Manage the full key list on{" "}
              <Link href={ROUTES.apiKeys} className="text-amber hover:underline">
                API Keys
              </Link>
              .
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border border-border/60 bg-muted/10 px-3 py-2 text-sm">
          <span className="text-muted-foreground">Active key: </span>
          <span className="font-mono text-foreground">{maskKey(storedKey)}</span>
        </div>

        <div>
          <Label htmlFor="settingsApiKey">Paste or replace active key</Label>
          <Input
            id="settingsApiKey"
            type="password"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="mn_… or dyn-…"
            className="mt-1.5 font-mono text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={handleSave} disabled={!draft.trim()}>
            {saved ? "Saved" : "Save active key"}
          </Button>
          <Link
            href={ROUTES.apiKeys}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-muted"
          >
            Open API Keys
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        {!storedKey && (
          <Callout type="warning" title="No API key in this browser">
            Webhooks and most task APIs need a key. Create one on the API Keys page or paste an existing key above.
          </Callout>
        )}
      </CardContent>
    </Card>
  )
}
