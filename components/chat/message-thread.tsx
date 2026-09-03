"use client"

import React, { forwardRef, useMemo, useState } from "react"
import type { ReactNode } from "react"
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Pencil,
  RefreshCcw,
  Upload,
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { ChatMessage } from "@/types/api"
import { ChatPipelineTaskResult } from "@/components/chat/chat-pipeline-task-result"
import { chatMarkdownComponentsForPrefs } from "@/components/markdown/markdown-components"
import { useChatDisplayPrefs } from "@/hooks/use-chat-display-prefs"
import { useLocaleDisplayPrefs } from "@/hooks/use-locale-display-prefs"
import {
  CHAT_ASSISTANT_MESSAGE_ALIGN_CLASS,
  CHAT_COLUMN_PAD_X,
  CHAT_MESSAGE_TEXT_CLASS,
  CHAT_USER_MESSAGE_ALIGN_CLASS,
} from "@/constants/chat-layout"
import { normalizeChatMarkdown, chatMarkdownUrlTransform } from "@/lib/chat-markdown"
import {
  isPipelineCompletionContent,
  latestPipelineCompletionMessageId,
  pipelineTasksWithDeliverables,
} from "@/lib/chat-pipeline-messages"
import {
  isPipelineLifecycleMessage,
  shouldHidePipelineStatusMessage,
} from "@/lib/chat-pipeline-lifecycle-message"
import { chatColumnClass } from "@/constants/chat-layout"
import {
  formatMessageThreadDivider,
  messageDayKey,
} from "@/lib/datetime-local"
import { MessageActionTooltip } from "@/components/chat/message-action-tooltip"
import { MessageInlineEdit } from "@/components/chat/message-inline-edit"
import { MessageMoreMenu } from "@/components/chat/message-more-menu"
import {
  ChatSourcesActionButton,
  useChatSourcesPanelOptional,
} from "@/components/chat/chat-sources-panel"
import { useChatPresentationPanelOptional } from "@/components/chat/chat-presentation-panel"
import { ChatMarkdownWithCitations } from "@/components/chat/chat-markdown-with-citations"
import { ChatUserAskBackBubble } from "@/components/chat/chat-user-ask-back-bubble"
import { parseQuotedChatMessage } from "@/lib/chat-quote"
import { ChatLiveThought } from "@/components/chat/chat-live-thought"
import { ChatMessageFollowUps } from "@/components/chat/chat-message-follow-ups"
import { ChatStreamingStatus } from "@/components/chat/chat-streaming-status"
import { getAssistantFollowUpSuggestions } from "@/lib/chat-follow-up-suggestions"
import {
  ChatPresentationArtifact,
  resolvePresentationForMessage,
  parseSlideOutline,
} from "@/components/chat/chat-presentation-artifact"
import { ChatDeliverableArtifactList } from "@/components/chat/chat-deliverable-artifact"
import { ChatDocumentArtifact } from "@/components/chat/chat-document-artifact"
import { ChatHtmlWriteupArtifact } from "@/components/chat/chat-html-writeup-artifact"
import {
  extractWebPageArtifactFromMarkdown,
  resolveHtmlWriteupForMessage,
  stripWebPageFencesFromMarkdown,
} from "@/lib/html-writeup"
import { ChatImageArtifact } from "@/components/chat/chat-image-artifact"
import { ChatTimeArtifact, type TimeArtifact } from "@/components/chat/chat-time-artifact"
import { ChatVideoArtifact } from "@/components/chat/chat-video-artifact"
import { ChatWeatherArtifact, type WeatherArtifact } from "@/components/chat/chat-weather-artifact"
import {
  ChatYouTubeArtifactCard,
  type YouTubeArtifact,
} from "@/components/chat/chat-rich-link-card"
import { ChatNewsArtifact } from "@/components/chat/chat-news-artifact"
import {
  ChatCalculatorArtifact,
  type CalculatorArtifact,
} from "@/components/chat/chat-calculator-artifact"
import { ChatFinanceArtifact, type FinanceArtifact } from "@/components/chat/chat-finance-artifact"
import { ChatPlacesArtifact, type PlacesArtifact } from "@/components/chat/chat-places-artifact"
import { resolveDocumentForMessage } from "@/lib/document-from-task-result"
import { collectProjectExportFiles } from "@/lib/project-files-from-artifact"
import { resolveZipForMessage } from "@/lib/zip-from-message"
import {
  extractNewsArtifactFromToolEvents,
  newsArtifactFromMetadata,
} from "@/lib/chat-news-artifact"
import {
  ChatPipelinePlanCard,
  ChatPipelinePlanCollapsible,
} from "@/components/chat/chat-pipeline-plan-card"
import type { PipelinePlanPayload } from "@/lib/pipeline-plan"
import { MessageFileGenerationActivity } from "@/components/chat/message-file-generation-activity"
import { ChatMessageAttachments } from "@/components/chat/chat-message-attachments"
import { parseFileGenerationActivity } from "@/lib/chat-file-generation-activity"
import { parseWebSearchActivity } from "@/lib/chat-web-search-activity"
import { formatWebSearchStatusLine } from "@/lib/chat-web-search-status"
import { readMessageAloud } from "@/lib/chat-read-aloud"
import { shareAssistantMessage } from "@/lib/chat-share"
import { extractWebSearchSources } from "@/lib/chat-web-search-sources"
import {
  getActiveResponseIndex,
  getActiveResponseVersion,
  getResponseVersions,
} from "@/lib/chat-response-versions"
import { taskDetailHref } from "@/lib/task-chat-link"
import type { AgentTemplateApi, ChatToolEvent, WebSearchSource } from "@/types/api"
import { ChatUserAssistantIntakeBubble } from "@/components/chat/chat-user-assistant-intake-bubble"
import { CopyMessageButton } from "@/components/chat/copy-message-button"
import { ResponseFeedbackActions } from "@/components/chat/response-feedback-actions"
import { trackProductEvent } from "@/lib/analytics/track-event"
import { ChatResponseContextBar } from "@/components/chat/chat-response-context-bar"
import {
  parseAssistantIntakeClarifyTrail,
  parseAssistantIntakeDisplay,
  parseAssistantIntakeUserPrompt,
} from "@/lib/assistant-message-display"
import { cn } from "@/lib/utils"

interface Props {
  messages: ChatMessage[]
  streamingText?: string
  /** True while the stream endpoint is open (shows live typing before first token). */
  isAssistantStreaming?: boolean
  /** ChatGPT-style web search status while results are loading. */
  webSearchStatus?: { queries: string[] } | null
  /** Live tool events during the active assistant stream. */
  streamingToolEvents?: ChatToolEvent[]
  /** User query currently being answered (live stream). */
  streamingUserQuery?: string
  /** Epoch ms when the active stream started. */
  streamStartedAt?: number | null
  /** Web sources gathered during the active stream (before the assistant message is saved). */
  streamingWebSources?: WebSearchSource[]
  onRetryAssistant?: (messageId: string) => void
  onSelectResponseVersion?: (messageId: string, index: number) => void
  onBranchInNewChat?: (messageId: string) => void
  onActionNotice?: (message: string, variant?: "success" | "error" | "info") => void
  regeneratingMessageId?: string | null
  editingMessageId?: string | null
  editDisabled?: boolean
  onStartEdit?: (messageId: string) => void
  onCancelEdit?: () => void
  onSaveEdit?: (messageId: string, content: string) => void
  allowRetry?: boolean
  showTaskLinks?: boolean
  /** Active chat thread — used to build task links that return here. */
  activeConversationId?: string | null
  /** Send a contextual follow-up (e.g. "Tell me in detail"). */
  onFollowUpPick?: (prompt: string) => void
  /** When the live pipeline panel shows plan review, hide the duplicate inline card. */
  suppressInlinePlanReviewTaskId?: string | null
  /** Live pipeline task status — hides stale plan-review cards after continue/completion. */
  livePipelineTaskId?: string | null
  livePipelineTaskStatus?: string | null
  /** Resolve assistant display names for "via …" badges on replies. */
  templates?: AgentTemplateApi[]
  /** Assistant attached for the active stream (before the reply is saved). */
  streamingAssistantTemplateId?: string | null
  /** Hide share actions for ephemeral incognito chats. */
  incognitoMode?: boolean
}

function ChatMarkdown({ content }: { content: string }) {
  const { renderMarkdown, syntaxHighlighting } = useChatDisplayPrefs()
  const normalized = useMemo(() => normalizeChatMarkdown(content), [content])
  const components = useMemo(
    () => chatMarkdownComponentsForPrefs(renderMarkdown && syntaxHighlighting),
    [renderMarkdown, syntaxHighlighting]
  )
  if (!renderMarkdown) {
    return (
      <pre className="chat-pref-font-size whitespace-pre-wrap font-sans leading-[1.55] text-foreground/90">
        {normalized}
      </pre>
    )
  }
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      urlTransform={chatMarkdownUrlTransform}
      components={components}
    >
      {normalized}
    </ReactMarkdown>
  )
}

function MessageTimeDivider({ label }: { label: string }) {
  return (
    <div className="flex w-full justify-center py-2" role="separator">
      <time className="rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide text-muted-foreground/80 tabular-nums">
        {label}
      </time>
    </div>
  )
}

function MessageActionButton({
  actionLabel,
  onClick,
  icon: Icon,
  iconOnly = true,
}: {
  actionLabel: string
  onClick: () => void
  icon: typeof Copy
  iconOnly?: boolean
}) {
  return (
    <MessageActionTooltip actionLabel={actionLabel}>
      <button
        type="button"
        onClick={onClick}
        aria-label={actionLabel}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-muted-foreground",
          "hover:bg-muted/80 hover:text-foreground transition-colors",
          iconOnly ? "h-7 w-7" : "h-7 gap-1 px-2 text-xs"
        )}
      >
        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
        {!iconOnly ? <span>{actionLabel}</span> : null}
      </button>
    </MessageActionTooltip>
  )
}

function ResponseVersionPager({
  messageId,
  versionsCount,
  activeIndex,
  disabled,
  onSelectVersion,
}: {
  messageId: string
  versionsCount: number
  activeIndex: number
  disabled?: boolean
  onSelectVersion?: (messageId: string, index: number) => void
}) {
  if (versionsCount <= 1 || !onSelectVersion) return null

  return (
    <div className="inline-flex items-center gap-0 text-[11px] text-muted-foreground tabular-nums">
      <button
        type="button"
        aria-label="Previous response"
        disabled={disabled || activeIndex <= 0}
        onClick={() => onSelectVersion(messageId, activeIndex - 1)}
        className={cn(
          "inline-flex h-7 w-6 items-center justify-center rounded-md transition-colors",
          "hover:bg-muted/80 hover:text-foreground disabled:opacity-35 disabled:pointer-events-none"
        )}
      >
        <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
      </button>
      <span className="min-w-[2.25rem] px-0.5 text-center">
        {activeIndex + 1}/{versionsCount}
      </span>
      <button
        type="button"
        aria-label="Next response"
        disabled={disabled || activeIndex >= versionsCount - 1}
        onClick={() => onSelectVersion(messageId, activeIndex + 1)}
        className={cn(
          "inline-flex h-7 w-6 items-center justify-center rounded-md transition-colors",
          "hover:bg-muted/80 hover:text-foreground disabled:opacity-35 disabled:pointer-events-none"
        )}
      >
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  )
}

function AssistantActionRow({ children }: { children: ReactNode }) {
  return (
    <div
      data-chat-message-actions=""
      className="inline-flex max-w-full flex-wrap items-center gap-0"
    >
      {children}
    </div>
  )
}

function MessageActions({
  msg,
  isUser,
  allowRetry,
  webSources,
  displayContent,
  versionsCount,
  activeVersionIndex,
  actionsDisabled,
  conversationId,
  onRetryAssistant,
  onStartEdit,
  onSelectResponseVersion,
  onBranchInNewChat,
  onActionNotice,
  incognitoMode = false,
}: {
  msg: ChatMessage
  isUser: boolean
  allowRetry: boolean
  webSources?: WebSearchSource[]
  displayContent: string
  versionsCount: number
  activeVersionIndex: number
  actionsDisabled?: boolean
  conversationId?: string | null
  onRetryAssistant?: (messageId: string) => void
  onStartEdit?: (messageId: string) => void
  onSelectResponseVersion?: (messageId: string, index: number) => void
  onBranchInNewChat?: (messageId: string) => void
  onActionNotice?: (message: string, variant?: "success" | "error" | "info") => void
  incognitoMode?: boolean
}) {
  const sourcesPanel = useChatSourcesPanelOptional()
  const presentationPanel = useChatPresentationPanelOptional()
  if (msg.metadata?.hide_message_actions || isPipelineLifecycleMessage(msg)) {
    return null
  }
  const canEdit = Boolean(isUser && onStartEdit && displayContent.trim())
  const hasTaskLink = Boolean(msg.metadata?.task_id)
  const isModeration = Boolean(msg.metadata?.moderation_notice)
  const canRetry =
    allowRetry &&
    !isUser &&
    !hasTaskLink &&
    !isModeration &&
    Boolean(onRetryAssistant) &&
    displayContent.trim().length > 0

  if (!displayContent.trim() && !webSources?.length && versionsCount <= 1) return null

  const showSources = !isUser && Boolean(webSources?.length)

  const handleShareMessage = async () => {
    try {
      const result = await shareAssistantMessage(displayContent)
      onActionNotice?.(
        result === "shared" ? "Reply shared." : "Reply copied to clipboard.",
        "success"
      )
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return
      onActionNotice?.("Could not share this reply.", "error")
    }
  }

  return (
    <div className={cn("mt-1.5", isUser ? "text-right" : "text-left")}>
      <div
        className={cn(
          "inline-flex flex-wrap items-center gap-0.5",
          isUser ? "justify-end" : "justify-start"
        )}
      >
        {isUser ? (
          <>
            {canEdit ? (
              <MessageActionButton
                actionLabel="Edit"
                icon={Pencil}
                onClick={() => onStartEdit?.(msg.message_id)}
              />
            ) : null}
            <CopyMessageButton text={displayContent} disabled={actionsDisabled} />
          </>
        ) : (
          <AssistantActionRow>
            <ResponseVersionPager
              messageId={msg.message_id}
              versionsCount={versionsCount}
              activeIndex={activeVersionIndex}
              disabled={actionsDisabled}
              onSelectVersion={onSelectResponseVersion}
            />
            <CopyMessageButton
              text={displayContent}
              disabled={actionsDisabled}
              onCopied={() =>
                void trackProductEvent(
                  "copy_response",
                  { message_id: msg.message_id },
                  { conversationId }
                )
              }
            />
            <ResponseFeedbackActions
              conversationId={conversationId || msg.conversation_id}
              message={msg}
              disabled={actionsDisabled}
              onNotice={onActionNotice}
            />
            {!incognitoMode ? (
              <MessageActionButton
                actionLabel="Share"
                icon={Upload}
                onClick={() => void handleShareMessage()}
              />
            ) : null}
            {canRetry ? (
              <MessageActionButton
                actionLabel="Regenerate"
                icon={RefreshCcw}
                onClick={() => {
                  void trackProductEvent(
                    "regenerate",
                    { message_id: msg.message_id },
                    { conversationId: conversationId || msg.conversation_id }
                  )
                  onRetryAssistant?.(msg.message_id)
                }}
              />
            ) : null}
            {showSources ? (
              <ChatSourcesActionButton
                sources={webSources!}
                messageId={msg.message_id}
              />
            ) : null}
            <MessageMoreMenu
              hasSources={showSources}
              disabled={actionsDisabled}
              onViewSources={
                showSources
                  ? () => {
                      presentationPanel?.closePresentation()
                      sourcesPanel?.openSources(webSources!, { messageId: msg.message_id })
                    }
                  : undefined
              }
              onBranchInNewChat={
                onBranchInNewChat ? () => onBranchInNewChat(msg.message_id) : undefined
              }
              onReadAloud={() => {
                const ok = readMessageAloud(displayContent)
                onActionNotice?.(
                  ok ? "Reading aloud…" : "Read aloud is not supported in this browser.",
                  ok ? "info" : "error"
                )
              }}
            />
          </AssistantActionRow>
        )}
      </div>
    </div>
  )
}

export const MessageThread = forwardRef<HTMLDivElement, Props>(function MessageThread(
  {
    messages,
    streamingText,
    isAssistantStreaming = false,
    webSearchStatus = null,
    streamingToolEvents = [],
    streamingUserQuery = "",
    streamStartedAt = null,
    streamingWebSources = [],
    onRetryAssistant,
    onSelectResponseVersion,
    onBranchInNewChat,
    onActionNotice,
    regeneratingMessageId = null,
    editingMessageId = null,
    editDisabled = false,
    onStartEdit,
    onCancelEdit,
    onSaveEdit,
    allowRetry = true,
    showTaskLinks = true,
    activeConversationId = null,
    onFollowUpPick,
    suppressInlinePlanReviewTaskId = null,
    livePipelineTaskId = null,
    livePipelineTaskStatus = null,
    templates,
    streamingAssistantTemplateId = null,
    incognitoMode = false,
  },
  ref
) {
  const sourcesPanel = useChatSourcesPanelOptional()
  const presentationPanel = useChatPresentationPanelOptional()
  useLocaleDisplayPrefs()

  const liveFileGenerationActivity = useMemo(
    () => parseFileGenerationActivity(streamingToolEvents),
    [streamingToolEvents]
  )

  /** One pipeline completion row per task (newest wins). */
  const latestPipelineResultMessageIdByTask = useMemo(
    () => latestPipelineCompletionMessageId(messages),
    [messages]
  )

  /** Latest assistant message with an HTML page — auto-open only that visualization. */
  const latestHtmlWriteupMessageId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const msg = messages[i]
      if (msg.role === "user") continue
      if (resolveHtmlWriteupForMessage(msg.metadata)) return msg.message_id
      if (extractWebPageArtifactFromMarkdown(msg.content || "")) return msg.message_id
    }
    return null
  }, [messages])

  const pipelineApprovedTaskIds = useMemo(() => {
    const ids = pipelineTasksWithDeliverables(messages)
    for (const m of messages) {
      const tid = m.metadata?.task_id
      if (typeof tid !== "string" || !tid.trim()) continue
      if (m.metadata?.pipeline_activated) ids.add(tid.trim())
      if (m.metadata?.pipeline_lifecycle && m.metadata?.pipeline_activated) ids.add(tid.trim())
      const plan = m.metadata?.pipeline_plan
      if (plan && typeof plan === "object" && !Array.isArray(plan)) {
        const status = String((plan as PipelinePlanPayload).status || "").toLowerCase()
        if (status === "approved" || status === "skipped") ids.add(tid.trim())
      }
    }
    return ids
  }, [messages])

  const streamingNewsArtifact = useMemo(
    () => extractNewsArtifactFromToolEvents(streamingToolEvents),
    [streamingToolEvents]
  )

  const liveWebSearchActivity = useMemo(() => {
    const fromEvents = parseWebSearchActivity(streamingToolEvents)
    if (fromEvents) {
      if (fromEvents.sources.length === 0 && streamingWebSources.length > 0) {
        return {
          ...fromEvents,
          sources: streamingWebSources,
          resultCount: streamingWebSources.length,
        }
      }
      return fromEvents
    }
    if (!webSearchStatus?.queries.length) return null
    return {
      status: streamingWebSources.length > 0 ? ("done" as const) : ("searching" as const),
      query: webSearchStatus.queries[0] ?? null,
      queries: webSearchStatus.queries,
      sources: streamingWebSources,
      resultCount: streamingWebSources.length,
    }
  }, [streamingToolEvents, streamingWebSources, webSearchStatus])

  const webSearchSearching = liveWebSearchActivity?.status === "searching"
  const liveSearchQueries =
    liveWebSearchActivity?.queries.length
      ? liveWebSearchActivity.queries
      : webSearchStatus?.queries ?? []

  let lastUserQuery = ""
  let lastVisibleDayKey = ""

  return (
    <div
      ref={ref}
      className={chatColumnClass(
        CHAT_COLUMN_PAD_X,
        // Top bar (plan pill) is in-flow now — keep normal thread padding only.
        "space-y-5 py-4 sm:py-5"
      )}
    >
      {messages.map((msg) => {
        if (msg.role === "user") {
          lastUserQuery = msg.content
        }
        const taskIdMeta = msg.metadata?.task_id
        const taskId = typeof taskIdMeta === "string" ? taskIdMeta.trim() : ""
        const isUser = msg.role === "user"
        const hasTaskResult = Boolean(msg.metadata?.task_result)
        const isPipelineCompletionCandidate =
          !isUser &&
          Boolean(taskId) &&
          (hasTaskResult ||
            isPipelineCompletionContent(msg.content || "") ||
            Boolean(
              typeof msg.metadata?.document_markdown === "string" &&
                msg.metadata.document_markdown.trim()
            ) ||
            Boolean(msg.metadata?.presentation_artifact) ||
            Boolean(msg.metadata?.html_writeup))
        const isPipelineCompletionMessage =
          isPipelineCompletionCandidate &&
          latestPipelineResultMessageIdByTask.get(taskId) === msg.message_id

        if (isPipelineCompletionCandidate && !isPipelineCompletionMessage) {
          return null
        }
        if (shouldHidePipelineStatusMessage(msg, messages)) {
          return null
        }
        // Once the deliverable exists, hide stale "Review the Proposed Plan" lifecycle bubbles.
        if (
          isPipelineLifecycleMessage(msg) &&
          taskId &&
          pipelineApprovedTaskIds.has(taskId) &&
          Boolean(msg.metadata?.pipeline_plan_review)
        ) {
          return null
        }

        const dayKey = messageDayKey(msg.created_at)
        const dividerLabel =
          dayKey && dayKey !== lastVisibleDayKey
            ? formatMessageThreadDivider(msg.created_at)
            : ""
        if (dayKey) lastVisibleDayKey = dayKey
        const isEditing = isUser && editingMessageId === msg.message_id
        const isRegenerating = !isUser && regeneratingMessageId === msg.message_id
        const activeVersion = !isUser ? getActiveResponseVersion(msg) : null
        const displayContent = isUser ? msg.content : activeVersion?.content || msg.content
        const askBackQuote = isUser ? parseQuotedChatMessage(displayContent).quote : null
        const displayToolEvents = isUser ? msg.tool_events : activeVersion?.tool_events ?? msg.tool_events
        const responseVersions = !isUser ? getResponseVersions(msg) : []
        const activeVersionIndex = !isUser ? getActiveResponseIndex(msg) : 0
        const webSources = !isUser ? extractWebSearchSources(displayToolEvents) : []
        const fileGenerationActivity = !isUser
          ? parseFileGenerationActivity(displayToolEvents)
          : null
        const isModeration = Boolean(msg.metadata?.moderation_notice)
        const presentationBundle = !isUser ? resolvePresentationForMessage(msg.metadata) : null
        const presentationArtifact = presentationBundle?.artifact ?? null
        const presentationTitle = presentationBundle?.title
        const slidesCreated = presentationBundle?.slidesCreated
        const presentationTheme = presentationBundle?.themeName
        const documentBundle = !isUser ? resolveDocumentForMessage(msg.metadata) : null
        const zipBundle = !isUser ? resolveZipForMessage(msg.metadata) : null
        const htmlWriteup = !isUser ? resolveHtmlWriteupForMessage(msg.metadata) : null
        const webPageArtifact =
          !isUser && !htmlWriteup && !isRegenerating
            ? extractWebPageArtifactFromMarkdown(displayContent)
            : null
        const htmlArtifact = htmlWriteup || webPageArtifact
        const markdownDisplayContent =
          webPageArtifact != null
            ? stripWebPageFencesFromMarkdown(displayContent, webPageArtifact.fenceBodies)
            : displayContent
        const projectExportFiles = !isUser
          ? collectProjectExportFiles({
              html: htmlArtifact?.html,
              htmlFilename: htmlArtifact?.filename,
              taskResult: msg.metadata?.task_result,
              markdown: markdownDisplayContent,
            })
          : []
        const imageArtifact =
          !isUser && msg.metadata?.image_artifact && typeof msg.metadata.image_artifact === "object"
            ? (msg.metadata.image_artifact as {
                filename: string
                mime_type: string
                base64: string
              })
            : null
        const videoArtifact =
          !isUser && msg.metadata?.video_artifact && typeof msg.metadata.video_artifact === "object"
            ? (msg.metadata.video_artifact as {
                filename: string
                mime_type: string
                base64?: string
                url?: string
              })
            : null
        const timeArtifact =
          !isUser && msg.metadata?.time_artifact && typeof msg.metadata.time_artifact === "object"
            ? (msg.metadata.time_artifact as TimeArtifact)
            : null
        const weatherArtifact =
          !isUser &&
          msg.metadata?.weather_artifact &&
          typeof msg.metadata.weather_artifact === "object"
            ? (msg.metadata.weather_artifact as WeatherArtifact)
            : null
        const showWeatherWidget =
          weatherArtifact && !timeArtifact && !isPipelineCompletionMessage
        const showTimeWidget = timeArtifact && !isPipelineCompletionMessage
        const widgetCaption =
          showTimeWidget || showWeatherWidget ? displayContent.trim() : ""
        const youtubeArtifact =
          !isUser &&
          msg.metadata?.youtube_artifact &&
          typeof msg.metadata.youtube_artifact === "object" &&
          typeof (msg.metadata.youtube_artifact as YouTubeArtifact).video_id === "string"
            ? (msg.metadata.youtube_artifact as YouTubeArtifact)
            : null
        const newsArtifact =
          !isUser && !isPipelineCompletionMessage
            ? newsArtifactFromMetadata(msg.metadata) ??
              extractNewsArtifactFromToolEvents(displayToolEvents)
            : null
        const calculatorArtifact =
          !isUser &&
          msg.metadata?.calculator_artifact &&
          typeof msg.metadata.calculator_artifact === "object"
            ? (msg.metadata.calculator_artifact as CalculatorArtifact)
            : null
        const financeArtifact =
          !isUser &&
          msg.metadata?.finance_artifact &&
          typeof msg.metadata.finance_artifact === "object"
            ? (msg.metadata.finance_artifact as FinanceArtifact)
            : null
        const placesArtifact =
          !isUser &&
          msg.metadata?.places_artifact &&
          typeof msg.metadata.places_artifact === "object"
            ? (msg.metadata.places_artifact as PlacesArtifact)
            : null
        const pipelinePlanMeta = !isUser ? msg.metadata?.pipeline_plan : null
        const pipelinePlanStored =
          pipelinePlanMeta &&
          typeof pipelinePlanMeta === "object" &&
          !Array.isArray(pipelinePlanMeta) &&
          String((pipelinePlanMeta as PipelinePlanPayload).plan_markdown || "").trim()
            ? (pipelinePlanMeta as PipelinePlanPayload)
            : null
        const planReviewActive =
          Boolean(msg.metadata?.pipeline_plan_review) && Boolean(pipelinePlanStored) && Boolean(taskId)
        const liveStatusForMessage =
          livePipelineTaskId === taskId
            ? String(livePipelineTaskStatus || "").toLowerCase()
            : ""
        const planReviewClosed =
          (livePipelineTaskId === taskId &&
            liveStatusForMessage !== "" &&
            liveStatusForMessage !== "awaiting_plan_review") ||
          (Boolean(taskId) && pipelineApprovedTaskIds.has(taskId))
        const planReviewStillOpen = planReviewActive && !planReviewClosed
        const planReviewWasRequired = messages.some(
          (m) =>
            m.metadata?.task_id === taskId &&
            m.metadata?.pipeline_plan_review === true
        )
        const deliverableApproved =
          !planReviewWasRequired || pipelineApprovedTaskIds.has(taskId)
        const showInlinePlanReview =
          planReviewStillOpen &&
          !(suppressInlinePlanReviewTaskId && taskId === suppressInlinePlanReviewTaskId)
        const slideOutline = !isUser ? parseSlideOutline(msg.metadata) : null
        const hideTaskLink =
          Boolean(msg.metadata?.hide_task_link) || isPipelineLifecycleMessage(msg)
        const followUpSuggestions =
          !isUser && onFollowUpPick
            ? getAssistantFollowUpSuggestions(
                lastUserQuery,
                displayContent,
                webSources.length > 0
              )
            : []
        const assistantIntakeDisplay = isUser ? parseAssistantIntakeDisplay(msg.metadata) : null
        const assistantIntakePrompt = isUser
          ? parseAssistantIntakeUserPrompt(msg.metadata)
          : null
        const assistantIntakeTrail = isUser
          ? parseAssistantIntakeClarifyTrail(msg.metadata)
          : []
        const showAssistantIntakeBubble =
          isUser &&
          (Boolean(assistantIntakeDisplay?.length) || Boolean(assistantIntakePrompt))
        return (
          <div key={msg.message_id} className="flex flex-col gap-2">
            {dividerLabel ? <MessageTimeDivider label={dividerLabel} /> : null}
            <div
              className={cn(
                "group/message flex",
                isUser && !isEditing
                  ? askBackQuote
                    ? "w-full justify-stretch"
                    : cn("justify-end", CHAT_USER_MESSAGE_ALIGN_CLASS)
                  : cn("w-full justify-start", CHAT_ASSISTANT_MESSAGE_ALIGN_CLASS)
              )}
            >
            <div
              className={cn(
                "min-w-0",
                isUser && !isEditing
                  ? askBackQuote
                    ? "w-full max-w-none"
                    : "max-w-[86%]"
                  : "w-full max-w-none"
              )}
            >
              {isEditing && onCancelEdit && onSaveEdit ? (
                <MessageInlineEdit
                  initialContent={msg.content}
                  attachments={msg.attachments}
                  disabled={editDisabled}
                  onCancel={onCancelEdit}
                  onSave={(content) => onSaveEdit(msg.message_id, content)}
                />
              ) : isUser ? (
                <div
                  className={cn(
                    "flex flex-col gap-1.5",
                    askBackQuote ? "w-full items-stretch" : "items-end"
                  )}
                >
                  {showAssistantIntakeBubble ? (
                    <ChatUserAssistantIntakeBubble
                      entries={assistantIntakeDisplay || []}
                      userPrompt={assistantIntakePrompt}
                      clarifyTrail={assistantIntakeTrail}
                      templates={templates}
                    />
                  ) : displayContent.trim() ? (
                    <div
                      className={cn(
                        CHAT_MESSAGE_TEXT_CLASS,
                        askBackQuote && "w-full"
                      )}
                    >
                      <ChatUserAskBackBubble content={displayContent} />
                    </div>
                  ) : null}
                  {msg.attachments && msg.attachments.length > 0 ? (
                    <ChatMessageAttachments
                      attachments={msg.attachments}
                      conversationId={msg.conversation_id || activeConversationId || ""}
                      className="items-end"
                    />
                  ) : null}
                </div>
              ) : (
                <div className={CHAT_MESSAGE_TEXT_CLASS}>
                  {!isUser ? (
                    <ChatResponseContextBar
                      metadata={isRegenerating ? undefined : msg.metadata}
                      toolEvents={
                        isRegenerating && streamingToolEvents.length > 0
                          ? streamingToolEvents
                          : displayToolEvents
                      }
                      templates={templates}
                      streamingTemplateId={streamingAssistantTemplateId}
                    />
                  ) : null}
                  {isRegenerating && (streamingText || isAssistantStreaming) ? (
                    <div className="min-w-0">
                      {webSearchSearching ? (
                        <ChatStreamingStatus
                          label={formatWebSearchStatusLine(liveSearchQueries)}
                          className="mt-3"
                        />
                      ) : !webSearchSearching ? (
                        <ChatLiveThought
                          userQuery={streamingUserQuery}
                          toolEvents={streamingToolEvents}
                          hasResponseText={Boolean(streamingText)}
                          isStreaming={isAssistantStreaming}
                          streamStartedAt={streamStartedAt}
                        />
                      ) : null}
                      {liveFileGenerationActivity &&
                      liveFileGenerationActivity.status === "running" ? (
                        <MessageFileGenerationActivity
                          activity={liveFileGenerationActivity}
                          defaultOpen
                        />
                      ) : null}
                      {streamingNewsArtifact ? (
                        <ChatNewsArtifact artifact={streamingNewsArtifact} />
                      ) : null}
                      {streamingText ? (
                        <div data-chat-selectable="true" className="min-w-0">
                          {streamingWebSources.length > 0 ? (
                            <ChatMarkdownWithCitations
                              content={streamingText}
                              sources={streamingWebSources}
                              messageId={msg.message_id}
                            />
                          ) : (
                            <ChatMarkdown content={streamingText} />
                          )}
                        </div>
                      ) : null}
                      {!streamingText &&
                      !streamingUserQuery &&
                      !liveWebSearchActivity &&
                      !liveFileGenerationActivity &&
                      !isAssistantStreaming ? (
                        <ChatStreamingStatus className="mt-3" />
                      ) : null}
                    </div>
                  ) : (
                    <div className="min-w-0">
                      {fileGenerationActivity ? (
                        <MessageFileGenerationActivity
                          activity={fileGenerationActivity}
                          defaultOpen={fileGenerationActivity.status === "running"}
                        />
                      ) : null}
                      {newsArtifact ? (
                        <ChatNewsArtifact artifact={newsArtifact} />
                      ) : null}
                      {financeArtifact ? (
                        <ChatFinanceArtifact artifact={financeArtifact} />
                      ) : null}
                      {calculatorArtifact ? (
                        <ChatCalculatorArtifact artifact={calculatorArtifact} />
                      ) : null}
                      {placesArtifact ? (
                        <ChatPlacesArtifact artifact={placesArtifact} />
                      ) : null}
                      {showTimeWidget ? (
                        <div className="mb-3 space-y-3">
                          <ChatTimeArtifact artifact={timeArtifact!} />
                          {widgetCaption ? (
                            <div data-chat-selectable="true" className="min-w-0 text-muted-foreground">
                              <ChatMarkdown content={widgetCaption} />
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                      {showWeatherWidget ? (
                        <div className="mb-3 space-y-3">
                          <ChatWeatherArtifact artifact={weatherArtifact!} />
                          {widgetCaption ? (
                            <div data-chat-selectable="true" className="min-w-0 text-muted-foreground">
                              <ChatMarkdown content={widgetCaption} />
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                      {youtubeArtifact && !isPipelineCompletionMessage ? (
                        <div className="mb-3 space-y-3">
                          <ChatYouTubeArtifactCard artifact={youtubeArtifact} />
                          {displayContent.trim() ? (
                            <div data-chat-selectable="true" className="min-w-0 text-muted-foreground">
                              <ChatMarkdown content={displayContent.trim()} />
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                      {!isPipelineCompletionMessage &&
                      markdownDisplayContent.trim() &&
                      !documentBundle?.markdown &&
                      !showTimeWidget &&
                      !showWeatherWidget &&
                      !youtubeArtifact ? (
                        <div data-chat-selectable="true" className="min-w-0">
                          {webSources.length > 0 ? (
                            <ChatMarkdownWithCitations
                              content={markdownDisplayContent}
                              sources={webSources}
                              messageId={msg.message_id}
                            />
                          ) : (
                            <ChatMarkdown content={markdownDisplayContent} />
                          )}
                        </div>
                      ) : null}
                      {isPipelineCompletionMessage && deliverableApproved && markdownDisplayContent.trim() ? (
                        <div data-chat-selectable="true" className="min-w-0 mb-1">
                          <ChatMarkdown content={markdownDisplayContent} />
                        </div>
                      ) : null}
                      {showInlinePlanReview && pipelinePlanStored && taskId ? (
                        <div className="mt-3">
                          <ChatPipelinePlanCard
                            taskId={taskId}
                            plan={pipelinePlanStored}
                            reviewMode
                            runPhase="review"
                          />
                        </div>
                      ) : planReviewStillOpen && !showInlinePlanReview ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Answer plan questions in the pipeline panel below.
                        </p>
                      ) : planReviewActive && !planReviewStillOpen && pipelinePlanStored && taskId ? (
                        <div className="mt-2">
                          <ChatPipelinePlanCollapsible plan={pipelinePlanStored} taskId={taskId} />
                        </div>
                      ) : null}
                      {presentationArtifact && !isPipelineCompletionMessage ? (
                        <ChatPresentationArtifact
                          artifact={presentationArtifact}
                          title={presentationTitle}
                          themeName={presentationTheme}
                          slidesCreated={slidesCreated}
                          slideOutline={slideOutline}
                          previewOpen={presentationPanel?.isOpenForMessage(msg.message_id)}
                          onOpenPreview={() => {
                            sourcesPanel?.closeSources()
                            presentationPanel?.openPresentation({
                              artifact: presentationArtifact,
                              title: presentationTitle,
                              slidesCreated,
                              slideOutline,
                              messageId: msg.message_id,
                            })
                          }}
                          variant="presented"
                        />
                      ) : null}
                      {htmlArtifact && !isPipelineCompletionMessage ? (
                        <ChatHtmlWriteupArtifact
                          html={htmlArtifact.html}
                          title={htmlArtifact.title}
                          filename={htmlArtifact.filename}
                          files={projectExportFiles}
                          messageId={msg.message_id}
                          autoOpen={msg.message_id === latestHtmlWriteupMessageId}
                        />
                      ) : null}
                      {imageArtifact && !isPipelineCompletionMessage ? (
                        <ChatImageArtifact artifact={imageArtifact} />
                      ) : null}
                      {videoArtifact && !isPipelineCompletionMessage ? (
                        <ChatVideoArtifact artifact={videoArtifact} />
                      ) : null}
                      {documentBundle?.markdown &&
                      !isPipelineCompletionMessage &&
                      !presentationArtifact &&
                      !htmlArtifact ? (
                        <ChatDocumentArtifact
                          markdown={documentBundle.markdown}
                          title={documentBundle.title}
                          artifacts={documentBundle.artifacts}
                        />
                      ) : null}
                      {zipBundle?.artifacts.length && !isPipelineCompletionMessage ? (
                        <ChatDeliverableArtifactList artifacts={zipBundle.artifacts} />
                      ) : null}
                    </div>
                  )}
                  {showTaskLinks && taskId && !isPipelineCompletionMessage && !hideTaskLink ? (
                    <div className="mt-3 text-xs text-muted-foreground">
                      <Link
                        href={taskDetailHref(taskId, activeConversationId)}
                        className="font-mono underline-offset-2 hover:underline"
                      >
                        Open task {taskId}
                      </Link>
                    </div>
                  ) : null}
                  {isPipelineCompletionMessage ? (
                    <div className="mt-3 border-t border-border/50 pt-3">
                      {!deliverableApproved ? (
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">
                            This output was generated before plan approval. Review the plan in the
                            pipeline panel below and click <strong>Run pipeline</strong>, or turn off
                            pipeline mode and ask again for a direct answer.
                          </p>
                          {htmlArtifact ? (
                            <ChatHtmlWriteupArtifact
                              html={htmlArtifact.html}
                              title={htmlArtifact.title}
                              filename={htmlArtifact.filename}
                              files={projectExportFiles}
                              messageId={msg.message_id}
                              autoOpen={false}
                            />
                          ) : null}
                          {!htmlArtifact && documentBundle?.markdown ? (
                            <ChatDocumentArtifact
                              markdown={documentBundle.markdown}
                              title={documentBundle.title}
                              artifacts={documentBundle.artifacts}
                            />
                          ) : null}
                          {!htmlArtifact &&
                          !documentBundle?.markdown &&
                          msg.metadata?.task_result ? (
                            <ChatPipelineTaskResult
                              taskId={taskId}
                              fallbackResult={msg.metadata?.task_result}
                            />
                          ) : null}
                        </div>
                      ) : null}
                      {deliverableApproved && htmlArtifact ? (
                        <ChatHtmlWriteupArtifact
                          html={htmlArtifact.html}
                          title={htmlArtifact.title}
                          filename={htmlArtifact.filename}
                          files={projectExportFiles}
                          messageId={msg.message_id}
                          autoOpen={msg.message_id === latestHtmlWriteupMessageId}
                        />
                      ) : deliverableApproved && !htmlArtifact && !documentBundle?.markdown ? (
                        <ChatPipelineTaskResult
                          taskId={taskId}
                          fallbackResult={msg.metadata?.task_result}
                        />
                      ) : null}
                      {deliverableApproved && !htmlArtifact && documentBundle?.markdown ? (
                        <ChatDocumentArtifact
                          markdown={documentBundle.markdown}
                          title={documentBundle.title}
                          artifacts={documentBundle.artifacts}
                        />
                      ) : deliverableApproved && !htmlArtifact && documentBundle?.artifacts.length ? (
                        <ChatDeliverableArtifactList artifacts={documentBundle.artifacts} />
                      ) : null}
                      {pipelinePlanStored ? (
                        <ChatPipelinePlanCollapsible
                          plan={pipelinePlanStored}
                          taskId={taskId}
                        />
                      ) : null}
                    </div>
                  ) : null}
                  {msg.audio_url ? (
                    <div className="mt-2">
                      <audio controls src={msg.audio_url} className="h-8 w-full max-w-xs" />
                    </div>
                  ) : null}
                </div>
              )}
              {!isEditing ? (
                <>
                  <MessageActions
                    msg={msg}
                    isUser={isUser}
                    allowRetry={allowRetry}
                    webSources={webSources}
                    displayContent={displayContent}
                    versionsCount={responseVersions.length}
                    activeVersionIndex={activeVersionIndex}
                    actionsDisabled={editDisabled || isRegenerating}
                    conversationId={activeConversationId}
                    onRetryAssistant={onRetryAssistant}
                    onStartEdit={onStartEdit}
                    onSelectResponseVersion={onSelectResponseVersion}
                    onBranchInNewChat={onBranchInNewChat}
                    onActionNotice={onActionNotice}
                    incognitoMode={incognitoMode}
                  />
                  {followUpSuggestions.length > 0 && onFollowUpPick ? (
                    <ChatMessageFollowUps
                      suggestions={followUpSuggestions}
                      onPick={onFollowUpPick}
                      disabled={editDisabled || isRegenerating}
                      className="mt-2"
                    />
                  ) : null}
                </>
              ) : null}
            </div>
          </div>
          </div>
        )
      })}
      {!regeneratingMessageId && (streamingText || isAssistantStreaming) ? (
        <div className={cn("flex w-full justify-start", CHAT_ASSISTANT_MESSAGE_ALIGN_CLASS)}>
          <div className={cn("w-full", CHAT_MESSAGE_TEXT_CLASS)}>
              <ChatResponseContextBar
                toolEvents={streamingToolEvents}
                templates={templates}
                streamingTemplateId={streamingAssistantTemplateId}
              />
              {webSearchSearching ? (
                <ChatStreamingStatus
                  label={formatWebSearchStatusLine(liveSearchQueries)}
                  className="mt-3"
                />
              ) : !webSearchSearching ? (
                <ChatLiveThought
                  userQuery={streamingUserQuery}
                  toolEvents={streamingToolEvents}
                  hasResponseText={Boolean(streamingText)}
                  isStreaming={isAssistantStreaming}
                  streamStartedAt={streamStartedAt}
                />
              ) : null}
              {liveFileGenerationActivity && liveFileGenerationActivity.status === "running" ? (
                <MessageFileGenerationActivity activity={liveFileGenerationActivity} defaultOpen />
              ) : null}
              {streamingNewsArtifact ? (
                <ChatNewsArtifact artifact={streamingNewsArtifact} />
              ) : null}
              {streamingText ? (
                <div data-chat-selectable="true" className="min-w-0">
                  {streamingWebSources.length > 0 ? (
                    <ChatMarkdownWithCitations
                      content={streamingText}
                      sources={streamingWebSources}
                    />
                  ) : (
                    <ChatMarkdown content={streamingText} />
                  )}
                </div>
              ) : null}
              {(() => {
                const streamingFollowUps =
                  streamingText && webSearchSearching && onFollowUpPick
                    ? getAssistantFollowUpSuggestions(
                        streamingUserQuery,
                        streamingText,
                        true
                      )
                    : []
                return streamingFollowUps.length > 0 ? (
                  <ChatMessageFollowUps
                    suggestions={streamingFollowUps}
                    onPick={onFollowUpPick!}
                    disabled={editDisabled}
                  />
                ) : null
              })()}
              {!streamingText &&
              !streamingUserQuery &&
              !liveWebSearchActivity &&
              !isAssistantStreaming ? (
                <ChatStreamingStatus className="mt-3" />
              ) : null}
            </div>
          </div>
      ) : null}
    </div>
  )
})
