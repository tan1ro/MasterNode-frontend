import type { PipelinePlanOption, PipelinePlanQuestion } from "@/lib/pipeline-plan"

export const PLAN_OTHER_OPTION_ID = "other"

export const PLAN_OTHER_OPTION: PipelinePlanOption = {
  id: PLAN_OTHER_OPTION_ID,
  label: "Other — specify your own",
}

export function optionsWithOther(options: PipelinePlanOption[]): PipelinePlanOption[] {
  const withoutOther = options.filter(
    (opt) =>
      opt.id !== PLAN_OTHER_OPTION_ID &&
      !/^other\b/i.test(opt.label.trim())
  )
  return [...withoutOther, PLAN_OTHER_OPTION]
}

export function encodePlanAnswer(optionId: string, customText?: string): string {
  if (optionId === PLAN_OTHER_OPTION_ID) {
    return `other:${(customText || "").trim()}`
  }
  return optionId
}

export function decodePlanAnswer(value: string): { optionId: string; customText: string } {
  const raw = (value || "").trim()
  if (raw.startsWith("other:")) {
    return { optionId: PLAN_OTHER_OPTION_ID, customText: raw.slice(6).trim() }
  }
  if (raw === PLAN_OTHER_OPTION_ID) {
    return { optionId: PLAN_OTHER_OPTION_ID, customText: "" }
  }
  return { optionId: raw, customText: "" }
}

export function isPlanQuestionAnswered(
  question: PipelinePlanQuestion,
  answers: Record<string, string>,
  customAnswers: Record<string, string>
): boolean {
  const selected = answers[question.id]
  if (!selected) return false
  if (selected === PLAN_OTHER_OPTION_ID) {
    return Boolean(customAnswers[question.id]?.trim())
  }
  return true
}

export function allPlanQuestionsAnswered(
  questions: PipelinePlanQuestion[],
  answers: Record<string, string>,
  customAnswers: Record<string, string>
): boolean {
  if (questions.length === 0) return true
  return questions.every((q) => isPlanQuestionAnswered(q, answers, customAnswers))
}

export function buildEncodedPlanAnswers(
  questions: PipelinePlanQuestion[],
  answers: Record<string, string>,
  customAnswers: Record<string, string>
): Record<string, string> {
  const encoded: Record<string, string> = {}
  for (const question of questions) {
    const selected = answers[question.id]
    if (!selected) continue
    encoded[question.id] = encodePlanAnswer(selected, customAnswers[question.id])
  }
  return encoded
}

export function firstUnansweredQuestionIndex(
  questions: PipelinePlanQuestion[],
  answers: Record<string, string>,
  customAnswers: Record<string, string>
): number {
  const idx = questions.findIndex((q) => !isPlanQuestionAnswered(q, answers, customAnswers))
  return idx >= 0 ? idx : Math.max(0, questions.length - 1)
}

export function parseStoredPlanAnswers(
  stored?: Record<string, string>
): { answers: Record<string, string>; customAnswers: Record<string, string> } {
  const answers: Record<string, string> = {}
  const customAnswers: Record<string, string> = {}
  for (const [questionId, raw] of Object.entries(stored ?? {})) {
    const { optionId, customText } = decodePlanAnswer(raw)
    answers[questionId] = optionId
    if (optionId === PLAN_OTHER_OPTION_ID && customText) {
      customAnswers[questionId] = customText
    }
  }
  return { answers, customAnswers }
}

export function resolvePlanAnswerLabel(
  question: PipelinePlanQuestion,
  optionId: string,
  customText?: string
): string {
  if (optionId === PLAN_OTHER_OPTION_ID) {
    return (customText || "").trim() || PLAN_OTHER_OPTION.label
  }
  const match = question.options.find((opt) => opt.id === optionId)
  return match?.label || optionId
}
