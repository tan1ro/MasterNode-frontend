import { apiClient } from "@/lib/api-client"
import type {
  BugReportRequest,
  BugReportResponse,
  SupportChatRequest,
  SupportChatResponse,
} from "@/types/api"

/** Send a support chat message. Uses authenticated or public endpoint based on API key. */
export const supportService = {
  chat: (
    data: SupportChatRequest,
    options?: { usePublic?: boolean }
  ): Promise<SupportChatResponse> => {
    const endpoint = options?.usePublic ? "/v1/support/chat/public" : "/v1/support/chat"
    return apiClient.post<SupportChatResponse>(endpoint, data).then((res) => res.data)
  },

  reportBug: (
    data: BugReportRequest,
    options?: { usePublic?: boolean }
  ): Promise<BugReportResponse> => {
    const endpoint = options?.usePublic
      ? "/v1/support/bug-report/public"
      : "/v1/support/bug-report"
    return apiClient.post<BugReportResponse>(endpoint, data).then((res) => res.data)
  },
}
