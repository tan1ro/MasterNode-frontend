"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, CornerDownLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatPipelinePlanVisual,
  type PipelinePlanRunPhase,
} from "@/components/chat/chat-pipeline-plan-visual"
import { ChatPipelinePlanEditor } from "@/components/chat/chat-pipeline-plan-editor"
import { cn } from "@/lib/utils"
import type { PipelinePlanPayload, PipelinePlanQuestion } from "@/lib/pipeline-plan"
import { applyOptimisticPlanContinue } from "@/lib/pipeline-plan"
import {
  normalizePlanMarkdown,
  type NormalizedPlanJsonFields,
} from "@/lib/pipeline-plan-normalize"
import {
  applyOutputFormatToPlanMarkdown,
  downloadPlanMarkdownFile,
  isPipelinePlanOutputFormat,
  type PipelinePlanOutputFormat,
} from "@/lib/pipeline-plan-output-format"
import { applyAnswersToPlanMarkdown } from "@/lib/pipeline-plan-answers-apply"
import {
  buildPlanMarkdownFromEditorFields,
  parsePipelinePlanMarkdown,
  parsedPlanToEditorFields,
} from "@/lib/pipeline-plan-parse"
import {
  allPlanQuestionsAnswered,
  buildEncodedPlanAnswers,
  firstUnansweredQuestionIndex,
  isPlanQuestionAnswered,
  optionsWithOther,
  parseStoredPlanAnswers,
  PLAN_OTHER_OPTION_ID,
} from "@/lib/pipeline-plan-questions"
import { tasksService } from "@/services/tasks"
import { formatPlanContinueError } from "@/lib/plan-continue-errors"
import { PlanOptionVisual } from "@/components/chat/pipeline-plan-option-visual"
import { ChatPipelinePlanAnswersSummary } from "@/components/chat/chat-pipeline-plan-answers-summary"
import type { Task } from "@/types/api"

function resolvePlanMarkdown(plan: PipelinePlanPayload): string {
  return normalizePlanMarkdown(plan.plan_markdown, { modulesFromPayload: plan.modules })
}

export interface ChatPipelinePlanCardProps {
  taskId: string
  plan: PipelinePlanPayload
  /** When true, user must approve before execution continues. */
  reviewMode?: boolean
  runPhase?: PipelinePlanRunPhase
  /** Fired immediately when Run/Skip is pressed (optimistic live flip). */
  onContinued?: () => void
  /** Fired if continue/skip fails after an optimistic flip. */
  onContinueFailed?: () => void
  className?: string
}

export function ChatPipelinePlanCard({
  taskId,
  plan,
  reviewMode = false,
  runPhase,
  onContinued,
  onContinueFailed,
  className,
}: ChatPipelinePlanCardProps) {
  const queryClient = useQueryClient()
  const [localQuestions, setLocalQuestions] = useState<PipelinePlanQuestion[] | null>(
    null
  )
  const planQuestionsKey = useMemo(
    () =>
      JSON.stringify(
        (plan.questions ?? []).map((q) => ({
          id: q.id,
          prompt: q.prompt,
          options: q.options,
        }))
      ),
    [plan.questions]
  )
  const questions = useMemo(
    () => localQuestions ?? plan.questions ?? [],
    // Stabilize on content, not array identity (task poll returns new [] each time).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- planQuestionsKey covers plan.questions
    [localQuestions, planQuestionsKey]
  )
  const questionIds = useMemo(
    () => questions.map((question) => question.id).join("|"),
    [questions]
  )
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({})
  const [planMarkdown, setPlanMarkdown] = useState(() => resolvePlanMarkdown(plan))
  const [intentKind, setIntentKind] = useState<string>(plan.intent_kind || "text")
  const [showMarkdown, setShowMarkdown] = useState(false)
  const [editorFields, setEditorFields] = useState<NormalizedPlanJsonFields>(() =>
    parsedPlanToEditorFields(
      parsePipelinePlanMarkdown(resolvePlanMarkdown(plan), {
        taskId,
        intentKind: plan.intent_kind,
        modulesFromPayload: plan.modules,
      })
    )
  )
  const [submitting, setSubmitting] = useState(false)
  const [savingFormat, setSavingFormat] = useState(false)
  const [auditing, setAuditing] = useState(false)
  const [replanning, setReplanning] = useState(false)
  const [answersMasterReviewed, setAnswersMasterReviewed] = useState(false)
  const [awaitingReapproval, setAwaitingReapproval] = useState(
    () => Boolean(plan.needs_reapproval)
  )
  const [editingAnswers, setEditingAnswers] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const otherInputRef = useRef<HTMLInputElement>(null)
  /** Avoid wiping in-progress answers when the task poll returns a fresh plan object. */
  const answersHydrationKeyRef = useRef<string | null>(null)
  /** Plan markdown without live answer sections — base for re-applying MCQ choices. */
  const basePlanMarkdownRef = useRef(resolvePlanMarkdown(plan))
  /** Skip prop→state sync once after a local format revise. */
  const skipNextPlanSyncRef = useRef(false)
  /** Avoid re-firing Master replan for the same answer set. */
  const answerReplanKeyRef = useRef<string | null>(null)

  const phase: PipelinePlanRunPhase =
    runPhase ?? (reviewMode ? "review" : "idle")

  useEffect(() => {
    if (plan.needs_reapproval) setAwaitingReapproval(true)
  }, [plan.needs_reapproval])

  useEffect(() => {
    // Drop local override once the refreshed task payload matches the chosen format.
    if (!localQuestions) return
    if (
      plan.intent_kind &&
      plan.intent_kind === intentKind &&
      planQuestionsKey !== "[]"
    ) {
      setLocalQuestions(null)
    }
  }, [plan.intent_kind, planQuestionsKey, intentKind, localQuestions])

  useEffect(() => {
    if (skipNextPlanSyncRef.current) {
      skipNextPlanSyncRef.current = false
      return
    }
    const resolved = resolvePlanMarkdown(plan)
    // Keep a clean base without prior answer sections so live MCQ updates re-apply cleanly.
    basePlanMarkdownRef.current = resolved
      .replace(/\n##\s*Your choices\b[\s\S]*?(?=\n##\s|\n#\s|$)/gi, "\n")
      .replace(/\n##\s*Clarification updates\b[\s\S]*?(?=\n##\s|\n#\s|$)/gi, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
    setPlanMarkdown(resolved)
  }, [plan.plan_markdown, plan.modules])

  useEffect(() => {
    if (plan.intent_kind) setIntentKind(plan.intent_kind)
  }, [plan.intent_kind])

  /** Live-update Proposed Plan markdown as clarification answers change. */
  useEffect(() => {
    if (!reviewMode || questions.length === 0) return
    if (answersMasterReviewed || replanning) return
    setPlanMarkdown(
      applyAnswersToPlanMarkdown(
        basePlanMarkdownRef.current,
        questions,
        answers,
        customAnswers
      )
    )
    // questions identity is stabilized via planQuestionsKey / localQuestions above.
  }, [
    answers,
    customAnswers,
    questionIds,
    reviewMode,
    questions,
    answersMasterReviewed,
    replanning,
  ])

  useEffect(() => {
    const serverAnswersKey = JSON.stringify(plan.answers ?? {})
    const hydrationKey = `${questionIds}|${serverAnswersKey}|${plan.intent_kind || ""}`
    if (answersHydrationKeyRef.current === hydrationKey) return
    answersHydrationKeyRef.current = hydrationKey

    const parsed = parseStoredPlanAnswers(plan.answers)
    setAnswers(parsed.answers)
    setCustomAnswers(parsed.customAnswers)
    setQuestionIndex(
      firstUnansweredQuestionIndex(questions, parsed.answers, parsed.customAnswers)
    )
  }, [questionIds, plan.answers, plan.intent_kind, questions])

  const activeQuestion: PipelinePlanQuestion | null = questions[questionIndex] ?? null
  const displayOptions = useMemo(
    () => (activeQuestion ? optionsWithOther(activeQuestion.options) : []),
    [activeQuestion]
  )

  const selectedOptionId = activeQuestion ? answers[activeQuestion.id] : undefined
  const currentAnswered = activeQuestion
    ? isPlanQuestionAnswered(activeQuestion, answers, customAnswers)
    : true
  const allAnswered = allPlanQuestionsAnswered(questions, answers, customAnswers)
  const isLastQuestion = questionIndex >= questions.length - 1
  const showAnswerSummary =
    reviewMode && questions.length > 0 && allAnswered && !showMarkdown && !editingAnswers
  const showQuestionStep =
    reviewMode && questions.length > 0 && !showMarkdown && (!allAnswered || editingAnswers)

  useEffect(() => {
    if (selectedOptionId !== PLAN_OTHER_OPTION_ID) return
    const timer = window.setTimeout(() => otherInputRef.current?.focus(), 50)
    return () => window.clearTimeout(timer)
  }, [selectedOptionId, questionIndex])

  const applyAnswerReplannedPlan = useCallback(
    (revised: PipelinePlanPayload, kind: string) => {
      skipNextPlanSyncRef.current = true
      const nextPayload: PipelinePlanPayload = {
        ...revised,
        intent_kind: String(revised.intent_kind || kind),
        needs_reapproval: true,
      }
      const next = resolvePlanMarkdown(nextPayload)
      // Keep choices/master-review sections from the revised plan as the new base.
      basePlanMarkdownRef.current = next
        .replace(/\n##\s*Your choices\b[\s\S]*?(?=\n##\s|\n#\s|$)/gi, "\n")
        .replace(/\n##\s*Clarification updates\b[\s\S]*?(?=\n##\s|\n#\s|$)/gi, "\n")
        .replace(/\n##\s*Master review\b[\s\S]*?(?=\n##\s|\n#\s|$)/gi, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
      setIntentKind(nextPayload.intent_kind || kind)
      setPlanMarkdown(next)
      setEditingAnswers(false)
      setAwaitingReapproval(true)
      setAnswersMasterReviewed(true)
      setShowMarkdown(false)
      queryClient.setQueryData<Task>(["task", taskId], (previous) => {
        if (!previous) return previous
        return {
          ...previous,
          pipeline_plan: {
            ...previous.pipeline_plan,
            ...nextPayload,
            plan_markdown: nextPayload.plan_markdown,
            questions: Array.isArray(nextPayload.questions)
              ? nextPayload.questions
              : previous.pipeline_plan?.questions,
            answers: nextPayload.answers ?? previous.pipeline_plan?.answers,
            intent_kind: nextPayload.intent_kind,
            needs_reapproval: true,
          },
        }
      })
    },
    [queryClient, taskId]
  )

  const handleReplanFromAnswers = useCallback(async () => {
    if (!reviewMode || questions.length === 0) return
    const encoded = buildEncodedPlanAnswers(questions, answers, customAnswers)
    const key = JSON.stringify(encoded)
    if (answerReplanKeyRef.current === key) return
    answerReplanKeyRef.current = key
    setReplanning(true)
    setError(null)
    try {
      const result = await tasksService.answerPlan(taskId, encoded, true)
      const revised = result?.pipeline_plan
      if (revised?.plan_markdown) {
        // Keep answered questions locally so the summary stays visible after Master clears them.
        setLocalQuestions(questions)
        applyAnswerReplannedPlan(revised as PipelinePlanPayload, intentKind)
      } else {
        // Local heuristic already applied; mark reviewed so Approve can proceed.
        setAnswersMasterReviewed(true)
        setAwaitingReapproval(true)
      }
      void queryClient.invalidateQueries({ queryKey: ["task", taskId] })
      void queryClient.invalidateQueries({ queryKey: ["tasks"] })
    } catch (err) {
      answerReplanKeyRef.current = null
      setError(
        formatPlanContinueError(
          err,
          "Could not re-review the plan with your answers. Try again."
        )
      )
    } finally {
      setReplanning(false)
    }
  }, [
    answers,
    applyAnswerReplannedPlan,
    customAnswers,
    intentKind,
    queryClient,
    questions,
    reviewMode,
    taskId,
  ])

  useEffect(() => {
    if (!reviewMode || !allAnswered || questions.length === 0 || editingAnswers) return
    if (answersMasterReviewed || replanning) return
    void handleReplanFromAnswers()
  }, [
    allAnswered,
    answersMasterReviewed,
    editingAnswers,
    handleReplanFromAnswers,
    questions.length,
    replanning,
    reviewMode,
  ])

  const persistPlanEdit = useCallback(
    async (markdown = planMarkdown, kind = intentKind) => {
      if (!reviewMode) return
      try {
        await tasksService.updatePlan(taskId, markdown, {
          intent_kind: isPipelinePlanOutputFormat(kind) ? kind : undefined,
        })
        void queryClient.invalidateQueries({ queryKey: ["task", taskId] })
        void queryClient.invalidateQueries({ queryKey: ["tasks"] })
      } catch {
        // Best-effort autosave before continue.
      }
    },
    [intentKind, planMarkdown, queryClient, reviewMode, taskId]
  )

  const applyAuditedPlan = useCallback(
    (revised: PipelinePlanPayload, kind: string) => {
      skipNextPlanSyncRef.current = true
      const nextPayload: PipelinePlanPayload = {
        ...revised,
        answers: {},
        intent_kind: String(revised.intent_kind || kind),
        needs_reapproval: true,
      }
      const next = resolvePlanMarkdown(nextPayload)
      basePlanMarkdownRef.current = next
        .replace(/\n##\s*Your choices\b[\s\S]*?(?=\n##\s|\n#\s|$)/gi, "\n")
        .replace(/\n##\s*Clarification updates\b[\s\S]*?(?=\n##\s|\n#\s|$)/gi, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
      setIntentKind(nextPayload.intent_kind || kind)
      setPlanMarkdown(next)
      if (Array.isArray(revised.questions) && revised.questions.length) {
        setLocalQuestions(revised.questions)
      } else {
        setLocalQuestions([])
      }
      setAnswers({})
      setCustomAnswers({})
      setQuestionIndex(0)
      setEditingAnswers(false)
      setAwaitingReapproval(true)
      setShowMarkdown(false)
      answersHydrationKeyRef.current = `${(revised.questions || [])
        .map((q) => q.id)
        .join("|")}|{}|${nextPayload.intent_kind || kind}`
      queryClient.setQueryData<Task>(["task", taskId], (previous) => {
        if (!previous) return previous
        return {
          ...previous,
          pipeline_plan: {
            ...previous.pipeline_plan,
            ...nextPayload,
            plan_markdown: nextPayload.plan_markdown,
            questions: nextPayload.questions,
            answers: {},
            intent_kind: nextPayload.intent_kind,
            needs_reapproval: true,
          },
        }
      })
    },
    [queryClient, taskId]
  )

  const handleSaveAndAudit = useCallback(async () => {
    if (!reviewMode) return
    const markdown = buildPlanMarkdownFromEditorFields(editorFields)
    setPlanMarkdown(markdown)
    setAuditing(true)
    setError(null)
    try {
      const result = await tasksService.updatePlan(taskId, markdown, {
        intent_kind: isPipelinePlanOutputFormat(intentKind) ? intentKind : undefined,
        audit: true,
      })
      const revised = result?.pipeline_plan
      if (revised?.plan_markdown) {
        applyAuditedPlan(revised as PipelinePlanPayload, intentKind)
      } else {
        setAwaitingReapproval(true)
        setShowMarkdown(false)
      }
      void queryClient.invalidateQueries({ queryKey: ["task", taskId] })
      void queryClient.invalidateQueries({ queryKey: ["tasks"] })
    } catch (err) {
      setError(
        formatPlanContinueError(err, "Could not audit the edited plan. Try again.")
      )
    } finally {
      setAuditing(false)
    }
  }, [applyAuditedPlan, editorFields, intentKind, queryClient, reviewMode, taskId])

  const openPlanEditor = useCallback(() => {
    const parsed = parsePipelinePlanMarkdown(planMarkdown, {
      taskId,
      intentKind,
      modulesFromPayload: plan.modules,
    })
    setEditorFields(parsedPlanToEditorFields(parsed))
    setShowMarkdown(true)
  }, [intentKind, plan.modules, planMarkdown, taskId])

  const handleDownloadPlan = useCallback(() => {
    const markdown = showMarkdown
      ? buildPlanMarkdownFromEditorFields(editorFields)
      : planMarkdown
    const parsed = parsePipelinePlanMarkdown(markdown, {
      taskId,
      intentKind,
      modulesFromPayload: plan.modules,
    })
    downloadPlanMarkdownFile(parsed.filename, markdown)
    void persistPlanEdit(markdown)
  }, [
    editorFields,
    intentKind,
    persistPlanEdit,
    plan.modules,
    planMarkdown,
    showMarkdown,
    taskId,
  ])

  const handleIntentKindChange = useCallback(
    async (kind: PipelinePlanOutputFormat) => {
      if (!reviewMode || kind === intentKind) return
      setSavingFormat(true)
      setError(null)
      try {
        // Backend rebuilds a custom plan (title, outline, questions, deliverables)
        // for Text vs Document vs Presentation, etc.
        const result = await tasksService.updatePlan(taskId, planMarkdown, {
          intent_kind: kind,
        })
        const revised = result?.pipeline_plan
        if (revised?.plan_markdown) {
          skipNextPlanSyncRef.current = true
          const nextPayload: PipelinePlanPayload = {
            ...(revised as PipelinePlanPayload),
            answers: {},
            intent_kind: String(revised.intent_kind || kind),
          }
          const next = resolvePlanMarkdown(nextPayload)
          basePlanMarkdownRef.current = next
            .replace(/\n##\s*Your choices\b[\s\S]*?(?=\n##\s|\n#\s|$)/gi, "\n")
            .replace(/\n##\s*Clarification updates\b[\s\S]*?(?=\n##\s|\n#\s|$)/gi, "\n")
            .replace(/\n{3,}/g, "\n\n")
            .trim()
          setIntentKind(nextPayload.intent_kind || kind)
          setPlanMarkdown(next)
          if (Array.isArray(revised.questions) && revised.questions.length) {
            setLocalQuestions(revised.questions)
          }
          setAnswers({})
          setCustomAnswers({})
          setQuestionIndex(0)
          setEditingAnswers(false)
          setAwaitingReapproval(true)
          // Prevent hydration from replaying answers from the previous format.
          answersHydrationKeyRef.current = `${(revised.questions || [])
            .map((q) => q.id)
            .join("|")}|{}|${nextPayload.intent_kind || kind}`
          queryClient.setQueryData<Task>(["task", taskId], (previous) => {
            if (!previous) return previous
            return {
              ...previous,
              pipeline_plan: {
                ...previous.pipeline_plan,
                ...nextPayload,
                plan_markdown: nextPayload.plan_markdown,
                questions: nextPayload.questions,
                answers: {},
                intent_kind: nextPayload.intent_kind,
              },
            }
          })
        } else {
          const nextMarkdown = applyOutputFormatToPlanMarkdown(planMarkdown, kind)
          basePlanMarkdownRef.current = nextMarkdown
          setIntentKind(kind)
          setPlanMarkdown(nextMarkdown)
        }
        void queryClient.invalidateQueries({ queryKey: ["task", taskId] })
        void queryClient.invalidateQueries({ queryKey: ["tasks"] })
      } catch (err) {
        setError(
          formatPlanContinueError(err, "Could not update output format. Try again.")
        )
      } finally {
        setSavingFormat(false)
      }
    },
    [intentKind, planMarkdown, queryClient, reviewMode, taskId]
  )

  const submitPlan = async () => {
    if (!reviewMode) return
    setSubmitting(true)
    setError(null)
    const answersPayload = buildEncodedPlanAnswers(questions, answers, customAnswers)
    const previous = queryClient.getQueryData<Task>(["task", taskId])
    const optimistic = applyOptimisticPlanContinue(previous, {
      planMarkdown,
      answers: answersPayload,
    })
    if (optimistic) queryClient.setQueryData(["task", taskId], optimistic)
    onContinued?.()
    try {
      // plan-continue already accepts plan_markdown — skip a separate PATCH round-trip
      await tasksService.continuePlan(taskId, {
        plan_markdown: planMarkdown,
        answers: answersPayload,
      })
      setEditingAnswers(false)
      setAwaitingReapproval(false)
      void queryClient.invalidateQueries({ queryKey: ["task", taskId] })
      void queryClient.invalidateQueries({ queryKey: ["tasks"] })
    } catch (err) {
      if (previous) queryClient.setQueryData(["task", taskId], previous)
      else void queryClient.invalidateQueries({ queryKey: ["task", taskId] })
      onContinueFailed?.()
      setError(
        formatPlanContinueError(
          err,
          "Could not continue pipeline. Answer every question, then try again."
        )
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handlePrimaryAction = async () => {
    if (!activeQuestion) {
      await submitPlan()
      return
    }
    if (!currentAnswered) {
      setError("Choose an option or enter your own answer before continuing.")
      return
    }
    setError(null)
    if (!isLastQuestion) {
      setQuestionIndex((index) => Math.min(questions.length - 1, index + 1))
      return
    }
    if (!allAnswered) {
      setError("Please answer all questions before running the pipeline.")
      return
    }
    await submitPlan()
  }

  const handleSkip = async () => {
    if (!reviewMode) return
    setSubmitting(true)
    setError(null)
    const previous = queryClient.getQueryData<Task>(["task", taskId])
    const optimistic = applyOptimisticPlanContinue(previous, {
      planMarkdown,
      skip: true,
    })
    if (optimistic) queryClient.setQueryData(["task", taskId], optimistic)
    onContinued?.()
    try {
      await tasksService.continuePlan(taskId, {
        plan_markdown: planMarkdown,
        skip: true,
      })
      void queryClient.invalidateQueries({ queryKey: ["task", taskId] })
      void queryClient.invalidateQueries({ queryKey: ["tasks"] })
    } catch (err) {
      if (previous) queryClient.setQueryData(["task", taskId], previous)
      else void queryClient.invalidateQueries({ queryKey: ["task", taskId] })
      onContinueFailed?.()
      setError(formatPlanContinueError(err, "Could not skip plan questions"))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!reviewMode) return
    setSubmitting(true)
    setError(null)
    try {
      await tasksService.rejectPlan(taskId)
      void queryClient.invalidateQueries({ queryKey: ["task", taskId] })
      void queryClient.invalidateQueries({ queryKey: ["tasks"] })
    } catch (err) {
      setError(formatPlanContinueError(err, "Could not cancel the plan."))
    } finally {
      setSubmitting(false)
    }
  }

  const selectOption = (optionId: string) => {
    if (!activeQuestion) return
    setAnswers((prev) => ({ ...prev, [activeQuestion.id]: optionId }))
    setError(null)
    if (optionId === PLAN_OTHER_OPTION_ID) return
    if (!isLastQuestion) {
      window.setTimeout(() => {
        setQuestionIndex((index) => Math.min(questions.length - 1, index + 1))
      }, 180)
    }
  }

  const primaryLabel = replanning
    ? "Updating plan…"
    : showAnswerSummary
      ? answersMasterReviewed
        ? awaitingReapproval
          ? "Approve again & Run"
          : "Approve & Run"
        : "Updating plan…"
      : questions.length === 0 || isLastQuestion
        ? questions.length === 0
          ? awaitingReapproval
            ? "Approve again & Run"
            : "Approve & Run"
          : "Continue"
        : "Next"

  return (
    <div className={cn("space-y-3", className)}>
      {replanning && reviewMode && !showMarkdown ? (
        <div
          className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2.5 text-[12px] text-foreground"
          role="status"
        >
          <p className="inline-flex items-center gap-1.5 font-medium text-violet-200">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            Master is reviewing your answers…
          </p>
          <p className="mt-0.5 text-muted-foreground">
            Updating scaffold, outline, and deliverables to match your choices.
          </p>
        </div>
      ) : null}

      {answersMasterReviewed && reviewMode && !showMarkdown && !replanning ? (
        <div
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-[12px] text-foreground"
          role="status"
        >
          <p className="font-medium text-emerald-300">Plan updated from your answers</p>
          <p className="mt-0.5 text-muted-foreground">
            Master re-checked the plan. Review the changes above, then approve to run.
          </p>
        </div>
      ) : null}

      {awaitingReapproval && reviewMode && !showMarkdown && !answersMasterReviewed ? (
        <div
          className="rounded-lg border border-amber/30 bg-amber/10 px-3 py-2.5 text-[12px] text-foreground"
          role="status"
        >
          <p className="font-medium text-amber">Plan edited and audited</p>
          <p className="mt-0.5 text-muted-foreground">
            Review the updated plan
            {questions.length > 0 ? " and answer the new questions" : ""}, then approve again
            to run the pipeline.
          </p>
        </div>
      ) : null}

      {showMarkdown ? (
        <div className="rounded-xl border border-border/60 bg-card/80 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/50 px-3 py-2 bg-muted/30">
            <div>
              <p className="text-xs font-semibold">
                {reviewMode ? "Edit plan" : "View plan"}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Plain fields — no markdown required.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {reviewMode ? (
                <button
                  type="button"
                  onClick={handleDownloadPlan}
                  className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
                >
                  Download plan
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setShowMarkdown(false)}
                disabled={auditing}
                className="text-[11px] font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                {reviewMode ? "Cancel" : "Close"}
              </button>
            </div>
          </div>
          <div className="max-h-[min(70vh,560px)] overflow-y-auto p-3 space-y-3">
            <ChatPipelinePlanEditor
              value={editorFields}
              onChange={setEditorFields}
              readOnly={!reviewMode || auditing}
            />
            {reviewMode ? (
              <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-2 border-t border-border/50 bg-card/95 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shadow-none"
                  disabled={auditing || submitting}
                  onClick={() => setShowMarkdown(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="bg-amber text-amber-foreground hover:bg-amber/90 shadow-none gap-1.5"
                  disabled={
                    auditing ||
                    submitting ||
                    !(editorFields.name || "").trim() ||
                    !(`${editorFields.overview || ""}${editorFields.objective || ""}`).trim()
                  }
                  onClick={() => void handleSaveAndAudit()}
                >
                  {auditing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  {auditing ? "Auditing…" : "Save & audit plan"}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <ChatPipelinePlanVisual
          planMarkdown={planMarkdown}
          taskId={taskId}
          intentKind={intentKind}
          modulesFromPayload={plan.modules}
          planSummary={plan.plan_summary}
          plannedSubtasks={plan.planned_subtasks}
          estimatedAgentCount={plan.estimated_agent_count}
          runPhase={phase}
          onViewPlan={openPlanEditor}
          viewPlanLabel={reviewMode ? "Edit plan" : "View Plan"}
          onSavePlan={reviewMode ? handleDownloadPlan : undefined}
          onIntentKindChange={reviewMode ? (kind) => void handleIntentKindChange(kind) : undefined}
          intentChangeDisabled={savingFormat || submitting || auditing}
        />
      )}

      {showAnswerSummary ? (
        <ChatPipelinePlanAnswersSummary
          questions={questions}
          answers={answers}
          customAnswers={customAnswers}
          onEdit={() => {
            setError(null)
            setEditingAnswers(true)
            setAnswersMasterReviewed(false)
            answerReplanKeyRef.current = null
            setQuestionIndex(0)
          }}
        />
      ) : null}

      {showQuestionStep && activeQuestion ? (
        <div className="rounded-xl border border-border/60 bg-card/80 px-3 py-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Clarification required
            </p>
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {questionIndex + 1} of {questions.length}
            </span>
          </div>

          <p className="text-sm leading-snug">
            <span className="text-muted-foreground mr-1">{questionIndex + 1}.</span>
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
                    onClick={() => selectOption(opt.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                      selected
                        ? "border-amber-500/50 bg-amber-500/10"
                        : "border-border/60 hover:bg-muted/40"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
                        selected
                          ? "border-amber-500/40 bg-amber-500/15"
                          : "border-border/50 bg-muted/30"
                      )}
                      aria-hidden
                    >
                      <PlanOptionVisual
                        optionId={opt.id}
                        label={opt.label}
                        selected={selected}
                      />
                    </span>
                    <span className="min-w-0 flex-1 leading-snug">{opt.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>

          {selectedOptionId === PLAN_OTHER_OPTION_ID ? (
            <div className="space-y-1.5">
              <label
                htmlFor={`plan-other-${activeQuestion.id}`}
                className="text-xs font-medium text-muted-foreground"
              >
                Your answer
              </label>
              <Input
                ref={otherInputRef}
                id={`plan-other-${activeQuestion.id}`}
                value={customAnswers[activeQuestion.id] ?? ""}
                onChange={(e) => {
                  const value = e.target.value
                  setCustomAnswers((prev) => ({ ...prev, [activeQuestion.id]: value }))
                  setError(null)
                }}
                placeholder="Type your own answer…"
                className="text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && currentAnswered && !isLastQuestion) {
                    e.preventDefault()
                    void handlePrimaryAction()
                  }
                }}
              />
            </div>
          ) : null}

          {questions.length > 1 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {questions.map((question, index) => {
                const done = isPlanQuestionAnswered(question, answers, customAnswers)
                const isCurrent = index === questionIndex
                return (
                  <span
                    key={question.id}
                    className={cn(
                      "h-1.5 w-6 rounded-full transition-colors",
                      isCurrent
                        ? "bg-amber-500"
                        : done
                          ? "bg-emerald-500/70"
                          : "bg-muted"
                    )}
                    aria-hidden
                  />
                )
              })}
            </div>
          ) : null}
        </div>
      ) : null}

      {error ? <p className="text-xs text-destructive px-1">{error}</p> : null}

      {reviewMode && !showMarkdown ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {showMarkdown ? (
              <button
                type="button"
                onClick={() => setShowMarkdown(false)}
                disabled={submitting}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                Back to summary
              </button>
            ) : showQuestionStep && questionIndex > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setError(null)
                  setQuestionIndex((index) => Math.max(0, index - 1))
                }}
                disabled={submitting}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                Previous
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => void handleReject()}
              disabled={submitting || auditing}
              className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              Cancel
            </button>
            {questions.length > 0 ? (
              <button
                type="button"
                onClick={() => void handleSkip()}
                disabled={submitting || auditing}
                className="text-xs font-medium text-foreground/85 hover:text-foreground inline-flex items-center gap-1.5 shrink-0 disabled:opacity-50"
              >
                Skip questions
                <kbd className="rounded border border-border bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-foreground/90">
                  Esc
                </kbd>
              </button>
            ) : null}
            <Button
              size="sm"
              className="shrink-0 bg-amber text-amber-foreground hover:bg-amber/90 gap-1.5 shadow-none"
              onClick={() => void handlePrimaryAction()}
              disabled={
                submitting ||
                auditing ||
                replanning ||
                (questions.length > 0 && !allAnswered && !showAnswerSummary) ||
                (showAnswerSummary && !answersMasterReviewed)
              }
            >
              {submitting || replanning ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : null}
              {questions.length === 0
                ? awaitingReapproval
                  ? "Approve again & Run"
                  : "Approve & Run"
                : primaryLabel}
              <CornerDownLeft className="h-3.5 w-3.5 opacity-80" aria-hidden />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

/** Collapsed plan viewer for completed tasks (opt-in). */
export function ChatPipelinePlanCollapsible({
  plan,
  taskId,
  className,
}: {
  plan: PipelinePlanPayload
  taskId?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className={cn("mt-2", className)}>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          View execution plan
        </button>
      ) : (
        <div className="space-y-2">
          <ChatPipelinePlanCard
            taskId={taskId || "completed"}
            plan={plan}
            reviewMode={false}
            runPhase="done"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Hide plan
          </button>
        </div>
      )}
    </div>
  )
}
