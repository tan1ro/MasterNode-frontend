import type { SolutionDemo } from "@/constants/solutions"
import type { TaskLiveLogEntry, TaskMilestoneRow } from "@/lib/task-live-execution"

/** Shared pipeline live-run demo — sales & marketing solution page. */
export const HOME_PIPELINE_LIVE_DEMO: SolutionDemo = {
  chips: ["Research", "Position", "Campaign", "Enable"],
  taskTitle: "Launch a new segment",
  prompt:
    "Research this segment, map the ICP, draft positioning, and build a launch campaign plan with battlecards.",
  steps: [
    { agent: "Market intelligence", detail: "Sized + scored the segment" },
    { agent: "ICP & persona mapping", detail: "Built target personas" },
    { agent: "Positioning & messaging", detail: "Drafted the narrative" },
    { agent: "Campaign planner", detail: "Planned the launch + assets" },
  ],
  result: {
    title: "Launch kit — ready for review",
    lines: [
      "ICP + persona profiles",
      "Positioning and messaging",
      "Campaign plan + battlecards",
    ],
  },
}

/** Chat pipeline panel demo — homepage section (matches in-chat UI). */
export const HOME_CHAT_PIPELINE_PANEL_DEMO = {
  taskId: "api-cfc2e5eec2c8",
  taskPrompt:
    "Analyze the world economic condition for 2026 across major regions and produce an executive report.",
  modules: ["datagatherer", "economicanalyzer", "reportgenerator"],
  intentKind: "document",
  workstreamLabel: "Chat pipeline",
  stageLabels: [
    "Parallel · Analysis (_regions)",
    "Parallel · Research (jections)",
    "Parallel · Generation (e_report)",
  ] as const,
  /** Cursor-style checklist items — tick one-by-one as demo stages complete. */
  todos: [
    {
      id: "todo-regions",
      content: "Identify and prioritize authoritative data sources (IMF, World Bank, OECD)",
    },
    {
      id: "todo-research",
      content: "Decompose analysis into parallel regional research tracks",
    },
    {
      id: "todo-report",
      content: "Draft executive report structure and synthesize findings",
    },
  ] as const,
  pipelineSteps: [
    "gather_authoritative_projections",
    "synthesize_regional_analysis",
    "compile_executive_report",
  ] as const,
  elapsedByPhase: ["0m 18s", "0m 52s", "1m 13s", "1m 48s", "2m 05s"] as const,
  logsByActiveStage: [
    [] as TaskLiveLogEntry[],
    [
      {
        id: "log-1",
        at: Date.now() - 45_000,
        kind: "info" as const,
        text: "Stage parallel:analysis started",
      },
      {
        id: "log-2",
        at: Date.now() - 30_000,
        kind: "success" as const,
        text: "Worker datagatherer completed regional sizing",
      },
    ],
    [
      {
        id: "log-1",
        at: Date.now() - 90_000,
        kind: "success" as const,
        text: "Stage parallel:analysis completed",
      },
      {
        id: "log-2",
        at: Date.now() - 20_000,
        kind: "info" as const,
        text: "Stage parallel:research started — gather_authoritative_projections",
      },
    ],
    [
      {
        id: "log-1",
        at: Date.now() - 120_000,
        kind: "success" as const,
        text: "Stage parallel:research completed",
      },
      {
        id: "log-2",
        at: Date.now() - 15_000,
        kind: "info" as const,
        text: "Stage parallel:generation started",
      },
    ],
    [
      {
        id: "log-1",
        at: Date.now() - 150_000,
        kind: "success" as const,
        text: "Pipeline completed — report ready for review",
      },
    ],
  ] as TaskLiveLogEntry[][],
} as const

export function buildDemoStages(activeStage: number, complete: boolean): TaskMilestoneRow[] {
  const { stageLabels } = HOME_CHAT_PIPELINE_PANEL_DEMO
  return stageLabels.map((label, index) => {
    let status: TaskMilestoneRow["status"] = "waiting"
    if (complete || index < activeStage) status = "done"
    else if (index === activeStage) status = "running"
    return {
      id: `pipeline:parallel:${index}`,
      label,
      status,
    }
  })
}
