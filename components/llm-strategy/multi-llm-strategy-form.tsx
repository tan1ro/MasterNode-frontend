"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronUp, GitBranch, Plus, RotateCcw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { LLM_PROVIDERS } from "@/constants/settings"
import {
  MULTI_LLM_STRATEGY_STORAGE_KEY,
  type MultiLlmStrategyConfig,
  type RoutedModelEntry,
  createDefaultRoutingPriority,
  newRouteId,
  sanitizeMultiLlmStrategy,
} from "@/constants/llm-strategy"
import { ROUTES } from "@/lib/routes"
import { SaveButton } from "@/components/settings/save-button"

const STRATEGY_FIELDS: {
  key: keyof Pick<
    MultiLlmStrategyConfig,
    | "autoSelectByComplexity"
    | "fallbackOnFailure"
    | "loadBalanceAcrossProviders"
    | "costOptimizeSimpleTasks"
    | "semanticDedupCache"
  >
  title: string
  description: string
}[] = [
  {
    key: "autoSelectByComplexity",
    title: "Auto-select by task complexity",
    description: "Route harder subtasks to higher-capability models when estimation signals allow.",
  },
  {
    key: "fallbackOnFailure",
    title: "Fallback on provider failure",
    description: "If a call fails or times out, retry with the next route in the priority list.",
  },
  {
    key: "loadBalanceAcrossProviders",
    title: "Load balance across providers",
    description: "Spread eligible traffic across configured providers to reduce hot spots and rate limits.",
  },
  {
    key: "costOptimizeSimpleTasks",
    title: "Cost-optimize simple tasks",
    description: "Prefer cheaper / smaller models when complexity is low.",
  },
  {
    key: "semanticDedupCache",
    title: "Model-level semantic cache",
    description: "Deduplicate semantically similar prompts to avoid redundant model calls.",
  },
]

export function MultiLlmStrategyForm() {
  const [config, setConfig] = useState<MultiLlmStrategyConfig>(() =>
    sanitizeMultiLlmStrategy(undefined)
  )
  const [saved, setSaved] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(MULTI_LLM_STRATEGY_STORAGE_KEY)
      if (raw) {
        setConfig(sanitizeMultiLlmStrategy(JSON.parse(raw)))
      }
    } catch {
      setConfig(sanitizeMultiLlmStrategy(undefined))
    }
    setHydrated(true)
  }, [])

  const flashSaved = useCallback(() => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [])

  const persist = useCallback((next: MultiLlmStrategyConfig) => {
    setConfig(next)
    localStorage.setItem(MULTI_LLM_STRATEGY_STORAGE_KEY, JSON.stringify(next))
    flashSaved()
  }, [flashSaved])

  const handleSave = () => {
    persist(config)
  }

  const setFlag = (key: (typeof STRATEGY_FIELDS)[number]["key"], checked: boolean) => {
    setConfig((c) => ({ ...c, [key]: checked }))
  }

  const moveRoute = (index: number, dir: -1 | 1) => {
    const next = [...config.routingPriority]
    const j = index + dir
    if (j < 0 || j >= next.length) return
    ;[next[index], next[j]] = [next[j], next[index]]
    setConfig((c) => ({ ...c, routingPriority: next }))
  }

  const updateRoute = (index: number, patch: Partial<RoutedModelEntry>) => {
    setConfig((c) => {
      const list = [...c.routingPriority]
      const cur = list[index]
      if (!cur) return c
      const providerId = patch.providerId ?? cur.providerId
      const p = LLM_PROVIDERS.find((x) => x.id === providerId)
      if (!p) return c
      let modelId = cur.modelId
      if (patch.providerId !== undefined && patch.providerId !== cur.providerId) {
        modelId = p.models[0]
      } else if (patch.modelId !== undefined) {
        modelId = patch.modelId
      }
      if (!p.models.includes(modelId)) modelId = p.models[0]
      list[index] = { ...cur, providerId, modelId }
      return { ...c, routingPriority: list }
    })
  }

  const removeRoute = (index: number) => {
    if (config.routingPriority.length <= 1) return
    setConfig((c) => ({
      ...c,
      routingPriority: c.routingPriority.filter((_, i) => i !== index),
    }))
  }

  const addRoute = () => {
    const first = LLM_PROVIDERS[0]
    setConfig((c) => ({
      ...c,
      routingPriority: [
        ...c.routingPriority,
        {
          id: newRouteId(),
          providerId: first.id,
          modelId: first.models[0],
        },
      ],
    }))
  }

  const resetPriorityDefaults = () => {
    setConfig((c) => ({
      ...c,
      routingPriority: createDefaultRoutingPriority(),
    }))
  }

  if (!hydrated) {
    return (
      <div className="text-sm text-muted-foreground py-8" aria-hidden>
        Loading strategy…
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <Card accent="amber">
        <CardHeader>
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-amber" />
            <div>
              <CardTitle>Routing policy (local)</CardTitle>
              <CardDescription>
                Policy toggles you want the orchestrator to respect—saved in this browser only. Live runs still follow
                keys on{" "}
                <Link href={ROUTES.apiKeys} className="text-amber hover:underline">
                  API Keys
                </Link>{" "}
                and task or template model fields until this profile is wired to the API.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-xs text-muted-foreground border-l-2 border-amber/40 pl-3">
            These options describe how you want routing to behave when a client or service consumes this profile—they
            are not enforced by the stock backend on their own.
          </p>
          <div className="space-y-4">
            {STRATEGY_FIELDS.map(({ key, title, description }) => (
              <div
                key={key}
                className="flex gap-3 rounded-lg border border-border/80 bg-muted/20 p-4"
              >
                <Checkbox
                  id={key}
                  checked={config[key]}
                  onChange={(e) => setFlag(key, e.target.checked)}
                  className="mt-0.5"
                />
                <div className="space-y-1 min-w-0">
                  <Label htmlFor={key} className="text-base font-medium cursor-pointer">
                    {title}
                  </Label>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card accent="cyan">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <CardTitle>Preferred provider order</CardTitle>
              <CardDescription>
                #1 is your first choice when building a routing or fallback story on paper. Order is not pushed to the
                server automatically—it mirrors how you would like retries or hand-offs to work once integrated.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 border-cyan/30 text-cyan hover:bg-cyan/10"
              onClick={resetPriorityDefaults}
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Reset to defaults
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <ol className="space-y-2">
            {config.routingPriority.map((entry, index) => {
              const provider = LLM_PROVIDERS.find((p) => p.id === entry.providerId) ?? LLM_PROVIDERS[0]
              return (
                <li
                  key={entry.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-lg border border-border/80 bg-background/50 p-3"
                >
                  <span className="font-mono text-xs text-muted-foreground w-8 shrink-0">
                    #{index + 1}
                  </span>
                  <div className="flex flex-1 flex-col sm:flex-row gap-2 min-w-0">
                    <Select
                      value={provider.id}
                      onChange={(e) => updateRoute(index, { providerId: e.target.value })}
                      className="sm:max-w-[160px]"
                      aria-label={`Provider for route ${index + 1}`}
                    >
                      {LLM_PROVIDERS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </Select>
                    <Select
                      value={
                        provider.models.includes(entry.modelId)
                          ? entry.modelId
                          : provider.models[0]
                      }
                      onChange={(e) => updateRoute(index, { modelId: e.target.value })}
                      className="min-w-0 flex-1"
                      aria-label={`Model for route ${index + 1}`}
                    >
                      {provider.models.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 justify-end sm:justify-start">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      disabled={index === 0}
                      onClick={() => moveRoute(index, -1)}
                      aria-label="Move up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      disabled={index === config.routingPriority.length - 1}
                      onClick={() => moveRoute(index, 1)}
                      aria-label="Move down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-destructive hover:text-destructive"
                      disabled={config.routingPriority.length <= 1}
                      onClick={() => removeRoute(index)}
                      aria-label="Remove route"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              )
            })}
          </ol>
          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed"
            onClick={addRoute}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add route
          </Button>
        </CardContent>
      </Card>

      <SaveButton onClick={handleSave} disabled={false} saved={saved} className="w-full" />

      <p className="text-xs text-muted-foreground text-center leading-relaxed">
        <code className="text-[10px] bg-muted/50 px-1.5 py-0.5 rounded">{MULTI_LLM_STRATEGY_STORAGE_KEY}</code>
        <span className="block mt-1">Read this key from your own tooling if you want the same plan outside the app.</span>
      </p>
    </div>
  )
}
