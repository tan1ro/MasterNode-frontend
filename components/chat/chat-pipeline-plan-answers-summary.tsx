"use client"

import { CheckCircle2 } from "lucide-react"
import type { PipelinePlanQuestion } from "@/lib/pipeline-plan"
import {
  parseStoredPlanAnswers,
  resolvePlanAnswerLabel,
} from "@/lib/pipeline-plan-questions"
import { cn } from "@/lib/utils"

export interface ChatPipelinePlanAnswersSummaryProps {
  questions: PipelinePlanQuestion[]
  answers: Record<string, string>
  customAnswers?: Record<string, string>
  /** When set, read answers from stored server payload instead of local state. */
  storedAnswers?: Record<string, string>
  onEdit?: () => void
  className?: string
}

export function ChatPipelinePlanAnswersSummary({
  questions,
  answers,
  customAnswers = {},
  storedAnswers,
  onEdit,
  className,
}: ChatPipelinePlanAnswersSummaryProps) {
  if (questions.length === 0) return null

  const parsed = storedAnswers ? parseStoredPlanAnswers(storedAnswers) : null
  const resolvedAnswers = parsed?.answers ?? answers
  const resolvedCustom = parsed?.customAnswers ?? customAnswers

  return (
    <div
      className={cn(
        "rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] px-3 py-3 space-y-2.5",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
          Your choices
        </p>
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
          >
            Edit answers
          </button>
        ) : null}
      </div>
      <ul className="space-y-2">
        {questions.map((question, index) => {
          const optionId = resolvedAnswers[question.id]
          if (!optionId) return null
          const label = resolvePlanAnswerLabel(
            question,
            optionId,
            resolvedCustom[question.id]
          )
          return (
            <li key={question.id} className="flex items-start gap-2.5 text-sm">
              <CheckCircle2
                className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5"
                aria-hidden
              />
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {index + 1}. {question.prompt}
                </p>
                <p className="font-medium leading-snug">{label}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
