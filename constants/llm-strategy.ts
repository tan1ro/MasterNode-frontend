import { LLM_PROVIDERS, type LLMProvider } from "@/constants/settings"

/** One slot in the global routing priority list (provider + concrete model). */
export interface RoutedModelEntry {
  id: string
  providerId: string
  modelId: string
}

export interface MultiLlmStrategyConfig {
  /** Pick a higher-capability model when estimated task complexity is high. */
  autoSelectByComplexity: boolean
  /** Try the next route in priority order when a provider errors or times out. */
  fallbackOnFailure: boolean
  /** Spread requests across configured providers where policy allows. */
  loadBalanceAcrossProviders: boolean
  /** Prefer smaller / cheaper models for low-complexity subtasks. */
  costOptimizeSimpleTasks: boolean
  /** Reuse prior model outputs when inputs are semantically similar (dedup). */
  semanticDedupCache: boolean
  /** Lower index = tried first (when not overridden by complexity / cost rules). */
  routingPriority: RoutedModelEntry[]
}

export const MULTI_LLM_STRATEGY_STORAGE_KEY = "llm_multimodel_strategy_v1"

export const DEFAULT_MULTIMODEL_STRATEGY: MultiLlmStrategyConfig = {
  autoSelectByComplexity: true,
  fallbackOnFailure: true,
  loadBalanceAcrossProviders: true,
  costOptimizeSimpleTasks: true,
  semanticDedupCache: false,
  routingPriority: [],
}

function providerMap(): Map<string, LLMProvider> {
  return new Map(LLM_PROVIDERS.map((p) => [p.id, p]))
}

/** Default order: Mistral Large → Gemini → GPT-4o → OpenRouter (fallback only). */
export function createDefaultRoutingPriority(): RoutedModelEntry[] {
  const defaults: { providerId: string; modelId: string }[] = [
    { providerId: "mistral", modelId: "mistral-large-latest" },
    { providerId: "google", modelId: "gemini-3-flash-preview" },
    { providerId: "openai", modelId: "gpt-4o" },
    { providerId: "openrouter", modelId: "anthropic/claude-3.5-sonnet:beta" },
  ]
  const pmap = providerMap()
  const out: RoutedModelEntry[] = []
  for (let i = 0; i < defaults.length; i++) {
    const { providerId, modelId } = defaults[i]
    const p = pmap.get(providerId)
    if (!p) continue
    const m = p.models.includes(modelId) ? modelId : p.models[0]
    out.push({
      id: `default-route-${providerId}-${i}`,
      providerId,
      modelId: m,
    })
  }
  return out.length > 0 ? out : fallbackSingleRoute()
}

function fallbackSingleRoute(): RoutedModelEntry[] {
  const p = LLM_PROVIDERS[0]
  return [
    {
      id: "default-route-fallback-0",
      providerId: p.id,
      modelId: p.models[0],
    },
  ]
}

function coerceBoolean(v: unknown, fallback: boolean): boolean {
  return typeof v === "boolean" ? v : fallback
}

function sanitizeRoutingEntry(raw: unknown, index: number): RoutedModelEntry | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  const providerId = typeof o.providerId === "string" ? o.providerId : ""
  const modelId = typeof o.modelId === "string" ? o.modelId : ""
  const id =
    typeof o.id === "string" && o.id.length > 0 ? o.id : `route-${index}-${providerId}`
  const p = providerMap().get(providerId)
  if (!p) return null
  const model = p.models.includes(modelId) ? modelId : p.models[0]
  return { id, providerId, modelId: model }
}

/** Normalize config from localStorage or API against the current provider catalog. */
export function sanitizeMultiLlmStrategy(raw: unknown): MultiLlmStrategyConfig {
  const defaults = createDefaultRoutingPriority()
  if (!raw || typeof raw !== "object") {
    return {
      ...DEFAULT_MULTIMODEL_STRATEGY,
      routingPriority: defaults,
    }
  }
  const o = raw as Record<string, unknown>
  const routingIn = Array.isArray(o.routingPriority) ? o.routingPriority : []
  const routing: RoutedModelEntry[] = []
  for (let i = 0; i < routingIn.length; i++) {
    const entry = sanitizeRoutingEntry(routingIn[i], i)
    if (entry) routing.push(entry)
  }
  return {
    autoSelectByComplexity: coerceBoolean(o.autoSelectByComplexity, true),
    fallbackOnFailure: coerceBoolean(o.fallbackOnFailure, true),
    loadBalanceAcrossProviders: coerceBoolean(o.loadBalanceAcrossProviders, true),
    costOptimizeSimpleTasks: coerceBoolean(o.costOptimizeSimpleTasks, true),
    semanticDedupCache: coerceBoolean(o.semanticDedupCache, false),
    routingPriority: routing.length > 0 ? routing : defaults,
  }
}

export function newRouteId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `route-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
