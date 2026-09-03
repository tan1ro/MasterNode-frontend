"use client"

import { useEffect, useMemo, useRef, useState, type RefObject } from "react"
import { ArrowLeft, CornerDownLeft, Loader2, UploadCloud, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { displayTemplateName } from "@/components/agent-templates/template-role-utils"
import {
  buildAssistantIntakeFields,
  fillAssistantPromptTemplate,
  intakeFieldQuestion,
  intakeSubmitLabel,
  isIntakeFieldAnswered,
  type AssistantIntakeField,
} from "@/lib/assistant-intake"
import {
  prefillIntakeValues,
  summarizePrefilledFieldsBySource,
  unansweredIntakeFields,
} from "@/lib/assistant-intake-prefill"
import {
  applyClarifyAnswersToValues,
  buildFallbackClarifyQuestions,
  fetchAssistantIntakeClarify,
  mergeIntakeSuggestions,
  type AssistantIntakeClarifyQuestion,
} from "@/services/assistant-intake"
import type { AssistantIntakeClarifyTrailItem } from "@/lib/assistant-message-display"
import {
  encodePlanAnswer,
  isPlanQuestionAnswered,
  optionsWithOther,
  PLAN_OTHER_OPTION_ID,
} from "@/lib/pipeline-plan-questions"
import type { PipelinePlanQuestion } from "@/lib/pipeline-plan"
import type { ComposerAttachmentItem } from "@/lib/chat-composer-attachments"
import type { AgentTemplateApi } from "@/types/api"
import { cn } from "@/lib/utils"

interface ChatAssistantIntakeProps {
  template: AgentTemplateApi
  /** User's original chat message — used to pre-fill and skip duplicate questions. */
  pendingMessage?: string
  /** Recent user messages from the thread (oldest → newest). */
  contextMessages?: string[]
  /** Restored answers when returning to a previous assistant step. */
  savedValues?: Record<string, string>
  /** When true, memory files are scanned before clarifying questions. */
  memoryActive?: boolean
  memorySources?: string[]
  disabled?: boolean
  attachments?: ComposerAttachmentItem[]
  onAttachFile?: (file: File) => void
  onRemoveAttachment?: (localId: string) => void
  stepIndex?: number
  stepCount?: number
  hasNext?: boolean
  hasPrevious?: boolean
  onNext?: (
    filledPrompt: string,
    fieldValues: Record<string, string>,
    extras?: { clarifyTrail?: AssistantIntakeClarifyTrailItem[] }
  ) => void
  onPreviousStep?: () => void
  onSkipStep?: () => void
  onSubmit: (
    filledPrompt: string,
    fieldValues: Record<string, string>,
    extras?: { clarifyTrail?: AssistantIntakeClarifyTrailItem[] }
  ) => void
  onDismiss: () => void
  className?: string
}

const FILE_ACCEPT = ".pdf,.doc,.docx"
const EMPTY_SAVED_VALUES: Record<string, string> = {}

export function ChatAssistantIntake({
  template,
  pendingMessage = "",
  contextMessages = [],
  savedValues = EMPTY_SAVED_VALUES,
  memoryActive = false,
  memorySources = [],
  disabled,
  attachments = [],
  onAttachFile,
  onRemoveAttachment,
  stepIndex = 0,
  stepCount = 1,
  hasNext = false,
  hasPrevious = false,
  onNext,
  onPreviousStep,
  onSkipStep,
  onSubmit,
  onDismiss,
  className,
}: ChatAssistantIntakeProps) {
  const fields = useMemo(() => buildAssistantIntakeFields(template), [template])
  const initialValues = useMemo(() => {
    const prefilled = prefillIntakeValues(fields, pendingMessage, contextMessages)
    return { ...prefilled, ...savedValues }
  }, [fields, pendingMessage, contextMessages, savedValues])

  const firstUnansweredIndex = useMemo(() => {
    const idx = fields.findIndex(
      (field) => !isIntakeFieldAnswered(field, initialValues, attachments.length)
    )
    return idx >= 0 ? idx : 0
  }, [fields, initialValues, attachments.length])

  const resumeFieldIndex = useMemo(() => {
    const restored = Object.keys(savedValues).length > 0
    const allAnswered = fields.every((field) =>
      isIntakeFieldAnswered(field, initialValues, attachments.length)
    )
    if (restored && allAnswered) return Math.max(0, fields.length - 1)
    return firstUnansweredIndex
  }, [fields, initialValues, attachments.length, savedValues, firstUnansweredIndex])

  const [values, setValues] = useState<Record<string, string>>(() => initialValues)
  const [fieldIndex, setFieldIndex] = useState(() => resumeFieldIndex)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [memoryScanning, setMemoryScanning] = useState(memoryActive)
  const [clarifying, setClarifying] = useState(true)
  const [valueSources, setValueSources] = useState<Record<string, string>>({})
  const [clarifyQuestions, setClarifyQuestions] = useState<AssistantIntakeClarifyQuestion[]>([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({})
  const [mcqCustom, setMcqCustom] = useState<Record<string, string>>({})
  const [persistedClarifyTrail, setPersistedClarifyTrail] = useState<
    AssistantIntakeClarifyTrailItem[]
  >([])
  /** Fields not covered by MCQs — asked after, as step N+1… */
  const [followUpFields, setFollowUpFields] = useState<AssistantIntakeField[]>([])
  const [followUpIndex, setFollowUpIndex] = useState(0)
  const [mcqCompletedCount, setMcqCompletedCount] = useState(0)
  const autoSubmittedRef = useRef(false)
  const backendEnrichedRef = useRef(false)
  const clarifyRequestIdRef = useRef(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textInputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  const useIntelligentQuestions = clarifyQuestions.length > 0
  const inFollowUpMode = !useIntelligentQuestions && mcqCompletedCount > 0 && followUpFields.length > 0

  const pendingFields = useMemo(
    () => unansweredIntakeFields(fields, values, attachments.length),
    [fields, values, attachments.length]
  )
  const capturedSummary = useMemo(
    () => summarizePrefilledFieldsBySource(fields, values, valueSources),
    [fields, values, valueSources]
  )

  const planQuestions = useMemo(
    () =>
      clarifyQuestions.map(
        (q): PipelinePlanQuestion => ({
          id: q.id,
          prompt: q.prompt,
          options: q.options,
        })
      ),
    [clarifyQuestions]
  )

  // Hydrate once per assistant — do not reset when chat history/context re-parses
  // (that was wiping keystrokes while the user filled the form).
  useEffect(() => {
    setValues(initialValues)
    setFieldIndex(resumeFieldIndex)
    setError(null)
    autoSubmittedRef.current = false
    backendEnrichedRef.current = false
    setMemoryScanning(memoryActive)
    setClarifying(true)
    setValueSources({})
    setClarifyQuestions([])
    setPersistedClarifyTrail([])
    setFollowUpFields([])
    setFollowUpIndex(0)
    setMcqCompletedCount(0)
    setQuestionIndex(0)
    setMcqAnswers({})
    setMcqCustom({})
  }, [template.template_id, memoryActive])

  useEffect(() => {
    if (backendEnrichedRef.current || disabled) return
    if (fields.length === 0) {
      setClarifying(false)
      return
    }

    let cancelled = false
    const requestId = ++clarifyRequestIdRef.current
    if (memoryActive) setMemoryScanning(true)
    setClarifying(true)
    void (async () => {
      try {
        const clarifyFields = fields.filter((field) => field.kind !== "file")
        const fieldNames = clarifyFields.map((field) => field.name)
        if (fieldNames.length === 0) {
          if (cancelled || requestId !== clarifyRequestIdRef.current) return
          backendEnrichedRef.current = true
          setClarifyQuestions([])
          setClarifying(false)
          setMemoryScanning(false)
          return
        }
        const fieldLabels = Object.fromEntries(
          clarifyFields.map((field) => [field.name, field.label])
        )
        const result = await fetchAssistantIntakeClarify(
          {
            template_id: template.template_id ?? "",
            template_name: template.name ?? "",
            template_description: template.description ?? "",
            field_names: fieldNames,
            field_labels: fieldLabels,
            pending_message: pendingMessage,
            context_messages: contextMessages,
            use_memory: memoryActive,
            memory_sources: memorySources,
            known_values: initialValues,
          },
          clarifyFields
        )
        if (cancelled || requestId !== clarifyRequestIdRef.current) return
        backendEnrichedRef.current = true
        setValueSources(result.value_sources ?? {})
        const merged = mergeIntakeSuggestions({}, result.values ?? {})
        setValues((prev) => mergeIntakeSuggestions(prev, merged))
        const questions =
          result.questions?.length > 0
            ? result.questions
            : buildFallbackClarifyQuestions(clarifyFields, {
                ...initialValues,
                ...merged,
              }, 3, pendingMessage)
        const covered = new Set(
          questions.map((q) => q.field).filter((name): name is string => Boolean(name))
        )
        setFollowUpFields(
          unansweredIntakeFields(
            clarifyFields,
            { ...initialValues, ...merged },
            attachments.length
          ).filter((field) => !covered.has(field.name))
        )
        setFollowUpIndex(0)
        setMcqCompletedCount(0)
        setClarifyQuestions(questions)
        setQuestionIndex(0)
      } catch {
        if (cancelled || requestId !== clarifyRequestIdRef.current) return
        backendEnrichedRef.current = true
        const clarifyFields = fields.filter((field) => field.kind !== "file")
        const fallback = buildFallbackClarifyQuestions(
          clarifyFields,
          initialValues,
          3,
          pendingMessage
        )
        const covered = new Set(fallback.map((q) => q.field).filter(Boolean))
        setFollowUpFields(
          unansweredIntakeFields(clarifyFields, initialValues, attachments.length).filter(
            (field) => !covered.has(field.name)
          )
        )
        setFollowUpIndex(0)
        setMcqCompletedCount(0)
        setClarifyQuestions(fallback)
      } finally {
        if (!cancelled && requestId === clarifyRequestIdRef.current) {
          setMemoryScanning(false)
          setClarifying(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [
    template.template_id,
    template.name,
    template.description,
    fields,
    pendingMessage,
    contextMessages,
    disabled,
    memoryActive,
    memorySources,
    initialValues,
    attachments.length,
  ])

  useEffect(() => {
    if (autoSubmittedRef.current || disabled) return
    if (memoryScanning || clarifying) return
    if (!backendEnrichedRef.current) return
    if (pendingFields.length > 0) return
    if (clarifyQuestions.length > 0) return
    if (followUpFields.length > 0 && mcqCompletedCount > 0) return
    autoSubmittedRef.current = true
    const merged = { ...values }
    if (attachments.length > 0) {
      const names = attachments.map((item) => item.file.name).join(", ")
      const phrase = `the attached ${attachments.length === 1 ? "file" : "files"} (${names})`
      for (const field of fields) {
        if (field.kind === "file" && !merged[field.name]?.trim()) {
          merged[field.name] = phrase
        }
      }
    }
    const prompt = fillAssistantPromptTemplate(template, merged)
    if (hasNext && onNext) onNext(prompt, merged)
    else onSubmit(prompt, merged)
  }, [
    pendingFields.length,
    disabled,
    values,
    attachments,
    fields,
    template,
    hasNext,
    onNext,
    onSubmit,
    memoryScanning,
    clarifying,
    clarifyQuestions.length,
    followUpFields.length,
    mcqCompletedCount,
  ])

  useEffect(() => {
    const timer = window.setTimeout(() => textInputRef.current?.focus(), 50)
    return () => window.clearTimeout(timer)
  }, [
    fieldIndex,
    questionIndex,
    followUpIndex,
    template.template_id,
    fields.length,
    useIntelligentQuestions,
    inFollowUpMode,
  ])

  if (fields.length === 0) return null
  if (
    !clarifying &&
    !memoryScanning &&
    pendingFields.length === 0 &&
    clarifyQuestions.length === 0 &&
    !inFollowUpMode
  ) {
    return null
  }

  const assistantName = displayTemplateName(template.name || template.template_id || "Assistant")
  const activeField = inFollowUpMode
    ? followUpFields[followUpIndex] ?? followUpFields[0]
    : fields[fieldIndex] ?? fields[0]
  const activeQuestion = clarifyQuestions[questionIndex] ?? null
  const activePlanQuestion = planQuestions[questionIndex] ?? null
  const displayOptions = activePlanQuestion ? optionsWithOther(activePlanQuestion.options) : []
  const selectedOptionId = activeQuestion ? mcqAnswers[activeQuestion.id] : undefined
  const isLastInPhase = useIntelligentQuestions
    ? questionIndex >= clarifyQuestions.length - 1
    : inFollowUpMode
      ? followUpIndex >= followUpFields.length - 1
      : fieldIndex >= fields.length - 1
  const isLastOverall =
    useIntelligentQuestions
      ? questionIndex >= clarifyQuestions.length - 1 && followUpFields.length === 0
      : isLastInPhase
  const canGoBackField = useIntelligentQuestions
    ? questionIndex > 0
    : inFollowUpMode
      ? followUpIndex > 0
      : fieldIndex > 0
  const canGoBackAssistant =
    hasPrevious &&
    (useIntelligentQuestions
      ? questionIndex === 0
      : inFollowUpMode
        ? followUpIndex === 0
        : fieldIndex === 0) &&
    Boolean(onPreviousStep)
  const canGoBack = canGoBackField || canGoBackAssistant
  const submitLabel = intakeSubmitLabel(fields)
  const currentAnswered = useIntelligentQuestions
    ? Boolean(
        activePlanQuestion &&
          isPlanQuestionAnswered(activePlanQuestion, mcqAnswers, mcqCustom)
      )
    : isIntakeFieldAnswered(activeField, values, attachments.length)
  const primaryLabel = isLastOverall ? (hasNext ? "Next assistant" : submitLabel) : "Next"
  const stepTotal = useIntelligentQuestions
    ? clarifyQuestions.length + followUpFields.length
    : inFollowUpMode
      ? mcqCompletedCount + followUpFields.length
      : fields.length
  const stepCurrent = useIntelligentQuestions
    ? questionIndex + 1
    : inFollowUpMode
      ? mcqCompletedCount + followUpIndex + 1
      : fieldIndex + 1

  const setField = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const composePrompt = (nextValues: Record<string, string> = values) => {
    const merged = { ...nextValues }
    if (attachments.length > 0) {
      const names = attachments.map((item) => item.file.name).join(", ")
      const phrase = `the attached ${attachments.length === 1 ? "file" : "files"} (${names})`
      for (const field of fields) {
        if (field.kind === "file" && !merged[field.name]?.trim()) {
          merged[field.name] = phrase
        }
      }
    }
    return fillAssistantPromptTemplate(template, merged)
  }

  const buildClarifyTrail = (
    questions: AssistantIntakeClarifyQuestion[] = clarifyQuestions
  ): AssistantIntakeClarifyTrailItem[] => {
    const trail: AssistantIntakeClarifyTrailItem[] = []
    for (const question of questions) {
      const selected = mcqAnswers[question.id]
      if (!selected) continue
      const answer =
        selected === PLAN_OTHER_OPTION_ID
          ? (mcqCustom[question.id] || "").trim()
          : question.options.find((opt) => opt.id === selected)?.label || selected
      if (!answer) continue
      trail.push({
        prompt: question.prompt,
        answer,
        ...(question.reason ? { reason: question.reason } : {}),
      })
    }
    return trail
  }

  const finishIntake = (
    nextValues: Record<string, string> = values,
    extras?: { clarifyTrail?: AssistantIntakeClarifyTrailItem[] }
  ) => {
    const prompt = composePrompt(nextValues)
    const clarifyTrail =
      extras?.clarifyTrail && extras.clarifyTrail.length > 0
        ? extras.clarifyTrail
        : [...persistedClarifyTrail, ...buildClarifyTrail()]
    const payload = { clarifyTrail }
    if (hasNext && onNext) onNext(prompt, nextValues, payload)
    else onSubmit(prompt, nextValues, payload)
  }

  const handleBack = () => {
    setError(null)
    if (canGoBackField) {
      if (useIntelligentQuestions) {
        setQuestionIndex((index) => Math.max(0, index - 1))
      } else if (inFollowUpMode) {
        setFollowUpIndex((index) => Math.max(0, index - 1))
      } else {
        setFieldIndex((index) => Math.max(0, index - 1))
      }
      return
    }
    if (canGoBackAssistant) onPreviousStep?.()
  }

  const finishIntelligentQuestions = () => {
    const encoded: Record<string, string> = {}
    for (const question of clarifyQuestions) {
      const selected = mcqAnswers[question.id]
      if (!selected) continue
      encoded[question.id] = encodePlanAnswer(selected, mcqCustom[question.id])
    }
    const trail = [...persistedClarifyTrail, ...buildClarifyTrail(clarifyQuestions)]
    const merged = applyClarifyAnswersToValues(clarifyQuestions, encoded, values)
    setValues(merged)
    const remaining = unansweredIntakeFields(fields, merged, attachments.length)
    if (remaining.length > 0) {
      setPersistedClarifyTrail(trail)
      setMcqCompletedCount(clarifyQuestions.length)
      setFollowUpFields(remaining)
      setFollowUpIndex(0)
      setClarifyQuestions([])
      return
    }
    setFollowUpFields([])
    setMcqCompletedCount(0)
    finishIntake(merged, { clarifyTrail: trail })
  }

  const handlePrimary = () => {
    if (!currentAnswered) {
      setError("Please answer this question before continuing.")
      return
    }
    setError(null)
    if (useIntelligentQuestions) {
      if (!isLastInPhase) {
        setQuestionIndex((index) => Math.min(clarifyQuestions.length - 1, index + 1))
        return
      }
      finishIntelligentQuestions()
      return
    }
    if (inFollowUpMode) {
      if (!isLastInPhase) {
        setFollowUpIndex((index) => Math.min(followUpFields.length - 1, index + 1))
        return
      }
      finishIntake()
      return
    }
    if (!isLastInPhase) {
      setFieldIndex((index) => Math.min(fields.length - 1, index + 1))
      return
    }
    finishIntake()
  }

  const selectClarifyOption = (optionId: string) => {
    if (!activeQuestion) return
    setMcqAnswers((prev) => ({ ...prev, [activeQuestion.id]: optionId }))
    setError(null)
    if (optionId === PLAN_OTHER_OPTION_ID) return
    if (!isLastInPhase) {
      window.setTimeout(() => {
        setQuestionIndex((index) => Math.min(clarifyQuestions.length - 1, index + 1))
      }, 180)
    }
  }

  const jumpToField = (index: number) => {
    if (inFollowUpMode) {
      if (disabled || index === followUpIndex || index < 0 || index >= followUpFields.length) return
      if (index > followUpIndex) {
        const blocked = followUpFields
          .slice(followUpIndex, index)
          .some((field) => !isIntakeFieldAnswered(field, values, attachments.length))
        if (blocked) return
      }
      setError(null)
      setFollowUpIndex(index)
      return
    }
    if (disabled || index === fieldIndex || index < 0 || index >= fields.length) return
    if (index > fieldIndex) {
      const blocked = fields
        .slice(fieldIndex, index)
        .some((field) => !isIntakeFieldAnswered(field, values, attachments.length))
      if (blocked) return
    }
    setError(null)
    setFieldIndex(index)
  }

  const handleFiles = (files: FileList | File[] | null) => {
    if (!files || !onAttachFile) return
    for (const file of Array.from(files)) onAttachFile(file)
    setError(null)
  }

  const renderActiveField = () => {
    const fieldId = `intake-${template.template_id}-${activeField.name}`

    if (activeField.kind === "file") {
      return (
        <div>
          <div
            role="button"
            tabIndex={disabled ? -1 : 0}
            onClick={() => !disabled && fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !disabled) {
                e.preventDefault()
                fileInputRef.current?.click()
              }
            }}
            onDragOver={(e) => {
              e.preventDefault()
              if (!disabled) setDragActive(true)
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragActive(false)
              if (!disabled) handleFiles(e.dataTransfer.files)
            }}
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center transition-colors",
              dragActive
                ? "border-amber-500/50 bg-amber-500/10"
                : "border-border/60 bg-muted/20 hover:border-amber-500/35 hover:bg-amber-500/5",
              disabled && "pointer-events-none opacity-60"
            )}
          >
            <UploadCloud className="h-6 w-6 text-muted-foreground" aria-hidden />
            <span className="text-sm text-foreground/90">Click to upload or drag and drop</span>
            <span className="text-xs text-muted-foreground">{activeField.placeholder}</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={FILE_ACCEPT}
            multiple
            className="hidden"
            disabled={disabled}
            onChange={(e) => {
              handleFiles(e.target.files)
              e.currentTarget.value = ""
            }}
          />
          {attachments.length > 0 ? (
            <ul className="mt-2 space-y-1.5">
              {attachments.map((item) => (
                <li
                  key={item.localId}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border/50 bg-background/60 px-2.5 py-1.5 text-xs"
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    {item.status === "uploading" ? (
                      <Loader2
                        className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground"
                        aria-hidden
                      />
                    ) : null}
                    <span className="truncate text-foreground/90">{item.file.name}</span>
                  </span>
                  {onRemoveAttachment ? (
                    <button
                      type="button"
                      onClick={() => onRemoveAttachment(item.localId)}
                      disabled={disabled}
                      aria-label={`Remove ${item.file.name}`}
                      className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )
    }

    if (activeField.kind === "long") {
      return (
        <Textarea
          key={fieldId}
          ref={textInputRef as RefObject<HTMLTextAreaElement>}
          id={fieldId}
          name={activeField.name}
          value={values[activeField.name] ?? ""}
          onChange={(e) => setField(activeField.name, e.target.value)}
          placeholder={activeField.placeholder}
          disabled={disabled}
          readOnly={false}
          autoComplete="off"
          rows={5}
          className="min-h-[120px] resize-y rounded-lg border-border/60 bg-background/80 text-sm focus-visible:border-amber-500/50 focus-visible:ring-amber-500/20"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              handlePrimary()
            }
          }}
        />
      )
    }

    return (
      <Input
        key={fieldId}
        ref={textInputRef as RefObject<HTMLInputElement>}
        id={fieldId}
        name={activeField.name}
        type="text"
        value={values[activeField.name] ?? ""}
        onChange={(e) => setField(activeField.name, e.target.value)}
        placeholder={activeField.placeholder}
        disabled={disabled}
        readOnly={false}
        autoComplete="off"
        className="h-11 rounded-lg border-border/60 bg-background/80 text-sm focus-visible:border-amber-500/50 focus-visible:ring-amber-500/20"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            handlePrimary()
          }
        }}
      />
    )
  }

  return (
    <div className={cn("relative z-10 space-y-3", className)}>
      <div className="rounded-xl border border-border/60 bg-card/80 px-3 py-3 sm:px-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {stepCount > 1 ? (
              <span className="mb-1 inline-flex items-center rounded-full border border-violet/30 bg-violet/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-violet">
                Now · {stepIndex + 1} of {stepCount}
              </span>
            ) : null}
            <h3 className="font-heading text-base font-semibold tracking-tight text-foreground sm:text-lg">
              {assistantName}
            </h3>
            {pendingMessage?.trim() ? (
              <p className="mt-2 whitespace-pre-wrap break-words rounded-lg border border-border/50 bg-muted/30 px-2.5 py-2 text-xs leading-relaxed text-foreground/90">
                {pendingMessage.trim()}
              </p>
            ) : null}
            {template.description ? (
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {template.description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onDismiss}
            disabled={disabled}
            aria-label="Dismiss assistant form"
            className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        {memoryScanning || clarifying ? (
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
            {memoryScanning
              ? "Checking your memory files for answers…"
              : "Preparing clarifying questions…"}
          </p>
        ) : null}
        {!memoryScanning && !clarifying && capturedSummary.fromMemory.length > 0 ? (
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground/80">From your files: </span>
            {capturedSummary.fromMemory.join(" · ")}
          </p>
        ) : null}
        {!memoryScanning && !clarifying && capturedSummary.fromMessage.length > 0 ? (
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground/80">From your message: </span>
            {capturedSummary.fromMessage.join(" · ")}
          </p>
        ) : null}
      </div>

      {!clarifying && !memoryScanning ? (
      <div className="rounded-xl border border-border/60 bg-card/80 px-3 py-3 space-y-3 sm:px-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Before we generate
          </p>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {stepCurrent} of {stepTotal}
          </span>
        </div>

        {useIntelligentQuestions && activeQuestion ? (
          <>
            <p className="text-sm leading-snug text-foreground">
              <span className="mr-1 text-muted-foreground">{stepCurrent}.</span>
              {activeQuestion.prompt}
            </p>
            <ul className="space-y-1.5" role="listbox" aria-label={activeQuestion.prompt}>
              {displayOptions.map((opt) => {
                const selected = selectedOptionId === opt.id
                return (
                  <li key={opt.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      disabled={disabled}
                      onClick={() => selectClarifyOption(opt.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                        selected
                          ? "border-amber-500/50 bg-amber-500/10"
                          : "border-border/60 hover:bg-muted/40"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                          selected
                            ? "border-amber-500 bg-amber-500"
                            : "border-border/60 bg-transparent"
                        )}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1 leading-snug">{opt.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
            {selectedOptionId === PLAN_OTHER_OPTION_ID ? (
              <div className="space-y-1.5">
                <label
                  htmlFor={`intake-other-${activeQuestion.id}`}
                  className="text-xs font-medium text-muted-foreground"
                >
                  Your answer
                </label>
                <Textarea
                  ref={textInputRef as RefObject<HTMLTextAreaElement>}
                  id={`intake-other-${activeQuestion.id}`}
                  value={mcqCustom[activeQuestion.id] ?? ""}
                  onChange={(e) => {
                    const value = e.target.value
                    setMcqCustom((prev) => ({ ...prev, [activeQuestion.id]: value }))
                    setError(null)
                  }}
                  placeholder="Type your full answer…"
                  rows={3}
                  className="min-h-[88px] resize-y text-sm"
                  disabled={disabled}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && currentAnswered) {
                      e.preventDefault()
                      handlePrimary()
                    }
                  }}
                />
                <p className="text-[11px] text-muted-foreground">
                  {isLastOverall
                    ? "Press Next when you’re done — your full answer is kept."
                    : "⌘/Ctrl + Enter to continue"}
                </p>
              </div>
            ) : null}
            {stepTotal > 1 ? (
              <div className="flex flex-wrap gap-1.5 pt-1" aria-hidden>
                {Array.from({ length: stepTotal }, (_, index) => {
                  const inMcq = index < clarifyQuestions.length
                  const done = inMcq
                    ? Boolean(
                        planQuestions[index] &&
                          isPlanQuestionAnswered(planQuestions[index], mcqAnswers, mcqCustom)
                      )
                    : false
                  const isCurrent = index === questionIndex
                  return (
                    <span
                      key={`mcq-step-${index}`}
                      className={cn(
                        "h-1.5 w-6 rounded-full transition-colors",
                        isCurrent ? "bg-amber-500" : done ? "bg-emerald-500/70" : "bg-muted"
                      )}
                    />
                  )
                })}
              </div>
            ) : null}
          </>
        ) : (
          <>
            <p className="text-sm leading-snug text-foreground">
              <span className="mr-1 text-muted-foreground">{stepCurrent}.</span>
              {intakeFieldQuestion(activeField)}
            </p>

            {renderActiveField()}

            {stepTotal > 1 ? (
              <div className="flex flex-wrap gap-1.5 pt-1" role="tablist" aria-label="Planning steps">
                {inFollowUpMode
                  ? Array.from({ length: stepTotal }, (_, index) => {
                      const priorDone = index < mcqCompletedCount
                      const followIdx = index - mcqCompletedCount
                      const field = followIdx >= 0 ? followUpFields[followIdx] : null
                      const done =
                        priorDone ||
                        (field
                          ? isIntakeFieldAnswered(field, values, attachments.length)
                          : false)
                      const isCurrent = index === stepCurrent - 1
                      const canJump =
                        !priorDone &&
                        followIdx >= 0 &&
                        (followIdx <= followUpIndex || done)
                      return (
                        <button
                          key={`follow-${index}`}
                          type="button"
                          role="tab"
                          aria-selected={isCurrent}
                          disabled={disabled || priorDone || !canJump}
                          onClick={() => {
                            if (!priorDone && followIdx >= 0) jumpToField(followIdx)
                          }}
                          className={cn(
                            "h-1.5 w-6 rounded-full transition-colors",
                            isCurrent
                              ? "bg-amber-500"
                              : done
                                ? "bg-emerald-500/70"
                                : "bg-muted",
                            canJump && !isCurrent && "cursor-pointer hover:bg-emerald-500",
                            (priorDone || !canJump) && "cursor-default"
                          )}
                        />
                      )
                    })
                  : fields.map((field, index) => {
                      const done = isIntakeFieldAnswered(field, values, attachments.length)
                      const isCurrent = index === fieldIndex
                      const canJump = index <= fieldIndex || done
                      return (
                        <button
                          key={field.name}
                          type="button"
                          role="tab"
                          aria-selected={isCurrent}
                          aria-label={`${field.label}${done ? ", answered" : ""}${isCurrent ? ", current" : ""}`}
                          disabled={disabled || !canJump}
                          onClick={() => jumpToField(index)}
                          className={cn(
                            "h-1.5 w-6 rounded-full transition-colors",
                            isCurrent
                              ? "bg-amber-500"
                              : done
                                ? "bg-emerald-500/70"
                                : "bg-muted",
                            canJump && !isCurrent && "cursor-pointer hover:bg-emerald-500",
                            !canJump && "cursor-default"
                          )}
                        />
                      )
                    })}
              </div>
            ) : null}
          </>
        )}
      </div>
      ) : null}

      {error ? <p className="px-1 text-xs text-destructive">{error}</p> : null}

      {!clarifying && !memoryScanning ? (
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {canGoBack ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={disabled}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              {canGoBackAssistant && !canGoBackField ? "Previous assistant" : "Previous"}
            </button>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          {hasNext ? (
            <button
              type="button"
              onClick={onSkipStep}
              disabled={disabled}
              className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
            >
              Skip assistant
            </button>
          ) : (
            <button
              type="button"
              onClick={onDismiss}
              disabled={disabled}
              className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          )}
          <Button
            size="sm"
            className="shrink-0 gap-1.5 bg-amber text-amber-foreground hover:bg-amber/90"
            onClick={handlePrimary}
            disabled={disabled || !currentAnswered}
          >
            {primaryLabel}
            <CornerDownLeft className="h-3.5 w-3.5 opacity-80" aria-hidden />
          </Button>
        </div>
      </div>
      ) : null}
    </div>
  )
}
