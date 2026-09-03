import type { ThinkingMode } from "@/types/api"

export interface LLMProvider {
  id: string
  name: string
  description: string
  apiKeyName: string
  apiKeyPlaceholder: string
  docsUrl: string
  models: string[]
}

export const LLM_PROVIDERS: LLMProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    description: "ChatGPT, GPT-4, GPT-3.5",
    apiKeyName: "OPENAI_API_KEY",
    apiKeyPlaceholder: "sk-...",
    docsUrl: "https://platform.openai.com/api-keys",
    models: ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo", "gpt-4o", "gpt-4o-mini"],
  },
  {
    id: "google",
    name: "Google (Gemini)",
    description: "Gemini 3.x, Gemini 1.5",
    apiKeyName: "GEMINI_API_KEY",
    apiKeyPlaceholder: "AIza...",
    docsUrl: "https://makersuite.google.com/app/apikey",
    models: [
      "gemini-3-flash-preview",
      "gemini-1.5-pro",
      "gemini-1.5-flash",
      "gemini-pro",
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic (Claude)",
    description: "Claude 3.5 Sonnet/Haiku",
    apiKeyName: "ANTHROPIC_API_KEY",
    apiKeyPlaceholder: "sk-ant-...",
    docsUrl: "https://console.anthropic.com/",
    models: [
      "claude-3-5-sonnet-20241022",
      "claude-3-5-haiku-20241022",
      "claude-3-opus",
      "claude-3-sonnet",
      "claude-3-haiku",
    ],
  },
  {
    id: "groq",
    name: "Groq",
    description: "Fast inference with Llama, Mixtral",
    apiKeyName: "GROQ_API_KEY",
    apiKeyPlaceholder: "gsk_...",
    docsUrl: "https://console.groq.com/keys",
    models: ["llama3-70b", "mixtral-8x7b", "gemma-7b"],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    description: "DeepSeek Chat, DeepSeek Coder",
    apiKeyName: "DEEPSEEK_API_KEY",
    apiKeyPlaceholder: "sk-...",
    docsUrl: "https://platform.deepseek.com/api_keys",
    models: ["deepseek-chat", "deepseek-coder", "deepseek-reasoner"],
  },
  {
    id: "mistral",
    name: "Mistral AI",
    description: "Mistral Large, Small, open models",
    apiKeyName: "MISTRAL_API_KEY",
    apiKeyPlaceholder: "...",
    docsUrl: "https://console.mistral.ai/api-keys/",
    models: [
      "mistral-large-latest",
      "mistral-small-latest",
      "open-mistral-7b",
      "open-mixtral-8x7b",
    ],
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    description: "Route to Claude/Gemini and many providers",
    apiKeyName: "OPENROUTER_API_KEY",
    apiKeyPlaceholder: "sk-or-...",
    docsUrl: "https://openrouter.ai/keys",
    models: ["anthropic/claude-3.5-sonnet:beta", "google/gemini-pro-1.5"],
  },
  {
    id: "cohere",
    name: "Cohere",
    description: "Command, Command Light",
    apiKeyName: "COHERE_API_KEY",
    apiKeyPlaceholder: "co_...",
    docsUrl: "https://dashboard.cohere.com/api-keys",
    models: ["command", "command-light", "command-nightly"],
  },
]

export const WEBHOOK_EVENTS = [
  "task_created",
  "task_started",
  "task_completed",
  "task_failed",
  "agent_completed",
] as const

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number]

export const PARALLEL_AGENT_OPTIONS = [1, 2, 3, 4, 5, 8, 10, 16, 32, 60] as const

export const REFRESH_INTERVAL_OPTIONS = [
  { value: "5", label: "5 seconds" },
  { value: "10", label: "10 seconds" },
  { value: "15", label: "15 seconds" },
  { value: "30", label: "30 seconds" },
  { value: "60", label: "1 minute" },
  { value: "0", label: "Manual only" },
] as const

export const DEFAULT_EXECUTION_MODE_OPTIONS = [
  { value: "parallel", label: "Parallel pipeline" },
  { value: "sequential", label: "Sequential" },
] as const

export const PREFERRED_PROVIDER_OPTIONS = [
  { value: "", label: "Auto (first configured key)" },
  ...LLM_PROVIDERS.map((p) => ({ value: p.id, label: p.name })),
] as const

export const CITATION_MODE_OPTIONS = [
  { value: "required", label: "Citations required" },
  { value: "optional", label: "Citations optional" },
  { value: "off", label: "No citations" },
] as const

export const FRESHNESS_MODE_OPTIONS = [
  { value: "latest", label: "Latest sources first" },
  { value: "balanced", label: "Balanced" },
  { value: "archive", label: "Archive / historical" },
] as const

export const THINKING_MODE_OPTIONS: { value: ThinkingMode; label: string; description: string }[] = [
  { value: "off", label: "Off", description: "Fastest replies; no extended reasoning." },
  { value: "standard", label: "Standard", description: "Balanced depth for most chats." },
  { value: "deep", label: "Deep", description: "More thorough reasoning when supported." },
]

export const CHAT_HISTORY_TURN_OPTIONS = [
  { value: "0", label: "Current message only" },
  { value: "4", label: "Last 4 turns" },
  { value: "6", label: "Last 6 turns (default)" },
  { value: "10", label: "Last 10 turns" },
  { value: "16", label: "Last 16 turns" },
] as const

export const THEME_OPTIONS = [
  { value: "system", label: "System" },
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
] as const

export const MAX_TOKENS_PRESETS = [
  { value: "2048", label: "2,048" },
  { value: "4096", label: "4,096" },
  { value: "8192", label: "8,192" },
  { value: "16384", label: "16,384" },
  { value: "32768", label: "32,768" },
] as const

export const TEMPERATURE_MIN = 0
export const TEMPERATURE_MAX = 2
export const TEMPERATURE_STEP = 0.1
