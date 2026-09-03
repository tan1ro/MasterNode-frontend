"use client"

import { Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import {
  LLM_PROVIDERS,
  MAX_TOKENS_PRESETS,
  PREFERRED_PROVIDER_OPTIONS,
  TEMPERATURE_MAX,
  TEMPERATURE_MIN,
  TEMPERATURE_STEP,
} from "@/constants/settings"

interface LlmDefaultsSectionProps {
  defaultPreferredProvider: string
  defaultTemperature: number
  defaultMaxTokens: string
  onProviderChange: (value: string) => void
  onTemperatureChange: (value: number) => void
  onMaxTokensChange: (value: string) => void
}

export function LlmDefaultsSection({
  defaultPreferredProvider,
  defaultTemperature,
  defaultMaxTokens,
  onProviderChange,
  onTemperatureChange,
  onMaxTokensChange,
}: LlmDefaultsSectionProps) {
  const selectedProvider = LLM_PROVIDERS.find((p) => p.id === defaultPreferredProvider)

  return (
    <Card variant="minimal" interactive={false} id="llm-defaults" accent="violet" className="scroll-mt-24">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-400" />
          <div>
            <CardTitle>LLM defaults</CardTitle>
            <CardDescription>
              Default provider for new tasks and chat pipelines. Temperature and max tokens are included in pipeline
              task context when supported. Keys and models are configured on API Keys.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="defaultProvider">Preferred provider</Label>
          <Select
            id="defaultProvider"
            value={defaultPreferredProvider}
            onChange={(e) => onProviderChange(e.target.value)}
            className="mt-1.5"
          >
            {PREFERRED_PROVIDER_OPTIONS.map((opt) => (
              <option key={opt.value || "auto"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            {defaultPreferredProvider
              ? `Tasks will request ${selectedProvider?.name ?? defaultPreferredProvider} when the API supports preferred_provider.`
              : "Auto picks the first provider that has both a key and model saved on API Keys."}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 border-t border-border/50 pt-4">
          <div>
            <Label htmlFor="defaultTemperature">
              Default temperature ({defaultTemperature.toFixed(1)})
            </Label>
            <input
              id="defaultTemperature"
              type="range"
              min={TEMPERATURE_MIN}
              max={TEMPERATURE_MAX}
              step={TEMPERATURE_STEP}
              value={defaultTemperature}
              onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
              className="mt-2 w-full accent-violet-500"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Planning default for templates and demos (0 = deterministic, 2 = creative).
            </p>
          </div>
          <div>
            <Label htmlFor="defaultMaxTokens">Default max output tokens</Label>
            <Select
              id="defaultMaxTokens"
              value={defaultMaxTokens}
              onChange={(e) => onMaxTokensChange(e.target.value)}
              className="mt-1.5"
            >
              {MAX_TOKENS_PRESETS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
            <p className="text-xs text-muted-foreground mt-1">Reference budget when estimating run cost.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
