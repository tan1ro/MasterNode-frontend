"use client"

import { useQuery } from "@tanstack/react-query"
import { corpusService } from "@/services/corpus"

const CORPUS_STATS_KEY = ["corpus", "stats"] as const

export function useCorpusStats(enabled = true) {
  return useQuery({
    queryKey: CORPUS_STATS_KEY,
    queryFn: () => corpusService.getStats(),
    enabled,
    staleTime: 30_000,
  })
}
