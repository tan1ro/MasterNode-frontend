import type { UseQueryOptions } from "@tanstack/react-query"

export const DEFAULT_QUERY_OPTIONS = {
  retry: false,
  refetchOnWindowFocus: false,
} as const satisfies Partial<UseQueryOptions>
