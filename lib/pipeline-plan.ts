import type { Task } from "@/types/api"
import { normalizePlanMarkdown } from "@/lib/pipeline-plan-normalize"

export interface PipelinePlanOption {
  id: string
  label: string
}

export interface PipelinePlanQuestion {
  id: string
  prompt: string
  options: PipelinePlanOption[]
}

export interface PipelinePlanPayload {
  plan_markdown: string
  questions?: PipelinePlanQuestion[]
  intent_kind?: string
  status?: string
  answers?: Record<string, string>
  source?: string
  modules?: string[]
  master_analysis?: Record<string, unknown>
  plan_summary?: string
  planned_subtasks?: Array<{
    name: string
    description?: string
    domain_assistant?: string | null
  }>
  clarifying_questions?: PipelinePlanQuestion[]
  estimated_agent_count?: number
  /** Set after an edit audit — UI should ask the user to approve again. */
  needs_reapproval?: boolean
}

export function extractPipelinePlanFromTask(task: Task | null | undefined): PipelinePlanPayload | null {
  if (!task) return null
  const approvedMarkdown = String(
    (task as Task & { approved_plan_markdown?: string }).approved_plan_markdown || ""
  ).trim()
  const raw = (task as Task & { pipeline_plan?: unknown }).pipeline_plan

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    if (!approvedMarkdown) return null
    return {
      plan_markdown: normalizePlanMarkdown(approvedMarkdown),
      status: "approved",
    }
  }

  const plan = raw as Record<string, unknown>
  const markdown = normalizePlanMarkdown(
    approvedMarkdown || String(plan.plan_markdown || "").trim(),
    {
      modulesFromPayload: Array.isArray(plan.modules)
        ? plan.modules.map((m) => String(m).trim()).filter(Boolean)
        : undefined,
    }
  )
  if (!markdown) return null
  const questionsRaw = plan.questions
  const questions: PipelinePlanQuestion[] = []
  if (Array.isArray(questionsRaw)) {
    for (const item of questionsRaw) {
      if (!item || typeof item !== "object") continue
      const row = item as Record<string, unknown>
      const prompt = String(row.prompt || row.question || "").trim()
      const id = String(row.id || "").trim()
      if (!prompt || !id) continue
      const options: PipelinePlanOption[] = []
      if (Array.isArray(row.options)) {
        for (const opt of row.options) {
          if (typeof opt === "string" && opt.trim()) {
            options.push({ id: String(options.length), label: opt.trim() })
          } else if (opt && typeof opt === "object") {
            const o = opt as Record<string, unknown>
            const label = String(o.label || o.text || "").trim()
            if (!label) continue
            options.push({ id: String(o.id || options.length), label })
          }
        }
      }
      if (options.length > 0) {
        questions.push({ id, prompt, options })
      }
    }
  }
  const modulesRaw = plan.modules
  const modules: string[] = Array.isArray(modulesRaw)
    ? modulesRaw.map((m) => String(m).trim()).filter(Boolean)
    : []
  const masterRaw = plan.master_analysis
  const master_analysis =
    masterRaw && typeof masterRaw === "object" && !Array.isArray(masterRaw)
      ? (masterRaw as Record<string, unknown>)
      : undefined
  const statusFromPlan = plan.status ? String(plan.status) : undefined
  const plannedRaw = plan.planned_subtasks
  const planned_subtasks = Array.isArray(plannedRaw)
    ? plannedRaw
        .filter((row): row is Record<string, unknown> => !!row && typeof row === "object")
        .map((row) => ({
          name: String(row.name || "").trim(),
          description: row.description ? String(row.description) : undefined,
          domain_assistant: row.domain_assistant != null ? String(row.domain_assistant) : null,
        }))
        .filter((row) => row.name)
    : undefined
  const estRaw = plan.estimated_agent_count
  const estimated_agent_count =
    typeof estRaw === "number"
      ? estRaw
      : Number.isFinite(Number(estRaw))
        ? Number(estRaw)
        : undefined
  return {
    plan_markdown: markdown,
    questions,
    intent_kind: plan.intent_kind ? String(plan.intent_kind) : undefined,
    status: approvedMarkdown ? statusFromPlan || "approved" : statusFromPlan,
    answers:
      plan.answers && typeof plan.answers === "object" && !Array.isArray(plan.answers)
        ? (plan.answers as Record<string, string>)
        : undefined,
    source: plan.source ? String(plan.source) : undefined,
    modules: modules.length > 0 ? modules : undefined,
    master_analysis,
    plan_summary: plan.plan_summary ? String(plan.plan_summary) : undefined,
    planned_subtasks,
    clarifying_questions: questions,
    estimated_agent_count,
    needs_reapproval: Boolean(plan.needs_reapproval),
  }
}

export function readTaskPlanReviewFlag(task: Task | null | undefined): boolean {
  if (!task) return false
  if (Boolean((task as Task & { plan_review?: boolean }).plan_review)) return true
  return Boolean(String(task.source_conversation_id || "").trim())
}

export function isAwaitingPlanReview(status: string | undefined): boolean {
  return String(status || "").toLowerCase() === "awaiting_plan_review"
}

export function isTerminalTaskStatus(status: string | undefined): boolean {
  const s = String(status || "").toLowerCase()
  return (
    s === "completed" ||
    s === "failed" ||
    s === "error" ||
    s === "cancelled" ||
    s === "timeout"
  )
}

/** True while the user must review the plan — even if status was incorrectly set to running. */
export function isPlanReviewPhase(task: Task | null | undefined): boolean {
  if (!task) return false
  if (isTerminalTaskStatus(task.status)) return false
  if (isAwaitingPlanReview(task.status)) return true
  if (taskRequiresPlanApproval(task) && !taskHasApprovedPlanExecution(task)) return true
  if (taskHasStoredPlan(task) && !taskHasApprovedPlanExecution(task)) return true
  return false
}

export function taskHasStoredPlan(task: Task | null | undefined): boolean {
  if (!task) return false
  const approved = String((task as Task & { approved_plan_markdown?: string }).approved_plan_markdown || "").trim()
  if (approved) return true
  return Boolean(extractPipelinePlanFromTask(task))
}

export function taskRequiresPlanApproval(task: Task | null | undefined): boolean {
  if (!task) return false
  if (String(task.source_conversation_id || "").trim()) return true
  return Boolean((task as Task & { plan_review?: boolean }).plan_review)
}

/** True once the user continued (or skipped) plan review — safe to run/post deliverables. */
export function taskHasApprovedPlanExecution(task: Task | null | undefined): boolean {
  if (!task) return false
  const approved = String(
    (task as Task & { approved_plan_markdown?: string }).approved_plan_markdown || ""
  ).trim()
  if (approved) return true

  const plan = extractPipelinePlanFromTask(task)
  if (plan) {
    const planStatus = String(plan.status || "").toLowerCase()
    if (planStatus === "approved" || planStatus === "skipped") return true
    return false
  }

  if (taskRequiresPlanApproval(task)) return false

  const status = String(task.status || "").toLowerCase()
  if (status === "awaiting_plan_review") return false
  return true
}

/** Optimistic cache patch so Proposed Plan → live UI flips without waiting on refetch. */
export function applyOptimisticPlanContinue(
  previous: Task | undefined,
  opts: {
    planMarkdown: string
    skip?: boolean
    answers?: Record<string, string>
  }
): Task | undefined {
  if (!previous) return previous
  const markdown = String(opts.planMarkdown || "").trim()
  const approved =
    markdown ||
    String(previous.approved_plan_markdown || "").trim() ||
    String(previous.pipeline_plan?.plan_markdown || "").trim() ||
    " "
  return {
    ...previous,
    status: "running",
    plan_review: false,
    approved_plan_markdown: approved,
    pipeline_plan: previous.pipeline_plan
      ? {
          ...previous.pipeline_plan,
          plan_markdown: markdown || previous.pipeline_plan.plan_markdown,
          status: opts.skip ? "skipped" : "approved",
          ...(opts.answers ? { answers: opts.answers } : {}),
        }
      : previous.pipeline_plan,
  }
}
