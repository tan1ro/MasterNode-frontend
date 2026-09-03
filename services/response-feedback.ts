import { apiClient } from "@/lib/api-client"

export type ResponseFeedbackType = "positive" | "negative" | "report"

export type NegativeFeedbackReason =
  | "incorrect_information"
  | "didnt_follow_instructions"
  | "too_long"
  | "too_short"
  | "offensive"
  | "slow_response"
  | "style_or_tone"
  | "safety_or_legal"
  | "other"

export interface ResponseFeedbackRequest {
  conversation_id: string
  message_id: string
  feedback_type: ResponseFeedbackType
  reasons?: NegativeFeedbackReason[]
  comment?: string
  model?: string
  prompt_tokens?: number
  completion_tokens?: number
  latency?: number
  idempotency_key?: string
}

export interface ResponseFeedbackRecord {
  id: string
  conversation_id: string
  message_id: string
  feedback_type: ResponseFeedbackType
  reasons: string[]
  comment: string
  created_at: string
}

export const responseFeedbackService = {
  submit(data: ResponseFeedbackRequest): Promise<{ status: string; feedback: ResponseFeedbackRecord }> {
    return apiClient.post("/v1/chat/feedback", data).then((res) => res.data)
  },
}
