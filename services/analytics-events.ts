import { apiClient } from "@/lib/api-client"

export type ProductEventName =
  | "app_open"
  | "login"
  | "logout"
  | "signup"
  | "conversation_created"
  | "message_sent"
  | "ai_response"
  | "regenerate"
  | "copy_response"
  | "thumbs_up"
  | "thumbs_down"
  | "feedback_submitted"
  | "report_response"
  | "search_used"
  | "image_generated"
  | "voice_started"
  | "voice_finished"
  | "file_uploaded"
  | "share_chat"
  | "export_chat"
  | "delete_chat"
  | "settings_changed"

export interface ProductEventRequest {
  event_id: string
  event_name: ProductEventName
  session_id: string
  timestamp?: string
  conversation_id?: string
  device?: string
  browser?: string
  operating_system?: string
  app_version?: string
  country?: string
  language?: string
  properties?: Record<string, unknown>
}

export const analyticsEventsService = {
  track(data: ProductEventRequest): Promise<{ status: string }> {
    return apiClient
      .post("/v1/events", {
        ...data,
        timestamp: data.timestamp || new Date().toISOString(),
      })
      .then((res) => res.data)
      .catch(() => ({ status: "skipped" }))
  },
}
