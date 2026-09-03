"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Route } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  MULTI_LLM_STRATEGY_STORAGE_KEY,
  type MultiLlmStrategyConfig,
  sanitizeMultiLlmStrategy,
} from "@/constants/llm-strategy"
import { ROUTES } from "@/lib/routes"
import { dispatchSettingsChanged } from "@/lib/settings-preferences"

const STRATEGY_TOGGLES: {
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
    title: "Auto-select by complexity",
    description: "Route harder subtasks to more capable models when signals allow.",
  },
  {
    key: "fallbackOnFailure",
    title: "Fallback on failure",
    description: "Try the next provider in your priority list after errors or timeouts.",
  },
  {
    key: "loadBalanceAcrossProviders",
    title: "Load balance",
    description: "Spread traffic across configured providers to reduce rate limits.",
  },
  {
    key: "costOptimizeSimpleTasks",
    title: "Cost-optimize simple tasks",
    description: "Prefer smaller models for low-complexity work.",
  },
  {
    key: "semanticDedupCache",
    title: "Semantic dedup cache",
    description: "Skip redundant calls for near-duplicate prompts.",
  },
]

export function LlmRoutingSection() {
  const [config, setConfig] = useState<MultiLlmStrategyConfig>(() => sanitizeMultiLlmStrategy(undefined))

  useEffect(() => {
    try {
      const raw = localStorage.getItem(MULTI_LLM_STRATEGY_STORAGE_KEY)
      if (raw) setConfig(sanitizeMultiLlmStrategy(JSON.parse(raw)))
    } catch {
      setConfig(sanitizeMultiLlmStrategy(undefined))
    }
  }, [])

  const persist = useCallback((next: MultiLlmStrategyConfig) => {
    setConfig(next)
    localStorage.setItem(MULTI_LLM_STRATEGY_STORAGE_KEY, JSON.stringify(next))
    dispatchSettingsChanged()
  }, [])

  const setFlag = (key: (typeof STRATEGY_TOGGLES)[number]["key"], checked: boolean) => {
    persist({ ...config, [key]: checked })
  }

  return (
    <Card variant="minimal" interactive={false} id="llm-routing" accent="violet" className="scroll-mt-24">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Route className="h-5 w-5 text-violet-400" />
            <div>
              <CardTitle>LLM routing policy</CardTitle>
              <CardDescription>
                High-level routing toggles saved in this browser. Edit full priority order on{" "}
                <Link href={ROUTES.llmStrategy} className="text-amber hover:underline">
                  LLM Strategy
                </Link>
                .
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-2">
          {STRATEGY_TOGGLES.map(({ key, title, description }) => (
            <li key={key}>
              <label className="flex items-start gap-3 cursor-pointer rounded-md border border-border/60 bg-muted/10 p-3">
                <Checkbox
                  checked={config[key]}
                  onChange={(e) => setFlag(key, e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  <span className="text-sm font-medium text-foreground block">{title}</span>
                  <span className="text-xs text-muted-foreground">{description}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
        <Link
          href={ROUTES.llmStrategy}
          className="inline-flex h-8 items-center rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-muted"
        >
          Open full routing editor
        </Link>
      </CardContent>
    </Card>
  )
}
