"use client"

import { ArrowUp, Mic, Square } from "lucide-react"
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type DragEvent,
  type KeyboardEvent,
} from "react"
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea"
import { cn } from "@/lib/utils"
import { ChatComposerAttachments } from "@/components/chat/chat-composer-attachments"
import { ChatComposerDisclaimer } from "@/components/chat/chat-composer-disclaimer"
import { ChatComposerVoiceBar } from "@/components/chat/chat-composer-voice-bar"
import { ChatComposerMentionMenu } from "@/components/chat/chat-composer-mention-menu"
import type { ComposerAttachmentItem } from "@/lib/chat-composer-attachments"
import type { AgentTemplateApi, RagFile } from "@/types/api"
import { AttachedAssistantsChips } from "@/components/chat/chat-attached-assistants-chips"
import {
  ChatComposerMenu,
  MemoryChip,
  PipelineModeChip,
} from "@/components/chat/chat-composer-menu"
import {
  CHAT_COLUMN_PAD_X,
  CHAT_COMPOSER_MAX_HEIGHT_CLASS,
  CHAT_COMPOSER_MAX_HEIGHT_PX,
  CHAT_COMPOSER_SURFACE_CLASS,
  CHAT_COMPOSER_TEXT_CLASS,
  CHAT_LANDING_MAX,
  chatColumnClass,
} from "@/constants/chat-layout"
import type { ChatContextSelection } from "@/components/chat/chat-context-panel"
import {
  getAttachedAssistants,
  getMemoryChipLabel,
  isMemoryActive,
} from "@/components/chat/chat-run-context-pickers"
import { resolveMemoryChipExt } from "@/lib/chat-context-chip-styles"
import {
  attachTemplateToChat,
  clearChatAttachedTemplates,
  detachTemplateFromChat,
  listAttachedTemplateIds,
  resolveChatEnabledTemplates,
} from "@/lib/chat-attached-assistants"
import { memorySelectionForTemplate } from "@/lib/assistant-read-capabilities"
import {
  loadChatEnabledMemoryKeys,
  resolveChatEnabledMemoryFiles,
} from "@/lib/chat-enabled-memory"
import { ragFileSourceKey } from "@/lib/rag-file-utils"
import { displayTemplateName } from "@/components/agent-templates/template-role-utils"
import {
  filterMentionCandidates,
  findMentionQuery,
  removeMentionQuery,
  type MentionCandidate,
  type MentionQuery,
} from "@/lib/chat-composer-mentions"
import { ChatQuotePreview } from "@/components/chat/chat-quote-preview"
import { ChatQuotaLockBanner } from "@/components/chat/chat-quota-lock-banner"
import { useChatDisplayPrefs } from "@/hooks/use-chat-display-prefs"
import { extractFilesFromDataTransfer, hasFilesInDataTransfer } from "@/lib/chat-input-files"
import {
  extractPasteText,
  insertTextAtSelection,
} from "@/lib/chat-input-paste"
import {
  defaultChord,
  eventMatchesChord,
  KEYBOARD_SHORTCUT_DEFINITIONS,
  SHORTCUT_EVENT,
} from "@/lib/keyboard-shortcuts"

interface Props {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onAttach: (file: File) => void
  onAttachFiles?: (files: File[]) => void
  onVoice: () => void
  onVoiceCancel?: () => void
  onVoiceStop?: () => void
  disabled?: boolean
  composerAttachments?: ComposerAttachmentItem[]
  onRemoveComposerAttachment?: (localId: string) => void
  voiceState?: "idle" | "requesting" | "listening" | "transcribing" | "error"
  pipelineModeEnabled?: boolean
  onPipelineModeChange?: (enabled: boolean) => void
  chatContext: ChatContextSelection
  onChatContextChange: (next: ChatContextSelection) => void
  ragFiles: RagFile[] | undefined
  ragLoading: boolean
  templates: AgentTemplateApi[] | undefined
  templatesLoading: boolean
  /** Centered empty-chat landing vs docked thread footer. */
  layout?: "dock" | "landing"
  /** Dashed ephemeral input styling for incognito chat. */
  incognitoMode?: boolean
  /** Increment to focus the textarea (e.g. when editing a prior user message). */
  focusRequest?: number
  /** Highlighted excerpt quoted into the composer (ChatGPT-style). */
  quotedExcerpt?: string | null
  onClearQuotedExcerpt?: () => void
  /** True while the assistant reply is streaming in this thread. */
  isGenerating?: boolean
  onStopGenerating?: () => void
  /** Credit window exhausted — lock send and show Claude-style notice. */
  quotaLocked?: boolean
  quotaLockMessage?: string | null
  onQuotaUpgrade?: () => void
}

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  onAttach,
  onAttachFiles,
  onVoice,
  onVoiceCancel,
  onVoiceStop,
  disabled,
  composerAttachments = [],
  onRemoveComposerAttachment,
  voiceState = "idle",
  pipelineModeEnabled = false,
  onPipelineModeChange,
  chatContext,
  onChatContextChange,
  ragFiles,
  ragLoading,
  templates,
  templatesLoading,
  layout = "dock",
  incognitoMode = false,
  focusRequest = 0,
  quotedExcerpt = null,
  onClearQuotedExcerpt,
  isGenerating = false,
  onStopGenerating,
  quotaLocked = false,
  quotaLockMessage = null,
  onQuotaUpgrade,
}: Props) {
  const { sendOnEnter } = useChatDisplayPrefs()
  const isLanding = layout === "landing"
  const voiceActive =
    voiceState === "listening" ||
    voiceState === "requesting" ||
    voiceState === "transcribing"
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pasteGuardUntilRef = useRef(0)
  const [isDragActive, setIsDragActive] = useState(false)
  const [mentionQuery, setMentionQuery] = useState<MentionQuery | null>(null)
  const [mentionIndex, setMentionIndex] = useState(0)
  /** Prevents compact ↔ expanded oscillation when paste wraps at different widths. */
  const expandedLatchRef = useRef(false)
  const { ref: textareaRef, resize: resizeTextarea, isScrollable, isMultiline } =
    useAutoResizeTextarea(value, CHAT_COMPOSER_MAX_HEIGHT_PX)
  const hasQuote = Boolean(quotedExcerpt?.trim())
  const attachmentsBusy = composerAttachments.some((item) => item.status === "uploading")
  const hasAttachments = composerAttachments.length > 0
  const hasText = value.trim().length > 0

  const mentionCandidates = useMemo(() => {
    if (!mentionQuery) return [] as MentionCandidate[]
    const enabledFiles = resolveChatEnabledMemoryFiles(
      loadChatEnabledMemoryKeys(),
      ragFiles
    )
    const attachedIds = listAttachedTemplateIds()
    const enabledTemplates = resolveChatEnabledTemplates(attachedIds, templates)

    const items: MentionCandidate[] = []
    for (const file of enabledFiles) {
      const id = ragFileSourceKey(file)
      if (!id) continue
      items.push({
        kind: "file",
        id,
        label: file.filename || file.file_id || id,
      })
    }
    for (const template of enabledTemplates) {
      const id = String(template.template_id || "").trim()
      if (!id || template.unlocked === false) continue
      items.push({
        kind: "assistant",
        id,
        label: displayTemplateName(template.name || id),
        detail: template.description || undefined,
      })
    }
    return filterMentionCandidates(items, mentionQuery.query)
  }, [mentionQuery, ragFiles, templates])

  const syncMentionFromCaret = (nextValue: string, caret: number) => {
    const next = findMentionQuery(nextValue, caret)
    setMentionQuery(next)
    setMentionIndex(0)
  }

  const closeMentions = () => {
    setMentionQuery(null)
    setMentionIndex(0)
  }

  const applyMention = (item: MentionCandidate) => {
    if (!mentionQuery) return
    const { nextValue, cursor } = removeMentionQuery(value, mentionQuery)
    onChange(nextValue)
    closeMentions()

    if (item.kind === "file") {
      const sources = chatContext.memorySources.includes(item.id)
        ? chatContext.memorySources
        : [...chatContext.memorySources, item.id]
      onChatContextChange({
        ...chatContext,
        useMemory: true,
        memorySources: sources,
      })
    } else {
      const nextIds = attachTemplateToChat(item.id)
      const match = (templates || []).find(
        (t) => String(t.template_id || "").trim() === item.id
      )
      const memory = match
        ? memorySelectionForTemplate(match)
        : { useMemory: false, memorySources: [] as string[] }
      onChatContextChange({
        ...chatContext,
        templateIds: nextIds,
        useMemory: memory.useMemory || chatContext.useMemory,
        memorySources:
          memory.memorySources.length > 0
            ? memory.memorySources
            : chatContext.memorySources,
      })
    }

    window.requestAnimationFrame(() => {
      const el = textareaRef.current
      if (!el) return
      el.focus()
      el.setSelectionRange(cursor, cursor)
      resizeTextarea()
    })
  }

  const wantsExpandedLayout =
    hasQuote ||
    hasAttachments ||
    (hasText && (value.includes("\n") || isScrollable))

  if (wantsExpandedLayout) {
    expandedLatchRef.current = true
  } else if (!hasText && !hasQuote && !hasAttachments) {
    expandedLatchRef.current = false
  }

  const isExpanded =
    hasQuote || hasAttachments || (hasText && expandedLatchRef.current)

  useEffect(() => {
    if (mentionCandidates.length === 0) {
      setMentionIndex(0)
      return
    }
    setMentionIndex((i) => Math.min(i, mentionCandidates.length - 1))
  }, [mentionCandidates.length])

  useEffect(() => {
    function onShortcut(e: Event) {
      const id = (e as CustomEvent<{ id: string }>).detail?.id
      if (id === "add-files") fileInputRef.current?.click()
      if (id === "toggle-dictation") onVoice()
    }
    window.addEventListener(SHORTCUT_EVENT, onShortcut)
    return () => window.removeEventListener(SHORTCUT_EVENT, onShortcut)
  }, [onVoice])

  const handleComposerKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionQuery) {
      if (e.key === "Escape") {
        e.preventDefault()
        closeMentions()
        return
      }
      if (e.key === "ArrowDown" && mentionCandidates.length > 0) {
        e.preventDefault()
        setMentionIndex((i) => (i + 1) % mentionCandidates.length)
        return
      }
      if (e.key === "ArrowUp" && mentionCandidates.length > 0) {
        e.preventDefault()
        setMentionIndex(
          (i) => (i - 1 + mentionCandidates.length) % mentionCandidates.length
        )
        return
      }
      if (
        (e.key === "Enter" || e.key === "Tab") &&
        mentionCandidates.length > 0 &&
        !e.shiftKey &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        e.preventDefault()
        const item = mentionCandidates[mentionIndex] || mentionCandidates[0]
        if (item) applyMention(item)
        return
      }
    }

    const isEnter =
      e.key === "Enter" && !e.metaKey && !e.ctrlKey && !e.altKey
    if (!isEnter) return

    if (Date.now() < pasteGuardUntilRef.current) {
      e.preventDefault()
      return
    }

    const sendChord = defaultChord(
      KEYBOARD_SHORTCUT_DEFINITIONS.find((d) => d.id === "send-message")!
    )
    const newLineChord = defaultChord(
      KEYBOARD_SHORTCUT_DEFINITIONS.find((d) => d.id === "new-line")!
    )
    const sendKey = sendOnEnter ? sendChord : newLineChord
    const newLineKey = sendOnEnter ? newLineChord : sendChord

    if (eventMatchesChord(e.nativeEvent, sendKey)) {
      e.preventDefault()
      onSubmit()
      return
    }

    if (eventMatchesChord(e.nativeEvent, newLineKey)) {
      const isShiftEnterNewLine =
        newLineKey.shift &&
        newLineKey.key === "enter" &&
        !newLineKey.meta &&
        !newLineKey.ctrl &&
        !newLineKey.alt
      if (!isShiftEnterNewLine) {
        e.preventDefault()
        const el = e.currentTarget
        const start = el.selectionStart ?? value.length
        const end = el.selectionEnd ?? value.length
        onChange(`${value.slice(0, start)}\n${value.slice(end)}`)
      }
    }
  }

  useEffect(() => {
    if (!focusRequest) return
    const el = textareaRef.current
    if (!el) return
    el.focus()
    const end = el.value.length
    el.setSelectionRange(end, end)
  }, [focusRequest, textareaRef])

  useEffect(() => {
    resizeTextarea()
  }, [quotedExcerpt, composerAttachments.length, resizeTextarea])

  useLayoutEffect(() => {
    resizeTextarea()
  }, [isExpanded, resizeTextarea])

  const attachedAssistants = getAttachedAssistants(chatContext, templates)
  const memoryLabel = getMemoryChipLabel(chatContext, ragFiles)
  const memoryExt = resolveMemoryChipExt(chatContext, ragFiles)
  const memoryActive = isMemoryActive(chatContext)

  const clearAssistant = (templateId: string) => {
    const nextTemplateIds = detachTemplateFromChat(templateId)
    onChatContextChange({ ...chatContext, templateIds: nextTemplateIds })
  }

  const clearAllAssistants = () => {
    onChatContextChange({
      ...chatContext,
      templateIds: clearChatAttachedTemplates(),
    })
  }

  const clearMemory = () => {
    onChatContextChange({ ...chatContext, useMemory: false, memorySources: [] })
  }

  const attachFiles = (files: File[]) => {
    if (files.length === 0) return
    if (onAttachFiles) {
      onAttachFiles(files)
      return
    }
    for (const file of files) onAttach(file)
  }

  const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const clipboard = event.clipboardData
    if (!clipboard) return

    const files = extractFilesFromDataTransfer(clipboard)
    const pastedText = extractPasteText(clipboard)

    if (pastedText) {
      event.preventDefault()
      pasteGuardUntilRef.current = Date.now() + 300

      const el = event.currentTarget
      const start = el.selectionStart ?? value.length
      const end = el.selectionEnd ?? value.length
      const { nextValue, cursor } = insertTextAtSelection(value, pastedText, start, end)
      onChange(nextValue)
      resizeTextarea()
      syncMentionFromCaret(nextValue, cursor)
      window.requestAnimationFrame(() => {
        el.focus()
        el.setSelectionRange(cursor, cursor)
      })
    }

    if (files.length > 0) {
      if (!pastedText) event.preventDefault()
      attachFiles(files)
    }
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!hasFilesInDataTransfer(event.dataTransfer)) return
    event.preventDefault()
    event.dataTransfer.dropEffect = "copy"
    setIsDragActive(true)
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
    setIsDragActive(false)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    const files = extractFilesFromDataTransfer(event.dataTransfer)
    if (files.length === 0) return
    event.preventDefault()
    setIsDragActive(false)
    attachFiles(files)
  }

  const showContextChips =
    memoryActive ||
    attachedAssistants.length > 0 ||
    (pipelineModeEnabled && onPipelineModeChange)

  const placeholder = hasQuote
    ? "Ask about this excerpt…"
    : pipelineModeEnabled
      ? "Ask anything"
      : "Ask anything"

  const shellRounded =
    isExpanded || isMultiline || isScrollable ? "rounded-[28px]" : "rounded-full"

  const shellClassName = cn(
    "relative w-full overflow-hidden transition-[border-radius] duration-200",
    CHAT_COMPOSER_SURFACE_CLASS,
    shellRounded,
    incognitoMode && "border-dashed"
  )

  const compactRowClassName =
    "flex w-full items-end gap-1 px-2 py-1.5 sm:px-2.5"

  const expandedControlsClassName =
    "flex w-full items-center gap-1 px-2 pb-2 pt-1 sm:px-2.5"

  const textareaClassName = cn(
    "min-w-0 bg-transparent outline-none resize-none placeholder:text-muted-foreground",
    isExpanded
      ? cn(
          CHAT_COMPOSER_TEXT_CLASS,
          "w-full",
          CHAT_COMPOSER_MAX_HEIGHT_CLASS,
          "px-3 pt-3 pb-0",
          isScrollable && "scrollbar-thin"
        )
      : cn(
          CHAT_COMPOSER_TEXT_CLASS,
          "flex-1 py-1.5 pl-1 pr-0.5",
          CHAT_COMPOSER_MAX_HEIGHT_CLASS,
          isScrollable && "scrollbar-thin"
        )
  )

  const voiceButton = (
    <button
      type="button"
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
        pipelineModeEnabled
          ? "text-foreground/90 hover:bg-background/50 hover:text-foreground"
          : "text-muted-foreground hover:bg-background/50 hover:text-foreground",
        voiceState === "requesting" && "animate-pulse text-amber bg-amber/10",
        voiceState === "listening" && "text-rose-500 bg-rose-500/10",
        voiceState === "error" && "text-destructive bg-destructive/10"
      )}
      onClick={() => void onVoice()}
      disabled={disabled || voiceState === "requesting"}
      title={
        voiceState === "requesting"
          ? "Waiting for microphone permission…"
          : voiceState === "listening"
            ? "Stop voice input"
            : voiceState === "error"
              ? "Voice input failed — try again"
              : "Start voice input"
      }
      aria-label={
        voiceState === "requesting"
          ? "Waiting for microphone permission"
          : voiceState === "listening"
            ? "Stop voice input"
            : "Start voice input"
      }
    >
      <Mic className="h-4 w-4 shrink-0" />
    </button>
  )

  const sendButton = (
    <button
      type="button"
      disabled={
        disabled || attachmentsBusy || (!value.trim() && composerAttachments.length === 0)
      }
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all",
        value.trim() || composerAttachments.length > 0
          ? [
              "border border-white/10 bg-[#2B9690] text-[#0b0b10]",
              "shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_10px_24px_rgba(43,150,144,0.22)]",
              "hover:scale-[1.03] hover:brightness-105",
            ]
          : pipelineModeEnabled
            ? "bg-foreground/18 text-foreground/90 hover:bg-foreground/25"
            : "bg-foreground/10 text-muted-foreground",
        "disabled:pointer-events-none",
        !pipelineModeEnabled && "disabled:opacity-40",
        pipelineModeEnabled && "disabled:opacity-100"
      )}
      onClick={onSubmit}
      aria-label="Send message"
    >
      {value.trim() || composerAttachments.length > 0 ? (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/78 backdrop-blur-[2px]">
          <ArrowUp className="h-4 w-4 shrink-0 text-[#0b0b10]" strokeWidth={2.25} />
        </span>
      ) : (
        <ArrowUp className="h-4 w-4 shrink-0" strokeWidth={2.25} />
      )}
    </button>
  )

  const stopButton =
    isGenerating && onStopGenerating ? (
      <button
        type="button"
        onClick={onStopGenerating}
        className={cn(
          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all",
          "border border-white/10 bg-[#2B9690] text-[#0b0b10]",
          "shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_10px_24px_rgba(43,150,144,0.22)]",
          "hover:scale-[1.03] hover:brightness-105"
        )}
        aria-label="Stop generating"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/78 backdrop-blur-[2px]">
          <Square className="h-3.5 w-3.5 shrink-0 fill-current text-[#0b0b10]" strokeWidth={0} />
        </span>
      </button>
    ) : null

  const primaryAction = stopButton ?? sendButton

  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      multiple
      className="hidden"
      onChange={(e) => {
        const files = Array.from(e.target.files || [])
        for (const file of files) onAttach(file)
        e.currentTarget.value = ""
      }}
    />
  )

  const composerMenu = (
    <ChatComposerMenu
      pipelineModeEnabled={pipelineModeEnabled}
      onPipelineModeChange={onPipelineModeChange}
      onAttach={() => fileInputRef.current?.click()}
      disabled={disabled}
      chatContext={chatContext}
      onChatContextChange={onChatContextChange}
      ragFiles={ragFiles}
      ragLoading={ragLoading}
      templates={templates}
      templatesLoading={templatesLoading}
    />
  )

  const textarea = (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        const next = e.target.value
        onChange(next)
        resizeTextarea()
        syncMentionFromCaret(next, e.target.selectionStart ?? next.length)
      }}
      onSelect={(e) => {
        const el = e.currentTarget
        syncMentionFromCaret(el.value, el.selectionStart ?? el.value.length)
      }}
      onBlur={() => {
        // Delay so mention mousedown can fire first
        window.setTimeout(() => closeMentions(), 120)
      }}
      onPaste={handlePaste}
      placeholder={placeholder}
      rows={1}
      disabled={disabled}
      className={textareaClassName}
      data-chat-composer-input=""
      onKeyDown={handleComposerKeyDown}
    />
  )

  return (
    <div
      className={
        isLanding
          ? cn("mx-auto w-full overflow-visible", CHAT_LANDING_MAX)
          : chatColumnClass(
              "overflow-visible pt-2 max-w-3xl mx-auto w-full",
              CHAT_COLUMN_PAD_X,
              pipelineModeEnabled
                ? "pb-5 max-lg:pb-[max(0.5rem,env(safe-area-inset-bottom))]"
                : "pb-4 max-lg:pb-[max(0.35rem,env(safe-area-inset-bottom))]"
            )
      }
    >
      {quotaLocked && quotaLockMessage && onQuotaUpgrade ? (
        <ChatQuotaLockBanner message={quotaLockMessage} onUpgrade={onQuotaUpgrade} />
      ) : null}
      {showContextChips ? (
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {memoryActive && memoryLabel ? (
            <MemoryChip
              label={memoryLabel}
              memoryExt={memoryExt}
              disabled={disabled}
              onClear={clearMemory}
            />
          ) : null}
          <AttachedAssistantsChips
            assistants={attachedAssistants}
            templates={templates}
            disabled={disabled}
            onClear={clearAssistant}
            onClearAll={clearAllAssistants}
          />
          {pipelineModeEnabled && onPipelineModeChange ? (
            <PipelineModeChip
              disabled={disabled}
              onDisable={() => onPipelineModeChange(false)}
            />
          ) : null}
        </div>
      ) : null}
      <div className="relative">
        {mentionQuery ? (
          <ChatComposerMentionMenu
            items={mentionCandidates}
            activeIndex={mentionIndex}
            onHoverIndex={setMentionIndex}
            onSelect={applyMention}
            loading={Boolean(ragLoading || templatesLoading)}
          />
        ) : null}
        <div className="relative">
          <div className={shellClassName} data-chat-tour="composer">
            <div
              className={cn(
                "relative",
                isDragActive && "bg-primary/5 ring-2 ring-primary/40 ring-inset"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
            {hasQuote && onClearQuotedExcerpt ? (
              <ChatQuotePreview
                excerpt={quotedExcerpt!}
                onClear={onClearQuotedExcerpt}
                disabled={disabled}
                className="rounded-t-full border-border/40"
              />
            ) : null}
            {composerAttachments.length > 0 && onRemoveComposerAttachment ? (
              <ChatComposerAttachments
                items={composerAttachments}
                onRemove={onRemoveComposerAttachment}
                className="px-2.5 pt-2.5 sm:px-3"
              />
            ) : null}
              {isDragActive ? (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[inherit] border-2 border-dashed border-primary/40 bg-background/75 px-4 text-center text-sm font-medium text-foreground backdrop-blur-sm">
                  Drop files or images to attach them
                </div>
              ) : null}
              {voiceActive ? (
                <ChatComposerVoiceBar
                  mode={
                    voiceState === "transcribing"
                      ? "transcribing"
                      : voiceState === "requesting"
                        ? "requesting"
                        : "listening"
                  }
                  onCancel={() => (onVoiceCancel ?? onVoice)()}
                  onStop={() => (onVoiceStop ?? onVoice)()}
                  onSend={() => {
                    if (voiceState === "listening" || voiceState === "requesting") {
                      ;(onVoiceStop ?? onVoice)()
                    }
                    window.setTimeout(() => onSubmit(), 480)
                  }}
                  canSend={Boolean(value.trim()) || voiceState === "listening"}
                />
              ) : isExpanded ? (
                <div className="flex flex-col">
                  {textarea}
                  <div className={expandedControlsClassName}>
                    {composerMenu}
                    <div className="min-w-0 flex-1" aria-hidden />
                    {fileInput}
                    {voiceButton}
                    {primaryAction}
                  </div>
                </div>
              ) : (
                <div className={compactRowClassName}>
                  {composerMenu}
                  {textarea}
                  {fileInput}
                  {voiceButton}
                  {primaryAction}
                </div>
              )}
            </div>
          </div>
          {/* Outside pipeline, mask scrolled thread under the dock with solid bg */}
          {!isLanding && !pipelineModeEnabled ? (
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-full z-0 h-[50vh] w-screen -translate-x-1/2 bg-background"
            />
          ) : null}
        </div>
        <div
          className={cn(
            !isLanding && "relative z-[1]",
            !isLanding && !pipelineModeEnabled && "bg-background"
          )}
        >
          <ChatComposerDisclaimer />
        </div>
      </div>
    </div>
  )
}
