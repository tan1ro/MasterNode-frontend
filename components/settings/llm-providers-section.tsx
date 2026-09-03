"use client"

import { Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LLM_PROVIDERS } from "@/constants/settings"
import { LlmProviderRow } from "./llm-provider-row"
import { SaveButton } from "./save-button"

interface LlmProvidersSectionProps {
  llmApiKeys: Record<string, string>
  showLlmApiKeys: Record<string, boolean>
  selectedModel: Record<string, string>
  saved: boolean
  onKeyChange: (providerId: string, value: string) => void
  onToggleVisibility: (providerId: string) => void
  onModelChange: (providerId: string, value: string) => void
  onCopy: (value: string) => void
  hasCopied: (text: string) => boolean
  onSave: () => void
}

export function LlmProvidersSection({
  llmApiKeys,
  showLlmApiKeys,
  selectedModel,
  saved,
  onKeyChange,
  onToggleVisibility,
  onModelChange,
  onCopy,
  hasCopied,
  onSave,
}: LlmProvidersSectionProps) {
  const configuredProviders = Object.values(llmApiKeys).filter(Boolean).length

  return (
    <Card variant="minimal" interactive={false} accent="violet">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-400" />
            <div>
              <CardTitle>LLM Providers</CardTitle>
              <CardDescription>
                Configure API keys for different LLM providers to power your agents
              </CardDescription>
            </div>
          </div>
          {configuredProviders > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-[11px] font-medium text-violet-400">
                {configuredProviders} configured
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {LLM_PROVIDERS.map((provider) => (
          <LlmProviderRow
            key={provider.id}
            provider={provider}
            apiKey={llmApiKeys[provider.id] || ""}
            isVisible={showLlmApiKeys[provider.id] || false}
            model={selectedModel[provider.id] || provider.models[0]}
            onKeyChange={(v) => onKeyChange(provider.id, v)}
            onToggleVisibility={() => onToggleVisibility(provider.id)}
            onModelChange={(v) => onModelChange(provider.id, v)}
            onCopy={onCopy}
            isCopied={hasCopied(llmApiKeys[provider.id] || "")}
          />
        ))}

        <div className="pt-3">
          <SaveButton
            onClick={onSave}
            disabled={saved}
            saved={saved}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  )
}
