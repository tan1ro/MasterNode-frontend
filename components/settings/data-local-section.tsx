"use client"

import { useState } from "react"
import { Database, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Callout } from "@/components/ui/callout"
import { clearAllStoredChats } from "@/lib/chat-storage"
import { MULTI_LLM_STRATEGY_STORAGE_KEY } from "@/constants/llm-strategy"
import { SETTINGS_PREF_KEYS, persistSettingsPreferences, DEFAULT_SETTINGS_PREFERENCES } from "@/lib/settings-preferences"
import { removeStoredApiKey } from "@/lib/storage"

export function DataLocalSection() {
  const [cleared, setCleared] = useState<string | null>(null)

  const flash = (label: string) => {
    setCleared(label)
    setTimeout(() => setCleared(null), 2500)
  }

  const clearChats = () => {
    if (!confirm("Delete all locally saved chat sessions? This cannot be undone.")) return
    clearAllStoredChats()
    flash("Chat history cleared")
  }

  const clearLlmStrategy = () => {
    if (!confirm("Remove saved LLM strategy JSON from this browser?")) return
    try {
      localStorage.removeItem(MULTI_LLM_STRATEGY_STORAGE_KEY)
      flash("LLM strategy cleared")
    } catch {
      /* ignore */
    }
  }

  const clearProviderFormCache = () => {
    if (!confirm("Clear saved provider keys and model picks from the API Keys page form (localStorage only)?")) return
    try {
      localStorage.removeItem("llm_provider_keys")
      localStorage.removeItem("selected_llm_models")
      flash("Provider form cache cleared")
    } catch {
      /* ignore */
    }
  }

  const resetAllPreferences = () => {
    if (
      !confirm(
        "Reset all Settings preferences on this browser to defaults? This does not delete server API keys or chat history."
      )
    )
      return
    try {
      persistSettingsPreferences(DEFAULT_SETTINGS_PREFERENCES)
      window.dispatchEvent(new Event("masternode-settings-changed"))
      flash("All preferences reset to defaults — reload the page if theme looks wrong")
    } catch {
      /* ignore */
    }
  }

  const clearWebhookPrefs = () => {
    if (!confirm("Clear saved webhook URL and event selections from this browser?")) return
    try {
      localStorage.removeItem(SETTINGS_PREF_KEYS.webhookUrl)
      localStorage.removeItem(SETTINGS_PREF_KEYS.webhookEvents)
      window.dispatchEvent(new Event("masternode-settings-changed"))
      flash("Webhook preferences cleared")
    } catch {
      /* ignore */
    }
  }

  const clearActiveApiKey = () => {
    if (
      !confirm(
        "Remove the active API key from this browser? You will need to paste or create a key again on the API Keys page."
      )
    )
      return
    removeStoredApiKey()
    window.dispatchEvent(new Event("masternode-settings-changed"))
    flash("Active API key removed from browser")
  }

  return (
    <Card variant="minimal" interactive={false} id="local-data" accent="destructive">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-red-400" />
          <div>
            <CardTitle>Local data & reset</CardTitle>
            <CardDescription>
              These actions only affect storage in <strong>this</strong> browser—not the server database.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Callout type="note" title="Before you clear">
          Export anything you need from Chat, Memory, or Tasks first. Clearing keys here does not revoke keys on the
          server.
        </Callout>
        <ul className="space-y-2">
          <li className="flex flex-col gap-2 rounded-lg border border-amber/30 bg-amber/5 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">All Settings preferences</p>
              <p className="text-xs text-muted-foreground">
                Restore task defaults, chat behavior, theme, and LLM options to factory defaults.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5 border-amber/40"
              onClick={resetAllPreferences}
            >
              Reset to defaults
            </Button>
          </li>
          <li className="flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/10 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Chat history</p>
              <p className="text-xs text-muted-foreground">All sessions under the chat sidebar storage key.</p>
            </div>
            <Button type="button" variant="outline" size="sm" className="shrink-0 gap-1.5 border-red-500/30 hover:bg-red-500/10" onClick={clearChats}>
              <Trash2 className="h-3.5 w-3.5" />
              Clear chats
            </Button>
          </li>
          <li className="flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/10 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">LLM strategy</p>
              <p className="text-xs text-muted-foreground">Routing playbook from the LLM Strategy page.</p>
            </div>
            <Button type="button" variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={clearLlmStrategy}>
              Clear strategy
            </Button>
          </li>
          <li className="flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/10 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">API Keys form cache</p>
              <p className="text-xs text-muted-foreground">Locally typed provider keys and model map (not server keys list).</p>
            </div>
            <Button type="button" variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={clearProviderFormCache}>
              Clear form cache
            </Button>
          </li>
          <li className="flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/10 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Webhook preferences</p>
              <p className="text-xs text-muted-foreground">Locally cached webhook URL and subscribed events.</p>
            </div>
            <Button type="button" variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={clearWebhookPrefs}>
              Clear webhook cache
            </Button>
          </li>
          <li className="flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/10 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Active API key in browser</p>
              <p className="text-xs text-muted-foreground">The key used for authenticated API calls from this app.</p>
            </div>
            <Button type="button" variant="outline" size="sm" className="shrink-0 gap-1.5 border-red-500/30 hover:bg-red-500/10" onClick={clearActiveApiKey}>
              Remove from browser
            </Button>
          </li>
        </ul>
        {cleared && (
          <p className="text-xs text-emerald-500" role="status">
            {cleared}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
