/** Browser-local preference keys used by Settings and task/chat defaults. */

import { LLM_PROVIDERS } from "@/constants/settings"
import {
  responseLanguageLabel,
  type DateFormatPref,
  type FontSizePref,
  type RetentionPeriodPref,
  type TimeFormatPref,
} from "@/constants/user-settings"
import {
  CHAT_PIPELINE_EXECUTION_MODE,
  CHAT_PIPELINE_HUMAN_IN_LOOP,
  resolveSessionPlanMaxParallelAgents,
} from "@/lib/pipeline-task-defaults"
import type { CreateTaskRequest } from "@/types/api"
import type { ThinkingMode } from "@/types/api"

function canUseLocalStorage(): boolean {
  try {
    return typeof window !== "undefined" && typeof localStorage?.getItem === "function"
  } catch {
    return false
  }
}

export const SETTINGS_PREF_KEYS = {
  maxParallelAgents: "pref_max_parallel_agents",
  refreshInterval: "pref_refresh_interval",
  defaultUseRag: "pref_default_use_rag",
  defaultExecutionMode: "pref_default_execution_mode",
  pipelineTemplateIds: "pref_pipeline_template_ids",
  webhookUrl: "pref_webhook_url",
  webhookEvents: "pref_webhook_events",
  defaultPreferredProvider: "pref_default_preferred_provider",
  defaultHumanInLoop: "pref_default_human_in_loop",
  citationMode: "pref_citation_mode",
  freshnessMode: "pref_freshness_mode",
  defaultTemperature: "pref_default_temperature",
  defaultMaxTokens: "pref_default_max_tokens",
  chatThinkingMode: "pref_chat_thinking_mode",
  chatConfirmBeforePipeline: "pref_chat_confirm_before_pipeline",
  chatStreamResponses: "pref_chat_stream_responses",
  chatHistoryTurns: "pref_chat_history_turns",
  themePreference: "pref_theme",
  compactDensity: "pref_compact_density",
  showTokenCostHints: "pref_show_token_cost_hints",
  notifyOnTaskComplete: "pref_notify_task_complete",
  soundOnComplete: "pref_sound_on_complete",
  showPipelineActivityPanel: "pref_show_pipeline_activity",
  fontSize: "pref_font_size",
  sendOnEnter: "pref_send_on_enter",
  autoNameConversations: "pref_auto_name_conversations",
  renderMarkdown: "pref_render_markdown",
  syntaxHighlighting: "pref_syntax_highlighting",
  responseLanguage: "pref_response_language",
  customInstructions: "pref_custom_instructions",
  timezone: "pref_timezone",
  dateFormat: "pref_date_format",
  timeFormat: "pref_time_format",
  memoryEnabled: "pref_memory_enabled",
  keywordMemoryEnabled: "pref_keyword_memory_enabled",
  allowTrainingData: "pref_allow_training_data",
  retentionPeriodDays: "pref_retention_period_days",
  lastSeenChangelogVersion: "pref_last_seen_changelog_version",
  displayName: "pref_display_name",
  avatarDataUrl: "pref_avatar_data_url",
  trustedContactEmail: "pref_trusted_contact_email",
  trustedContactPhone: "pref_trusted_contact_phone",
  crisisNotifyEnabled: "pref_crisis_notify_enabled",
  parentalControlsEnabled: "pref_parental_controls_enabled",
  guardianEmail: "pref_guardian_email",
} as const

export type DefaultExecutionMode = "parallel" | "sequential"
export type CitationMode = "required" | "optional" | "off"
export type FreshnessMode = "latest" | "balanced" | "archive"
export type ThemePreference = "system" | "light" | "dark"

export interface SettingsPreferences {
  maxParallelAgents: string
  refreshInterval: string
  defaultUseRag: boolean
  defaultExecutionMode: DefaultExecutionMode
  templateIds: Record<string, string>
  webhookUrl: string
  webhookEvents: string[]
  defaultPreferredProvider: string
  defaultHumanInLoop: boolean
  citationMode: CitationMode
  freshnessMode: FreshnessMode
  defaultTemperature: number
  defaultMaxTokens: string
  chatThinkingMode: ThinkingMode
  chatConfirmBeforePipeline: boolean
  chatStreamResponses: boolean
  chatHistoryTurns: string
  themePreference: ThemePreference
  compactDensity: boolean
  showTokenCostHints: boolean
  notifyOnTaskComplete: boolean
  soundOnComplete: boolean
  showPipelineActivityPanel: boolean
  fontSize: FontSizePref
  sendOnEnter: boolean
  autoNameConversations: boolean
  renderMarkdown: boolean
  syntaxHighlighting: boolean
  responseLanguage: string
  customInstructions: string
  timezone: string
  dateFormat: DateFormatPref
  timeFormat: TimeFormatPref
  memoryEnabled: boolean
  /** When true, chat may retrieve/remember keyword Memory OS facts. */
  keywordMemoryEnabled: boolean
  allowTrainingData: boolean
  retentionPeriodDays: RetentionPeriodPref
  lastSeenChangelogVersion: string
  displayName: string
  avatarDataUrl: string
  trustedContactEmail: string
  trustedContactPhone: string
  crisisNotifyEnabled: boolean
  parentalControlsEnabled: boolean
  guardianEmail: string
}

export const DEFAULT_SETTINGS_PREFERENCES: SettingsPreferences = {
  maxParallelAgents: "3",
  refreshInterval: "10",
  defaultUseRag: false,
  defaultExecutionMode: "parallel",
  templateIds: {},
  webhookUrl: "",
  webhookEvents: [],
  defaultPreferredProvider: "",
  defaultHumanInLoop: true,
  citationMode: "required",
  freshnessMode: "balanced",
  defaultTemperature: 0.7,
  defaultMaxTokens: "8192",
  chatThinkingMode: "standard",
  chatConfirmBeforePipeline: true,
  chatStreamResponses: true,
  chatHistoryTurns: "6",
  themePreference: "dark",
  compactDensity: false,
  showTokenCostHints: true,
  notifyOnTaskComplete: false,
  soundOnComplete: false,
  showPipelineActivityPanel: true,
  fontSize: "md",
  sendOnEnter: true,
  autoNameConversations: true,
  renderMarkdown: true,
  syntaxHighlighting: true,
  responseLanguage: "",
  customInstructions: "",
  timezone: "",
  dateFormat: "dmy",
  timeFormat: "12h",
  memoryEnabled: true,
  keywordMemoryEnabled: true,
  allowTrainingData: true,
  retentionPeriodDays: "forever",
  lastSeenChangelogVersion: "",
  displayName: "",
  avatarDataUrl: "",
  trustedContactEmail: "",
  trustedContactPhone: "",
  crisisNotifyEnabled: false,
  parentalControlsEnabled: false,
  guardianEmail: "",
}

export function dispatchSettingsChanged(): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event("masternode-settings-changed"))
}

export function settingsPreferencesEqual(
  a: SettingsPreferences,
  b: SettingsPreferences
): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

/** Merge server preferences over local defaults (local wins for avatarDataUrl). */
export function mergeServerPreferences(
  local: SettingsPreferences,
  server: Partial<SettingsPreferences> | Record<string, unknown> | null | undefined
): SettingsPreferences {
  if (!server || typeof server !== "object") return local
  const next: SettingsPreferences = { ...local }
  for (const key of Object.keys(DEFAULT_SETTINGS_PREFERENCES) as (keyof SettingsPreferences)[]) {
    if (key === "avatarDataUrl") continue
    if (key in server && server[key as string] !== undefined && server[key as string] !== null) {
      ;(next as Record<string, unknown>)[key] = server[key as string]
    }
  }
  next.themePreference = "dark"
  return next
}

/** Strip fields that should stay browser-local only. */
export function preferencesForServerSync(prefs: SettingsPreferences): Record<string, unknown> {
  const { avatarDataUrl: _avatar, ...rest } = prefs
  return { ...rest, themePreference: "dark" }
}

function readBool(raw: string | null, fallback: boolean): boolean {
  if (raw === "1" || raw === "true") return true
  if (raw === "0" || raw === "false") return false
  return fallback
}

function readNumber(raw: string | null, fallback: number, min: number, max: number): number {
  const n = parseFloat(raw || "")
  if (Number.isNaN(n)) return fallback
  return Math.min(Math.max(n, min), max)
}

function readCitationMode(raw: string | null): CitationMode {
  if (raw === "optional" || raw === "off" || raw === "required") return raw
  return DEFAULT_SETTINGS_PREFERENCES.citationMode
}

function readFreshnessMode(raw: string | null): FreshnessMode {
  if (raw === "latest" || raw === "archive" || raw === "balanced") return raw
  return DEFAULT_SETTINGS_PREFERENCES.freshnessMode
}

function readThinkingMode(raw: string | null): ThinkingMode {
  if (raw === "off" || raw === "deep" || raw === "standard") return raw
  return DEFAULT_SETTINGS_PREFERENCES.chatThinkingMode
}

function readTheme(_raw: string | null): ThemePreference {
  return "dark"
}

function readFontSize(raw: string | null): FontSizePref {
  if (raw === "sm" || raw === "md" || raw === "lg" || raw === "xl") return raw
  return DEFAULT_SETTINGS_PREFERENCES.fontSize
}

function readDateFormat(raw: string | null): DateFormatPref {
  if (raw === "dmy" || raw === "mdy" || raw === "ymd") return raw
  return DEFAULT_SETTINGS_PREFERENCES.dateFormat
}

function readTimeFormat(raw: string | null): TimeFormatPref {
  if (raw === "12h" || raw === "24h") return raw
  return DEFAULT_SETTINGS_PREFERENCES.timeFormat
}

function readRetentionPeriod(raw: string | null): RetentionPeriodPref {
  if (raw === "30" || raw === "90" || raw === "365" || raw === "forever") return raw
  return DEFAULT_SETTINGS_PREFERENCES.retentionPeriodDays
}

export function loadSettingsPreferences(): SettingsPreferences {
  if (!canUseLocalStorage()) return { ...DEFAULT_SETTINGS_PREFERENCES }

  const d = DEFAULT_SETTINGS_PREFERENCES

  let templateIds: Record<string, string> = {}
  try {
    const rawTemplateIds = localStorage.getItem(SETTINGS_PREF_KEYS.pipelineTemplateIds)
    const parsed = rawTemplateIds ? (JSON.parse(rawTemplateIds) as Record<string, string>) : {}
    templateIds = parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    templateIds = {}
  }

  let webhookEvents: string[] = []
  try {
    const rawEvents = localStorage.getItem(SETTINGS_PREF_KEYS.webhookEvents)
    const parsed = rawEvents ? (JSON.parse(rawEvents) as string[]) : []
    webhookEvents = Array.isArray(parsed) ? parsed.filter(Boolean) : []
  } catch {
    webhookEvents = []
  }

  const ex = localStorage.getItem(SETTINGS_PREF_KEYS.defaultExecutionMode)

  return {
    maxParallelAgents: localStorage.getItem(SETTINGS_PREF_KEYS.maxParallelAgents) || d.maxParallelAgents,
    refreshInterval: localStorage.getItem(SETTINGS_PREF_KEYS.refreshInterval) || d.refreshInterval,
    defaultUseRag: readBool(localStorage.getItem(SETTINGS_PREF_KEYS.defaultUseRag), d.defaultUseRag),
    defaultExecutionMode: ex === "sequential" ? "sequential" : d.defaultExecutionMode,
    templateIds,
    webhookUrl: localStorage.getItem(SETTINGS_PREF_KEYS.webhookUrl) || "",
    webhookEvents,
    defaultPreferredProvider: localStorage.getItem(SETTINGS_PREF_KEYS.defaultPreferredProvider) || "",
    defaultHumanInLoop: readBool(localStorage.getItem(SETTINGS_PREF_KEYS.defaultHumanInLoop), d.defaultHumanInLoop),
    citationMode: readCitationMode(localStorage.getItem(SETTINGS_PREF_KEYS.citationMode)),
    freshnessMode: readFreshnessMode(localStorage.getItem(SETTINGS_PREF_KEYS.freshnessMode)),
    defaultTemperature: readNumber(
      localStorage.getItem(SETTINGS_PREF_KEYS.defaultTemperature),
      d.defaultTemperature,
      0,
      2
    ),
    defaultMaxTokens: localStorage.getItem(SETTINGS_PREF_KEYS.defaultMaxTokens) || d.defaultMaxTokens,
    chatThinkingMode: readThinkingMode(localStorage.getItem(SETTINGS_PREF_KEYS.chatThinkingMode)),
    chatConfirmBeforePipeline: readBool(
      localStorage.getItem(SETTINGS_PREF_KEYS.chatConfirmBeforePipeline),
      d.chatConfirmBeforePipeline
    ),
    chatStreamResponses: readBool(
      localStorage.getItem(SETTINGS_PREF_KEYS.chatStreamResponses),
      d.chatStreamResponses
    ),
    chatHistoryTurns: localStorage.getItem(SETTINGS_PREF_KEYS.chatHistoryTurns) || d.chatHistoryTurns,
    themePreference: readTheme(localStorage.getItem(SETTINGS_PREF_KEYS.themePreference)),
    compactDensity: readBool(localStorage.getItem(SETTINGS_PREF_KEYS.compactDensity), d.compactDensity),
    showTokenCostHints: readBool(localStorage.getItem(SETTINGS_PREF_KEYS.showTokenCostHints), d.showTokenCostHints),
    notifyOnTaskComplete: readBool(
      localStorage.getItem(SETTINGS_PREF_KEYS.notifyOnTaskComplete),
      d.notifyOnTaskComplete
    ),
    soundOnComplete: readBool(localStorage.getItem(SETTINGS_PREF_KEYS.soundOnComplete), d.soundOnComplete),
    showPipelineActivityPanel: readBool(
      localStorage.getItem(SETTINGS_PREF_KEYS.showPipelineActivityPanel),
      d.showPipelineActivityPanel
    ),
    fontSize: readFontSize(localStorage.getItem(SETTINGS_PREF_KEYS.fontSize)),
    sendOnEnter: readBool(localStorage.getItem(SETTINGS_PREF_KEYS.sendOnEnter), d.sendOnEnter),
    autoNameConversations: readBool(
      localStorage.getItem(SETTINGS_PREF_KEYS.autoNameConversations),
      d.autoNameConversations
    ),
    renderMarkdown: readBool(localStorage.getItem(SETTINGS_PREF_KEYS.renderMarkdown), d.renderMarkdown),
    syntaxHighlighting: readBool(
      localStorage.getItem(SETTINGS_PREF_KEYS.syntaxHighlighting),
      d.syntaxHighlighting
    ),
    responseLanguage: localStorage.getItem(SETTINGS_PREF_KEYS.responseLanguage) || "",
    customInstructions: localStorage.getItem(SETTINGS_PREF_KEYS.customInstructions) || "",
    timezone: localStorage.getItem(SETTINGS_PREF_KEYS.timezone) || "",
    dateFormat: readDateFormat(localStorage.getItem(SETTINGS_PREF_KEYS.dateFormat)),
    timeFormat: readTimeFormat(localStorage.getItem(SETTINGS_PREF_KEYS.timeFormat)),
    memoryEnabled: readBool(localStorage.getItem(SETTINGS_PREF_KEYS.memoryEnabled), d.memoryEnabled),
    keywordMemoryEnabled: readBool(
      localStorage.getItem(SETTINGS_PREF_KEYS.keywordMemoryEnabled),
      d.keywordMemoryEnabled
    ),
    allowTrainingData: readBool(
      localStorage.getItem(SETTINGS_PREF_KEYS.allowTrainingData),
      d.allowTrainingData
    ),
    retentionPeriodDays: readRetentionPeriod(
      localStorage.getItem(SETTINGS_PREF_KEYS.retentionPeriodDays)
    ),
    lastSeenChangelogVersion:
      localStorage.getItem(SETTINGS_PREF_KEYS.lastSeenChangelogVersion) || "",
    displayName: localStorage.getItem(SETTINGS_PREF_KEYS.displayName) || "",
    avatarDataUrl: localStorage.getItem(SETTINGS_PREF_KEYS.avatarDataUrl) || "",
    trustedContactEmail: localStorage.getItem(SETTINGS_PREF_KEYS.trustedContactEmail) || "",
    trustedContactPhone: localStorage.getItem(SETTINGS_PREF_KEYS.trustedContactPhone) || "",
    crisisNotifyEnabled: readBool(
      localStorage.getItem(SETTINGS_PREF_KEYS.crisisNotifyEnabled),
      d.crisisNotifyEnabled
    ),
    parentalControlsEnabled: readBool(
      localStorage.getItem(SETTINGS_PREF_KEYS.parentalControlsEnabled),
      d.parentalControlsEnabled
    ),
    guardianEmail: localStorage.getItem(SETTINGS_PREF_KEYS.guardianEmail) || "",
  }
}

export function persistSettingsPreferences(prefs: SettingsPreferences): void {
  if (typeof window === "undefined") return
  localStorage.setItem(SETTINGS_PREF_KEYS.maxParallelAgents, prefs.maxParallelAgents)
  localStorage.setItem(SETTINGS_PREF_KEYS.refreshInterval, prefs.refreshInterval)
  localStorage.setItem(SETTINGS_PREF_KEYS.defaultUseRag, prefs.defaultUseRag ? "1" : "0")
  localStorage.setItem(SETTINGS_PREF_KEYS.defaultExecutionMode, prefs.defaultExecutionMode)
  localStorage.setItem(SETTINGS_PREF_KEYS.pipelineTemplateIds, JSON.stringify(prefs.templateIds))
  localStorage.setItem(SETTINGS_PREF_KEYS.webhookUrl, prefs.webhookUrl)
  localStorage.setItem(SETTINGS_PREF_KEYS.webhookEvents, JSON.stringify(prefs.webhookEvents))
  localStorage.setItem(SETTINGS_PREF_KEYS.defaultPreferredProvider, prefs.defaultPreferredProvider)
  localStorage.setItem(SETTINGS_PREF_KEYS.defaultHumanInLoop, prefs.defaultHumanInLoop ? "1" : "0")
  localStorage.setItem(SETTINGS_PREF_KEYS.citationMode, prefs.citationMode)
  localStorage.setItem(SETTINGS_PREF_KEYS.freshnessMode, prefs.freshnessMode)
  localStorage.setItem(SETTINGS_PREF_KEYS.defaultTemperature, String(prefs.defaultTemperature))
  localStorage.setItem(SETTINGS_PREF_KEYS.defaultMaxTokens, prefs.defaultMaxTokens)
  localStorage.setItem(SETTINGS_PREF_KEYS.chatThinkingMode, prefs.chatThinkingMode)
  localStorage.setItem(
    SETTINGS_PREF_KEYS.chatConfirmBeforePipeline,
    prefs.chatConfirmBeforePipeline ? "1" : "0"
  )
  localStorage.setItem(SETTINGS_PREF_KEYS.chatStreamResponses, prefs.chatStreamResponses ? "1" : "0")
  localStorage.setItem(SETTINGS_PREF_KEYS.chatHistoryTurns, prefs.chatHistoryTurns)
  localStorage.setItem(SETTINGS_PREF_KEYS.themePreference, "dark")
  localStorage.setItem(SETTINGS_PREF_KEYS.compactDensity, prefs.compactDensity ? "1" : "0")
  localStorage.setItem(SETTINGS_PREF_KEYS.showTokenCostHints, prefs.showTokenCostHints ? "1" : "0")
  localStorage.setItem(SETTINGS_PREF_KEYS.notifyOnTaskComplete, prefs.notifyOnTaskComplete ? "1" : "0")
  localStorage.setItem(SETTINGS_PREF_KEYS.soundOnComplete, prefs.soundOnComplete ? "1" : "0")
  localStorage.setItem(
    SETTINGS_PREF_KEYS.showPipelineActivityPanel,
    prefs.showPipelineActivityPanel ? "1" : "0"
  )
  localStorage.setItem(SETTINGS_PREF_KEYS.fontSize, prefs.fontSize)
  localStorage.setItem(SETTINGS_PREF_KEYS.sendOnEnter, prefs.sendOnEnter ? "1" : "0")
  localStorage.setItem(
    SETTINGS_PREF_KEYS.autoNameConversations,
    prefs.autoNameConversations ? "1" : "0"
  )
  localStorage.setItem(SETTINGS_PREF_KEYS.renderMarkdown, prefs.renderMarkdown ? "1" : "0")
  localStorage.setItem(SETTINGS_PREF_KEYS.syntaxHighlighting, prefs.syntaxHighlighting ? "1" : "0")
  localStorage.setItem(SETTINGS_PREF_KEYS.responseLanguage, prefs.responseLanguage)
  localStorage.setItem(SETTINGS_PREF_KEYS.customInstructions, prefs.customInstructions)
  localStorage.setItem(SETTINGS_PREF_KEYS.timezone, prefs.timezone)
  localStorage.setItem(SETTINGS_PREF_KEYS.dateFormat, prefs.dateFormat)
  localStorage.setItem(SETTINGS_PREF_KEYS.timeFormat, prefs.timeFormat)
  localStorage.setItem(SETTINGS_PREF_KEYS.memoryEnabled, prefs.memoryEnabled ? "1" : "0")
  localStorage.setItem(
    SETTINGS_PREF_KEYS.keywordMemoryEnabled,
    prefs.keywordMemoryEnabled ? "1" : "0"
  )
  localStorage.setItem(SETTINGS_PREF_KEYS.allowTrainingData, prefs.allowTrainingData ? "1" : "0")
  localStorage.setItem(SETTINGS_PREF_KEYS.retentionPeriodDays, prefs.retentionPeriodDays)
  localStorage.setItem(SETTINGS_PREF_KEYS.lastSeenChangelogVersion, prefs.lastSeenChangelogVersion)
  localStorage.setItem(SETTINGS_PREF_KEYS.displayName, prefs.displayName)
  localStorage.setItem(SETTINGS_PREF_KEYS.avatarDataUrl, prefs.avatarDataUrl)
  localStorage.setItem(SETTINGS_PREF_KEYS.trustedContactEmail, prefs.trustedContactEmail)
  localStorage.setItem(SETTINGS_PREF_KEYS.trustedContactPhone, prefs.trustedContactPhone)
  localStorage.setItem(SETTINGS_PREF_KEYS.crisisNotifyEnabled, prefs.crisisNotifyEnabled ? "1" : "0")
  localStorage.setItem(
    SETTINGS_PREF_KEYS.parentalControlsEnabled,
    prefs.parentalControlsEnabled ? "1" : "0"
  )
  localStorage.setItem(SETTINGS_PREF_KEYS.guardianEmail, prefs.guardianEmail)
  dispatchSettingsChanged()
}

/** Build optional system-prompt suffix from user prefs (language + custom instructions). */
export function buildChatPreferencePromptSuffix(prefs?: SettingsPreferences): string {
  const p = prefs ?? loadSettingsPreferences()
  const parts: string[] = []
  const lang = p.responseLanguage.trim()
  if (lang) {
    const label = responseLanguageLabel(lang)
    parts.push(`Always reply in ${label} unless the user explicitly asks for another language.`)
  }
  const instructions = p.customInstructions.trim()
  if (instructions) {
    parts.push(`User standing instructions:\n${instructions.slice(0, 1500)}`)
  }
  // Temperature / max tokens are API knobs — never inject them into task text.
  return parts.join("\n\n")
}

/**
 * Attach standing chat prefs to pipeline task text without overshadowing the user request.
 * User prompt stays first; prefs are an appendix the planner should ignore as the objective.
 */
export function appendPipelinePreferenceContext(
  taskText: string,
  prefs?: SettingsPreferences
): string {
  const suffix = buildChatPreferencePromptSuffix(prefs).trim()
  const body = taskText.trim()
  if (!suffix) return body
  if (!body) return suffix
  return `${body}\n\nStanding preferences (do not treat as the primary request):\n${suffix}`
}

export function persistWebhookPreferences(url: string, events: string[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(SETTINGS_PREF_KEYS.webhookUrl, url)
  localStorage.setItem(SETTINGS_PREF_KEYS.webhookEvents, JSON.stringify(events))
}

export function loadPipelineTemplateIds(): Record<string, string> {
  return loadSettingsPreferences().templateIds
}

export function parseMaxParallelAgents(raw: string | null, fallback = 3): number {
  const n = parseInt(raw || String(fallback), 10)
  if (Number.isNaN(n)) return fallback
  return Math.min(Math.max(n, 1), 64)
}

export function parseChatHistoryTurns(raw: string | null, fallback = 6): number {
  const n = parseInt(raw || String(fallback), 10)
  if (Number.isNaN(n) || n <= 0) return 0
  return Math.min(Math.max(n, 1), 32)
}

/** Backend failover order — prefer stable providers over free OpenRouter tiers. */
const PROVIDER_AUTODETECT_ORDER = [
  "mistral",
  "google",
  "openai",
  "anthropic",
  "groq",
  "deepseek",
  "openrouter",
  "cohere",
] as const

function mapProviderIdToPreferred(id: string): string {
  const normalized = id.trim().toLowerCase()
  if (normalized === "google") return "GEMINI"
  return normalized.toUpperCase()
}

/** Resolve provider from settings or first configured key in API Keys form cache. */
export function resolvePreferredProvider(prefs?: SettingsPreferences): string {
  const p = prefs ?? loadSettingsPreferences()
  if (p.defaultPreferredProvider.trim()) {
    return mapProviderIdToPreferred(p.defaultPreferredProvider)
  }
  if (typeof window === "undefined") return ""
  try {
    const rawModels = localStorage.getItem("selected_llm_models")
    const rawKeys = localStorage.getItem("llm_provider_keys")
    const modelMap = rawModels ? (JSON.parse(rawModels) as Record<string, string>) : {}
    const keyMap = rawKeys ? (JSON.parse(rawKeys) as Record<string, string>) : {}
    const byId = new Map(LLM_PROVIDERS.map((provider) => [provider.id, provider]))
    for (const id of PROVIDER_AUTODETECT_ORDER) {
      const provider = byId.get(id)
      if (!provider) continue
      if (String(keyMap?.[provider.id] || "").trim() && String(modelMap?.[provider.id] || "").trim()) {
        return mapProviderIdToPreferred(provider.id)
      }
    }
  } catch {
    return ""
  }
  return ""
}

export function buildCreateTaskDefaults(overrides?: Partial<CreateTaskRequest>): CreateTaskRequest {
  const prefs = loadSettingsPreferences()
  const templateIds = Object.fromEntries(
    Object.entries(prefs.templateIds).filter(([, v]) => String(v || "").trim())
  ) as Record<string, string>

  const fromChat = Boolean(String(overrides?.source_conversation_id || "").trim())

  const body: CreateTaskRequest = {
    task: overrides?.task ?? "",
    max_parallel_agents:
      overrides?.max_parallel_agents ?? resolveSessionPlanMaxParallelAgents(),
    use_rag: overrides?.use_rag ?? prefs.defaultUseRag,
    execution_mode: overrides?.execution_mode ?? CHAT_PIPELINE_EXECUTION_MODE,
    human_in_loop:
      overrides?.human_in_loop ??
      (fromChat ? CHAT_PIPELINE_HUMAN_IN_LOOP : prefs.defaultHumanInLoop),
    citation_mode: overrides?.citation_mode ?? prefs.citationMode,
    freshness_mode: overrides?.freshness_mode ?? prefs.freshnessMode,
  }

  const provider = resolvePreferredProvider(prefs)
  if (provider) body.preferred_provider = provider

  if (Object.keys(templateIds).length > 0) {
    body.template_ids = templateIds
  }

  return { ...body, ...overrides, task: overrides?.task ?? body.task }
}
