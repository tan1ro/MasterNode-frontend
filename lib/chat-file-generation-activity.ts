import type { ChatToolEvent } from "@/types/api"

export type FileGenStepKind = "read" | "command" | "script" | "file" | "qa" | "plan"

export type FileGenStepStatus = "running" | "done"

export interface FileGenerationStep {
  id: string
  kind: FileGenStepKind
  label: string
  detail?: string
  status: FileGenStepStatus
  filename?: string
}

export interface FileGenerationActivity {
  status: "running" | "done" | "error"
  toolName: string
  steps: FileGenerationStep[]
  filename?: string
  slidesCreated?: number
  filesRead: number
  commandsRun: number
  filesCreated: number
}

function stepKindFromEvent(event: ChatToolEvent): FileGenStepKind {
  const raw = String(event.step || "").trim().toLowerCase()
  if (
    raw === "read" ||
    raw === "command" ||
    raw === "script" ||
    raw === "file" ||
    raw === "qa" ||
    raw === "plan"
  ) {
    return raw
  }
  const output = String(event.output || event.label || "").toLowerCase()
  if (output.includes("reading")) return "read"
  if (output.includes("script") || output.includes("spec")) return "script"
  if (output.includes("validat") || output.includes("qa")) return "qa"
  if (output.includes("generat") || output.includes("build")) return "command"
  return "plan"
}

function countByKind(steps: FileGenerationStep[]): {
  filesRead: number
  commandsRun: number
  filesCreated: number
} {
  let filesRead = 0
  let commandsRun = 0
  let filesCreated = 0
  for (const step of steps) {
    if (step.kind === "read") filesRead += 1
    if (step.kind === "command" || step.kind === "plan") commandsRun += 1
    if (step.kind === "file") filesCreated += 1
  }
  if (filesCreated === 0 && steps.some((s) => s.kind === "script" || s.kind === "qa")) {
    filesCreated = 1
  }
  return { filesRead, commandsRun, filesCreated }
}

export function fileGenerationActivitySummary(activity: FileGenerationActivity): string {
  if (activity.toolName === "n8n_workflow") {
    if (activity.status === "running") return "Triggering n8n workflow…"
    if (activity.status === "error") return "n8n workflow failed"
    return "n8n workflow triggered"
  }
  if (activity.status === "running") return "Generating file…"
  const parts: string[] = []
  if (activity.filesRead > 0) {
    const verb = activity.toolName === "generate_presentation" ? "Viewed" : "Read"
    parts.push(`${verb} ${activity.filesRead} file${activity.filesRead === 1 ? "" : "s"}`)
  }
  if (activity.commandsRun > 0) {
    parts.push(`ran ${activity.commandsRun} command${activity.commandsRun === 1 ? "" : "s"}`)
  }
  if (activity.filesCreated > 0) {
    parts.push(`created ${activity.filesCreated} file${activity.filesCreated === 1 ? "" : "s"}`)
  }
  if (parts.length === 0) return "Created file"
  return parts.join(", ")
}

const FILE_GEN_TOOL_NAMES = new Set([
  "generate_presentation",
  "generate_file",
  "n8n_workflow",
])

export function parseFileGenerationActivity(events?: ChatToolEvent[]): FileGenerationActivity | null {
  if (!events?.length) return null

  const started = [...events]
    .reverse()
    .find(
      (event) =>
        FILE_GEN_TOOL_NAMES.has(event.name) && event.type === "tool_call_started"
    )
  if (!started) return null

  const callId = started.call_id
  const matched = events.filter(
    (event) =>
      event.name === started.name &&
      (!callId || !event.call_id || event.call_id === callId)
  )
  const completed = [...matched]
    .reverse()
    .find((event) => event.type === "tool_call_completed")

  const steps: FileGenerationStep[] = []
  let stepIndex = 0

  for (const event of matched) {
    if (event.type !== "tool_call_output") continue
    const label = String(event.label || event.output || "").trim()
    if (!label) continue
    const kind = stepKindFromEvent(event)
    steps.push({
      id: `${started.name}-${stepIndex++}`,
      kind,
      label,
      detail: String(event.detail || "").trim() || undefined,
      status: "done",
      filename: event.filename ? String(event.filename) : undefined,
    })
  }

  if (steps.length > 0 && !completed) {
    steps[steps.length - 1]!.status = "running"
  }

  if (steps.length === 0) {
    steps.push({
      id: `${started.name}-generic`,
      kind: "plan",
      label: "Planning file generation",
      status: completed ? "done" : "running",
    })
  }

  const counts = countByKind(steps)
  if (counts.filesCreated === 0 && completed?.filename) {
    counts.filesCreated = 1
  }
  const status =
    completed?.status === "error"
      ? "error"
      : completed
        ? "done"
        : "running"

  return {
    status,
    toolName: started.name,
    steps,
    filename: completed?.filename ? String(completed.filename) : undefined,
    slidesCreated:
      typeof completed?.slides_created === "number" ? completed.slides_created : undefined,
    ...counts,
  }
}

export function hasFileGenerationActivity(events?: ChatToolEvent[]): boolean {
  return parseFileGenerationActivity(events) !== null
}
