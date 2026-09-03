"use client"

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type WheelEvent } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { usePathname, useRouter } from "next/navigation"
import { formatChatStreamError } from "@/lib/chat-stream-errors"
import {
  isCreditQuotaExceededError,
  isQuotaResetPending,
  quotaExceededComposerLine,
  type CreditQuotaExceededPayload,
} from "@/lib/chat-quota-error"
import { promptQuotaFromApi } from "@/lib/plan-usage"
import { CHAT_BEGIN_DRAFT_EVENT, parseChatConversationIdFromPathname } from "@/lib/chat-path"
import { ROUTES } from "@/lib/routes"
import { rememberTaskConversationLink, readStoredTaskConversationId, taskDetailHref } from "@/lib/task-chat-link"
import { preloadPiThinkingMark } from "@/components/chat/chat-streaming-status"
import { ChatEmptyLanding } from "@/components/chat/chat-empty-landing"
import {
  ChatIncognitoBar,
  ChatIncognitoDisclaimer,
} from "@/components/chat/chat-incognito-chrome"
import { ChatWorkspaceTopBar } from "@/components/chat/chat-workspace-top-bar"
import { ChatPricingModal } from "@/components/chat/chat-pricing-modal"
import { ChatQuotaExceededDialog } from "@/components/chat/chat-quota-exceeded-dialog"
import { MessageThread } from "@/components/chat/message-thread"
import { ChatComposer } from "@/components/chat/chat-composer"
import {
  ChatConversationFeedback,
  shouldShowConversationFeedback,
} from "@/components/chat/chat-conversation-feedback"
import { ChatSelectionToolbar } from "@/components/chat/chat-selection-toolbar"
import {
  chatContextToTaskOptions,
  defaultChatContextSelection,
  type ChatContextSelection,
} from "@/components/chat/chat-context-panel"
import {
  CHAT_ENABLED_MEMORY_CHANGED,
  chatContextAfterEnabledFilesChanged,
  chatContextAfterMemoryDisabled,
  enableMemoryFromChat,
  persistChatMemoryContext,
  resolveInitialChatUseMemory,
} from "@/lib/chat-memory-sync"
import { useConversations } from "@/hooks/use-conversations"
import { useAgentTemplates, useRagFiles } from "@/hooks"
import { buildChatClientContext } from "@/lib/chat-client-context"
import { withChatStreamPreferences } from "@/lib/chat-stream-preferences"
import { applyStreamConversationTitle } from "@/lib/chat-conversation-title-cache"
import { chatService } from "@/services/chat"
import { useChatVoiceInput } from "@/hooks/use-chat-voice-input"
import { apiClient } from "@/lib/api-client"
import { tasksService } from "@/services/tasks"
import { useTask } from "@/hooks/use-tasks"
import { useAppAuth } from "@/hooks/use-app-auth"
import { resolveClientUploadLimits, validateChatFileUpload } from "@/lib/upload-validation"
import { useBillingSubscription } from "@/hooks/use-billing"
import { useChatIntroTour } from "@/hooks/use-chat-intro-tour"
import { useToast } from "@/hooks/use-toast"
import {
  isGuestConversationInSession,
  registerGuestConversationId,
} from "@/lib/guest-chat-session"
import {
  isGhostConversationInSession,
  registerGhostConversationId,
} from "@/lib/ghost-chat-mode"
import { useAppShell } from "@/components/layout/app-shell-context"
import { SHORTCUT_EVENT } from "@/lib/keyboard-shortcuts"
import { removeStoredApiKey, setStoredApiKey } from "@/lib/storage"
import { ChatPipelineContinueBanner } from "@/components/chat/chat-pipeline-continue-banner"
import { ChatPipelinePanel } from "@/components/chat/chat-pipeline-panel"
import { ChatPipelineNotifyBanner } from "@/components/chat/chat-pipeline-notify-banner"
import { ChatPipelineSuggestBanner } from "@/components/chat/chat-pipeline-suggest-banner"
import { dismissPipelineEnableSuggest, markPipelineModeUsed } from "@/lib/chat-pipeline-prompts"
import { shouldUseExplicitPipelineMode } from "@/lib/chat-intent-router"
import {
  appendBackgroundStreamToken,
  appendBackgroundStreamToolEvent,
  createBackgroundChatStream,
  getBackgroundStream,
  hasBackgroundStream,
  isViewingBackgroundStream,
  removeBackgroundStream,
  setBackgroundStream,
  type BackgroundChatStream,
} from "@/lib/chat-background-stream"
import type {
  ChatAttachment,
  ChatMessage,
  ChatToolEvent,
  CreateTaskRequest,
  ThinkingMode,
} from "@/types/api"

import {
  appendPipelinePreferenceContext,
  buildCreateTaskDefaults,
  loadSettingsPreferences,
  parseChatHistoryTurns,
  resolvePreferredProvider,
} from "@/lib/settings-preferences"
import { notifyTaskTerminalStatus } from "@/lib/task-notifications"
import {
  notifyPipelineChatReady,
  requestPipelineNotifyPermission,
} from "@/lib/pipeline-chat-notify"
import {
  clearPipelineNotifyOptIn,
  dismissPipelineNotifyPrompt,
  isPipelineNotifyOptedIn,
  optInPipelineNotify,
  readPipelineNotifyOptIns,
  shouldShowPipelineNotifyPrompt,
} from "@/lib/pipeline-notify-registry"
import {
  extractPipelinePlanFromTask,
  isPlanReviewPhase,
  isTerminalTaskStatus,
  taskHasApprovedPlanExecution,
} from "@/lib/pipeline-plan"
import {
  buildPipelineLifecycleMetadata,
  pipelineLifecycleContent,
} from "@/lib/chat-pipeline-lifecycle-message"
import type { Task } from "@/types/api"
import {
  countSelectedTemplates,
  loadStoredRunContext,
  mergeEncodedTemplateIds,
  runContextFromSettingsAndStore,
} from "@/lib/pipeline-run-context"
import {
  CHAT_ATTACHED_ASSISTANTS_CHANGED,
  listAttachedTemplateIds,
  loadChatAttachedTemplates,
  persistChatAttachedTemplates,
  resolveChatEnabledTemplates,
} from "@/lib/chat-attached-assistants"
import { ChatAssistantIntake } from "@/components/chat/chat-assistant-intake"
import { ChatAssistantIntakeChecklist } from "@/components/chat/chat-assistant-intake-checklist"
import { isMemoryActive } from "@/components/chat/chat-run-context-pickers"
import {
  buildAssistantIntakeFields,
  fillAssistantPromptTemplate,
  templateHasIntake,
} from "@/lib/assistant-intake"
import {
  allIntakeFieldsAnswered,
  buildIntakeContextMessages,
  prefillIntakeValues,
} from "@/lib/assistant-intake-prefill"
import { isVagueUserPrompt } from "@/lib/assistant-intake-quality"
import {
  buildIntakeDisplayEntries,
  buildUserAssistantIntakeMetadata,
  type AssistantIntakeClarifyTrailItem,
  type AssistantIntakeDisplayEntry,
} from "@/lib/assistant-message-display"
import { isResponseContinuationRequest } from "@/lib/chat-response-continuation"
import {
  conversationHasPipelineCompletion,
  isPipelineCompletionContent,
} from "@/lib/chat-pipeline-messages"
import {
  extractPresentationFromTaskResult,
  parseSlideOutline,
} from "@/components/chat/chat-presentation-artifact"
import { extractDocumentFromTaskResult } from "@/lib/document-from-task-result"
import { extractHtmlWriteupFromTaskResult } from "@/lib/html-writeup"
import { classifyPipelineOutput, normalizeTaskResultForViewer } from "@/lib/pipeline-output"
import { pipelineOutputUsesDocumentReader } from "@/lib/pipeline-deliverables"
import {
  chatColumnClass,
} from "@/constants/chat-layout"
import { extractWebSearchSources } from "@/lib/chat-web-search-sources"
import {
  mergeMessagesPreserveToolEvents,
  mergeToolEventsIntoMessage,
} from "@/lib/chat-message-tool-events"
import { getWebSearchStreamState } from "@/lib/chat-web-search-status"
import {
  mergeRegeneratedAssistantMessage,
  withActiveResponseIndex,
} from "@/lib/chat-response-versions"
import {
  attachmentWarningMessage,
  createComposerAttachmentItem,
  isImageAttachment,
  revokeComposerAttachmentPreview,
  type ComposerAttachmentItem,
} from "@/lib/chat-composer-attachments"
import { ChatSourcesPanelProvider } from "@/components/chat/chat-sources-panel"
import { ChatPresentationPanelProvider } from "@/components/chat/chat-presentation-panel"
import { cn } from "@/lib/utils"
import { hydrateChatMessageAttachments } from "@/lib/chat-message-attachments"
import { formatChatMessageWithQuote } from "@/lib/chat-quote"
import { useChatTextSelection } from "@/hooks/use-chat-text-selection"

function applyChatModerationBlock(
  prev: ChatMessage[],
  payload: {
    user_message?: ChatMessage
    policy_message?: ChatMessage
    message?: string
  },
  optimisticUserContent?: string
): ChatMessage[] {
  let next = prev
  if (optimisticUserContent) {
    next = next.filter(
      (m) =>
        !(
          m.message_id.startsWith("tmp-user-") &&
          m.role === "user" &&
          m.content === optimisticUserContent
        )
    )
  }
  if (payload.user_message) {
    next = [...next.filter((m) => m.message_id !== payload.user_message!.message_id), payload.user_message]
  }
  if (payload.policy_message) {
    next = [...next, payload.policy_message]
  } else if (payload.message) {
    next = [
      ...next,
      {
        message_id: `mod-${Date.now()}`,
        conversation_id: payload.user_message?.conversation_id || "",
        role: "assistant",
        content: payload.message,
        created_at: new Date().toISOString(),
        metadata: { moderation_notice: true },
      },
    ]
  }
  return next
}

function isPipelineUiMessage(content: string): boolean {
  const c = content.trim()
  if (!c) return true
  if (/^(run|adjust|cancel)$/i.test(c)) return true
  if (c.startsWith("Before running the workflow:")) return true
  if (c.startsWith("Before running the agent pipeline:")) return true
  if (c.startsWith("Open **Memory")) return true
  if (c.startsWith("Agent pipeline started.")) return true
  if (c.startsWith("Cancelled. Send a new message")) return true
  if (c.startsWith("Pipeline completed.")) return true
  if (c.startsWith("Pipeline failed.")) return true
  if (c.startsWith("I hit a streaming error:")) return true
  if (c.startsWith("The AI service is temporarily busy")) return true
  if (c.startsWith("I couldn't reach the AI service")) return true
  if (c.startsWith("Something went wrong while generating a reply")) return true
  return false
}

const BLOOM_TEMPLATE_ID = "sample-academics-bloom-course-planner"

export function ChatWorkspace() {
  const router = useRouter()
  const pathname = usePathname()
  const chatIntroTour = useChatIntroTour()
  const pathConversationId = parseChatConversationIdFromPathname(pathname)
  /** Holds new id between create + `router.replace`; cleared once URL matches. */
  const [pendingConversationId, setPendingConversationId] = useState<string | null>(null)
  /**
   * Sidebar "New chat" while still on `/chat/:id` (or while pending id is set).
   * Forces a blank draft until the URL is `/chat` or the user opens another thread.
   */
  const [forceDraftChat, setForceDraftChat] = useState(false)
  /** Conversation id at the moment New chat was clicked — kept until URL leaves it. */
  const forceDraftFromConversationRef = useRef<string | null>(null)
  const activeConversationId = forceDraftChat
    ? null
    : pendingConversationId ?? pathConversationId
  const [hasMounted, setHasMounted] = useState(false)
  const [conversationLoading, setConversationLoading] = useState(Boolean(pathConversationId))
  const [conversationError, setConversationError] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [preferredProviderOverride, setPreferredProviderOverride] = useState<string>("")
  const [chatStreamResponses, setChatStreamResponses] = useState(true)
  const [pipelineModeEnabled, setPipelineModeState] = useState(false)
  const [showPipelineSuggestBanner, setShowPipelineSuggestBanner] = useState(false)
  const [showPipelineContinueBanner, setShowPipelineContinueBanner] = useState(false)
  const [chatHistoryTurns, setChatHistoryTurns] = useState(6)
  const [chatThinkingMode, setChatThinkingMode] = useState<ThinkingMode>("standard")
  const [chatConfirmBeforePipeline, setChatConfirmBeforePipeline] = useState(true)
  const [showPipelineActivityPanel, setShowPipelineActivityPanel] = useState(true)
  const [composerAttachments, setComposerAttachments] = useState<ComposerAttachmentItem[]>([])
  const [pipelineTaskId, setPipelineTaskId] = useState<string | null>(null)
  const [chatContext, setChatContext] = useState<ChatContextSelection>(() => defaultChatContextSelection())
  const [pipelineRunning, setPipelineRunning] = useState(false)
  const [pipelinePanelHidden, setPipelinePanelHidden] = useState(false)
  const [crossChatNotifyPrompt, setCrossChatNotifyPrompt] = useState<{
    taskId: string
    conversationId: string
  } | null>(null)
  /** Bumps when the user answers the notify prompt so inline visibility re-reads sessionStorage. */
  const [pipelineNotifyTick, setPipelineNotifyTick] = useState(0)
  const [chatStreaming, setChatStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState("")
  const [streamToolEvents, setStreamToolEvents] = useState<ChatToolEvent[]>([])
  const streamToolEventsRef = useRef<ChatToolEvent[]>([])
  const [streamingUserQuery, setStreamingUserQuery] = useState("")
  const [streamStartedAt, setStreamStartedAt] = useState<number | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [regeneratingMessageId, setRegeneratingMessageId] = useState<string | null>(null)
  const [composerFocusRequest, setComposerFocusRequest] = useState(0)
  const [quotedExcerpt, setQuotedExcerpt] = useState<string | null>(null)
  const [messageThreadEl, setMessageThreadEl] = useState<HTMLDivElement | null>(null)
  const sendInFlightRef = useRef(false)
  const activeConversationIdRef = useRef(activeConversationId)
  const backgroundStreamsRef = useRef<Map<string, BackgroundChatStream>>(new Map())
  const chatStreamResponsesRef = useRef(chatStreamResponses)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const composerDockRef = useRef<HTMLDivElement>(null)
  const [composerDockHeight, setComposerDockHeight] = useState(0)
  const skipNextConversationHydrateRef = useRef(false)
  const pipelineSuggestDismissedRef = useRef(false)
  const pipelineCompletionPostedRef = useRef<string | null>(null)
  const pipelineLifecyclePostedRef = useRef<string | null>(null)
  const pipelineLifecycleMessageIdRef = useRef<Map<string, string>>(new Map())
  const pipelineFailurePostedRef = useRef<Set<string>>(new Set())
  const pipelineRecoveryGenerationRef = useRef(0)
  const pipelineExecutionApprovedRef = useRef<string | null>(null)
  const runningPipelineByConversationRef = useRef<Map<string, string>>(new Map())
  const prevActiveConversationIdRef = useRef<string | null>(activeConversationId)
  const pipelineNotifyWatcherInFlightRef = useRef<Set<string>>(new Set())
  const streamAbortRef = useRef<AbortController | null>(null)
  const streamUserStoppedRef = useRef(false)
  const regeneratingMessageIdRef = useRef<string | null>(null)
  const { isSignedIn, accountType, user, plan } = useAppAuth()
  const uploadLimits = useMemo(
    () => resolveClientUploadLimits(plan, accountType),
    [accountType, plan]
  )
  const { data: billing } = useBillingSubscription()
  const [quotaDialogOpen, setQuotaDialogOpen] = useState(false)
  const [quotaDialogPayload, setQuotaDialogPayload] = useState<CreditQuotaExceededPayload | null>(
    null
  )
  const quotaAutoShownRef = useRef(false)
  const [pricingModalOpen, setPricingModalOpen] = useState(false)
  const { ghostModeEnabled, composerMode, setComposerMode } = useAppShell()
  const { showToast, ToastSlot } = useToast()
  const { selection, clearSelection, toolbarRef } = useChatTextSelection(messageThreadEl)

  const setPipelineMode = useCallback(
    (enabled: boolean) => {
      setPipelineModeState(enabled)
      if (!ghostModeEnabled) setComposerMode(enabled ? "pipeline" : "chat")
    },
    [ghostModeEnabled, setComposerMode]
  )

  useEffect(() => {
    if (ghostModeEnabled) return
    setPipelineModeState(composerMode === "pipeline")
  }, [composerMode, ghostModeEnabled])

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId
  }, [activeConversationId])

  useEffect(() => {
    preloadPiThinkingMark()
  }, [])

  const applyBackgroundStreamToUi = useCallback((stream: BackgroundChatStream | null) => {
    if (!stream || !isViewingBackgroundStream(activeConversationIdRef.current, stream)) {
      return
    }
    setChatStreaming(true)
    setStreamingText(stream.streamingText)
    setStreamToolEvents(stream.toolEvents)
    streamToolEventsRef.current = stream.toolEvents
    setStreamingUserQuery(stream.userQuery)
    setStreamStartedAt(stream.streamStartedAt)
  }, [])

  const clearStreamUi = useCallback(() => {
    setChatStreaming(false)
    setStreamingText("")
    setStreamToolEvents([])
    streamToolEventsRef.current = []
    setStreamingUserQuery("")
    setStreamStartedAt(null)
  }, [])

  useEffect(() => {
    regeneratingMessageIdRef.current = regeneratingMessageId
  }, [regeneratingMessageId])

  const commitStoppedStream = useCallback(
    async (conversationId: string) => {
      const snapshot = getBackgroundStream(backgroundStreamsRef.current, conversationId)
      const partial = (snapshot?.streamingText || "").trim()
      const toolEvents = snapshot?.toolEvents ?? streamToolEventsRef.current

      removeBackgroundStream(backgroundStreamsRef.current, conversationId)
      clearStreamUi()
      setRegeneratingMessageId(null)

      if (!partial) return

      const regenId = regeneratingMessageIdRef.current

      if (ghostModeEnabled) {
        setMessages((prev) => [
          ...prev,
          {
            message_id: `tmp-assistant-stop-${Date.now()}`,
            conversation_id: conversationId,
            role: "assistant",
            content: partial,
            created_at: new Date().toISOString(),
            metadata: { generation_stopped: true },
            tool_events: toolEvents.length > 0 ? toolEvents : undefined,
          },
        ])
        return
      }

      if (regenId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.message_id === regenId
              ? {
                  ...m,
                  content: partial,
                  metadata: { ...(m.metadata || {}), generation_stopped: true },
                  tool_events: toolEvents.length > 0 ? toolEvents : m.tool_events,
                }
              : m
          )
        )
        return
      }

      try {
        const assistantMsg = await chatService.addMessage(conversationId, {
          role: "assistant",
          content: partial,
          metadata: { generation_stopped: true },
        })
        setMessages((prev) => {
          const withoutTmp = prev.filter((m) => !m.message_id.startsWith("tmp-user-"))
          return [...withoutTmp, mergeToolEventsIntoMessage(assistantMsg, toolEvents)]
        })
      } catch {
        setMessages((prev) => [
          ...prev.filter((m) => !m.message_id.startsWith("tmp-user-")),
          {
            message_id: `tmp-assistant-stop-${Date.now()}`,
            conversation_id: conversationId,
            role: "assistant",
            content: partial,
            created_at: new Date().toISOString(),
            metadata: { generation_stopped: true },
            tool_events: toolEvents.length > 0 ? toolEvents : undefined,
          },
        ])
      }
    },
    [clearStreamUi, ghostModeEnabled]
  )

  const stopGenerating = useCallback(() => {
    const conversationId = activeConversationIdRef.current
    if (!conversationId) return
    if (!hasBackgroundStream(backgroundStreamsRef.current, conversationId)) return

    streamUserStoppedRef.current = true
    streamAbortRef.current?.abort()
    streamAbortRef.current = null
    void commitStoppedStream(conversationId)
  }, [commitStoppedStream])

  const beginChatStream = useCallback((conversationId: string) => {
    streamAbortRef.current?.abort()
    const controller = new AbortController()
    streamAbortRef.current = controller
    streamUserStoppedRef.current = false
    return controller
  }, [])

  const shouldIgnoreStreamCompletion = useCallback((conversationId: string) => {
    if (!streamUserStoppedRef.current) return false
    streamUserStoppedRef.current = false
    streamAbortRef.current = null
    removeBackgroundStream(backgroundStreamsRef.current, conversationId)
    return true
  }, [])

  const openPipelineConversation = useCallback(
    (conversationId: string) => {
      router.push(ROUTES.chatConversation(conversationId))
    },
    [router]
  )

  const handlePipelineNotifyYes = useCallback(
    (taskId: string, conversationId: string) => {
      optInPipelineNotify(taskId, conversationId)
      setCrossChatNotifyPrompt(null)
      setPipelineNotifyTick((n) => n + 1)
      void requestPipelineNotifyPermission()
      showToast("We'll let you know when your response is ready.", "success")
    },
    [showToast]
  )

  const handlePipelineNotifyNo = useCallback((taskId: string) => {
    dismissPipelineNotifyPrompt(taskId)
    setCrossChatNotifyPrompt(null)
    setPipelineNotifyTick((n) => n + 1)
  }, [])

  const showInlinePipelineNotify = useMemo(
    () =>
      pipelineRunning &&
      Boolean(pipelineTaskId) &&
      Boolean(activeConversationId) &&
      shouldShowPipelineNotifyPrompt(pipelineTaskId!),
    // pipelineNotifyTick forces a re-read after Yes / No / dismiss.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tick is intentional
    [pipelineRunning, pipelineTaskId, activeConversationId, pipelineNotifyTick]
  )

  const handleSelectionCopy = useCallback(
    (text: string) => {
      void navigator.clipboard.writeText(text).then(
        () => {
          showToast("Copied to clipboard.", "success")
          clearSelection()
        },
        () => showToast("Could not copy selection.", "error")
      )
    },
    [clearSelection, showToast]
  )

  const handleSelectionAsk = useCallback(
    (text: string) => {
      setQuotedExcerpt(text.trim())
      clearSelection()
      setComposerFocusRequest((n) => n + 1)
    },
    [clearSelection]
  )

  const handleChatQuotaExceeded = useCallback((payload: CreditQuotaExceededPayload) => {
    setMessages((prev) => prev.filter((m) => !m.message_id.startsWith("tmp-user-")))
    setStreamingText("")
    setQuotaDialogPayload(payload)
    setQuotaDialogOpen(true)
  }, [])

  const promptQuotaUsage = useMemo(
    () => promptQuotaFromApi(billing?.prompt_quota),
    [billing?.prompt_quota]
  )
  const quotaExhaustedPayload = useMemo((): CreditQuotaExceededPayload | null => {
    if (promptQuotaUsage?.isUnlimited) return null
    const fromDialog = quotaDialogPayload
    const percent = fromDialog?.percent ?? promptQuotaUsage?.percent ?? 0
    const resetsAt = fromDialog?.resetsAt ?? promptQuotaUsage?.resetsAt ?? null
    if (resetsAt && !isQuotaResetPending(resetsAt)) return null
    if (percent >= 100 || fromDialog) {
      return { resetsAt, percent: percent || 100 }
    }
    return null
  }, [promptQuotaUsage, quotaDialogPayload])
  const quotaLocked = Boolean(quotaExhaustedPayload)
  const quotaLockMessage = quotaExhaustedPayload
    ? quotaExceededComposerLine(quotaExhaustedPayload, promptQuotaUsage?.windowHours ?? 5)
    : null

  useEffect(() => {
    if (!quotaLocked) {
      quotaAutoShownRef.current = false
      return
    }
    if (quotaAutoShownRef.current) return
    quotaAutoShownRef.current = true
    if (quotaExhaustedPayload) setQuotaDialogPayload(quotaExhaustedPayload)
    setQuotaDialogOpen(true)
  }, [quotaLocked, quotaExhaustedPayload])
  const prevGhostModeRef = useRef(ghostModeEnabled)
  const webSearchStream = useMemo(
    () => getWebSearchStreamState(streamToolEvents),
    [streamToolEvents]
  )
  const streamingWebSources = useMemo(
    () => webSearchStream.sources.length > 0
      ? webSearchStream.sources
      : extractWebSearchSources(streamToolEvents),
    [streamToolEvents, webSearchStream.sources]
  )
  const webSearchStatus = useMemo(() => {
    if (!webSearchStream.visible || !chatStreaming) return null
    const stillSearching = webSearchStream.sources.length === 0
    if (!stillSearching) return null
    if (!webSearchStream.queries.length) return null
    return { queries: webSearchStream.queries }
  }, [webSearchStream, chatStreaming])

  const queryClient = useQueryClient()
  const { conversations, isLoading, createConversation, deleteConversation } = useConversations()
  const { data: ragFiles, isLoading: ragLoading } = useRagFiles()
  const { data: templatesData, isLoading: templatesLoading } = useAgentTemplates()
  const ragList = useMemo(() => (Array.isArray(ragFiles) ? ragFiles : []), [ragFiles])
  const { data: pipelineTaskSnapshot } = useTask(
    pipelineTaskId,
    Boolean(pipelineTaskId && pipelineRunning)
  )

  const showLivePipelinePanel = useMemo(() => {
    if (!showPipelineActivityPanel) return false
    // Keep live execution always visible while the pipeline run is active
    if (!pipelineTaskId || !pipelineRunning || pipelinePanelHidden) return false
    return true
  }, [pipelinePanelHidden, pipelineRunning, pipelineTaskId, showPipelineActivityPanel])

  const handleVoiceTranscript = useCallback((transcript: string) => {
    const text = transcript.trim()
    if (!text) return
    setInput((prev) => (prev.trim() ? `${prev.trimEnd()} ${text}` : text))
  }, [])

  const { voiceState, toggleVoiceInput, stopVoiceInput, cancelVoiceInput } =
    useChatVoiceInput(handleVoiceTranscript)

  const handleVoice = () => {
    void toggleVoiceInput()
  }

  const handleVoiceCancel = () => {
    cancelVoiceInput()
  }

  const handleVoiceStop = () => {
    stopVoiceInput()
  }

  useEffect(() => {
    function onShortcut(e: Event) {
      const id = (e as CustomEvent<{ id: string }>).detail?.id
      if (id !== "enable-thinking") return
      setChatThinkingMode((mode: ThinkingMode) => {
        if (mode === "off") return "standard"
        if (mode === "standard") return "deep"
        return "off"
      })
    }
    window.addEventListener(SHORTCUT_EVENT, onShortcut)
    return () => window.removeEventListener(SHORTCUT_EVENT, onShortcut)
  }, [])

  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    const prefs = loadSettingsPreferences()
    const stored = loadStoredRunContext(ragList.length)
    const merged = runContextFromSettingsAndStore(prefs.templateIds, ragList.length)
    const attached = loadChatAttachedTemplates()
    setChatContext({
      useMemory: resolveInitialChatUseMemory(ragList.length),
      memorySources: stored.memorySources,
      templateIds:
        countSelectedTemplates(attached) > 0 ? attached : merged.templateIds,
    })
  }, [ragList.length])

  useEffect(() => {
    if (typeof window === "undefined") return
    const syncFromEnabledFiles = () => {
      setChatContext((prev) => {
        const next = chatContextAfterEnabledFilesChanged(prev)
        if (next.useMemory === prev.useMemory && next.memorySources === prev.memorySources) {
          return prev
        }
        persistChatMemoryContext(next)
        return next
      })
    }
    window.addEventListener(CHAT_ENABLED_MEMORY_CHANGED, syncFromEnabledFiles)
    return () => window.removeEventListener(CHAT_ENABLED_MEMORY_CHANGED, syncFromEnabledFiles)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const syncAttachedAssistants = () => {
      setChatContext((prev) => ({
        ...prev,
        templateIds: loadChatAttachedTemplates(),
      }))
    }
    window.addEventListener(CHAT_ATTACHED_ASSISTANTS_CHANGED, syncAttachedAssistants)
    return () => window.removeEventListener(CHAT_ATTACHED_ASSISTANTS_CHANGED, syncAttachedAssistants)
  }, [])

  useEffect(() => {
    if (pendingConversationId && pathConversationId === pendingConversationId) {
      setPendingConversationId(null)
    }
  }, [pathConversationId, pendingConversationId])

  useEffect(() => {
    if (!forceDraftChat) return
    if (!pathConversationId) {
      setForceDraftChat(false)
      forceDraftFromConversationRef.current = null
      return
    }
    // Still on the chat we left — wait for router to reach `/chat`.
    if (pathConversationId === forceDraftFromConversationRef.current) return
    // User opened a different thread from the sidebar.
    setForceDraftChat(false)
    forceDraftFromConversationRef.current = null
  }, [forceDraftChat, pathConversationId])

  const beginDraftChat = useCallback(() => {
    pipelineCompletionPostedRef.current = null
    pipelineLifecyclePostedRef.current = null
    pipelineLifecycleMessageIdRef.current = new Map()
    pipelineExecutionApprovedRef.current = null
    pipelineFailurePostedRef.current = new Set()
    setPipelineTaskId(null)
    setPipelineRunning(false)
    setPipelinePanelHidden(false)
    setPipelineMode(false)
    setShowPipelineSuggestBanner(false)
    setShowPipelineContinueBanner(false)
    pipelineSuggestDismissedRef.current = false
    setInput("")
    setQuotedExcerpt(null)
    setEditingMessageId(null)
    setComposerAttachments((prev) => {
      prev.forEach(revokeComposerAttachmentPreview)
      return []
    })
    setMessages([])
    setStreamingText("")
    setStreamToolEvents([])
    streamToolEventsRef.current = []
    setStreamingUserQuery("")
    setStreamStartedAt(null)
    setChatStreaming(false)
    setRegeneratingMessageId(null)
    setConversationError(null)
    setConversationLoading(false)
    // Drop pending create id and ignore current URL chat until navigation settles
    // (otherwise streaming callbacks / pending id keep the previous thread visible).
    forceDraftFromConversationRef.current =
      pathConversationId ?? pendingConversationId ?? activeConversationIdRef.current
    setPendingConversationId(null)
    setForceDraftChat(true)
    activeConversationIdRef.current = null
    if (pathname !== ROUTES.chat) {
      router.replace(ROUTES.chat, { scroll: false })
    }
  }, [pathname, pathConversationId, pendingConversationId, router])

  useEffect(() => {
    const onBeginDraft = () => beginDraftChat()
    window.addEventListener(CHAT_BEGIN_DRAFT_EVENT, onBeginDraft)
    return () => window.removeEventListener(CHAT_BEGIN_DRAFT_EVENT, onBeginDraft)
  }, [beginDraftChat])

  const createConversationOnFirstMessage = useCallback(
    async (firstMessageText: string): Promise<string | null> => {
      if (activeConversationId) return activeConversationId
      skipNextConversationHydrateRef.current = true
      const prefs = loadSettingsPreferences()
      const title = firstMessageText.trim().replace(/\s+/g, " ").slice(0, 80) || "New chat"
      const created = await createConversation.mutateAsync({
        title,
        thinking_mode: prefs.chatThinkingMode,
        ghost_mode: isSignedIn && ghostModeEnabled,
      })
      if (!isSignedIn) {
        registerGuestConversationId(created.conversation_id)
      } else if (ghostModeEnabled) {
        registerGhostConversationId(created.conversation_id)
      }
      // Bind the new id before React flushes so stream tokens are not dropped
      // during the first-send navigation gap.
      activeConversationIdRef.current = created.conversation_id
      setForceDraftChat(false)
      setPendingConversationId(created.conversation_id)
      router.replace(ROUTES.chatConversation(created.conversation_id), { scroll: false })
      return created.conversation_id
    },
    [activeConversationId, createConversation, ghostModeEnabled, isSignedIn, router]
  )

  const ensureConversationForAttachments = useCallback(
    async (seedTitle?: string): Promise<string | null> => {
      if (activeConversationId) return activeConversationId
      skipNextConversationHydrateRef.current = true
      setForceDraftChat(false)
      const prefs = loadSettingsPreferences()
      const title =
        (seedTitle || "").trim().replace(/\s+/g, " ").slice(0, 80) || "New chat"
      const created = await createConversation.mutateAsync({
        title,
        thinking_mode: prefs.chatThinkingMode,
        ghost_mode: isSignedIn && ghostModeEnabled,
      })
      if (!isSignedIn) {
        registerGuestConversationId(created.conversation_id)
      } else if (ghostModeEnabled) {
        registerGhostConversationId(created.conversation_id)
      }
      setPendingConversationId(created.conversation_id)
      router.replace(ROUTES.chatConversation(created.conversation_id), { scroll: false })
      return created.conversation_id
    },
    [activeConversationId, createConversation, ghostModeEnabled, isSignedIn, router]
  )

  useEffect(() => {
    if (isSignedIn || !activeConversationId) return
    if (!isGuestConversationInSession(activeConversationId)) {
      router.replace(ROUTES.chat, { scroll: false })
    }
  }, [isSignedIn, activeConversationId, router])

  useEffect(() => {
    if (!isSignedIn || !activeConversationId || !ghostModeEnabled) return
    if (!isGhostConversationInSession(activeConversationId)) {
      router.replace(ROUTES.chat, { scroll: false })
    }
  }, [isSignedIn, activeConversationId, ghostModeEnabled, router])

  useEffect(() => {
    if (!isSignedIn) return
    if (prevGhostModeRef.current === ghostModeEnabled) return
    prevGhostModeRef.current = ghostModeEnabled
    beginDraftChat()
    if (ghostModeEnabled) {
      setPipelineMode(false)
      setChatContext((prev) => ({ ...prev, useMemory: false }))
    }
  }, [ghostModeEnabled, isSignedIn, beginDraftChat])

  useEffect(() => {
    if (!activeConversationId) {
      if (!skipNextConversationHydrateRef.current) {
        setMessages([])
      }
      setConversationLoading(false)
      setConversationError(null)
      return
    }
    if (
      !isSignedIn &&
      activeConversationId &&
      !isGuestConversationInSession(activeConversationId)
    ) {
      return
    }
    if (
      isSignedIn &&
      ghostModeEnabled &&
      activeConversationId &&
      !isGhostConversationInSession(activeConversationId)
    ) {
      return
    }
    if (isSignedIn && ghostModeEnabled && activeConversationId) {
      setConversationLoading(false)
      setConversationError(null)
      return
    }
    if (skipNextConversationHydrateRef.current) {
      skipNextConversationHydrateRef.current = false
      setConversationLoading(false)
      setConversationError(null)
      prevActiveConversationIdRef.current = activeConversationId
      applyBackgroundStreamToUi(
        getBackgroundStream(backgroundStreamsRef.current, activeConversationId) ?? null
      )
      return
    }
    const previousConversationId = prevActiveConversationIdRef.current
    if (
      previousConversationId &&
      previousConversationId !== activeConversationId
    ) {
      const runningTaskId = runningPipelineByConversationRef.current.get(previousConversationId)
      if (runningTaskId && shouldShowPipelineNotifyPrompt(runningTaskId)) {
        setCrossChatNotifyPrompt({
          taskId: runningTaskId,
          conversationId: previousConversationId,
        })
      }
    }
    prevActiveConversationIdRef.current = activeConversationId
    setConversationLoading(true)
    setConversationError(null)
    setInput("")
    setEditingMessageId(null)
    const bgStream = getBackgroundStream(backgroundStreamsRef.current, activeConversationId)
    if (!bgStream) {
      setStreamingText("")
      setStreamToolEvents([])
      streamToolEventsRef.current = []
      setStreamingUserQuery("")
      setStreamStartedAt(null)
      setChatStreaming(false)
    }
    setComposerAttachments((prev) => {
      prev.forEach(revokeComposerAttachmentPreview)
      return []
    })
    pipelineCompletionPostedRef.current = null
    pipelineFailurePostedRef.current = new Set()
    if (!bgStream) {
      setPipelineTaskId(null)
      setPipelineRunning(false)
      setPipelinePanelHidden(false)
    }
    setPipelineMode(false)
    setShowPipelineSuggestBanner(false)
    setShowPipelineContinueBanner(false)
    pipelineSuggestDismissedRef.current = false
    void (async () => {
      try {
        const data = await chatService.getConversation(activeConversationId)
        const conversationMode = data.conversation?.thinking_mode
        if (
          conversationMode === "off" ||
          conversationMode === "deep" ||
          conversationMode === "standard"
        ) {
          setChatThinkingMode(conversationMode)
        }
        setMessages(
          hydrateChatMessageAttachments(
            data.messages,
            data.attachments ?? [],
            activeConversationId
          )
        )
        applyBackgroundStreamToUi(
          getBackgroundStream(backgroundStreamsRef.current, activeConversationId) ?? null
        )
      } catch {
        setConversationError("Could not load this conversation. Please retry.")
      } finally {
        setConversationLoading(false)
      }
    })()
  }, [activeConversationId, applyBackgroundStreamToUi, ghostModeEnabled, isSignedIn])

  useEffect(() => {
    if (!crossChatNotifyPrompt) return
    if (activeConversationId === crossChatNotifyPrompt.conversationId) {
      setCrossChatNotifyPrompt(null)
    }
  }, [activeConversationId, crossChatNotifyPrompt])

  useEffect(() => {
    pipelineFailurePostedRef.current = new Set()
    setShowPipelineSuggestBanner(false)
    setShowPipelineContinueBanner(false)
    pipelineSuggestDismissedRef.current = false
  }, [activeConversationId])

  const activeConversation = useMemo(
    () => conversations.find((c) => c.conversation_id === activeConversationId) || null,
    [activeConversationId, conversations]
  )

  const showEmptyHero =
    !isLoading &&
    !conversationLoading &&
    messages.length === 0 &&
    !conversationError &&
    !chatStreaming &&
    !streamingText.trim() &&
    !sendInFlightRef.current

  /**
   * Overlay composer dock so replies scroll behind/around chips (same idea as the
   * plan pill). Measure height for thread bottom padding.
   */
  useLayoutEffect(() => {
    if (showEmptyHero) {
      setComposerDockHeight(0)
      return
    }
    const el = composerDockRef.current
    if (!el) return
    const update = () => {
      setComposerDockHeight(Math.ceil(el.getBoundingClientRect().height))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [showEmptyHero])

  /** Forward wheel over the floating dock into the thread (dock itself is not scrollable). */
  const forwardDockWheelToThread = useCallback((event: WheelEvent<HTMLElement>) => {
    const target = event.target as HTMLElement | null
    if (target?.closest("textarea, input, [contenteditable='true']")) return
    const el = scrollAreaRef.current
    if (!el) return
    el.scrollTop += event.deltaY
  }, [])

  /**
   * Bottom room only clears the floating composer — not a full viewport of
   * empty scroll under the last reply.
   */
  const threadBottomSpacerPx = showEmptyHero
    ? 0
    : Math.max(
        (composerDockHeight > 0 ? composerDockHeight : 152) +
          (pipelineModeEnabled && !ghostModeEnabled ? 24 : 32),
        160
      )

  const isNewDraftChat = !activeConversationId

  const chatTaskOptions = useMemo(() => chatContextToTaskOptions(chatContext), [chatContext])
  const attachedChatTemplateIds = useMemo(
    () => listAttachedTemplateIds(chatContext.templateIds),
    [chatContext.templateIds]
  )
  const attachedChatTemplateId = attachedChatTemplateIds[0]

  const attachedIntakeTemplates = useMemo(() => {
    if (attachedChatTemplateIds.length === 0) return []
    const resolved = resolveChatEnabledTemplates(
      attachedChatTemplateIds,
      templatesData?.templates
    )
    return resolved.filter((template) => templateHasIntake(template))
  }, [attachedChatTemplateIds, templatesData?.templates])

  const intakeKey = useMemo(
    () => attachedIntakeTemplates.map((t) => t.template_id ?? "").join("|"),
    [attachedIntakeTemplates]
  )

  // The intake form is a follow-up gate: it only appears after the user tries to
  // send with an intake assistant attached and hasn't provided the required
  // inputs. ``intakeSatisfiedKey`` marks a set as already answered/skipped.
  const [intakeSatisfiedKey, setIntakeSatisfiedKey] = useState<string | null>(null)
  const [intakeActive, setIntakeActive] = useState(false)
  const [intakePendingText, setIntakePendingText] = useState("")
  const [intakeStepIndex, setIntakeStepIndex] = useState(0)
  const [intakeCollected, setIntakeCollected] = useState<string[]>([])
  const [intakeClarifyTrail, setIntakeClarifyTrail] = useState<AssistantIntakeClarifyTrailItem[]>(
    []
  )
  const [intakeValuesCache, setIntakeValuesCache] = useState<
    Record<string, Record<string, string>>
  >({})

  useEffect(() => {
    setIntakeSatisfiedKey(null)
    setIntakeActive(false)
    setIntakePendingText("")
    setIntakeStepIndex(0)
    setIntakeCollected([])
    setIntakeClarifyTrail([])
    setIntakeValuesCache({})
  }, [intakeKey])

  const currentIntakeTemplate = attachedIntakeTemplates[intakeStepIndex] ?? null
  const currentIntakeTemplateId = currentIntakeTemplate?.template_id ?? ""
  const hasNextIntake = intakeStepIndex < attachedIntakeTemplates.length - 1
  const hasPreviousIntake = intakeStepIndex > 0

  const showAssistantIntake =
    intakeActive && Boolean(currentIntakeTemplate) && !chatStreaming && !pipelineRunning

  const finalizeIntake = (
    prompts: string[],
    displayEntries?: AssistantIntakeDisplayEntry[],
    extras?: { clarifyTrail?: AssistantIntakeClarifyTrailItem[] }
  ) => {
    const combined = prompts.filter((p) => p.trim()).join("\n\n---\n\n")
    const userPrompt = intakePendingText
    const clarifyTrail = extras?.clarifyTrail ?? intakeClarifyTrail
    setIntakeSatisfiedKey(intakeKey)
    setIntakeActive(false)
    setIntakePendingText("")
    setIntakeClarifyTrail([])
    if (combined.trim() || composerAttachments.length > 0) {
      void sendMessage(combined, null, {
        fromIntake: true,
        intakeDisplay: displayEntries,
        intakeUserPrompt: userPrompt,
        intakeClarifyTrail: clarifyTrail,
      })
    }
  }

  const buildCurrentIntakeDisplayEntries = useCallback(
    (extraValues?: Record<string, Record<string, string>>) => {
      const mergedCache = { ...intakeValuesCache, ...(extraValues || {}) }
      return buildIntakeDisplayEntries(attachedIntakeTemplates, mergedCache)
    },
    [attachedIntakeTemplates, intakeValuesCache]
  )

  const intakeContextMessages = useMemo(
    () => buildIntakeContextMessages(messages),
    [messages]
  )

  const assistantIntakeCard =
    showAssistantIntake && currentIntakeTemplate ? (
      <div className="space-y-2">
        {attachedIntakeTemplates.length > 1 ? (
          <ChatAssistantIntakeChecklist
            templates={attachedIntakeTemplates}
            currentIndex={intakeStepIndex}
            valuesCache={intakeValuesCache}
          />
        ) : null}
        <ChatAssistantIntake
          key={currentIntakeTemplate.template_id}
          template={currentIntakeTemplate}
          pendingMessage={intakePendingText}
          contextMessages={intakeContextMessages}
          savedValues={intakeValuesCache[currentIntakeTemplateId]}
          memoryActive={isMemoryActive(chatContext)}
          memorySources={chatContext.memorySources}
          disabled={chatStreaming || pipelineRunning}
          attachments={composerAttachments}
          onAttachFile={(file) => void handleAttach(file)}
          onRemoveAttachment={(localId) => removeComposerAttachment(localId)}
          stepIndex={intakeStepIndex}
          stepCount={attachedIntakeTemplates.length}
          hasNext={hasNextIntake}
          hasPrevious={hasPreviousIntake}
          onNext={(filledPrompt, fieldValues, extras) => {
            setIntakeValuesCache((prev) => ({
              ...prev,
              [currentIntakeTemplateId]: fieldValues,
            }))
            setIntakeCollected((prev) => [...prev, filledPrompt])
            if (extras?.clarifyTrail?.length) {
              setIntakeClarifyTrail((prev) => [...prev, ...extras.clarifyTrail!])
            }
            setIntakeStepIndex((i) => i + 1)
          }}
          onPreviousStep={() => {
            setIntakeCollected((prev) => prev.slice(0, -1))
            setIntakeStepIndex((i) => Math.max(0, i - 1))
          }}
          onSkipStep={() => {
            if (hasNextIntake) setIntakeStepIndex((i) => i + 1)
            else finalizeIntake(intakeCollected)
          }}
          onSubmit={(filledPrompt, fieldValues, extras) => {
            setIntakeValuesCache((prev) => ({
              ...prev,
              [currentIntakeTemplateId]: fieldValues,
            }))
            const clarifyTrail = [
              ...intakeClarifyTrail,
              ...(extras?.clarifyTrail || []),
            ]
            finalizeIntake(
              [...intakeCollected, filledPrompt],
              buildCurrentIntakeDisplayEntries({
                [currentIntakeTemplateId]: fieldValues,
              }),
              { clarifyTrail }
            )
          }}
          onDismiss={() => finalizeIntake(intakeCollected)}
        />
      </div>
    ) : null

  useEffect(() => {
    chatStreamResponsesRef.current = chatStreamResponses
  }, [chatStreamResponses])

  /** Keep the thread glued to the bottom while streaming, without yanking if the user scrolled up. */
  useEffect(() => {
    if (!chatStreaming && !streamingText) return
    const el = scrollAreaRef.current
    if (!el) return

    const NEAR_BOTTOM_PX = 160
    const stickIfNearBottom = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight
      if (distance <= NEAR_BOTTOM_PX) {
        el.scrollTop = el.scrollHeight
      }
    }

    stickIfNearBottom()

    const ro = new ResizeObserver(() => {
      stickIfNearBottom()
    })
    ro.observe(el)
    const content = el.firstElementChild
    if (content) ro.observe(content)

    return () => ro.disconnect()
  }, [chatStreaming, streamingText, messages.length, streamToolEvents.length])

  useEffect(() => {
    const syncFromSettings = () => {
      const prefs = loadSettingsPreferences()
      setPreferredProviderOverride(resolvePreferredProvider(prefs))
      setChatStreamResponses(prefs.chatStreamResponses)
      chatStreamResponsesRef.current = prefs.chatStreamResponses
      setChatHistoryTurns(parseChatHistoryTurns(prefs.chatHistoryTurns, 6))
      setChatThinkingMode(prefs.chatThinkingMode)
      setChatConfirmBeforePipeline(prefs.chatConfirmBeforePipeline)
      setShowPipelineActivityPanel(prefs.showPipelineActivityPanel)
    }
    syncFromSettings()
    if (typeof window !== "undefined") {
      window.addEventListener("masternode-settings-changed", syncFromSettings)
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("masternode-settings-changed", syncFromSettings)
      }
    }
  }, [])

  const clearComposerAttachments = useCallback(() => {
    setComposerAttachments((prev) => {
      prev.forEach(revokeComposerAttachmentPreview)
      return []
    })
  }, [])

  const removeComposerAttachment = useCallback((localId: string) => {
    setComposerAttachments((prev) => {
      const target = prev.find((item) => item.localId === localId)
      if (target) revokeComposerAttachmentPreview(target)
      return prev.filter((item) => item.localId !== localId)
    })
  }, [])

  const uploadQueuedAttachments = async (
    conversationId: string,
    items: ComposerAttachmentItem[]
  ): Promise<ChatAttachment[]> => {
    const uploaded: ChatAttachment[] = []
    for (const item of items) {
      if (item.attachment) {
        uploaded.push(item.attachment)
        continue
      }
      setComposerAttachments((prev) =>
        prev.map((entry) =>
          entry.localId === item.localId ? { ...entry, status: "uploading" as const } : entry
        )
      )
      try {
        const attachment = await chatService.uploadAttachment(conversationId, item.file)
        const warning = attachmentWarningMessage(attachment)
        setComposerAttachments((prev) =>
          prev.map((entry) =>
            entry.localId === item.localId
              ? { ...entry, status: "ready" as const, attachment, warning: warning ?? undefined }
              : entry
          )
        )
        uploaded.push(attachment)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed"
        setComposerAttachments((prev) =>
          prev.map((entry) =>
            entry.localId === item.localId
              ? { ...entry, status: "error" as const, error: message }
              : entry
          )
        )
        throw err
      }
    }
    return uploaded
  }

  const refreshApiKeyForTasks = async (): Promise<boolean> => {
    if (typeof window === "undefined") return false
    try {
      removeStoredApiKey()
      const res = await apiClient.post<{ api_key?: string }>("/v1/api-keys/auto-create", {})
      const key = String(res.data?.api_key || "").trim()
      if (!key) return false
      setStoredApiKey(key)
      return true
    } catch {
      return false
    }
  }

  const buildPipelineCreateBody = (taskText: string, conversationId?: string | null): CreateTaskRequest => {
    const prefs = loadSettingsPreferences()
    const ctxOpts = chatContextToTaskOptions(chatContext)
    const cid = (conversationId || "").trim()
    const base = buildCreateTaskDefaults({
      task: appendPipelinePreferenceContext(taskText, prefs),
      use_rag: ctxOpts.use_rag ?? false,
      rag_sources: ctxOpts.rag_sources,
      source_conversation_id: cid || undefined,
    })
    const mergedTemplateIds = mergeEncodedTemplateIds(ctxOpts.template_ids, base.template_ids)
    if (mergedTemplateIds) base.template_ids = mergedTemplateIds
    else delete base.template_ids
    if (!chatContext.useMemory) base.use_rag = false
    if (preferredProviderOverride) {
      base.preferred_provider = preferredProviderOverride
    }
    if (cid) {
      base.plan_review = chatConfirmBeforePipeline
    }
    return base
  }

  const createPipelineTaskWithAuthRecovery = async (
    taskText: string,
    conversationId?: string | null
  ) => {
    const body = buildPipelineCreateBody(taskText, conversationId)
    try {
      return await tasksService.create(body)
    } catch (err: any) {
      if (!err?.isAuthError) throw err
      const refreshed = await refreshApiKeyForTasks()
      if (!refreshed) throw err
      return await tasksService.create(body)
    }
  }

  const shouldAutoGenerateBloomDocs = useMemo(() => {
    if (accountType !== "creator") return false
    const ids = Object.values(chatContext?.templateIds || {})
    return ids.some((id) => String(id || "").trim() === BLOOM_TEMPLATE_ID)
  }, [accountType, chatContext])

  const resultToPlainText = (value: unknown): string => {
    if (typeof value === "string") return value
    if (value && typeof value === "object") {
      try {
        return JSON.stringify(value, null, 2)
      } catch {
        return String(value)
      }
    }
    if (value === null || value === undefined) return ""
    return String(value)
  }

  const buildDataUri = (artifact: { mime_type: string; base64: string }) =>
    `data:${artifact.mime_type};base64,${artifact.base64}`

  const postPipelineCompletionMessage = useCallback(
    async (taskId: string, fallbackResult?: unknown) => {
      const conversationId =
        readStoredTaskConversationId(taskId) || activeConversationId
      if (!conversationId || !taskId) return
      const postKey = `${conversationId}:${taskId}`
      if (pipelineCompletionPostedRef.current === postKey) return
      let alreadyPosted = false
      if (activeConversationIdRef.current === conversationId) {
        alreadyPosted = conversationHasPipelineCompletion(messages, taskId)
      } else {
        try {
          const data = await chatService.getConversation(conversationId)
          alreadyPosted = conversationHasPipelineCompletion(data.messages, taskId)
        } catch {
          alreadyPosted = false
        }
      }
      if (alreadyPosted) {
        pipelineCompletionPostedRef.current = postKey
        return
      }
      let normalizedTaskResult: unknown = null
      let storedPlan = null
      try {
        const task = await tasksService.get(taskId)
        const approved = taskHasApprovedPlanExecution(task as Task)
        const terminal = isTerminalTaskStatus(task.status)
        if (!approved) {
          // Completed/failed runs may still have a result even if approval markers were lost.
          if (!terminal) return
          const hasResult = Boolean(
            (task as Task & { final_result?: unknown }).final_result ||
              (task as Task & { result?: unknown }).result
          )
          if (!hasResult && String(task.status || "").toLowerCase() !== "completed") return
        }
        storedPlan = extractPipelinePlanFromTask(task as Task)
        normalizedTaskResult = normalizeTaskResultForViewer(task as unknown as Record<string, unknown>)
        if (!approved && !normalizedTaskResult) return
      } catch {
        // Without task confirmation we cannot safely post deliverables.
        return
      }
      if (!normalizedTaskResult) return
      const presentationFields = normalizedTaskResult
        ? extractPresentationFromTaskResult(normalizedTaskResult)
        : null
      const documentFields = normalizedTaskResult
        ? extractDocumentFromTaskResult(normalizedTaskResult)
        : null
      const htmlWriteupFields = normalizedTaskResult
        ? extractHtmlWriteupFromTaskResult(normalizedTaskResult)
        : null
      const outputKind = normalizedTaskResult
        ? classifyPipelineOutput(normalizedTaskResult)
        : null
      const slideOutline =
        normalizedTaskResult && typeof normalizedTaskResult === "object"
          ? parseSlideOutline(normalizedTaskResult as Record<string, unknown>)
          : null
      const presentationMetadata = presentationFields
        ? {
            presentation_artifact: presentationFields.artifact,
            presentation_title: presentationFields.title,
            ...(presentationFields.themeName
              ? { presentation_theme: presentationFields.themeName }
              : {}),
            ...(presentationFields.slidesCreated != null
              ? { slides_created: presentationFields.slidesCreated }
              : {}),
            ...(slideOutline ? { slide_outline: slideOutline } : {}),
            generated_file: true,
          }
        : {}
      const documentMetadata =
        documentFields &&
        outputKind &&
        pipelineOutputUsesDocumentReader(outputKind)
          ? {
              document_markdown: documentFields.markdown,
              document_title: documentFields.title,
              document_filename: documentFields.filename,
              output_kind: outputKind,
              ...(documentFields.artifacts.length
                ? {
                    document_artifacts: documentFields.artifacts,
                    generated_file: true,
                  }
                : {}),
            }
          : {}
      const htmlWriteupMetadata = htmlWriteupFields
        ? {
            html_writeup: htmlWriteupFields.html,
            html_writeup_title: htmlWriteupFields.title,
            html_writeup_filename: htmlWriteupFields.filename,
            output_kind: "document",
            generated_file: true,
          }
        : {}
      let completionContent = "Pipeline completed. Final validated output is ready."
      if (presentationFields) {
        completionContent = "Slides look sharp and clean. Let me share the file."
      } else if (htmlWriteupFields) {
        completionContent = `Your **${htmlWriteupFields.title || "write-up"}** is ready. Preview it below.`
      } else if (documentFields && outputKind && pipelineOutputUsesDocumentReader(outputKind)) {
        completionContent = "Your document is ready. Review the sections below."
      }
      const finalMessage = await chatService.addMessage(conversationId, {
        role: "assistant",
        content: completionContent,
        metadata: {
          task_id: taskId,
          ...(normalizedTaskResult ? { task_result: normalizedTaskResult } : {}),
          ...(storedPlan ? { pipeline_plan: storedPlan } : {}),
          ...presentationMetadata,
          ...htmlWriteupMetadata,
          ...documentMetadata,
        },
      })
      pipelineCompletionPostedRef.current = postKey
      if (activeConversationIdRef.current === conversationId) {
        setMessages((prev) => [...prev, finalMessage])
      }

      if (shouldAutoGenerateBloomDocs && normalizedTaskResult) {
        const plain = resultToPlainText(normalizedTaskResult)
        if (plain.trim()) {
          try {
            const docs = await chatService.generateAcademicCourseDocuments({
              title: "Bloom Taxonomy Course Document",
              content: plain,
              base_filename: "bloom_course_plan",
            })
            const docx = docs.artifacts.find((a) => a.filename.toLowerCase().endsWith(".docx"))
            const pdf = docs.artifacts.find((a) => a.filename.toLowerCase().endsWith(".pdf"))
            const parts: string[] = [
              "Generated the course document package automatically for your Bloom taxonomy planner.",
            ]
            if (docx) {
              parts.push(
                `- [Download Word (.docx)](${buildDataUri(docx)})`
              )
            }
            if (pdf) {
              parts.push(
                `- [Download PDF (.pdf)](${buildDataUri(pdf)})`
              )
            }
            const docsMessage = await chatService.addMessage(conversationId, {
              role: "assistant",
              content: parts.join("\n"),
              metadata: { task_id: taskId, autogenerated_artifacts: true },
            })
            if (activeConversationIdRef.current === conversationId) {
              setMessages((prev) => [...prev, docsMessage])
            }
          } catch {
            // Non-blocking: keep normal pipeline completion even if doc export fails.
          }
        }
      }
    },
    [activeConversationId, messages, shouldAutoGenerateBloomDocs, showToast]
  )

  const buildPipelineTaskInput = (prompt: string): string => {
    const cleanPrompt = prompt.trim()
    const recentTurns =
      chatHistoryTurns <= 0
        ? []
        : messages
            .filter((m) => {
              if (m.role !== "user" && m.role !== "assistant") return false
              const c = (m.content || "").trim()
              if (!c) return false
              if (isPipelineUiMessage(c)) return false
              if (c.startsWith("Please attach your data (paperclip)")) return false
              return true
            })
            .slice(-chatHistoryTurns)
            .map((m) => ({
              role: m.role,
              content: (m.content || "").trim().slice(0, 1200),
            }))

    if (recentTurns.length === 0) return cleanPrompt

    let history = ""
    for (const turn of recentTurns) {
      const line = `${turn.role === "user" ? "User" : "Assistant"}: ${turn.content}\n`
      if ((history + line).length > 5000) break
      history += line
    }

    return [
      "Follow-up aware pipeline task.",
      "",
      "Previous conversation context:",
      history.trim(),
      "",
      "Latest user request:",
      cleanPrompt,
      "",
      "Instruction: Use the conversation context to resolve references such as pronouns ('them', 'it', 'that').",
    ].join("\n")
  }

  const showPipelineContinuePrompt = useCallback(() => {
    setShowPipelineContinueBanner(true)
    setShowPipelineSuggestBanner(false)
  }, [])

  const messagesBeforeEdit = useCallback(
    (source: ChatMessage[], fromMessageId: string | null) => {
      if (!fromMessageId) return source
      const idx = source.findIndex((m) => m.message_id === fromMessageId)
      return idx >= 0 ? source.slice(0, idx) : source
    },
    []
  )

  const sendMessage = async (
    overrideText?: string,
    editFromMessageIdOverride?: string | null,
    opts?: {
      fromIntake?: boolean
      intakeDisplay?: AssistantIntakeDisplayEntry[]
      intakeUserPrompt?: string
      intakeClarifyTrail?: AssistantIntakeClarifyTrailItem[]
    }
  ) => {
    if (sendInFlightRef.current) return
    const rawText = (overrideText ?? input).trim()
    const attachmentsBusy = composerAttachments.some((item) => item.status === "uploading")
    const viewingStream = hasBackgroundStream(backgroundStreamsRef.current, activeConversationId)
    if (
      (!rawText && composerAttachments.length === 0) ||
      viewingStream ||
      attachmentsBusy
    ) {
      return
    }

    if (
      promptQuotaUsage &&
      !promptQuotaUsage.isUnlimited &&
      (promptQuotaUsage.percent ?? 0) >= 100
    ) {
      handleChatQuotaExceeded({
        resetsAt: promptQuotaUsage.resetsAt,
        percent: promptQuotaUsage.percent,
      })
      return
    }

    // Ask for the assistant's required inputs before sending, if not already answered.
    const vaguePrompt = isVagueUserPrompt(rawText)
    const continuationRequest = isResponseContinuationRequest(rawText)
    const skipIntakeGate =
      continuationRequest || (intakeSatisfiedKey === intakeKey && !vaguePrompt)
    if (
      !opts?.fromIntake &&
      !intakeActive &&
      attachedIntakeTemplates.length > 0 &&
      !skipIntakeGate
    ) {
      const allTemplatesComplete =
        !vaguePrompt &&
        attachedIntakeTemplates.every((tpl) => {
        const fields = buildAssistantIntakeFields(tpl)
        const prefilled = prefillIntakeValues(fields, rawText, intakeContextMessages)
        return allIntakeFieldsAnswered(fields, prefilled, composerAttachments.length)
      })

      if (allTemplatesComplete) {
        const prompts = attachedIntakeTemplates.map((tpl) => {
          const fields = buildAssistantIntakeFields(tpl)
          const prefilled = prefillIntakeValues(fields, rawText, intakeContextMessages)
          const merged = { ...prefilled }
          if (composerAttachments.length > 0) {
            const names = composerAttachments.map((item) => item.file.name).join(", ")
            const phrase = `the attached ${composerAttachments.length === 1 ? "file" : "files"} (${names})`
            for (const field of fields) {
              if (field.kind === "file" && !merged[field.name]?.trim()) {
                merged[field.name] = phrase
              }
            }
          }
          return fillAssistantPromptTemplate(tpl, merged)
        })
        const valuesByTemplateId = Object.fromEntries(
          attachedIntakeTemplates.map((tpl) => {
            const templateId = String(tpl.template_id ?? "").trim()
            const fields = buildAssistantIntakeFields(tpl)
            const prefilled = prefillIntakeValues(fields, rawText, intakeContextMessages)
            const merged = { ...prefilled }
            if (composerAttachments.length > 0) {
              const names = composerAttachments.map((item) => item.file.name).join(", ")
              const phrase = `the attached ${composerAttachments.length === 1 ? "file" : "files"} (${names})`
              for (const field of fields) {
                if (field.kind === "file" && !merged[field.name]?.trim()) {
                  merged[field.name] = phrase
                }
              }
            }
            return [templateId, merged]
          })
        )
        setIntakeSatisfiedKey(intakeKey)
        const combined = prompts.filter((p) => p.trim()).join("\n\n---\n\n")
        if (!overrideText) setInput("")
        void sendMessage(combined || rawText, null, {
          fromIntake: true,
          intakeDisplay: buildIntakeDisplayEntries(attachedIntakeTemplates, valuesByTemplateId),
          intakeUserPrompt: rawText,
        })
        return
      }

      if (!overrideText) setInput("")
      setIntakePendingText(rawText)
      setIntakeStepIndex(0)
      setIntakeCollected([])
      setIntakeClarifyTrail([])
      setIntakeActive(true)
      return
    }
    const hasOnlyImageAttachments =
      composerAttachments.length > 0 &&
      composerAttachments.every((item) => isImageAttachment(item.file))
    const messageBody =
      rawText ||
      (composerAttachments.length > 0
        ? hasOnlyImageAttachments
          ? ""
          : "Please review the attached file(s)."
        : "")
    const text = formatChatMessageWithQuote(quotedExcerpt || "", messageBody)
    const intakeEntries =
      opts?.intakeDisplay && opts.intakeDisplay.length > 0
        ? opts.intakeDisplay
        : opts?.fromIntake
          ? buildCurrentIntakeDisplayEntries()
          : []
    const userMessageMetadata = opts?.fromIntake
      ? buildUserAssistantIntakeMetadata(intakeEntries, {
          userPrompt: opts.intakeUserPrompt,
          clarifyTrail: opts.intakeClarifyTrail,
        })
      : undefined
    const editFromMessageId = editFromMessageIdOverride ?? editingMessageId
    const historyBase = messagesBeforeEdit(messages, editFromMessageId)
    const optimisticUserMessage: ChatMessage = {
      message_id: `tmp-user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      conversation_id: activeConversationId ?? "draft",
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
      metadata: userMessageMetadata,
    }

    try {
      sendInFlightRef.current = true
      setShowPipelineSuggestBanner(false)
      if (editFromMessageId) {
        setEditingMessageId(null)
      }
      if (!overrideText) {
        setInput("")
        setQuotedExcerpt(null)
      }

      // Show the user bubble + thinking mark immediately — first send used to wait
      // on conversation create (~2s) with a blank landing.
      if (!activeConversationId) {
        skipNextConversationHydrateRef.current = true
      }
      setMessages([...historyBase, optimisticUserMessage])
      setChatStreaming(true)
      setStreamingText("")
      setStreamToolEvents([])
      streamToolEventsRef.current = []
      setStreamingUserQuery(text)
      setStreamStartedAt(Date.now())

      const conversationId = await createConversationOnFirstMessage(text)
      if (!conversationId) {
        skipNextConversationHydrateRef.current = false
        clearStreamUi()
        setMessages(historyBase)
        if (!overrideText) setInput(rawText)
        return
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.message_id === optimisticUserMessage.message_id
            ? { ...m, conversation_id: conversationId }
            : m
        )
      )

      const attachmentsForSend = await uploadQueuedAttachments(
        conversationId,
        composerAttachments
      )
      if (attachmentsForSend.length > 0) {
        setMessages((prev) =>
          prev.map((m) =>
            m.message_id === optimisticUserMessage.message_id
              ? { ...m, attachments: attachmentsForSend }
              : m
          )
        )
      }

      // Explicit pipeline mode always runs the pipeline (intent routing is only
      // for suggestions when mode is off). Keep short status phrases in chat.
      const usePipeline =
        pipelineModeEnabled &&
        !pipelineRunning &&
        !ghostModeEnabled &&
        shouldUseExplicitPipelineMode(text)

      if (usePipeline) {
        const userMsg = await chatService.addMessage(conversationId, {
          role: "user",
          content: text,
          metadata: userMessageMetadata,
          attachments:
            attachmentsForSend.length > 0
              ? attachmentsForSend.map((a) => ({
                  attachment_id: a.attachment_id,
                  filename: a.filename,
                  mime_type: a.mime_type,
                  size_bytes: a.size_bytes,
                }))
              : undefined,
        })
        if (userMsg.moderation_blocked) {
          clearStreamUi()
          setMessages((prev) =>
            applyChatModerationBlock(
              prev.filter((m) => m.message_id !== optimisticUserMessage.message_id),
              {
                user_message: userMsg,
                message: userMsg.moderation_message,
                policy_message: userMsg.policy_message,
              }
            )
          )
          return
        }
        setMessages((prev) => [
          ...prev.filter((m) => m.message_id !== optimisticUserMessage.message_id),
          userMsg,
        ])
        const pipelineTaskInput = buildPipelineTaskInput(text)
        const created = await createPipelineTaskWithAuthRecovery(pipelineTaskInput, conversationId)
        rememberTaskConversationLink(created.task_id, conversationId)
        runningPipelineByConversationRef.current.set(conversationId, created.task_id)
        pipelineCompletionPostedRef.current = null
        pipelineLifecyclePostedRef.current = null
        pipelineLifecycleMessageIdRef.current = new Map()
        pipelineExecutionApprovedRef.current = null
        markPipelineModeUsed()
        setPipelineTaskId(created.task_id)
        setPipelineRunning(true)
        setPipelinePanelHidden(false)
        setShowPipelineContinueBanner(false)
        clearStreamUi()
        clearComposerAttachments()
        return
      }

      const ghostSessionHistory =
        ghostModeEnabled && chatHistoryTurns > 0
          ? historyBase
              .filter((m) => (m.role === "user" || m.role === "assistant") && m.content.trim())
              .slice(-chatHistoryTurns * 2)
              .map((m) => ({
                role: m.role as "user" | "assistant",
                content: m.content.trim(),
              }))
          : undefined

      const initialStream = createBackgroundChatStream(conversationId, text)
      setBackgroundStream(backgroundStreamsRef.current, initialStream)
      applyBackgroundStreamToUi(initialStream)
      streamToolEventsRef.current = []
      const ctxForSend = ghostModeEnabled
        ? { ...chatContext, useMemory: false }
        : chatContext
      const ctxOpts = chatContextToTaskOptions(ctxForSend)
      const clientCtx = await buildChatClientContext(text)
      const streamBody = withChatStreamPreferences(
        {
          message: text,
          thinking_mode: attachedChatTemplateIds.length > 0 ? "deep" : chatThinkingMode,
          agent_template_id: attachedChatTemplateId,
          agent_template_ids:
            attachedChatTemplateIds.length > 0 ? attachedChatTemplateIds : undefined,
          use_rag: attachedChatTemplateIds.length > 0 ? true : ctxOpts.use_rag,
          rag_sources: ctxOpts.rag_sources,
          ...clientCtx,
          ghost_mode: ghostModeEnabled,
          session_history: ghostSessionHistory,
          truncate_from_message_id:
            !ghostModeEnabled && editFromMessageId ? editFromMessageId : undefined,
          user_message_metadata: userMessageMetadata,
          attachments:
            attachmentsForSend.length > 0
              ? attachmentsForSend.map((a) => ({
                  attachment_id: a.attachment_id,
                  filename: a.filename,
                  mime_type: a.mime_type,
                  size_bytes: a.size_bytes,
                }))
              : undefined,
        },
        { useMemory: ctxForSend.useMemory }
      )
      const streamController = beginChatStream(conversationId)
      void chatService
        .streamReply(
          conversationId,
          streamBody,
          {
          onToken: (delta) => {
            if (!chatStreamResponsesRef.current) return
            const current = getBackgroundStream(backgroundStreamsRef.current, conversationId)
            if (!current) return
            const next = appendBackgroundStreamToken(current, delta)
            setBackgroundStream(backgroundStreamsRef.current, next)
            if (activeConversationIdRef.current === conversationId) {
              setStreamingText(next.streamingText)
            }
          },
          onDone: (payload) => {
            if (shouldIgnoreStreamCompletion(conversationId)) return
            applyStreamConversationTitle(queryClient, conversationId, payload?.conversation_title)
            const doneMessage = payload?.message
            const streamSnapshot = getBackgroundStream(backgroundStreamsRef.current, conversationId)
            const streamEvents = streamSnapshot?.toolEvents ?? []
            const hydratedMessage = doneMessage
              ? mergeToolEventsIntoMessage(doneMessage, streamEvents)
              : null
            const viewing = activeConversationIdRef.current === conversationId
            if (hydratedMessage && viewing) {
              setMessages((prev) => {
                const withoutTmp = ghostModeEnabled
                  ? prev
                  : prev.filter((m) => !m.message_id.startsWith("tmp-user-"))
                const existingIdx = withoutTmp.findIndex(
                  (msg) => msg.message_id === hydratedMessage.message_id
                )
                if (existingIdx >= 0) {
                  const next = [...withoutTmp]
                  next[existingIdx] = hydratedMessage
                  return next
                }
                return [...withoutTmp, hydratedMessage]
              })
            }
            removeBackgroundStream(backgroundStreamsRef.current, conversationId)
            if (viewing) {
              clearStreamUi()
            } else {
              showToast("Reply ready in your previous chat.", "success")
            }
            if (!ghostModeEnabled && viewing) {
              void chatService
                .getConversation(conversationId)
                .then((data) => {
                  if (activeConversationIdRef.current !== conversationId) return
                  const hydrated = hydrateChatMessageAttachments(
                    data.messages,
                    data.attachments ?? [],
                    conversationId
                  )
                  setMessages((prev) => mergeMessagesPreserveToolEvents(hydrated, prev))
                })
                .catch(() => {
                  // Keep optimistic UI state if refresh fails transiently.
                })
            } else if (!ghostModeEnabled && !viewing) {
              void chatService.getConversation(conversationId).catch(() => undefined)
            }
          },
          onModerationBlocked: (payload) => {
            removeBackgroundStream(backgroundStreamsRef.current, conversationId)
            if (activeConversationIdRef.current === conversationId) {
              clearStreamUi()
              setMessages((prev) => applyChatModerationBlock(prev, payload, text))
            }
          },
          onToolEvent: (event) => {
            const current = getBackgroundStream(backgroundStreamsRef.current, conversationId)
            if (!current) return
            const next = appendBackgroundStreamToolEvent(current, event)
            setBackgroundStream(backgroundStreamsRef.current, next)
            if (activeConversationIdRef.current === conversationId) {
              streamToolEventsRef.current = next.toolEvents
              setStreamToolEvents(next.toolEvents)
            }
          },
          onQuotaExceeded: handleChatQuotaExceeded,
          onAborted: () => {
            if (shouldIgnoreStreamCompletion(conversationId)) return
          },
          onError: async (message) => {
            if (shouldIgnoreStreamCompletion(conversationId)) return
            removeBackgroundStream(backgroundStreamsRef.current, conversationId)
            if (activeConversationIdRef.current === conversationId) {
              clearStreamUi()
              const errMsg = await chatService.addMessage(conversationId, {
                role: "assistant",
                content: formatChatStreamError(message),
                metadata: { stream_error: true },
              })
              setMessages((prev) => [...prev, errMsg])
            }
          },
        },
        { signal: streamController.signal }
        )
        .catch((err) => {
          if (streamUserStoppedRef.current) {
            shouldIgnoreStreamCompletion(conversationId)
            return
          }
          removeBackgroundStream(backgroundStreamsRef.current, conversationId)
          if (activeConversationIdRef.current === conversationId) {
            clearStreamUi()
            if (isCreditQuotaExceededError(err)) {
              handleChatQuotaExceeded({
                message: err.message,
                resetsAt: err.quotaResetsAt,
                percent: 100,
              })
              return
            }
            setConversationError(
              err instanceof Error
                ? err.message
                : "Could not send your message. Please try again."
            )
          }
        })
      clearComposerAttachments()
      return
    } catch (err) {
      skipNextConversationHydrateRef.current = false
      clearStreamUi()
      setMessages(historyBase)
      if (!overrideText) setInput(rawText)
      if (isCreditQuotaExceededError(err)) {
        handleChatQuotaExceeded({
          message: err.message,
          resetsAt: err.quotaResetsAt,
          percent: 100,
        })
        return
      }
      const detail =
        err instanceof Error ? err.message : "Could not send your message. Please try again."
      setConversationError(detail)
    } finally {
      sendInFlightRef.current = false
    }
  }

  const handlePlanExecutionStarted = useCallback(
    (startedTaskId: string) => {
      pipelineExecutionApprovedRef.current = startedTaskId
      const existingId =
        pipelineLifecycleMessageIdRef.current.get(startedTaskId) ??
        messages.find(
          (m) =>
            m.metadata?.pipeline_lifecycle === true &&
            String(m.metadata?.task_id || "").trim() === startedTaskId
        )?.message_id

      if (existingId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.message_id === existingId
              ? {
                  ...m,
                  content: pipelineLifecycleContent("activated"),
                  metadata: {
                    ...(m.metadata || {}),
                    ...buildPipelineLifecycleMetadata(startedTaskId, "activated"),
                  },
                }
              : m
          )
        )
      }
    },
    [messages]
  )

  const handlePipelineCompleted = useCallback(
    (completedTaskId: string, fallbackTask?: unknown) => {
      const conversationId =
        readStoredTaskConversationId(completedTaskId) || activeConversationId
      const notifyWhenReady = isPipelineNotifyOptedIn(completedTaskId)
      if (conversationId) {
        runningPipelineByConversationRef.current.delete(conversationId)
      }
      clearPipelineNotifyOptIn(completedTaskId)
      setPipelineRunning(false)
      setPipelinePanelHidden(true)
      setPipelineMode(false)
      showPipelineContinuePrompt()
      notifyTaskTerminalStatus(completedTaskId, "completed")
      const fallbackResult =
        fallbackTask && typeof fallbackTask === "object" && !Array.isArray(fallbackTask)
          ? normalizeTaskResultForViewer(fallbackTask as Record<string, unknown>)
          : fallbackTask
      void postPipelineCompletionMessage(completedTaskId, fallbackResult)
      const viewing = activeConversationIdRef.current === conversationId
      if (!viewing && conversationId && notifyWhenReady) {
        notifyPipelineChatReady({
          conversationId,
          taskId: completedTaskId,
          onOpenChat: () => openPipelineConversation(conversationId),
        })
        showToast("Your pipeline response is ready.", "success", {
          actionLabel: "Open chat",
          onAction: () => openPipelineConversation(conversationId),
          durationMs: 12000,
        })
      }
    },
    [activeConversationId, openPipelineConversation, postPipelineCompletionMessage, showPipelineContinuePrompt, showToast]
  )

  const handlePipelineFailed = useCallback(
    async (failedTaskId: string, error?: string) => {
      const conversationId =
        readStoredTaskConversationId(failedTaskId) || activeConversationId
      const notifyWhenReady = isPipelineNotifyOptedIn(failedTaskId)
      if (conversationId) {
        runningPipelineByConversationRef.current.delete(conversationId)
      }
      clearPipelineNotifyOptIn(failedTaskId)
      setPipelineRunning(false)
      setPipelineMode(false)
      showPipelineContinuePrompt()
      notifyTaskTerminalStatus(failedTaskId, "failed")
      if (!conversationId || pipelineFailurePostedRef.current.has(failedTaskId)) return
      pipelineFailurePostedRef.current.add(failedTaskId)
      const failMessage = await chatService.addMessage(conversationId, {
        role: "assistant",
        content: `Pipeline failed. ${error || "Pipeline ended with a failed status."}`,
        metadata: { task_id: failedTaskId },
      })
      if (activeConversationIdRef.current === conversationId) {
        setMessages((prev) => [...prev, failMessage])
      } else if (conversationId && notifyWhenReady) {
        notifyPipelineChatReady({
          conversationId,
          taskId: failedTaskId,
          failed: true,
          onOpenChat: () => openPipelineConversation(conversationId),
        })
        showToast("Pipeline failed in your other chat.", "error", {
          actionLabel: "Open chat",
          onAction: () => openPipelineConversation(conversationId),
          durationMs: 12000,
        })
      }
    },
    [activeConversationId, openPipelineConversation, showPipelineContinuePrompt, showToast]
  )

  useEffect(() => {
    let cancelled = false

    const pollOptedInPipelineTasks = async () => {
      const optIns = readPipelineNotifyOptIns()
      if (!optIns.length) return

      for (const entry of optIns) {
        if (pipelineNotifyWatcherInFlightRef.current.has(entry.taskId)) continue
        pipelineNotifyWatcherInFlightRef.current.add(entry.taskId)
        try {
          const task = await tasksService.get(entry.taskId)
          if (cancelled) return
          const st = String(task.status || "").toLowerCase()

          if (st === "completed" && taskHasApprovedPlanExecution(task as Task)) {
            clearPipelineNotifyOptIn(entry.taskId)
            runningPipelineByConversationRef.current.delete(entry.conversationId)
            await postPipelineCompletionMessage(
              entry.taskId,
              task as unknown as Record<string, unknown>
            )
            if (activeConversationIdRef.current !== entry.conversationId) {
              notifyPipelineChatReady({
                conversationId: entry.conversationId,
                taskId: entry.taskId,
                onOpenChat: () => openPipelineConversation(entry.conversationId),
              })
              showToast("Your pipeline response is ready.", "success", {
                actionLabel: "Open chat",
                onAction: () => openPipelineConversation(entry.conversationId),
                durationMs: 12000,
              })
            }
          } else if (
            st === "failed" ||
            st === "error" ||
            st === "cancelled" ||
            st === "timeout"
          ) {
            clearPipelineNotifyOptIn(entry.taskId)
            runningPipelineByConversationRef.current.delete(entry.conversationId)
            if (activeConversationIdRef.current !== entry.conversationId) {
              notifyPipelineChatReady({
                conversationId: entry.conversationId,
                taskId: entry.taskId,
                failed: true,
                onOpenChat: () => openPipelineConversation(entry.conversationId),
              })
              showToast("Pipeline failed in your other chat.", "error", {
                actionLabel: "Open chat",
                onAction: () => openPipelineConversation(entry.conversationId),
                durationMs: 12000,
              })
            }
          }
        } catch {
          // Ignore transient polling errors.
        } finally {
          pipelineNotifyWatcherInFlightRef.current.delete(entry.taskId)
        }
      }
    }

    const interval = window.setInterval(() => {
      void pollOptedInPipelineTasks()
    }, 4000)
    void pollOptedInPipelineTasks()

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [openPipelineConversation, postPipelineCompletionMessage, showToast])

  useEffect(() => {
    if (!activeConversationId || conversationLoading || messages.length === 0) return
    let cancelled = false
    const generation = ++pipelineRecoveryGenerationRef.current

    const allTaskIds = new Set<string>()
    const terminalTaskIds = new Set<string>()

    for (const msg of messages) {
      const rawTaskId = msg.metadata?.task_id
      const taskId = typeof rawTaskId === "string" ? rawTaskId.trim() : ""
      if (!taskId) continue
      allTaskIds.add(taskId)
      const content = (msg.content || "").trim()
      if (
        isPipelineCompletionContent(content) ||
        content.startsWith("Pipeline failed.") ||
        msg.metadata?.presentation_artifact ||
        msg.metadata?.task_result ||
        (typeof msg.metadata?.document_markdown === "string" &&
          msg.metadata.document_markdown.trim()) ||
        Boolean(msg.metadata?.html_writeup)
      ) {
        terminalTaskIds.add(taskId)
      }
    }

    const pendingTaskIds = [...allTaskIds].filter((taskId) => !terminalTaskIds.has(taskId))
    if (pendingTaskIds.length === 0) return

    void (async () => {
      let latestRunningTaskId: string | null = null

      for (const taskId of pendingTaskIds) {
        if (cancelled || generation !== pipelineRecoveryGenerationRef.current) return
        try {
          const task = await tasksService.get(taskId)
          if (cancelled || generation !== pipelineRecoveryGenerationRef.current) return
          const st = String(task.status || "").toLowerCase()

          if (st === "completed") {
            if (!conversationHasPipelineCompletion(messages, taskId)) {
              await postPipelineCompletionMessage(
                taskId,
                task as unknown as Record<string, unknown>
              )
            }
          } else if (st === "failed" || st === "error" || st === "cancelled" || st === "timeout") {
            const err =
              typeof (task as { error?: unknown }).error === "string"
                ? (task as { error: string }).error
                : undefined
            await handlePipelineFailed(taskId, err)
          } else if (st === "awaiting_plan_review") {
            latestRunningTaskId = taskId
          } else if (st === "running" && !taskHasApprovedPlanExecution(task as Task)) {
            latestRunningTaskId = taskId
          } else if (taskHasApprovedPlanExecution(task as Task)) {
            latestRunningTaskId = taskId
          }
        } catch {
          // Ignore transient recovery fetch errors.
        }
      }

      if (
        cancelled ||
        generation !== pipelineRecoveryGenerationRef.current ||
        !latestRunningTaskId
      ) {
        return
      }

      rememberTaskConversationLink(latestRunningTaskId, activeConversationId)
      runningPipelineByConversationRef.current.set(activeConversationId, latestRunningTaskId)
      setPipelineTaskId(latestRunningTaskId)
      setPipelineRunning(true)
      setPipelinePanelHidden(false)
      setPipelineMode(true)
    })()

    return () => {
      cancelled = true
    }
  }, [
    activeConversationId,
    conversationLoading,
    messages,
    postPipelineCompletionMessage,
    handlePipelineFailed,
  ])


  useEffect(() => {
    if (!pipelineTaskSnapshot || !pipelineTaskId || !pipelineRunning || !activeConversationId) return
    if (!isPlanReviewPhase(pipelineTaskSnapshot as Task)) return

    const postKey = `${activeConversationId}:${pipelineTaskId}:plan`
    if (pipelineLifecyclePostedRef.current === postKey) return

    const plan = extractPipelinePlanFromTask(pipelineTaskSnapshot as Task)
    if (!plan?.plan_markdown?.trim()) return

    const existingLifecycle = messages.find(
      (m) =>
        m.metadata?.pipeline_lifecycle === true &&
        String(m.metadata?.task_id || "").trim() === pipelineTaskId
    )
    if (existingLifecycle) {
      pipelineLifecyclePostedRef.current = postKey
      pipelineLifecycleMessageIdRef.current.set(pipelineTaskId, existingLifecycle.message_id)
      return
    }

    pipelineLifecyclePostedRef.current = postKey
    void (async () => {
      try {
        const lifecycleMessage = await chatService.addMessage(activeConversationId, {
          role: "assistant",
          content: pipelineLifecycleContent("plan_review"),
          metadata: buildPipelineLifecycleMetadata(pipelineTaskId, "plan_review", plan),
        })
        pipelineLifecycleMessageIdRef.current.set(pipelineTaskId, lifecycleMessage.message_id)
        setMessages((prev) => [...prev, lifecycleMessage])
      } catch {
        pipelineLifecyclePostedRef.current = null
      }
    })()
  }, [activeConversationId, messages, pipelineTaskSnapshot, pipelineTaskId, pipelineRunning])

  useEffect(() => {
    if (!pipelineTaskSnapshot || !pipelineTaskId || !pipelineRunning) return
    if (isPlanReviewPhase(pipelineTaskSnapshot as Task)) return
    const st = String(pipelineTaskSnapshot.status || "").toLowerCase()
    if (st === "completed") {
      handlePipelineCompleted(pipelineTaskId, pipelineTaskSnapshot as Task)
      return
    }
    if (st === "failed" || st === "error" || st === "cancelled" || st === "timeout") {
      const err =
        typeof (pipelineTaskSnapshot as { error?: unknown }).error === "string"
          ? (pipelineTaskSnapshot as { error: string }).error
          : undefined
      void handlePipelineFailed(pipelineTaskId, err)
    }
  }, [
    pipelineTaskSnapshot,
    pipelineTaskId,
    pipelineRunning,
    handlePipelineCompleted,
    handlePipelineFailed,
  ])

  const handleAttach = async (file: File, existingCountOverride?: number) => {
    const existingCount =
      existingCountOverride ??
      composerAttachments.filter((entry) => entry.status !== "error").length
    const validation = validateChatFileUpload(file, uploadLimits, existingCount)
    if (!validation.ok) {
      showToast(validation.message || "Upload not allowed on your plan.", "error")
      return
    }
    const item = createComposerAttachmentItem(file)
    setComposerAttachments((prev) => [item, ...prev])

    setComposerAttachments((prev) =>
      prev.map((entry) =>
        entry.localId === item.localId ? { ...entry, status: "uploading" as const } : entry
      )
    )
    try {
      const conversationId = await ensureConversationForAttachments(file.name)
      if (!conversationId) {
        throw new Error("Could not create a chat to store this file.")
      }
      const attachment = await chatService.uploadAttachment(conversationId, file)
      const warning = attachmentWarningMessage(attachment)
      setComposerAttachments((prev) =>
        prev.map((entry) =>
          entry.localId === item.localId
            ? { ...entry, status: "ready" as const, attachment, warning: warning ?? undefined }
            : entry
        )
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed"
      setComposerAttachments((prev) =>
        prev.map((entry) =>
          entry.localId === item.localId
            ? { ...entry, status: "error" as const, error: message }
            : entry
        )
      )
      showToast(message, "error")
    }
  }

  const handleAttachFiles = async (files: File[]) => {
    let existingCount = composerAttachments.filter((entry) => entry.status !== "error").length
    for (const file of files) {
      await handleAttach(file, existingCount)
      existingCount += 1
    }
  }

  const regenerateAssistant = async (assistantMessageId: string) => {
    const viewingStream = hasBackgroundStream(backgroundStreamsRef.current, activeConversationId)
    if (sendInFlightRef.current || viewingStream || pipelineRunning) return
    const assistantIdx = messages.findIndex((m) => m.message_id === assistantMessageId)
    if (assistantIdx <= 0) return
    const assistantMessage = messages[assistantIdx]
    if (assistantMessage.role !== "assistant") return
    if (assistantMessage.metadata?.task_id || assistantMessage.metadata?.moderation_notice) return

    const priorUser = [...messages.slice(0, assistantIdx)]
      .reverse()
      .find((m) => m.role === "user")
    if (!priorUser?.content.trim()) return

    const conversationId = activeConversationId
    if (!conversationId) return

    setEditingMessageId(null)
    sendInFlightRef.current = true
    setRegeneratingMessageId(assistantMessageId)

    const initialStream = createBackgroundChatStream(conversationId, priorUser.content.trim())
    setBackgroundStream(backgroundStreamsRef.current, initialStream)
    applyBackgroundStreamToUi(initialStream)
    streamToolEventsRef.current = []

    const historyBeforeAssistant = messages.slice(0, assistantIdx)
    const ghostSessionHistory =
      ghostModeEnabled && chatHistoryTurns > 0
        ? historyBeforeAssistant
            .filter((m) => (m.role === "user" || m.role === "assistant") && m.content.trim())
            .slice(-chatHistoryTurns * 2)
            .map((m) => ({
              role: m.role as "user" | "assistant",
              content: m.content.trim(),
            }))
        : undefined

    try {
      const ctxForRegen = ghostModeEnabled
        ? { ...chatContext, useMemory: false }
        : chatContext
      const regenCtxOpts = chatContextToTaskOptions(ctxForRegen)
      const regenClientCtx = await buildChatClientContext(priorUser.content.trim())
      const streamController = beginChatStream(conversationId)
      void chatService
        .streamReply(
          conversationId,
          withChatStreamPreferences(
            {
              message: priorUser.content.trim(),
              thinking_mode: attachedChatTemplateIds.length > 0 ? "deep" : chatThinkingMode,
              agent_template_id: attachedChatTemplateId,
              agent_template_ids:
                attachedChatTemplateIds.length > 0 ? attachedChatTemplateIds : undefined,
              use_rag: attachedChatTemplateIds.length > 0 ? true : regenCtxOpts.use_rag,
              rag_sources: regenCtxOpts.rag_sources,
              ...regenClientCtx,
              ghost_mode: ghostModeEnabled,
              session_history: ghostSessionHistory,
              regenerate_assistant_message_id: assistantMessageId,
            },
            { useMemory: ctxForRegen.useMemory }
          ),
          {
            onToken: (delta) => {
              if (!chatStreamResponsesRef.current) return
              const current = getBackgroundStream(backgroundStreamsRef.current, conversationId)
              if (!current) return
              const next = appendBackgroundStreamToken(current, delta)
              setBackgroundStream(backgroundStreamsRef.current, next)
              if (activeConversationIdRef.current === conversationId) {
                setStreamingText(next.streamingText)
              }
            },
            onDone: (payload) => {
              if (shouldIgnoreStreamCompletion(conversationId)) return
              applyStreamConversationTitle(queryClient, conversationId, payload?.conversation_title)
              const doneMessage = payload?.message
              const streamSnapshot = getBackgroundStream(backgroundStreamsRef.current, conversationId)
              const streamEvents = streamSnapshot?.toolEvents ?? []
              const viewing = activeConversationIdRef.current === conversationId
              if (doneMessage && viewing) {
                setMessages((prev) =>
                  prev.map((m) => {
                    if (m.message_id !== assistantMessageId) return m
                    return mergeRegeneratedAssistantMessage(
                      m,
                      mergeToolEventsIntoMessage(doneMessage, streamEvents)
                    )
                  })
                )
              }
              removeBackgroundStream(backgroundStreamsRef.current, conversationId)
              if (viewing) {
                clearStreamUi()
              } else {
                showToast("Reply ready in your previous chat.", "success")
              }
            },
            onModerationBlocked: (payload) => {
              removeBackgroundStream(backgroundStreamsRef.current, conversationId)
              if (activeConversationIdRef.current === conversationId) {
                clearStreamUi()
                setMessages((prev) => applyChatModerationBlock(prev, payload))
              }
            },
            onToolEvent: (event) => {
              const current = getBackgroundStream(backgroundStreamsRef.current, conversationId)
              if (!current) return
              const next = appendBackgroundStreamToolEvent(current, event)
              setBackgroundStream(backgroundStreamsRef.current, next)
              if (activeConversationIdRef.current === conversationId) {
                streamToolEventsRef.current = next.toolEvents
                setStreamToolEvents(next.toolEvents)
              }
            },
            onQuotaExceeded: handleChatQuotaExceeded,
            onAborted: () => {
              if (shouldIgnoreStreamCompletion(conversationId)) return
            },
            onError: async (message) => {
              if (shouldIgnoreStreamCompletion(conversationId)) return
              removeBackgroundStream(backgroundStreamsRef.current, conversationId)
              if (activeConversationIdRef.current === conversationId) {
                clearStreamUi()
                setConversationError(formatChatStreamError(message))
              }
            },
          },
          { signal: streamController.signal }
        )
        .catch((err) => {
          if (streamUserStoppedRef.current) {
            shouldIgnoreStreamCompletion(conversationId)
            return
          }
          removeBackgroundStream(backgroundStreamsRef.current, conversationId)
          if (activeConversationIdRef.current === conversationId) {
            clearStreamUi()
            if (isCreditQuotaExceededError(err)) {
              handleChatQuotaExceeded({
                message: err.message,
                resetsAt: err.quotaResetsAt,
                percent: 100,
              })
              return
            }
            const detail =
              err instanceof Error
                ? err.message
                : "Could not regenerate the response. Please try again."
            setConversationError(detail)
          }
        })
    } catch (err) {
      removeBackgroundStream(backgroundStreamsRef.current, conversationId)
      if (activeConversationIdRef.current === conversationId) {
        clearStreamUi()
      }
      if (isCreditQuotaExceededError(err)) {
        handleChatQuotaExceeded({
          message: err.message,
          resetsAt: err.quotaResetsAt,
          percent: 100,
        })
        return
      }
      const detail =
        err instanceof Error ? err.message : "Could not regenerate the response. Please try again."
      setConversationError(detail)
    } finally {
      setRegeneratingMessageId(null)
      sendInFlightRef.current = false
    }
  }

  const handleBranchInNewChat = async (assistantMessageId: string) => {
    if (chatStreaming || pipelineRunning) return
    const assistantIdx = messages.findIndex((m) => m.message_id === assistantMessageId)
    if (assistantIdx <= 0) return

    const branchMessages = messages.slice(0, assistantIdx)
    const priorUser = [...branchMessages].reverse().find((m) => m.role === "user")
    const title =
      priorUser?.content.trim().replace(/\s+/g, " ").slice(0, 80) || "Branched chat"

    try {
      skipNextConversationHydrateRef.current = true
      setForceDraftChat(false)
      forceDraftFromConversationRef.current = null
      const created = await createConversation.mutateAsync({
        title,
        thinking_mode: chatThinkingMode,
        ghost_mode: isSignedIn && ghostModeEnabled,
      })
      if (!isSignedIn) {
        registerGuestConversationId(created.conversation_id)
      } else if (ghostModeEnabled) {
        registerGhostConversationId(created.conversation_id)
      }

      setPendingConversationId(created.conversation_id)
      setEditingMessageId(null)
      setStreamingText("")
      setRegeneratingMessageId(null)
      router.replace(ROUTES.chatConversation(created.conversation_id), { scroll: false })

      if (!ghostModeEnabled) {
        for (const msg of branchMessages) {
          if (msg.role !== "user" && msg.role !== "assistant") continue
          if (!msg.content.trim()) continue
          await chatService.addMessage(created.conversation_id, {
            role: msg.role,
            content: msg.content.trim(),
          })
        }
        const data = await chatService.getConversation(created.conversation_id)
        setMessages(
          hydrateChatMessageAttachments(
            data.messages,
            data.attachments ?? [],
            created.conversation_id
          )
        )
      } else {
        setMessages(branchMessages)
      }

      showToast("Branched into a new chat.", "success")
    } catch (err) {
      const detail =
        err instanceof Error ? err.message : "Could not branch into a new chat."
      showToast(detail, "error")
    }
  }

  const handleSelectResponseVersion = async (messageId: string, index: number) => {
    const current = messages.find((m) => m.message_id === messageId)
    if (!current) return

    setMessages((prev) =>
      prev.map((m) => (m.message_id === messageId ? withActiveResponseIndex(m, index) : m))
    )

    if (ghostModeEnabled || !activeConversationId) return

    try {
      const updated = await chatService.setActiveResponseVersion(
        activeConversationId,
        messageId,
        index
      )
      setMessages((prev) =>
        prev.map((m) => (m.message_id === messageId ? updated : m))
      )
    } catch {
      // Keep optimistic local version selection when the API is unavailable.
    }
  }

  const handleStartEdit = (messageId: string) => {
    setEditingMessageId(messageId)
    setInput("")
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null)
  }

  const handleSaveEdit = (messageId: string, content: string) => {
    const text = content.trim()
    if (!text || chatStreaming) return
    void sendMessage(text, messageId)
  }

  const handleChatContextChange = useCallback(
    (next: ChatContextSelection) => {
      if (ghostModeEnabled) {
        setChatContext({ ...next, useMemory: false })
        return
      }
      let resolved = next
      if (!next.useMemory && chatContext.useMemory) {
        resolved = chatContextAfterMemoryDisabled(next)
      } else if (next.useMemory && !chatContext.useMemory) {
        enableMemoryFromChat()
      }
      persistChatAttachedTemplates(resolved.templateIds)
      persistChatMemoryContext(resolved)
      setChatContext(resolved)
    },
    [ghostModeEnabled, chatContext.useMemory]
  )

  const handlePipelineModeChange = useCallback(
    (enabled: boolean) => {
      if (ghostModeEnabled) return
      setPipelineMode(enabled)
      if (enabled) {
        markPipelineModeUsed()
        setShowPipelineSuggestBanner(false)
        setShowPipelineContinueBanner(false)
        pipelineSuggestDismissedRef.current = true
        dismissPipelineEnableSuggest()
      }
    },
    [ghostModeEnabled]
  )

  const composerChatContext = ghostModeEnabled
    ? { ...chatContext, useMemory: false }
    : chatContext

  const showConversationFeedback = useMemo(
    () =>
      !showEmptyHero &&
      shouldShowConversationFeedback({
        messages,
        isStreaming: chatStreaming,
        regeneratingMessageId,
      }),
    [showEmptyHero, messages, chatStreaming, regeneratingMessageId]
  )

  return (
    <ChatPresentationPanelProvider conversationId={activeConversationId}>
    <ChatSourcesPanelProvider>
    {chatIntroTour}
    <div
      className={cn(
        "relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
        pipelineModeEnabled && !ghostModeEnabled
          ? "chat-shell-pipeline-ambient"
          : "bg-background"
      )}
    >
      <ChatIncognitoBar />
      <div
        data-pipeline-mode={
          pipelineModeEnabled && !ghostModeEnabled ? "" : undefined
        }
        data-chat-document-host=""
        className={cn(
          "relative flex min-h-0 w-full min-w-0 flex-1 flex-col",
          pipelineModeEnabled && !ghostModeEnabled && "chat-window-pipeline-inset"
        )}
      >
        {hasMounted && !ghostModeEnabled ? (
          <ChatWorkspaceTopBar
            showPlanBanner
            showShare={Boolean(!showEmptyHero && activeConversationId)}
            conversationId={activeConversationId}
            messages={messages}
            conversationTitle={activeConversation?.title}
            shareDisabled={chatStreaming || pipelineRunning || messages.length === 0}
            showIncognito={isSignedIn}
          />
        ) : null}
        <div
          ref={scrollAreaRef}
          data-chat-scroll=""
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-contain bg-transparent scrollbar-thin [overflow-anchor:none]"
        >
            {conversationError ? (
              <div className={chatColumnClass("px-4 pt-4")}>
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                  {conversationError}
                  <button
                    type="button"
                    onClick={() => router.refresh()}
                    className="ml-2 underline underline-offset-2 hover:no-underline"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : null}

            {showEmptyHero ? (
              <ChatEmptyLanding
                username={user?.username}
                email={user?.email}
                isNewDraft={isNewDraftChat}
                incognitoMode={ghostModeEnabled}
                pipelineMode={!ghostModeEnabled && pipelineModeEnabled}
                composer={
                  <div className="w-full space-y-2">
                    {assistantIntakeCard}
                  <ChatComposer
                    layout="landing"
                    incognitoMode={ghostModeEnabled}
                    focusRequest={composerFocusRequest}
                    quotedExcerpt={quotedExcerpt}
                    onClearQuotedExcerpt={() => setQuotedExcerpt(null)}
                    value={input}
                    onChange={setInput}
                    onSubmit={() => void sendMessage()}
                    onAttach={(file) => void handleAttach(file)}
                    onAttachFiles={(files) => void handleAttachFiles(files)}
                    onVoice={handleVoice}
                    onVoiceCancel={handleVoiceCancel}
                    onVoiceStop={handleVoiceStop}
                    disabled={chatStreaming || pipelineRunning || quotaLocked}
                    quotaLocked={quotaLocked}
                    quotaLockMessage={quotaLockMessage}
                    onQuotaUpgrade={() => setQuotaDialogOpen(true)}
                    composerAttachments={composerAttachments}
                    onRemoveComposerAttachment={removeComposerAttachment}
                    voiceState={voiceState}
                    pipelineModeEnabled={ghostModeEnabled ? false : pipelineModeEnabled}
                    onPipelineModeChange={ghostModeEnabled ? undefined : handlePipelineModeChange}
                    chatContext={composerChatContext}
                    onChatContextChange={handleChatContextChange}
                    ragFiles={ragFiles}
                    ragLoading={ragLoading}
                    templates={templatesData?.templates}
                    templatesLoading={templatesLoading}
                    isGenerating={chatStreaming}
                    onStopGenerating={() => void stopGenerating()}
                  />
                  </div>
                }
              />
            ) : (
              <>
                {/*
                  Spacer matches composer dock height so the last reply ends just
                  above Ask anything — no extra empty scroll beyond the output.
                */}
                <div className="flex flex-col">
                  <MessageThread
                    ref={setMessageThreadEl}
                    messages={messages}
                    streamingText={streamingText}
                    isAssistantStreaming={chatStreaming}
                    webSearchStatus={webSearchStatus}
                    streamingToolEvents={streamToolEvents}
                    streamingUserQuery={streamingUserQuery}
                    streamStartedAt={streamStartedAt}
                    streamingWebSources={streamingWebSources}
                    onRetryAssistant={(messageId) => void regenerateAssistant(messageId)}
                    onSelectResponseVersion={(messageId, index) =>
                      void handleSelectResponseVersion(messageId, index)
                    }
                    regeneratingMessageId={regeneratingMessageId}
                    editingMessageId={editingMessageId}
                    editDisabled={chatStreaming || pipelineRunning}
                    onStartEdit={handleStartEdit}
                    onCancelEdit={handleCancelEdit}
                    onSaveEdit={handleSaveEdit}
                    onBranchInNewChat={(messageId) => void handleBranchInNewChat(messageId)}
                    onActionNotice={(message, variant = "info") => showToast(message, variant)}
                    allowRetry
                    showTaskLinks={hasMounted && isSignedIn}
                    activeConversationId={activeConversationId}
                    onFollowUpPick={(prompt) => {
                      setInput(prompt)
                      void sendMessage(prompt)
                    }}
                    suppressInlinePlanReviewTaskId={
                      pipelineTaskId && pipelineRunning && !pipelinePanelHidden
                        ? pipelineTaskId
                        : null
                    }
                    livePipelineTaskId={pipelineTaskId}
                    livePipelineTaskStatus={pipelineTaskSnapshot?.status}
                    templates={templatesData?.templates}
                    streamingAssistantTemplateId={
                      chatStreaming ? attachedChatTemplateId : null
                    }
                    incognitoMode={ghostModeEnabled}
                  />
                  {showLivePipelinePanel && pipelineTaskId ? (
                    <div className={chatColumnClass("max-w-6xl px-4 pb-3")}>
                      <ChatPipelinePanel
                        taskId={pipelineTaskId}
                        conversationId={activeConversationId}
                        onExecutionStarted={handlePlanExecutionStarted}
                        onCompleted={handlePipelineCompleted}
                        onFailed={(id, err) => void handlePipelineFailed(id, err)}
                        onDismiss={() => setPipelinePanelHidden(true)}
                        className="mb-1"
                      />
                    </div>
                  ) : null}
                  {pipelineTaskId && pipelinePanelHidden && pipelineRunning && showPipelineActivityPanel ? (
                    <div className={chatColumnClass("px-4 pb-2")}>
                      <button
                        type="button"
                        onClick={() => setPipelinePanelHidden(false)}
                        className="text-xs font-medium text-amber hover:underline"
                      >
                        Show pipeline progress
                      </button>
                    </div>
                  ) : null}
                  <div
                    aria-hidden
                    className="w-full shrink-0"
                    style={{ height: threadBottomSpacerPx }}
                  />
                </div>
              </>
            )}
          </div>

          {!showEmptyHero ? (
          <div
            ref={composerDockRef}
            data-chat-composer-dock=""
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 w-full bg-transparent pt-2"
          >
            {/*
              Keep the dock itself pointer-events-none so links in the last
              reply (which sit under this overlay) stay clickable. Re-enable
              hit-testing only on the composer chrome and banners.
            */}
            <div
              className="mx-auto w-full max-w-3xl"
              onWheel={forwardDockWheelToThread}
            >
            {crossChatNotifyPrompt ? (
              <div className={chatColumnClass("pointer-events-auto px-4 pb-2")}>
                <ChatPipelineNotifyBanner
                  switchedChat
                  onYes={() =>
                    handlePipelineNotifyYes(
                      crossChatNotifyPrompt.taskId,
                      crossChatNotifyPrompt.conversationId
                    )
                  }
                  onNo={() => handlePipelineNotifyNo(crossChatNotifyPrompt.taskId)}
                />
              </div>
            ) : null}
            {showInlinePipelineNotify && pipelineTaskId && activeConversationId ? (
              <div className={chatColumnClass("pointer-events-auto px-4 pb-2")}>
                <ChatPipelineNotifyBanner
                  onYes={() =>
                    handlePipelineNotifyYes(pipelineTaskId, activeConversationId)
                  }
                  onNo={() => handlePipelineNotifyNo(pipelineTaskId)}
                />
              </div>
            ) : null}
            {showPipelineContinueBanner && !pipelineRunning ? (
              <div className={chatColumnClass("pointer-events-auto px-4 pb-2")}>
                <ChatPipelineContinueBanner
                  onContinue={() => {
                    setPipelineMode(true)
                    setShowPipelineContinueBanner(false)
                    markPipelineModeUsed()
                  }}
                  onSwitchToQuickChat={() => setShowPipelineContinueBanner(false)}
                />
              </div>
            ) : null}
            {showPipelineSuggestBanner &&
            !showPipelineContinueBanner &&
            !pipelineModeEnabled &&
            !pipelineRunning ? (
              <div className={chatColumnClass("pointer-events-auto px-4 pb-2")}>
                <ChatPipelineSuggestBanner
                  isSignedIn={isSignedIn}
                  onEnable={() => {
                    setPipelineMode(true)
                    setShowPipelineSuggestBanner(false)
                    pipelineSuggestDismissedRef.current = true
                    dismissPipelineEnableSuggest()
                    markPipelineModeUsed()
                  }}
                  onDismiss={() => {
                    setShowPipelineSuggestBanner(false)
                    pipelineSuggestDismissedRef.current = true
                    dismissPipelineEnableSuggest()
                  }}
                />
              </div>
            ) : null}
            {ghostModeEnabled && !showEmptyHero ? (
              <div className={chatColumnClass("pointer-events-auto px-4 pb-3 pt-1")}>
                <ChatIncognitoDisclaimer />
              </div>
            ) : null}
            {selection && !showEmptyHero ? (
              <ChatSelectionToolbar
                selection={selection}
                toolbarRef={toolbarRef}
                onCopy={handleSelectionCopy}
                onAsk={handleSelectionAsk}
              />
            ) : null}
            {showConversationFeedback ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-full z-20 flex justify-center pb-1.5">
                <ChatConversationFeedback
                  conversationId={activeConversationId}
                  className="pointer-events-auto"
                />
              </div>
            ) : null}
            {!showEmptyHero && assistantIntakeCard ? (
              <div className={chatColumnClass("pointer-events-auto px-4 pb-2 max-w-3xl")}>
                {assistantIntakeCard}
              </div>
            ) : null}
              <div className="pointer-events-auto">
              <ChatComposer
                layout="dock"
                incognitoMode={ghostModeEnabled}
                focusRequest={composerFocusRequest}
                quotedExcerpt={quotedExcerpt}
                onClearQuotedExcerpt={() => setQuotedExcerpt(null)}
                value={input}
                onChange={setInput}
                onSubmit={() => void sendMessage()}
                onAttach={(file) => void handleAttach(file)}
                onAttachFiles={(files) => void handleAttachFiles(files)}
                onVoice={handleVoice}
                onVoiceCancel={handleVoiceCancel}
                onVoiceStop={handleVoiceStop}
                disabled={chatStreaming || pipelineRunning || quotaLocked}
                quotaLocked={quotaLocked}
                quotaLockMessage={quotaLockMessage}
                onQuotaUpgrade={() => setQuotaDialogOpen(true)}
                composerAttachments={composerAttachments}
                onRemoveComposerAttachment={removeComposerAttachment}
                voiceState={voiceState}
                pipelineModeEnabled={ghostModeEnabled ? false : pipelineModeEnabled}
                onPipelineModeChange={ghostModeEnabled ? undefined : handlePipelineModeChange}
                chatContext={composerChatContext}
                onChatContextChange={handleChatContextChange}
                ragFiles={ragFiles}
                ragLoading={ragLoading}
                templates={templatesData?.templates}
                templatesLoading={templatesLoading}
                isGenerating={chatStreaming}
                onStopGenerating={() => void stopGenerating()}
              />
              </div>
            </div>
          </div>
          ) : null}
        </div>
      <ToastSlot />
      <ChatQuotaExceededDialog
        open={quotaDialogOpen}
        onOpenChange={setQuotaDialogOpen}
        payload={quotaDialogPayload}
        windowHours={promptQuotaUsage?.windowHours ?? 5}
        onExplorePlans={() => setPricingModalOpen(true)}
      />
      <ChatPricingModal
        open={pricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
        signedIn={isSignedIn}
      />
    </div>
    </ChatSourcesPanelProvider>
    </ChatPresentationPanelProvider>
  )
}
