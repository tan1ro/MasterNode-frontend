"use client"

import { Check, Copy, Eye, EyeOff, ExternalLink } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { LLMProvider } from "@/constants/settings"

interface LlmProviderRowProps {
  provider: LLMProvider
  apiKey: string
  isVisible: boolean
  model: string
  onKeyChange: (value: string) => void
  onToggleVisibility: () => void
  onModelChange: (value: string) => void
  onCopy: (value: string) => void
  isCopied: boolean
}

export function LlmProviderRow({
  provider,
  apiKey,
  isVisible,
  model,
  onKeyChange,
  onToggleVisibility,
  onModelChange,
  onCopy,
  isCopied,
}: LlmProviderRowProps) {
  const hasKey = !!apiKey

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border transition-all duration-200",
        hasKey
          ? "border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10"
          : "border-border/50 hover:bg-accent/50"
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-medium text-sm">{provider.name}</span>
          {hasKey && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Check className="h-2.5 w-2.5" />
              Configured
            </span>
          )}
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {provider.description}
          </span>
        </div>
        <div className="relative">
          <Input
            type={isVisible ? "text" : "password"}
            placeholder={provider.apiKeyPlaceholder || "Enter API key"}
            value={apiKey}
            onChange={(e) => onKeyChange(e.target.value)}
            className="h-9 pr-16 text-sm"
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            {apiKey && (
              <button
                type="button"
                onClick={() => onCopy(apiKey)}
                className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                title="Copy"
              >
                {isCopied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            )}
            <button
              type="button"
              onClick={onToggleVisibility}
              className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
              title="Toggle visibility"
            >
              {isVisible ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Select
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
          className="w-40 h-9 text-sm"
          disabled={!hasKey}
        >
          {provider.models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </Select>
        <a
          href={provider.docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-9 h-9 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Get API key"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  )
}
