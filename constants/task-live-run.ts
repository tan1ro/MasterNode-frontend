/** Copy and labels for the task detail live-run panel (MasterNode / PI pipeline). */

export const TASK_LIVE_RUN = {
  title: "Live run",
  ariaLabel: "Live pipeline run",
  streamLive: "Live",
  streamPolling: "Updating",
  streamSynced: "Synced",
  currentStep: "Pipeline step",
  metrics: {
    agents: "Agents",
    done: "Done",
    inProgress: "In progress",
    elapsed: "Elapsed",
    stagesProgress: "stages",
  },
  taskPrompt: "Task prompt",
  execution: "Execution",
  executionValue: "PI pipeline",
  workstream: "Product workstream",
  aboutRun: "How this run works",
  aboutRunBody:
    "After you approve the plan, Parallel agents run your task; Aggregator merges and Supervisor reworks the final result.",
  pipelineStages: "Pipeline stages",
  eventStream: "Event stream",
  eventStreamWaiting: "Waiting for WebSocket events…",
  eventStreamEmpty: "No events were recorded for this run.",
  assistantActivity: "Assistant activity",
  assistantActivityEmpty: "Assistant steps will stream here as the PI pipeline runs.",
} as const
