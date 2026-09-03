import axios from "axios"
import { getClientApiBaseUrl } from "@/lib/routes"
import { apiClient, buildAuthHeaders } from "@/lib/api-client"
import { consumeChatSseBuffer, flushChatSseBuffer } from "@/lib/chat-sse"
import { parseCreditQuotaDetail, type CreditQuotaExceededPayload } from "@/lib/chat-quota-error"
import { clearGuestToken, ensureGuestToken } from "@/lib/session-token"
import type {
  ChatAttachment,
  ChatConversation,
  ChatMessage,
  ChatModelInfo,
  ChatToolEvent,
  ThinkingMode,
} from "@/types/api"

export interface CreateConversationBody {
  title?: string
  model_id?: string
  thinking_mode?: ThinkingMode
  ghost_mode?: boolean
}

export interface SendChatMessageBody {
  role: "user" | "assistant" | "tool"
  content: string
  model_id?: string
  thinking_mode?: ThinkingMode
  tool_choice?: string
  metadata?: Record<string, unknown>
  attachments?: Array<{
    attachment_id: string
    filename: string
    mime_type?: string
    size_bytes?: number
  }>
}

export interface StreamChatBody {
  message: string
  model_id?: string
  thinking_mode?: ThinkingMode
  agent_template_id?: string
  /** Multiple attached assistants — merged on the server. */
  agent_template_ids?: string[]
  /** Unsaved assistant draft for preview (Assistants page). */
  inline_agent_template?: {
    template_id?: string
    name?: string
    description?: string
    agent_type?: string
    prompt_template?: string
    config?: Record<string, unknown>
    variables?: unknown[]
  }
  ghost_mode?: boolean
  session_history?: Array<{ role: "user" | "assistant"; content: string }>
  truncate_from_message_id?: string
  regenerate_assistant_message_id?: string
  use_rag?: boolean
  rag_sources?: string[]
  /** When false, skip keyword Memory OS retrieve/remember for this turn. */
  use_keyword_memory?: boolean
  tool_choice?: string
  attachments?: Array<{
    attachment_id: string
    filename: string
    mime_type?: string
    size_bytes?: number
  }>
  /** Browser IANA timezone (e.g. Asia/Kolkata) for local date/time/weather. */
  client_timezone?: string
  /** Browser GPS when the user allows location (where am I / weather here). */
  client_latitude?: number
  client_longitude?: number
  client_location_accuracy_m?: number
  /** When true, skip auto-generating conversation title from first message. */
  skip_autoname?: boolean
  /** ISO-639 response language hint for the assistant. */
  response_language?: string
  /** Standing user instructions appended to the system prompt. */
  custom_instructions?: string
  /** When true, server may store this turn for tenant model training (if enabled). */
  allow_training_data?: boolean
  user_message_metadata?: Record<string, unknown>
}

export interface GeneratedArtifact {
  filename: string
  mime_type: string
  base64: string
}

export const chatService = {
  listModels: async (): Promise<ChatModelInfo[]> => {
    const res = await apiClient.get<{ models: ChatModelInfo[] }>("/v1/chat/models")
    return res.data.models || []
  },

  listConversations: async (options?: {
    includeArchived?: boolean
    archivedOnly?: boolean
    limit?: number
  }): Promise<ChatConversation[]> => {
    const params: Record<string, boolean | number> = {
      limit: options?.limit ?? 50,
    }
    // Only send true flags — avoids bool query-param ambiguity (`false` as string).
    if (options?.archivedOnly) params.archived_only = true
    else if (options?.includeArchived) params.include_archived = true
    const res = await apiClient.get<{ conversations: ChatConversation[] }>("/v1/chat/conversations", {
      params,
    })
    const conversations = res.data.conversations || []
    if (options?.archivedOnly) {
      return conversations.filter((c) => c.archived === true)
    }
    if (!options?.includeArchived) {
      return conversations.filter((c) => c.archived !== true)
    }
    return conversations
  },

  createConversation: async (body?: CreateConversationBody): Promise<ChatConversation> => {
    const res = await apiClient.post<ChatConversation>("/v1/chat/conversations", body || {})
    return res.data
  },

  getConversation: async (
    conversationId: string
  ): Promise<{ conversation: ChatConversation; messages: ChatMessage[]; attachments: ChatAttachment[] }> => {
    const res = await apiClient.get<{
      conversation: ChatConversation
      messages: ChatMessage[]
      attachments: ChatAttachment[]
    }>(`/v1/chat/conversations/${conversationId}`)
    return res.data
  },

  patchConversation: async (
    conversationId: string,
    body: Partial<Pick<ChatConversation, "title" | "archived" | "model_id" | "thinking_mode">>
  ): Promise<ChatConversation> => {
    const res = await apiClient.patch<ChatConversation>(`/v1/chat/conversations/${conversationId}`, body)
    return res.data
  },

  deleteConversation: async (conversationId: string): Promise<void> => {
    await apiClient.delete(`/v1/chat/conversations/${conversationId}`)
  },

  createShare: async (
    conversationId: string,
    body?: { expires_in_days?: number }
  ): Promise<{
    share_id: string
    title?: string
    created_at?: string
    expires_at?: string | null
    path: string
  }> => {
    const res = await apiClient.post<{
      share_id: string
      title?: string
      created_at?: string
      expires_at?: string | null
      path: string
    }>(`/v1/chat/conversations/${conversationId}/share`, body || {})
    return res.data
  },

  getShare: async (
    shareId: string
  ): Promise<{
    share_id: string
    title: string
    messages: ChatMessage[]
    created_at: string
    expires_at?: string | null
  }> => {
    const res = await apiClient.get<{
      share_id: string
      title: string
      messages: ChatMessage[]
      created_at: string
      expires_at?: string | null
    }>(`/v1/chat/shares/${encodeURIComponent(shareId)}`)
    return res.data
  },

  revokeShare: async (shareId: string): Promise<void> => {
    await apiClient.delete(`/v1/chat/shares/${encodeURIComponent(shareId)}`)
  },

  uploadAttachment: async (conversationId: string, file: File): Promise<ChatAttachment> => {
    const form = new FormData()
    form.append("file", file)
    const res = await apiClient.post<ChatAttachment>(`/v1/chat/conversations/${conversationId}/attachments`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return res.data
  },

  fetchAttachmentBlob: async (
    conversationId: string,
    attachmentId: string
  ): Promise<Blob> => {
    try {
      const res = await apiClient.get<Blob>(
        `/v1/chat/conversations/${conversationId}/attachments/${attachmentId}/content`,
        { responseType: "blob" }
      )
      return res.data
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
        const contentType = String(error.response.headers?.["content-type"] ?? "")
        if (contentType.includes("application/json")) {
          try {
            const text = await error.response.data.text()
            const body = JSON.parse(text) as { detail?: unknown }
            if (typeof body.detail === "string" && body.detail.trim()) {
              throw new Error(body.detail.trim())
            }
          } catch (parseError) {
            if (parseError instanceof Error && parseError.message) {
              throw parseError
            }
          }
        }
      }
      throw error
    }
  },

  setActiveResponseVersion: async (
    conversationId: string,
    messageId: string,
    index: number
  ): Promise<ChatMessage> => {
    const res = await apiClient.patch<ChatMessage>(
      `/v1/chat/conversations/${conversationId}/messages/${messageId}/response-version`,
      { index }
    )
    return res.data
  },

  addMessage: async (
    conversationId: string,
    body: SendChatMessageBody
  ): Promise<
    ChatMessage & {
      moderation_blocked?: boolean
      moderation_message?: string
      policy_message?: ChatMessage
    }
  > => {
    const res = await apiClient.post<
      ChatMessage & {
        moderation_blocked?: boolean
        moderation_message?: string
        policy_message?: ChatMessage
      }
    >(`/v1/chat/conversations/${conversationId}/messages`, body)
    return res.data
  },

  streamReply: async (
    conversationId: string,
    body: StreamChatBody,
    handlers: {
      onToken: (delta: string) => void
      onDone: (payload: { message: ChatMessage; conversation_title?: string }) => void
      onError: (message: string) => void
      onAborted?: () => void
      onModerationBlocked?: (payload: {
        message: string
        categories?: string[]
        user_message?: ChatMessage
        policy_message?: ChatMessage
      }) => void
      onToolEvent?: (event: ChatToolEvent) => void
      onQuotaExceeded?: (payload: CreditQuotaExceededPayload) => void
    },
    options?: { signal?: AbortSignal }
  ): Promise<void> => {
    const dispatchSseEvent = (event: string, data: string) => {
      try {
        const payload = JSON.parse(data)
        if (event === "token") {
          const delta = String(payload.delta ?? "")
          if (delta) handlers.onToken(delta)
        } else if (event === "done") {
          handlers.onDone(payload)
        } else if (event === "moderation_blocked" && handlers.onModerationBlocked) {
          handlers.onModerationBlocked(payload)
        } else if (event === "error") {
          handlers.onError(String(payload.message || "Stream error"))
        } else if (event.startsWith("tool_call_") && handlers.onToolEvent) {
          handlers.onToolEvent(payload as ChatToolEvent)
        }
      } catch {
        // Ignore malformed JSON payloads.
      }
    }

    const postStream = async (retryGuest = false) => {
      if (retryGuest) clearGuestToken()
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(await buildAuthHeaders()),
      }
      if (retryGuest && !headers.Authorization) {
        headers.Authorization = `Bearer ${await ensureGuestToken()}`
      }
      return fetch(`${getClientApiBaseUrl()}/v1/chat/conversations/${conversationId}/stream`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: options?.signal,
      })
    }

    const finishAborted = () => {
      handlers.onAborted?.()
    }

    const isAbortError = (err: unknown) =>
      (err instanceof DOMException && err.name === "AbortError") ||
      (err instanceof Error && err.name === "AbortError") ||
      Boolean(options?.signal?.aborted)

    let resp: Response
    try {
      resp = await postStream(false)
      if (resp.status === 401) {
        resp = await postStream(true)
      }
    } catch (err) {
      if (isAbortError(err)) {
        finishAborted()
        return
      }
      throw err
    }
    if (!resp.ok || !resp.body) {
      if (resp.status === 429 && handlers.onQuotaExceeded) {
        try {
          const data = (await resp.json()) as { detail?: unknown }
          const quota = parseCreditQuotaDetail(data.detail)
          if (quota) {
            handlers.onQuotaExceeded(quota)
            return
          }
        } catch {
          // Fall through to generic stream error.
        }
      }
      handlers.onError(`Streaming failed (${resp.status})`)
      return
    }
    const reader = resp.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""
    try {
      while (true) {
        if (options?.signal?.aborted) {
          await reader.cancel().catch(() => undefined)
          finishAborted()
          return
        }
        const { done, value } = await reader.read()
        if (value) {
          buffer += decoder.decode(value, { stream: !done })
          buffer = consumeChatSseBuffer(buffer, dispatchSseEvent)
        }
        if (done) break
      }
      buffer += decoder.decode()
      if (buffer) {
        flushChatSseBuffer(buffer, dispatchSseEvent)
      }
    } catch (err) {
      if (isAbortError(err)) {
        finishAborted()
        return
      }
      handlers.onError(err instanceof Error ? err.message : "Stream error")
    }
  },

  generateAcademicCourseDocuments: async (body: {
    title: string
    content: string
    base_filename?: string
    formats?: Array<"docx" | "pdf">
  }): Promise<{
    title: string
    docx_size_bytes: number
    pdf_size_bytes: number
    artifacts: GeneratedArtifact[]
  }> => {
    const res = await apiClient.post<{
      title: string
      docx_size_bytes: number
      pdf_size_bytes: number
      artifacts: GeneratedArtifact[]
    }>("/v1/academics/course-documents", body)
    return res.data
  },
}
