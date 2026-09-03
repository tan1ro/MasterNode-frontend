/** Keys must match backend ``AgentType`` / ``_V1_TEMPLATE_ID_KEYS`` for ``template_ids`` on tasks. */
export const PIPELINE_STAGE_LABELS: Record<string, string> = {
  master: "Master",
  decomposer: "Decompose",
  parallel: "Parallel Work",
  aggregator: "Aggregate",
  supervisor: "Supervise",
  custom: "Custom",
}

export const PIPELINE_TEMPLATE_ROLE_SLOTS: { key: string; label: string }[] = [
  { key: "master", label: PIPELINE_STAGE_LABELS.master },
  { key: "decomposer", label: PIPELINE_STAGE_LABELS.decomposer },
  { key: "parallel", label: PIPELINE_STAGE_LABELS.parallel },
  { key: "aggregator", label: PIPELINE_STAGE_LABELS.aggregator },
  { key: "supervisor", label: PIPELINE_STAGE_LABELS.supervisor },
]

/** Display label for an agent_type / pipeline slot key. */
export function pipelineStageLabel(agentType?: string): string {
  const key = (agentType || "custom").toLowerCase()
  return PIPELINE_STAGE_LABELS[key] ?? key
}
