import { buildChatPreferencePromptSuffix, loadSettingsPreferences } from "@/lib/settings-preferences"
import type { StreamChatBody } from "@/services/chat"

/** Merge user chat prefs into a stream request body. */
export function withChatStreamPreferences(
  body: StreamChatBody,
  overrides?: { useMemory?: boolean }
): StreamChatBody {
  const prefs = loadSettingsPreferences()
  const suffix = buildChatPreferencePromptSuffix(prefs)
  const out: StreamChatBody = {
    ...body,
    skip_autoname: !prefs.autoNameConversations,
    custom_instructions: suffix || undefined,
  }
  if (overrides?.useMemory === false) {
    out.use_rag = false
    out.rag_sources = undefined
  } else if (overrides?.useMemory !== true && !prefs.memoryEnabled) {
    out.use_rag = false
    out.rag_sources = undefined
  }
  out.use_keyword_memory = prefs.keywordMemoryEnabled
  out.allow_training_data = prefs.allowTrainingData
  return out
}
