const PIPELINE_ENABLE_DISMISSED_KEY = "pref_chat_pipeline_enable_dismissed"
const PIPELINE_USED_KEY = "pref_chat_pipeline_used"

export function isPipelineEnableSuggestDismissed(): boolean {
  if (typeof window === "undefined") return true
  return localStorage.getItem(PIPELINE_ENABLE_DISMISSED_KEY) === "1"
}

export function dismissPipelineEnableSuggest(): void {
  if (typeof window === "undefined") return
  localStorage.setItem(PIPELINE_ENABLE_DISMISSED_KEY, "1")
}

export function markPipelineModeUsed(): void {
  if (typeof window === "undefined") return
  localStorage.setItem(PIPELINE_USED_KEY, "1")
}

export function hasUsedPipelineMode(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(PIPELINE_USED_KEY) === "1"
}
