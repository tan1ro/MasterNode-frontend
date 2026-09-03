/** User-facing copy for pipeline stage activity (thinking → parallel → merge → supervise). */

export type PipelineStageActivityKey =
  | "master"
  | "decomposer"
  | "parallel"
  | "aggregator"
  | "supervisor"

export interface PipelineStageActivityCopy {
  /** Short badge / checklist subtitle */
  headline: string
  /** One-line explanation of what this stage does */
  detail: string
  /** How this stage reworks the task (aggregator / supervisor focus) */
  rework?: string
}

const ACTIVITY: Record<PipelineStageActivityKey, PipelineStageActivityCopy> = {
  master: {
    headline: "Master · Understanding the task",
    detail: "Reads your prompt, goals, and constraints before any work is split.",
  },
  decomposer: {
    headline: "Decompose · Building the plan",
    detail: "Breaks the task into modules, todos, and clarification questions for review.",
  },
  parallel: {
    headline: "Parallel · Agents at work",
    detail: "Selected modules run side-by-side on their slices of the plan.",
  },
  aggregator: {
    headline: "Aggregator · Merging parallel results",
    detail: "Combines worker outputs into one coherent draft.",
    rework:
      "Reworking overlaps, gaps, and conflicts from parallel agents into a single merged result.",
  },
  supervisor: {
    headline: "Supervisor · Final quality pass",
    detail: "Audits the merged draft against your plan and success criteria.",
    rework:
      "Reworking weak sections, fixing open points, and shaping the final deliverable before completion.",
  },
}

export function normalizePipelineStageKey(raw?: string | null): string {
  return String(raw || "")
    .replace(/^pipeline:/i, "")
    .trim()
    .toLowerCase()
    .replace(/parallel_execution/g, "parallel")
}

export function pipelineStageActivity(
  raw?: string | null
): PipelineStageActivityCopy | null {
  const key = normalizePipelineStageKey(raw)
  if (key in ACTIVITY) return ACTIVITY[key as PipelineStageActivityKey]
  return null
}

export function isPostParallelStage(raw?: string | null): boolean {
  const key = normalizePipelineStageKey(raw)
  return key === "aggregator" || key === "supervisor"
}

/** Rework checklist — replaces build todos once Parallel is finished. */
export const AGGREGATOR_REWORK_STEPS = [
  {
    id: "agg-collect",
    title: "Collecting parallel outputs",
    detail: "Gathering each worker’s result",
  },
  {
    id: "agg-resolve",
    title: "Resolving overlaps and gaps",
    detail: "Aligning conflicting sections into one story",
  },
  {
    id: "agg-merge",
    title: "Merging into one draft",
    detail: "Producing a single coherent result for Supervisor",
  },
] as const

export const SUPERVISOR_REWORK_STEPS = [
  {
    id: "sup-audit",
    title: "Auditing against your plan",
    detail: "Checking deliverables, stack, and success criteria",
  },
  {
    id: "sup-fix",
    title: "Fixing open points",
    detail: "Reworking weak or incomplete sections",
  },
  {
    id: "sup-polish",
    title: "Shaping the final deliverable",
    detail: "Preparing the result for chat / download",
  },
] as const

export function reworkStepsForStage(raw?: string | null) {
  const key = normalizePipelineStageKey(raw)
  if (key === "aggregator") return AGGREGATOR_REWORK_STEPS
  if (key === "supervisor") return SUPERVISOR_REWORK_STEPS
  return null
}

/** Thinking checklist shown while Master + Decompose draft the plan. */
export const PIPELINE_THINKING_STEPS = [
  {
    id: "master-read",
    title: "Master · Reading your request",
    detail: "Parsing goals, constraints, and deliverables",
  },
  {
    id: "master-frame",
    title: "Master · Framing the approach",
    detail: "Defining success criteria and expected outputs",
  },
  {
    id: "decompose-modules",
    title: "Decompose · Choosing pipeline modules",
    detail: "Selecting agents for parallel work",
  },
  {
    id: "decompose-draft",
    title: "Decompose · Drafting the plan for review",
    detail: "Preparing questions, todos, and module order",
  },
] as const

export const PIPELINE_THINKING_STAGE = {
  title: "Stage 1 · Master & Decompose",
  description: "Master analyzes your request; Decompose builds the reviewable plan",
  eta: "~ 15s",
  about:
    "Master understands the task. Decompose splits it into modules, todos, and clarification questions — then you review before Parallel Work starts.",
  avgDurationLabel: "12s",
} as const
