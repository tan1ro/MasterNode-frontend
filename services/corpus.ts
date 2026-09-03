import { apiClient, buildAuthHeaders } from "@/lib/api-client"
import { getClientApiBaseUrl } from "@/lib/routes"

export interface CorpusStats {
  enabled: boolean
  pipeline_collection: boolean
  total: number
  slm: number
  llm: number
  chat_turns: number
  pipeline_turns: number
  ready_for_slm_export: boolean
  ready_for_llm_export: boolean
}

export const corpusService = {
  getStats: (): Promise<CorpusStats> =>
    apiClient.get<CorpusStats>("/v1/corpus/stats").then((res) => res.data),

  async downloadExport(options?: {
    tier?: "slm" | "llm"
    source?: "chat" | "pipeline"
    limit?: number
  }): Promise<void> {
    const params = new URLSearchParams()
    if (options?.tier) params.set("tier", options.tier)
    if (options?.source) params.set("source", options.source)
    if (options?.limit) params.set("limit", String(options.limit))
    const qs = params.toString()
    const url = `${getClientApiBaseUrl()}/v1/corpus/export${qs ? `?${qs}` : ""}`
    const headers = await buildAuthHeaders()
    const res = await fetch(url, { headers })
    if (!res.ok) throw new Error(`Export failed (${res.status})`)
    const blob = await res.blob()
    const tier = options?.tier ?? "all"
    const objectUrl = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = objectUrl
    anchor.download = `masternode-corpus-${tier}.jsonl`
    anchor.click()
    URL.revokeObjectURL(objectUrl)
  },
}
